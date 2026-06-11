const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

export async function onRequestOptions() {
  return new Response(null, { status: 204, headers: CORS });
}

export async function onRequestGet({ env }) {
  const raw = await env.MUNDIAL_DATA.get("state");
  return new Response(raw ?? "null", {
    headers: { ...CORS, "Content-Type": "application/json" },
  });
}

export async function onRequestPost({ request, env }) {
  const body = await request.json();
  if (body?.adminPass !== "paquete2026") {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401, headers: CORS,
    });
  }
  delete body.adminPass;
  body.lastUpdate = new Date().toISOString();
  await env.MUNDIAL_DATA.put("state", JSON.stringify(body));
  return new Response(JSON.stringify({ ok: true }), { headers: { ...CORS, "Content-Type": "application/json" } });
}
