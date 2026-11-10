import crypto from 'node:crypto';
// Unisce piu' fonti XMLTV in docs/data/epg.json.
// Priorita': file locali in EXTRA_DIR (ordine alfabetico: fonti ufficiali), poi le fonti remote di config.json.
// Un programma di una fonte meno prioritaria viene scartato se il suo punto medio cade in un intervallo gia' coperto.
import fs from 'node:fs';
import path from 'node:path';
import zlib from 'node:zlib';
const CFG = JSON.parse(fs.readFileSync('config.json', 'utf8'));
const OUT = 'docs/data/epg.json'; fs.mkdirSync('docs/data', { recursive: true });
const EXTRA = process.env.EXTRA_DIR || '/tmp/out';
const dec = s => s.replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&apos;/g, "'").replace(/&#(\d+);/g, (_, n) => String.fromCharCode(n)).replace(/&amp;/g, '&');
const slug = s => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/g, '');
const clean = n => n.replace(/\s+HD\b/i, '').replace(/\s+\d{3,4}\s*$/, '').replace(/\s+/g, ' ').trim();
const ts = s => {
  const m = /^(\d{4})(\d\d)(\d\d)(\d\d)(\d\d)(\d\d)?\s*([+-]\d{4})?/.exec(s || '');
  if (!m) return NaN;
  let t = Date.UTC(+m[1], m[2] - 1, +m[3], +m[4], +m[5], +(m[6] || 0));
  if (m[7]) t -= (m[7][0] === '-' ? -1 : 1) * (+m[7].slice(1, 3) * 60 + +m[7].slice(3, 5)) * 60000;
  return t;
};
const freeRe = new RegExp(CFG.freeRegex, 'i'), payRe = new RegExp(CFG.payRegex, 'i');
const classify = n => CFG.overrides[n] || (payRe.test(n) ? 'pay' : freeRe.test(n.trim()) ? 'free' : 'other');
const lo = Date.now() - 36e5 * 6, hi = Date.now() + CFG.windowDays * 864e5;
const chans = {}, prog = [], covered = {}, log = [];

