(() => {
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];
  const store = {
    get(k, d) { try { const v = localStorage.getItem("p107_" + k); return v ? JSON.parse(v) : d; } catch { return d; } },
    set(k, v) { try { localStorage.setItem("p107_" + k, JSON.stringify(v)); } catch {} },
  };
  const shuffle = (a) => { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
  // give each injected SVG its own gradient/marker ids so copies don't clash
  let uid = 0;
  const uniq = (h) => { const n = ++uid; return h.replace(/id="([\w-]+)"/g, `id="$1_${n}"`).replace(/url\(#([\w-]+)\)/g, `url(#$1_${n})`); };
  const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));

  // Countdown to the test: Mon Nov 9 2026 7:30 PM Pacific (UTC-8)
  const TEST = new Date("2026-11-10T03:30:00Z");
  function tick() {
    const ms = TEST - new Date();
    const el = $("#countdown");
    if (ms <= 0) { el.textContent = "Test day has passed. Good luck with IACRA!"; return; }
    const d = Math.floor(ms / 864e5), h = Math.floor((ms % 864e5) / 36e5);
    el.textContent = `Test: Mon Nov 9, 7:30 PM, PSI Santa Clara · ${d}d ${h}h to go`;
  }
  tick(); setInterval(tick, 60000);

  // Tabs
  $$(".tabs button").forEach((b) => b.addEventListener("click", () => {
    $$(".tabs button").forEach((x) => x.classList.toggle("on", x === b));
    $$(".tab").forEach((t) => t.classList.toggle("on", t.id === "tab-" + b.dataset.tab));
    store.set("tab", b.dataset.tab);
  }));
  const lastTab = store.get("tab", "cards");
  const lb = $(`.tabs button[data-tab="${lastTab}"]`); if (lb) lb.click();

  // ───── Flashcards (simple Leitner boxes) ─────
  const cardId = (c) => c.a + ":" + c.f;
  let boxes = store.get("boxes", {});
  let missed = store.get("missed", {});
  let activeAreas = new Set(store.get("areas", Object.keys(AREAS)));
  let deck = [], cur = null, flipped = false;

  const filt = $("#areaFilters");
  filt.innerHTML = Object.entries(AREAS).map(([k, v]) =>
    `<button class="chip ${activeAreas.has(k) ? "on" : ""}" data-area="${k}">${v} <span class="n">${CARDS.filter((c) => c.a === k).length}</span></button>`).join("");
  filt.addEventListener("click", (e) => {
    const b = e.target.closest(".chip"); if (!b) return;
    const k = b.dataset.area;
    if (activeAreas.has(k) && activeAreas.size > 1) activeAreas.delete(k); else activeAreas.add(k);
    b.classList.toggle("on", activeAreas.has(k));
    $$(".chip", filt).forEach((x) => x.classList.toggle("on", activeAreas.has(x.dataset.area)));
    store.set("areas", [...activeAreas]);
    buildDeck(); next();
  });
  $("#weakOnly").addEventListener("change", () => { buildDeck(); next(); });
  $("#resetCards").addEventListener("click", () => {
    if (!confirm("Reset all flashcard progress?")) return;
    boxes = {}; missed = {}; store.set("boxes", boxes); store.set("missed", missed); buildDeck(); next();
  });

  function pool() {
    let p = CARDS.filter((c) => activeAreas.has(c.a));
    if ($("#weakOnly").checked) p = p.filter((c) => missed[cardId(c)]);
    return p;
  }
  function buildDeck() {
    // lower box first, shuffled within each box
    const p = shuffle(pool());
    p.sort((x, y) => (boxes[cardId(x)] || 0) - (boxes[cardId(y)] || 0));
    deck = p;
    stats();
  }
  function stats() {
    const p = CARDS.filter((c) => activeAreas.has(c.a));
    const known = p.filter((c) => (boxes[cardId(c)] || 0) >= 2).length;
    const miss = p.filter((c) => missed[cardId(c)]).length;
    $("#cardStats").innerHTML = `<b>${known}</b> / ${p.length} solid · <b>${miss}</b> to review · ${deck.length} in this round`;
  }
  function show(c) {
    cur = c; flipped = false;
    if (!c) {
      $("#flashTag").textContent = "";
      $("#flashFront").innerHTML = $("#weakOnly").checked ? "No missed cards here. Nice!" : "Round complete! 🎉 Tap ✓ to start a new round.";
      $("#flashBack").hidden = true; $("#flashDiagram").hidden = true; $("#flashHint").hidden = true;
      return;
    }
    $("#flashTag").textContent = AREAS[c.a] + (boxes[cardId(c)] ? ` · level ${boxes[cardId(c)]}` : "");
    $("#flashFront").innerHTML = esc(c.f);
    $("#flashBack").innerHTML = esc(c.b);
    $("#flashBack").hidden = true; $("#flashDiagram").hidden = true; $("#flashHint").hidden = false;
    $("#flash").classList.remove("flipped");
  }
  function flip() {
    if (!cur) return;
    flipped = !flipped;
    $("#flashBack").hidden = !flipped;
    $("#flash").classList.toggle("flipped", flipped);
    $("#flashHint").hidden = flipped;
    const slot = $("#flashDiagram");
    if (flipped && cur.d && DIAGRAMS[cur.d]) { const D = DIAGRAMS[cur.d]; slot.innerHTML = uniq(D.svg || D.html); slot.hidden = false; }
    else slot.hidden = true;
  }
  function next() { if (!deck.length) buildDeck(); show(deck.shift() || null); stats(); }
  function grade(ok) {
    if (!cur) { buildDeck(); next(); return; }
    const id = cardId(cur);
    if (ok) { boxes[id] = Math.min((boxes[id] || 0) + 1, 4); if (boxes[id] >= 2) delete missed[id]; }
    else {
      boxes[id] = 0; missed[id] = 1;
      // bring it back in a few cards
      deck.splice(Math.min(3, deck.length), 0, cur);
    }
    store.set("boxes", boxes); store.set("missed", missed);
    next();
  }
  $("#flash").addEventListener("click", (e) => { if (e.target.closest("a")) return; flip(); });
  $("#againBtn").addEventListener("click", () => grade(false));
  $("#gotBtn").addEventListener("click", () => grade(true));
  document.addEventListener("keydown", (e) => {
    if (!$("#tab-cards").classList.contains("on") || e.target.matches("input,textarea")) return;
    if (e.code === "Space") { e.preventDefault(); flip(); }
    if (e.key === "ArrowLeft") grade(false);
    if (e.key === "ArrowRight") grade(true);
  });
  buildDeck(); next();

  // ───── Practice test ─────
  let T = null, timerInt = null;
  let qMiss = store.get("qmiss", {});
  const qid = (q) => q.q;
  const history = store.get("history", []);
  function renderHistory() {
    if (!history.length) { $("#testHistory").textContent = ""; return; }
    $("#testHistory").innerHTML = "<b>Past scores:</b> " + history.slice(-8).map((h) =>
      `<span class="pill ${h.pct >= 85 ? "ok" : h.pct >= 70 ? "mid" : "low"}">${h.kind} ${h.pct}%</span>`).join(" ");
  }
  renderHistory();

  function pickFull() {
    // Weighted toward the heavy areas; uses every question (bank is about 60)
    return shuffle(QUESTIONS).slice(0, 60);
  }
  $$("[data-start]").forEach((b) => b.addEventListener("click", () => {
    const kind = b.dataset.start;
    let qs;
    if (kind === "full") qs = pickFull();
    else if (kind === "quick") qs = shuffle(QUESTIONS).slice(0, 15);
    else { qs = QUESTIONS.filter((q) => qMiss[qid(q)]); if (!qs.length) { alert("No missed questions yet. Take a test first!"); return; } qs = shuffle(qs); }
    T = { kind, qs: qs.map((q) => ({ ...q, order: shuffle([0, 1, 2]) })), i: 0, ans: {}, instant: $("#instant").checked,
          end: kind === "full" ? Date.now() + 120 * 60000 : null };
    $("#testStart").hidden = true; $("#testResult").hidden = true; $("#testRun").hidden = false;
    clearInterval(timerInt);
    if (T.end) timerInt = setInterval(timerTick, 1000);
    timerTick(); renderQ();
  }));
  function timerTick() {
    if (!T || !T.end) { $("#timer").textContent = ""; return; }
    const s = Math.max(0, Math.round((T.end - Date.now()) / 1000));
    $("#timer").textContent = `⏱ ${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
    if (s === 0) finish();
  }
  function renderQ() {
    const q = T.qs[T.i];
    $("#qCount").textContent = `Question ${T.i + 1} of ${T.qs.length}`;
    $("#qArea").textContent = AREAS[q.a];
    $("#qText").textContent = q.q;
    const chosen = T.ans[T.i];
    const reveal = T.instant && chosen !== undefined;
    $("#qOpts").innerHTML = q.order.map((oi, k) => {
      let cls = "opt";
      if (chosen === oi) cls += " sel";
      if (reveal && oi === q.c) cls += " right";
      if (reveal && chosen === oi && oi !== q.c) cls += " wrong";
      return `<button class="${cls}" data-oi="${oi}"><b>${"ABC"[k]}.</b> ${esc(q.o[oi])}</button>`;
    }).join("");
    $("#qExplain").hidden = !reveal;
    if (reveal) $("#qExplain").innerHTML = (chosen === q.c ? "✓ Correct. " : "✗ Not quite. ") + esc(q.e);
    $("#prevQ").disabled = T.i === 0;
    $("#nextQ").textContent = T.i === T.qs.length - 1 ? "Finish & grade" : "Next →";
  }
  $("#qOpts").addEventListener("click", (e) => {
    const b = e.target.closest(".opt"); if (!b) return;
    if (T.instant && T.ans[T.i] !== undefined) return;
    T.ans[T.i] = +b.dataset.oi; renderQ();
  });
  $("#prevQ").addEventListener("click", () => { if (T.i > 0) { T.i--; renderQ(); } });
  $("#nextQ").addEventListener("click", () => { if (T.i < T.qs.length - 1) { T.i++; renderQ(); } else finish(); });
  $("#finishQ").addEventListener("click", () => {
    const left = T.qs.length - Object.keys(T.ans).length;
    if (left && !confirm(`${left} unanswered. Grade anyway?`)) return;
    finish();
  });
  function finish() {
    clearInterval(timerInt);
    let right = 0; const byArea = {};
    T.qs.forEach((q, i) => {
      const ok = T.ans[i] === q.c;
      byArea[q.a] = byArea[q.a] || [0, 0]; byArea[q.a][1]++;
      if (ok) { right++; byArea[q.a][0]++; delete qMiss[qid(q)]; } else qMiss[qid(q)] = 1;
    });
    store.set("qmiss", qMiss);
    const pct = Math.round((100 * right) / T.qs.length);
    history.push({ kind: { full: "Mock", quick: "Quick", weak: "Misses" }[T.kind], pct, at: Date.now() });
    store.set("history", history);
    const verdict = pct >= 85 ? "Ready range. 🎯" : pct >= 70 ? "Passing, but aim for 85%+." : "Below passing. Review the misses below.";
    $("#testRun").hidden = true; $("#testResult").hidden = false;
    $("#testResult").innerHTML = `<h2>${right} / ${T.qs.length} · ${pct}%</h2><p>${verdict}</p>
      <div class="areas">${Object.entries(byArea).map(([k, [r, n]]) => `<span class="pill ${r / n >= .85 ? "ok" : r / n >= .7 ? "mid" : "low"}">${AREAS[k]} ${r}/${n}</span>`).join(" ")}</div>
      <div class="row"><button class="primary" id="againTest">Back to tests</button></div>
      <h3>Review</h3><ol class="review">${T.qs.map((q, i) => {
        const ok = T.ans[i] === q.c;
        return `<li class="${ok ? "ok" : "bad"}"><b>${esc(q.q)}</b><br>${ok ? "✓" : "✗"} Your answer: ${T.ans[i] === undefined ? "<i>none</i>" : esc(q.o[T.ans[i]])}${ok ? "" : `<br>Correct: <b>${esc(q.o[q.c])}</b>`}<br><span class="small">${esc(q.e)}</span></li>`;
      }).join("")}</ol>`;
    $("#againTest").addEventListener("click", () => { $("#testResult").hidden = true; $("#testStart").hidden = false; renderHistory(); });
    window.scrollTo(0, 0);
  }

  // ───── Chart lab ─────
  $("#chartLabSvg").innerHTML = uniq(CHART_LAB_SVG);
  $("#labQs").innerHTML = CHART_LAB_QS.map((x) => `<li><details><summary>${esc(x.q)}</summary>${esc(x.a)}</details></li>`).join("");

  // ───── Diagrams tab ─────
  $("#diagramList").innerHTML = Object.values(DIAGRAMS).map((D) =>
    `<div class="panel"><h2>${esc(D.title)}</h2><div class="figure">${uniq(D.svg || D.html)}</div></div>`).join("");

  // Checklist persistence
  const checks = $$(".check input");
  const saved = store.get("checks", []);
  checks.forEach((c, i) => { c.checked = !!saved[i]; c.addEventListener("change", () => store.set("checks", checks.map((x) => x.checked))); });
})();
