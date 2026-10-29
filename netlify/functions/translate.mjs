// Traduz frases EN -> PT-BR pelo DeepL. A chave fica na variável DEEPL_KEY do Netlify.
import { check } from "../lib/auth.mjs";

export default async (req) => {
  if (req.method !== "POST") return new Response("Use POST", { status: 405 });
  const c = await check(req);
  if (c.error) return Response.json({ error: c.error }, { status: c.status });
  let texts;
  try { ({ texts } = await req.json()); } catch { return new Response("JSON inválido", { status: 400 }); }
  if (!Array.isArray(texts) || !texts.length || texts.length > 60 || texts.join("").length > 6000)
    return new Response("Texto vazio ou longo demais", { status: 400 });
  const key = process.env.DEEPL_KEY || "";
  const url = key.endsWith(":fx") ? "https://api-free.deepl.com/v2/translate" : "https://api.deepl.com/v2/translate";
  const r = await fetch(url, {
    method: "POST",
    headers: { Authorization: "DeepL-Auth-Key " + key, "Content-Type": "application/json" },
    body: JSON.stringify({ text: texts.map(String), source_lang: "EN", target_lang: "PT-BR" }),
  });
  if (!r.ok) return Response.json({ error: r.status }, { status: 502 });
  const d = await r.json();
  return Response.json({ translations: d.translations.map(t => t.text) });
};
