// Confere login e prazo de acesso do aluno no Supabase.
export const SB = "https://thotxnszjiiipqhpetba.supabase.co";
export const SBK = "sb_publishable_ruFNKM-AmNyES-aC2lg9yQ_16_IjalD";

export async function check(req) {
  const auth = req.headers.get("authorization") || "";
  if (!auth.startsWith("Bearer ") || auth.length < 20) return { error: "login", status: 401 };
  const h = { apikey: SBK, Authorization: auth };
  const u = await fetch(SB + "/auth/v1/user", { headers: h });
  if (!u.ok) return { error: "login", status: 401 };
  const user = await u.json();
  const [ra, rb] = await Promise.all([
    fetch(`${SB}/rest/v1/alunos?select=expira_em&id=eq.${user.id}`, { headers: h }),
    fetch(`${SB}/rest/v1/rpc/is_admin`, { method: "POST", headers: { ...h, "Content-Type": "application/json" }, body: "{}" }),
  ]);
  const rows = ra.ok ? await ra.json() : [];
  const admin = rb.ok ? (await rb.json()) === true : false;
  const expira_em = rows[0]?.expira_em || null;
  if (!admin && !(expira_em && new Date(expira_em) > new Date()))
    return { error: "pagamento", status: 402, expira_em };
  return { admin, expira_em, user };
}
