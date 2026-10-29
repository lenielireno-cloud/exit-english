// Entrega as lições só para quem tem acesso liberado.
import { L, SPK } from "../lib/licoes-data.mjs";
import { check } from "../lib/auth.mjs";

export default async (req) => {
  const c = await check(req);
  if (c.error) return Response.json({ error: c.error, expira_em: c.expira_em || null }, { status: c.status });
  return Response.json({ L, SPK, admin: c.admin, expira_em: c.expira_em });
};
