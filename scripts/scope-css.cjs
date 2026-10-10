/* One-off generator: scopes the approved prototype CSS so Home and the page set can coexist.
   Shared shell rules (tokens, header, footer, resets) live in src/app/globals.css instead. */
const fs = require("fs");
const path = require("path");
const postcss = require("postcss");

const SRC = path.join(__dirname, "..", "KUSP_final_design_handoff", "site");
const OUT = path.join(__dirname, "..", "src", "styles");

const SHELL = /^(:root|\*|html|body|button|a|button, input, select, textarea, a|::selection|\.(site-header|site-footer|wordmark|menu-mark|footer-|approval-banner|review-banner))/;

function scope(file, prefix, out, banner) {
  const root = postcss.parse(fs.readFileSync(file, "utf8"));
  root.walkRules((rule) => {
    if (rule.parent && rule.parent.type === "atrule" && /keyframes/.test(rule.parent.name)) return;
    const kept = rule.selectors.filter((s) => !SHELL.test(s.trim()));
    if (!kept.length) return rule.remove();
    rule.selectors = kept.map((s) => `${prefix} ${s.trim().replace(".why-index div", ".why-index > li")}`);
  });
  root.walkDecls((d) => {
    if (d.prop === "box-shadow" && !/inset/.test(d.value)) d.remove();
  });
  root.walkAtRules((a) => {
    if (a.nodes && a.nodes.length === 0) a.remove();
  });
  fs.writeFileSync(path.join(OUT, out), `/* ${banner} — generated from approved prototype CSS by scripts/scope-css.cjs */\n${root.toString()}\n`);
}

scope(path.join(SRC, "home-approval", "home.css"), ".kp-home", "home.css", "Home (Living Masterplan)");
scope(path.join(SRC, "design", "design.css"), ".kp-page", "pages.css", "About / Expertise / Framework / Sectors / Experience / Insights / Contact");
