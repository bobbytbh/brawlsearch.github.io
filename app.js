const WORKER_URL = "https://brawl-lookup.YOURNAME.workers.dev"; // your Worker address
const TAG = /^[0289PYLQGRJCUV]{3,12}$/;
const $ = (id) => document.getElementById(id);
const fields = [
  ["Nome", (p) => p.name], ["ID", (p) => p.tag],
  ["Trofei", (p) => p.trophies], ["Record trofei", (p) => p.highestTrophies],
  ["Livello", (p) => p.expLevel], ["Vittorie 3vs3", (p) => p["3vs3Victories"]],
  ["Vittorie Solo", (p) => p.soloVictories], ["Vittorie Duo", (p) => p.duoVictories],
  ["Club", (p) => (p.club ? p.club.name : "nessuno")], ["Personaggi", (p) => p.brawlers.length],
];
const errors = {
  400: "ID non valido. Usa solo le lettere e i numeri dell'ID.",
  404: "Giocatore non trovato.",
  429: "Troppe richieste. Aspetta un minuto e riprova.",
};

async function search(e) {
  e.preventDefault();
  const tag = $("tag").value.trim().toUpperCase().replace(/^#/, "");
  $("out").hidden = true;
  if (!TAG.test(tag)) { $("msg").textContent = errors[400]; return; }
  $("go").disabled = true;
  $("msg").textContent = "Cerco...";
  try {
    const r = await fetch(`${WORKER_URL}?tag=${encodeURIComponent(tag)}`, { signal: AbortSignal.timeout(10000) });
    if (!r.ok) throw new Error(errors[r.status] || "Il servizio non risponde. Riprova più tardi.");
    const p = await r.json();
    $("out").replaceChildren(...fields.flatMap(([name, get]) => {
      const dt = document.createElement("dt"), dd = document.createElement("dd");
      const v = get(p);
      dt.textContent = name;
      dd.textContent = typeof v === "number" ? v.toLocaleString("it-IT") : v; // textContent: names come from players, never HTML
      return [dt, dd];
    }));
    $("out").hidden = false;
    $("msg").textContent = "";
  } catch (err) {
    // A TypeError or TimeoutError means no answer at all; our own errors carry a message.
    $("msg").textContent = err instanceof Error && err.name === "Error" ? err.message : "Il servizio non risponde. Riprova più tardi.";
  } finally {
    $("go").disabled = false;
  }
}
$("form").addEventListener("submit", search);
