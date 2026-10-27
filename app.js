/* mi feed: tabs of chosen channels, a small ranking algorithm, a quiet player, and search. */
(() => {
  const CFG = window.MI_FEED || {};
  const $ = (s) => document.querySelector(s);
  const PAGE = 18;

  /* ---------- saved preferences (this browser only) ---------- */
  const store = {
    get(k, d) { try { const v = localStorage.getItem("mf:" + k); return v ? JSON.parse(v) : d; } catch { return d; } },
    set(k, v) { try { localStorage.setItem("mf:" + k, JSON.stringify(v)); } catch { /* storage off */ } },
  };
  const watched = new Set(store.get("watched", []));
  const hidden = new Set(store.get("hidden", []));
  const muted = new Set(store.get("muted", []));
  const boosted = new Set(store.get("boosted", []));
  let adopted = store.get("adopted", {});   // channelId -> tabId (moves a Discover channel into a tab)
  let later = store.get("later", []);       // saved video objects
  const save = () => {
    store.set("watched", [...watched].slice(-2000));
    store.set("hidden", [...hidden]);
    store.set("muted", [...muted]);
    store.set("boosted", [...boosted]);
    store.set("adopted", adopted);
    store.set("later", later);
  };

  let data = { tabs: [], channels: {}, videos: [], errors: [] };
  let byId = new Map();
  let tab = store.get("tab", null);
  let shown = PAGE;
  let query = "";
  let yt = { q: "", items: null, error: null, loading: false };
  let recent = [];          // latest comments across all videos
  let counts = {};          // videoId -> number of comments
  let unsubVideo = null;

  /* ---------- helpers ---------- */
  const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const decode = (s) => { const t = document.createElement("textarea"); t.innerHTML = s; return t.value; };
  const chName = (v) => v.channel || data.channels[v.channelId]?.title || "";
  function fmtDur(s) {
    if (s == null) return "";
    const h = Math.floor(s / 3600), m = Math.floor((s % 3600) / 60), sec = s % 60;
    return (h ? h + ":" + String(m).padStart(2, "0") : m) + ":" + String(sec).padStart(2, "0");
  }
  function ago(iso) {
    const d = (Date.now() - new Date(iso)) / 864e5;
    if (d < 1 / 24) return "just now";
    if (d < 1) return Math.round(d * 24) + " h ago";
    if (d < 2) return "yesterday";
    if (d < 30) return Math.round(d) + " days ago";
    return Math.round(d / 30) + " mo ago";
  }
  function hash(str) { let h = 2166136261; for (const c of str) { h ^= c.charCodeAt(0); h = Math.imul(h, 16777619); } return (h >>> 0) / 4294967296; }
  const today = new Date().toISOString().slice(0, 10);

  /* ---------- which channels belong to which tab ---------- */
  function channelsFor(t) {
    const ids = new Set(t.channelIds);
    for (const [cid, tid] of Object.entries(adopted)) {
      if (tid === t.id) ids.add(cid);
      else if (t.discover) ids.delete(cid);   // adopted channels leave Discover
    }
    return ids;
  }

  /* ---------- the algorithm ----------
     score = freshness (half life depends on the tab)
           x 1.6 if you asked for more from that channel
           x 0.15 if you already watched it
           x a daily shuffle on Discover, so it changes each day but not on every refresh
     then no channel shows up more than twice in a row. */
  function rank(list, t) {
    const half = t.discover ? 21 : t.id === "news" ? 2 : 7;
    const scored = list.map((v) => {
      const days = Math.max(0, (Date.now() - new Date(v.published)) / 864e5);
      let s = Math.pow(0.5, days / half);
      if (boosted.has(v.channelId)) s *= 1.6;
      if (watched.has(v.id)) s *= 0.15;
      if (t.discover) s *= 0.6 + 0.8 * hash(v.id + today);
      return { v, s };
    }).sort((a, b) => b.s - a.s);

    const out = [];
    const pool = scored.map((x) => x.v);
    while (pool.length) {
      const last2 = out.slice(-2).map((v) => v.channelId);
      const streak = last2.length === 2 && last2[0] === last2[1] ? last2[0] : null;
      let i = streak ? pool.findIndex((v) => v.channelId !== streak) : 0;
      if (i < 0) i = 0;
      out.push(pool.splice(i, 1)[0]);
    }
    return out;
  }

  function videosFor(t) {
    const ids = channelsFor(t);
    const min = (t.minMinutes || 0) * 60;
    const list = data.videos.filter((v) =>
      ids.has(v.channelId) && !hidden.has(v.id) && !muted.has(v.channelId) &&
      (v.duration == null || v.duration >= min));
    return rank(list, t);
  }

  function localSearch(q) {
    const words = q.toLowerCase().split(/\s+/).filter(Boolean);
    const pool = [...data.videos, ...later.filter((v) => !byId.has(v.id))];
    return pool.filter((v) => {
      const hay = (v.title + " " + chName(v) + " " + (v.desc || "")).toLowerCase();
      return words.every((w) => hay.includes(w));
    }).slice(0, 60);
  }

  /* ---------- rendering ---------- */
  function renderTabs() {
    const all = [...data.tabs, { id: "talk", name: "Conversations" }, { id: "later", name: "Watch later" }];
    $("#tabs").innerHTML = all.map((t) => {
      const n = t.id === "later" ? later.length : t.id === "talk" ? Object.keys(counts).length : null;
      return `<button class="tab" role="tab" data-tab="${esc(t.id)}" aria-selected="${!query && t.id === tab}">${esc(t.name)}${n ? `<span class="count">${n}</span>` : ""}</button>`;
    }).join("");
  }

  function card(v, ctx) {
    const isLater = later.some((x) => x.id === v.id);
    const seen = watched.has(v.id);
    const discover = ctx?.discover;
    let extra = "";
    if (discover) {
      const opts = data.tabs.filter((t) => !t.discover)
        .map((t) => `<option value="${esc(t.id)}">${esc(t.name)}</option>`).join("");
      extra = `<span class="chip-wrap"><select class="chip chip-select" data-act="adopt" aria-label="Add this channel to a tab"><option value="">Add channel to…</option>${opts}</select></span>
               <button class="chip" data-act="mute">Less of this channel</button>`;
    }
    const remove = ctx?.later ? `<button class="chip" data-act="unlater">Remove</button>` : "";
    return `<article class="card${seen ? " seen" : ""}" data-id="${esc(v.id)}">
      <button class="thumb" data-act="play" aria-label="Play ${esc(v.title)}">
        <img loading="lazy" src="https://i.ytimg.com/vi/${esc(v.id)}/mqdefault.jpg" alt="">
        ${v.duration ? `<span class="dur">${fmtDur(v.duration)}</span>` : ""}
        ${seen ? `<span class="seen-tag">Watched</span>` : ""}
      </button>
      <h3><button data-act="play">${esc(v.title)}</button></h3>
      <p class="byline"><strong>${esc(chName(v))}</strong>${v.published ? " · " + ago(v.published) : ""}</p>
      ${ctx?.talk ? `<p class="last-comment"><strong>${esc(ctx.talk.name)}:</strong> ${esc(ctx.talk.text)}</p>` : ""}
      <div class="actions">
        ${counts[v.id] ? `<button class="chip talk-chip" data-act="play">${counts[v.id]} comment${counts[v.id] > 1 ? "s" : ""}</button>` : ""}
        ${ctx?.later ? remove : `<button class="chip${isLater ? " on" : ""}" data-act="later">${isLater ? "Saved" : "Watch later"}</button>`}
        ${!ctx?.later && !ctx?.search ? `<button class="chip" data-act="hide">Not for me</button>` : ""}
        ${extra}
      </div>
    </article>`;
  }

  function render() {
    renderTabs();
    const grid = $("#grid"), intro = $("#intro"), more = $("#more"), ytBox = $("#yt-results");
    ytBox.innerHTML = "";
    more.hidden = true;

    if (!data.videos.length) {
      intro.innerHTML = `<h1>Your feed is getting ready</h1><p>The first update runs a couple of minutes after the site goes live. Refresh in a bit.</p>`;
      grid.innerHTML = "";
      return;
    }

    if (query) {
      const hits = localSearch(query);
      intro.innerHTML = `<h1>“${esc(query)}”</h1><p>${hits.length} in your feed${CFG.apiKey ? ". Press Enter to search all of YouTube." : "."}</p><button class="clear" data-act="clear">Back to tabs</button>`;
      grid.innerHTML = hits.length ? hits.map((v) => card(v, { search: true })).join("") : "";
      renderYt();
      return;
    }

    if (tab === "talk") {
      const threads = talkThreads();
      intro.innerHTML = `<h1>Conversations</h1><p>Videos people are talking about, newest comment first.</p>`;
      grid.innerHTML = !window.miComments
        ? `<p class="empty">Comments aren’t switched on yet.</p>`
        : threads.length ? threads.map((t) => card(t.v, { talk: t.last })).join("")
        : `<p class="empty">No comments yet. Open any video and say what you thought.</p>`;
      return;
    }

    if (tab === "later") {
      intro.innerHTML = `<h1>Watch later</h1><p>Things you saved on purpose. Oldest first.</p>`;
      grid.innerHTML = later.length ? later.map((v) => card(v, { later: true })).join("")
        : `<p class="empty">Nothing saved. Use “Watch later” on any video to keep it here.</p>`;
      return;
    }

    const t = data.tabs.find((x) => x.id === tab) || data.tabs[0];
    tab = t.id;
    const list = videosFor(t);
    const blurb = t.discover
      ? "Long, informative videos from channels you don’t follow yet. Add the good ones to a tab."
      : `Newest from ${channelsFor(t).size} channels you picked${t.minMinutes ? `, ${t.minMinutes} min and up` : ""}.`;
    intro.innerHTML = `<h1>${esc(t.name)}</h1><p>${blurb}</p>`;
    grid.innerHTML = list.length ? list.slice(0, shown).map((v) => card(v, { discover: t.discover })).join("")
      : `<p class="empty">No videos here yet. Add channels to this tab in channels.json.</p>`;
    if (list.length > shown) {
      more.hidden = false;
      more.textContent = `Show ${Math.min(PAGE, list.length - shown)} more`;
    }
  }

  function renderYt() {
    const box = $("#yt-results");
    if (!yt.q || yt.q !== query) {
      if (!CFG.apiKey) box.innerHTML = `<p class="empty">Full YouTube search turns on once your API key is in config.js.</p>`;
      return;
    }
    let body;
    if (yt.loading) body = `<p class="empty">Searching YouTube…</p>`;
    else if (yt.error) body = `<p class="empty">${esc(yt.error)}</p>`;
    else if (!yt.items.length) body = `<p class="empty">No long enough videos found. Try other words.</p>`;
    else body = `<div class="grid">${yt.items.map((v) => card(v, { search: true })).join("")}</div>`;
    box.innerHTML = `<h2 class="section-head">From all of YouTube <small>${CFG.minSearchMinutes ?? 3} min and up, no Shorts</small></h2>${body}`;
  }

  /* ---------- comments ---------- */
  function talkThreads() {
    const seen = new Map();
    for (const c of recent) {           // newest first
      if (seen.has(c.videoId)) continue;
      let v = byId.get(c.videoId);
      if (!v) {
        v = { id: c.videoId, title: c.title || "Video", channel: c.channel || "", channelId: "", published: null, duration: null };
        byId.set(v.id, v);
      }
      seen.set(c.videoId, { v, last: c });
    }
    return [...seen.values()];
  }

  function renderComments(list, err) {
    const box = $("#c-list");
    if (err) { $("#c-status").textContent = "Comments couldn’t load. Refresh to try again."; return; }
    $("#c-count").textContent = list.length ? `(${list.length})` : "";
    box.innerHTML = list.length ? list.map((c) => `<li>
        <p class="c-meta"><strong>${esc(c.name)}</strong> <span>${ago(new Date(c.time).toISOString())}</span></p>
        <p class="c-text">${esc(c.text)}</p></li>`).join("")
      : `<li class="c-empty">No comments yet. Start the conversation.</li>`;
  }

  function openComments(v) {
    if (unsubVideo) { unsubVideo(); unsubVideo = null; }
    $("#c-status").textContent = "";
    $("#c-list").innerHTML = "";
    $("#c-count").textContent = "";
    $("#comments").hidden = !window.miComments;
    if (!window.miComments) return;
    $("#c-name").value = store.get("name", "");
    unsubVideo = window.miComments.watchVideo(v.id, renderComments);
  }

  function startComments() {
    if (!window.miComments) return;
    window.miComments.watchRecent((list) => {
      if (!list) return;
      recent = list;
      counts = {};
      for (const c of list) counts[c.videoId] = (counts[c.videoId] || 0) + 1;
      if ($("#player").hidden) render(); else renderTabs();
    });
    if (current) openComments(current);
  }
  if (window.miComments) startComments();
  else window.addEventListener("mi-comments-ready", startComments, { once: true });

  $("#c-form").addEventListener("submit", async (e) => {
    e.preventDefault();
    if (!window.miComments || !current) return;
    const name = $("#c-name").value.trim().slice(0, 40);
    const text = $("#c-text").value.trim().slice(0, 1000);
    if (!name) { $("#c-status").textContent = "Add your name so people know who’s talking."; $("#c-name").focus(); return; }
    if (!text) { $("#c-text").focus(); return; }
    store.set("name", name);
    $("#c-post").disabled = true;
    $("#c-status").textContent = "Posting…";
    try {
      await window.miComments.add({
        videoId: current.id, name, text,
        title: (current.title || "").slice(0, 200),
        channel: chName(current).slice(0, 100),
      });
      $("#c-text").value = "";
      $("#c-status").textContent = "Posted.";
    } catch (err) {
      $("#c-status").textContent = "That didn’t post. Check your connection and try again.";
    }
    $("#c-post").disabled = false;
  });

  /* ---------- full YouTube search ---------- */
  async function searchYouTube(q) {
    yt = { q, items: null, error: null, loading: true };
    renderYt();
    try {
      const api = "https://www.googleapis.com/youtube/v3/";
      const p = new URLSearchParams({ part: "snippet", type: "video", maxResults: "25", q, key: CFG.apiKey, safeSearch: "moderate" });
      const r = await fetch(api + "search?" + p);
      const j = await r.json();
      if (j.error) throw j.error;
      const items = j.items.filter((i) => i.id?.videoId);
      const ids = items.map((i) => i.id.videoId).join(",");
      const r2 = await fetch(api + "videos?" + new URLSearchParams({ part: "contentDetails", id: ids, key: CFG.apiKey }));
      const j2 = await r2.json();
      if (j2.error) throw j2.error;
      const dur = Object.fromEntries(j2.items.map((x) => [x.id, isoSeconds(x.contentDetails.duration)]));
      const min = (CFG.minSearchMinutes ?? 3) * 60;
      yt.items = items.map((i) => ({
        id: i.id.videoId,
        title: decode(i.snippet.title),
        channel: decode(i.snippet.channelTitle),
        channelId: i.snippet.channelId,
        published: i.snippet.publishedAt,
        duration: dur[i.id.videoId] ?? null,
      })).filter((v) => v.duration && v.duration >= min);
      for (const v of yt.items) byId.set(v.id, v);
    } catch (e) {
      const reason = e?.errors?.[0]?.reason || "";
      yt.error = reason.includes("quota") ? "Today’s free search limit is used up. It resets at midnight Pacific."
        : reason.includes("Referer") || reason.includes("referer") ? "The API key is blocked for this address. Check the website restriction on the key."
        : "YouTube search didn’t work: " + (e?.message || "network error") + ". Check the API key in config.js.";
    }
    yt.loading = false;
    if (query === q) renderYt();
  }
  function isoSeconds(s) {
    const m = /P(?:(\d+)D)?(?:T(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?)?/.exec(s || "");
    if (!m) return null;
    const [d, h, mi, se] = m.slice(1).map((x) => +(x || 0));
    return d * 86400 + h * 3600 + mi * 60 + se;
  }

  /* ---------- player: plays one video, then stops ---------- */
  let player = null, current = null, apiReady = null;
  function loadApi() {
    if (apiReady) return apiReady;
    apiReady = new Promise((res) => {
      window.onYouTubeIframeAPIReady = res;
      const s = document.createElement("script");
      s.src = "https://www.youtube.com/iframe_api";
      document.head.appendChild(s);
    });
    return apiReady;
  }
  function freshSlot() {
    if (player) { try { player.destroy(); } catch { /* already gone */ } player = null; }
    $(".frame").innerHTML = `<div id="yt"></div>`;
  }
  async function play(v) {
    current = v;
    watched.add(v.id); save();
    $("#p-title").textContent = v.title;
    $("#p-channel").textContent = chName(v);
    $("#done").hidden = true;
    $(".frame").hidden = false;
    $("#player").hidden = false;
    document.body.style.overflow = "hidden";
    openComments(v);
    freshSlot();
    await loadApi();
    if (current !== v) return;
    player = new YT.Player("yt", {
      host: "https://www.youtube-nocookie.com",
      videoId: v.id,
      playerVars: { autoplay: 1, rel: 0, modestbranding: 1, playsinline: 1, iv_load_policy: 3 },
      events: { onStateChange: (e) => { if (e.data === YT.PlayerState.ENDED) finished(); } },
    });
  }
  function finished() {
    freshSlot();
    $(".frame").hidden = true;
    $("#done-title").textContent = current.title;
    $("#done-boost").textContent = boosted.has(current.channelId) ? "Showing more from this channel" : "More from this channel";
    const canAdopt = data.tabs.some((t) => t.discover && channelsFor(t).has(current.channelId));
    $("#done-adopt-wrap").hidden = !canAdopt;
    $("#done-note").textContent = "";
    if (canAdopt) {
      $("#done-adopt").innerHTML = `<option value="">choose a tab</option>` +
        data.tabs.filter((t) => !t.discover).map((t) => `<option value="${esc(t.id)}">${esc(t.name)}</option>`).join("");
    }
    $("#done").hidden = false;
    $("#done-back").focus();
  }
  function closePlayer() {
    if (unsubVideo) { unsubVideo(); unsubVideo = null; }
    freshSlot();
    current = null;
    $("#player").hidden = true;
    document.body.style.overflow = "";
    render();
  }

  /* ---------- events ---------- */
  function find(id) { return byId.get(id) || later.find((v) => v.id === id); }

  document.addEventListener("click", (e) => {
    const tabBtn = e.target.closest("[data-tab]");
    if (tabBtn) {
      tab = tabBtn.dataset.tab; store.set("tab", tab);
      query = ""; $("#q").value = ""; shown = PAGE;
      render(); window.scrollTo({ top: 0 });
      return;
    }
    const el = e.target.closest("[data-act]");
    if (!el || el.tagName === "SELECT") return;
    const act = el.dataset.act;
    if (act === "clear") { query = ""; $("#q").value = ""; render(); return; }
    const id = el.closest("[data-id]")?.dataset.id;
    const v = id && find(id);
    if (!v) return;
    if (act === "play") play(v);
    if (act === "later") {
      const i = later.findIndex((x) => x.id === v.id);
      if (i >= 0) later.splice(i, 1);
      else later.push({ id: v.id, title: v.title, channel: chName(v), channelId: v.channelId, published: v.published, duration: v.duration });
      save(); render();
    }
    if (act === "unlater") { later = later.filter((x) => x.id !== v.id); save(); render(); }
    if (act === "hide") { hidden.add(v.id); save(); render(); }
    if (act === "mute") { muted.add(v.channelId); save(); render(); }
  });

  document.addEventListener("change", (e) => {
    const sel = e.target.closest('select[data-act="adopt"]');
    if (!sel || !sel.value) return;
    const v = find(sel.closest("[data-id]").dataset.id);
    adopted[v.channelId] = sel.value; save(); render();
  });

  $("#done-adopt").addEventListener("change", (e) => {
    if (!e.target.value || !current) return;
    adopted[current.channelId] = e.target.value;
    save();
    const name = data.tabs.find((t) => t.id === e.target.value)?.name;
    $("#done-adopt-wrap").hidden = true;
    $("#done-note").textContent = `Added to ${name}.`;
  });
  $("#done-boost").addEventListener("click", () => {
    if (!current) return;
    boosted.add(current.channelId); save();
    $("#done-boost").textContent = "Showing more from this channel";
  });
  $("#done-back").addEventListener("click", closePlayer);
  $("#close").addEventListener("click", closePlayer);
  $("#player").addEventListener("click", (e) => { if (e.target.id === "player") closePlayer(); });
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && !$("#player").hidden && !e.target.closest(".c-form")) closePlayer();
  });

  $("#more").addEventListener("click", () => { shown += PAGE; render(); });

  let typing;
  $("#q").addEventListener("input", (e) => {
    clearTimeout(typing);
    typing = setTimeout(() => { query = e.target.value.trim(); render(); }, 150);
  });
  $("#search").addEventListener("submit", (e) => {
    e.preventDefault();
    query = $("#q").value.trim();
    if (!query) { render(); return; }
    render();
    if (CFG.apiKey && yt.q !== query) searchYouTube(query);
  });

  /* ---------- start ---------- */
  fetch("data/videos.json?t=" + Date.now())
    .then((r) => (r.ok ? r.json() : null))
    .catch(() => null)
    .then((d) => {
      if (d && Array.isArray(d.videos)) data = d;
      byId = new Map(data.videos.map((v) => [v.id, v]));
      for (const v of data.videos) v.channel = data.channels[v.channelId]?.title || "";
      if (!tab || (tab !== "later" && tab !== "talk" && !data.tabs.some((t) => t.id === tab))) tab = data.tabs[0]?.id || "later";
      if (data.updated) $("#updated").textContent = "Updated " + ago(data.updated);
      if (data.errors?.length) {
        $("#problems").hidden = false;
        $("#problem-list").innerHTML = data.errors.map((x) => `<li>${esc(x)}</li>`).join("");
      }
      render();
    });
})();
