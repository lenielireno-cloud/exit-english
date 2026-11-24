// Entrega as lições conforme o plano do aluno (adulto ou kids).
import { L, SPK } from "../lib/licoes-data.mjs";
import { KL } from "../lib/licoes-kids.mjs";
import { check } from "../lib/auth.mjs";

// Converte as lições Kids para o mesmo formato das demais (nível "k").
const K = KL.map(l => [l.t, "k", l.s.map(x => [x.en, x.pt]), { cat: l.cat, em: l.em, g: l.s.map(x => x.g), w: l.s.map(x => x.w), e: l.s.map(x => x.e) }]);

export default async (req) => {
  const c = await check(req);
  if (c.error) return Response.json({ error: c.error, expira_em: c.expira_em || null, plano: c.plano || null }, { status: c.status });
  // Kids vê só a parte infantil; adulto vê só a parte adulta; administrador vê tudo.
  const lessons = c.admin ? L.concat(K) : c.plano === "kids" ? K : L;
  return Response.json({ L: lessons, SPK: c.plano === "kids" && !c.admin ? {} : SPK, admin: c.admin, expira_em: c.expira_em, plano: c.admin ? "admin" : c.plano });
};
