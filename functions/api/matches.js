const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Content-Type": "application/json",
};

// Nombres de nuestros equipos tal como los devuelve la API
const OUR_TEAMS = [
  "Qatar", "Curaçao", "Ghana", "South Africa", "Haiti", "New Zealand", "Saudi Arabia"
];

export async function onRequestOptions() {
  return new Response(null, { status: 204, headers: { "Access-Control-Allow-Origin": "*" } });
}

export async function onRequestGet({ env }) {
  const apiKey = env.FOOTBALL_API_KEY;
  if (!apiKey) {
    return new Response(JSON.stringify({ error: "FOOTBALL_API_KEY no configurada" }), { status: 500, headers: CORS });
  }

  try {
    const res = await fetch(
      "https://api.football-data.org/v4/competitions/WC/matches?stage=GROUP_STAGE",
      { headers: { "X-Auth-Token": apiKey } }
    );

    if (!res.ok) {
      const txt = await res.text();
      return new Response(JSON.stringify({ error: `API error ${res.status}`, detail: txt }), { status: res.status, headers: CORS });
    }

    const json = await res.json();
    const matches = (json.matches || []).filter(m =>
      OUR_TEAMS.includes(m.homeTeam.name) || OUR_TEAMS.includes(m.awayTeam.name)
    );

    const result = matches.map(m => ({
      id: m.id,
      utcDate: m.utcDate,
      status: m.status,       // SCHEDULED | IN_PLAY | PAUSED | FINISHED
      group: m.group,
      homeTeam: m.homeTeam.name,
      awayTeam: m.awayTeam.name,
      homeScore: m.score?.fullTime?.home ?? null,
      awayScore: m.score?.fullTime?.away ?? null,
    }));

    return new Response(JSON.stringify(result), { headers: CORS });
  } catch (e) {
    return new Response(JSON.stringify({ error: e.message }), { status: 500, headers: CORS });
  }
}
