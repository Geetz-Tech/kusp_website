/**
 * Builds public/og/kusp-og.png (1200x630) from the approved KUSP logo + a generic planning-sheet fragment.
 * Needs playwright-core (or set PLAYWRIGHT_CORE) and a running production server:  node scripts/build-og.cjs  (expects http://localhost:3100)
 * Uses the site's own loaded fonts (Libre Caslon Text, Hanken Grotesk) so the card matches the website.
 */
const fs = require("fs");
const path = require("path");
let pw;
try { pw = require("playwright-core"); } catch (e) { pw = require(process.env.PLAYWRIGHT_CORE || "playwright"); }
const logo = fs.readFileSync(path.join(__dirname, "../public/brand/kusp-primary-burgundy.svg"), "utf8");

(async () => {
  const b = await pw.chromium.launch();
  const p = await b.newPage({ viewport: { width: 1200, height: 630 }, deviceScaleFactor: 1 });
  await p.goto("http://localhost:3100/about", { waitUntil: "networkidle" });
  await p.evaluate(async ({ logo }) => {
    // deterministic plan fragment
    let s = 7; const rnd = () => ((s = (s * 16807) % 2147483647) / 2147483647);
    const W = 500, H = 400; let blocks = "";
    for (let i = 0; i < 9; i++) for (let j = 0; j < 6; j++) {
      if (j === 3 || (j === 2 && i > 3 && i < 6)) continue;
      const x = 22 + i * 50, y = 20 + j * 56 + (j > 3 ? 10 : 0), w = 34 + Math.round(rnd() * 8), h = 30 + Math.round(rnd() * 10);
      blocks += `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="#eee6d2" stroke="#6f6652" stroke-width=".9"/>`;
    }
    let grid = "";
    for (let i = 0; i <= 25; i++) grid += `<path d="M${i * 20} 0V${H}"/>`;
    for (let i = 0; i <= 20; i++) grid += `<path d="M0 ${i * 20}H${W}"/>`;
    const plan = `<svg width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg">
      <rect width="${W}" height="${H}" fill="#f8f3e7"/>
      <g stroke="rgba(111,102,82,.2)" stroke-width=".7" fill="none">${grid}</g>
      <path d="M-10 190C90 168 170 214 260 188S400 168 510 196" fill="none" stroke="#8ca5ae" stroke-width="16" stroke-linecap="round" opacity=".85"/>
      ${blocks}
      <path d="M16 16H484V384H16Z" fill="none" stroke="#6b1f32" stroke-width="1.3" stroke-dasharray="8 5"/>
      <path d="M16 350C110 300 200 190 270 176S410 96 484 70" fill="none" stroke="#6b1f32" stroke-width="3.6" stroke-linecap="round"/>
      <path d="M16 120H484" stroke="#b99352" stroke-width="2.4" stroke-dasharray="7 5" fill="none"/>
      <rect x="440" y="334" width="24" height="24" fill="#b99352" stroke="#8c7a50"/>
    </svg>`;
    document.documentElement.style.cssText = "background:#f1ecdf";
    document.body.className = "";
    document.body.style.cssText = "margin:0;width:1200px;height:630px;background:#f1ecdf;position:relative;overflow:hidden;";
    document.body.innerHTML = `
      <div style="position:absolute;left:72px;top:68px;width:470px">${logo.replace("<svg ", '<svg width="470" style="display:block" ')}</div>
      <div style="position:absolute;left:72px;top:250px;width:470px;font-family:var(--serif);font-size:41px;line-height:1.14;letter-spacing:-.02em;color:#171614">Designing Resilient Cities &amp; Transformative Infrastructure.</div>
      <div style="position:absolute;left:640px;top:70px;width:${W}px;height:${H}px;border:1px solid rgba(23,22,20,.35);">${plan}</div>
      <div style="position:absolute;left:640px;top:484px;font-family:var(--sans);font-size:11px;font-weight:700;letter-spacing:.16em;color:#5d584f">SITE / MASTERPLAN STUDY &nbsp;·&nbsp; SCHEMATIC</div>
      <svg style="position:absolute;left:72px;top:566px" width="1056" height="14" viewBox="0 0 1056 14"><path d="M0 7H1056" stroke="#6b1f32" stroke-width="2"/><path d="M0 0V14M1056 0V14" stroke="#6b1f32" stroke-width="2"/><path d="M0 7H150" stroke="#b99352" stroke-width="6"/></svg>`;
    await document.fonts.ready;
  }, { logo });
  await p.waitForTimeout(600);
  fs.mkdirSync(path.join(__dirname, "../public/og"), { recursive: true });
  await p.screenshot({ path: path.join(__dirname, "../public/og/kusp-og.png"), clip: { x: 0, y: 0, width: 1200, height: 630 } });
  await b.close();
})();
