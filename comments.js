// Comments for mi feed, stored in Firebase (Firestore). Turns on when config.js has a firebase block.
const cfg = window.MI_FEED && window.MI_FEED.firebase;

if (cfg && cfg.projectId) {
  try {
    const base = "https://www.gstatic.com/firebasejs/10.12.2/";
    const { initializeApp } = await import(base + "firebase-app.js");
    const fs = await import(base + "firebase-firestore.js");
    const db = fs.getFirestore(initializeApp(cfg));
    const col = fs.collection(db, "comments");
    const toList = (snap) => snap.docs.map((d) => {
      const c = d.data();
      return { id: d.id, ...c, time: c.createdAt ? c.createdAt.toMillis() : Date.now() };
    });

    window.miComments = {
      watchVideo(videoId, cb) {
        return fs.onSnapshot(fs.query(col, fs.where("videoId", "==", videoId)),
          (snap) => cb(toList(snap).sort((a, b) => a.time - b.time)),
          (err) => cb(null, err));
      },
      watchRecent(cb) {
        return fs.onSnapshot(fs.query(col, fs.orderBy("createdAt", "desc"), fs.limit(300)),
          (snap) => cb(toList(snap)),
          (err) => cb(null, err));
      },
      watchSuggestions(cb) {
        return fs.onSnapshot(fs.query(fs.collection(db, "suggestions"), fs.orderBy("createdAt", "desc"), fs.limit(150)),
          (snap) => cb(toList(snap)),
          (err) => cb(null, err));
      },
      suggest(s) {
        return fs.addDoc(fs.collection(db, "suggestions"), { ...s, createdAt: fs.serverTimestamp() });
      },
      add(c) {
        return fs.addDoc(col, { ...c, createdAt: fs.serverTimestamp() });
      },
    };
  } catch (err) {
    console.error("Comments could not start", err);
  }
}
window.dispatchEvent(new Event("mi-comments-ready"));