async function load(url) {
  const r = await fetch(url, { signal: AbortSignal.timeout(240000), headers: { 'user-agent': 'tv-guida/1.0' } });
  if (!r.ok) throw new Error('HTTP ' + r.status);
  let b = Buffer.from(await r.arrayBuffer());
  if (b[0] === 0x1f && b[1] === 0x8b) b = zlib.gunzipSync(b);
  return b.toString('utf8');
}
function parse(xml) {
  const idName = {}, list = [];
  for (const m of xml.matchAll(/<channel id="([^"]+)">([\s\S]*?)<\/channel>/g)) {
    const d = /<display-name[^>]*>([^<]*)</.exec(m[2]);
    const name = clean(dec(d ? d[1] : m[1]).trim()); idName[dec(m[1])] = name;
    const id = slug(name), type = classify(name);
    if (id && !chans[id] && (CFG.keepOther || type !== 'other')) chans[id] = { id, name, type };
  }
  for (const m of xml.matchAll(/<programme ([^>]*)>([\s\S]*?)<\/programme>/g)) {
    const a = m[1], s = ts((/start="([^"]+)"/.exec(a) || [])[1]), e = ts((/stop="([^"]+)"/.exec(a) || [])[1]);
    if (!(e > lo && s < hi)) continue;
    const name = idName[dec((/channel="([^"]+)"/.exec(a) || [])[1] || '')]; if (!name) continue;
    const c = slug(name); if (!chans[c]) continue;
    const t = /<title[^>]*>([^<]*)</.exec(m[2]), d = /<desc[^>]*>([^<]*)</.exec(m[2]), g = /<category[^>]*>([^<]*)</.exec(m[2]);
    list.push([c, s, e, t ? dec(t[1]) : '', d ? dec(d[1]).slice(0, 600) : '', g ? dec(g[1]) : '']);
  }
  return list;
}
function merge(list) {
  const fresh = []; let added = 0;
  for (const p of list) {
    const mid = (p[1] + p[2]) / 2;
    if ((covered[p[0]] || []).some(([a, b]) => mid >= a && mid < b)) continue;
    prog.push(p); fresh.push(p); added++;
  }
  for (const p of fresh) (covered[p[0]] ??= []).push([p[1], p[2]]);
  return added;
}
const sources = [];
if (fs.existsSync(EXTRA)) for (const f of fs.readdirSync(EXTRA).filter(f => f.endsWith('.xml')).sort()) sources.push({ name: 'sito ufficiale ' + f, get: async () => fs.readFileSync(path.join(EXTRA, f), 'utf8') });
for (const s of CFG.sources) sources.push({ name: s.name, get: () => load(s.url) });
for (const s of sources) {
  try { const l = parse(await s.get()); log.push(`${s.name}: ok (${l.length} letti, ${merge(l)} nuovi)`); }
  catch (e) { log.push(`${s.name}: ERRORE ${e.message}`); }
}
console.log(log.join('\n'));
if (!prog.length) { console.error('Nessuna fonte ha restituito programmi: dati precedenti mantenuti.'); process.exit(1); }
// numeri di canale: Sky dal sito ufficiale (site_id DTH#N), digitale terrestre da config.json
const sky = {};
try {
  const x = fs.readFileSync((process.env.EPG_REPO || '/tmp/epg') + '/sites/guidatv.sky.it/guidatv.sky.it.channels.xml', 'utf8');
  for (const m of x.matchAll(/site_id="DTH#(\d+)"[^>]*>([^<]*)</g)) { const id = slug(clean(dec(m[2]).trim())); if (id && (!(id in sky) || +m[1] < sky[id])) sky[id] = +m[1]; }
} catch {}
const lcn = Object.fromEntries(Object.entries(CFG.lcn || {}).map(([k, v]) => [slug(k), v]));
for (const c of Object.values(chans)) { const a = lcn[c.id], b = sky[c.id]; c.n = a ?? null; }
prog.sort((a, b) => a[1] - b[1]);
// correzione fine programma: non oltre l'inizio del successivo sullo stesso canale; durate assurde (>8h) ridotte
{
  const last = {};
  for (let i = prog.length - 1; i >= 0; i--) {
    const p = prog[i], nx = last[p[0]];
    if (nx != null && p[2] > nx) p[2] = nx;
    if (p[2] - p[1] > 8 * 36e5) p[2] = nx != null ? Math.min(nx, p[1] + 2 * 36e5) : p[1] + 2 * 36e5;
    if (p[2] <= p[1]) p[2] = p[1] + 36e5;
    last[p[0]] = p[1];
  }
}
const used = new Set(prog.map(p => p[0]));
const payload = JSON.stringify({ updated: Date.now(), log, channels: Object.values(chans).filter(c => used.has(c.id)), programmes: prog });
if (process.env.EPG_PASSWORD) {
  // dati cifrati (AES-256-GCM, chiave PBKDF2): il file in chiaro non viene pubblicato
  const salt = crypto.randomBytes(16), iv = crypto.randomBytes(12), IT = 200000;
  const key = crypto.pbkdf2Sync(process.env.EPG_PASSWORD, salt, IT, 32, 'sha256');
  const ci = crypto.createCipheriv('aes-256-gcm', key, iv);
  const enc = Buffer.concat([ci.update(payload, 'utf8'), ci.final(), ci.getAuthTag()]);
  fs.writeFileSync('docs/data/epg.enc', JSON.stringify({ v: 1, it: IT, s: salt.toString('base64'), iv: iv.toString('base64'), d: enc.toString('base64') }));
  fs.rmSync(OUT, { force: true });
} else {
  fs.writeFileSync(OUT, payload);
  fs.rmSync('docs/data/epg.enc', { force: true });
}
console.log(`Scritti ${prog.length} programmi, ${used.size} canali -> ${OUT}`);
