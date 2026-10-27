// Settings for mi feed.
// Paste your YouTube Data API key between the quotes to turn on full YouTube search.
// Restrict the key in Google Cloud to "anapalaciosrm.github.io/*" so it only works on your site.
window.MI_FEED = {
  apiKey: "AIzaSyAepgsXRUQtlZhbjaltkxmq3Xzj_GC7gbE",
  // Search results shorter than this many minutes are hidden (cuts out Shorts and clips).
  minSearchMinutes: 3,
  // Firebase settings for comments (safe to be public). Leave as null to hide comments.
  firebase: {
    apiKey: "AIzaSyBHqsSr_R8S8-NjN5klHqkb4kYJQOWw4Lw",
    authDomain: "mi-feed-512906.firebaseapp.com",
    projectId: "mi-feed-512906",
    storageBucket: "mi-feed-512906.firebasestorage.app",
    messagingSenderId: "37037381816",
    appId: "1:37037381816:web:40ecee193cbf0f0f167c4d"
  }
};
