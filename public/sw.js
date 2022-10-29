self.addEventListener("install", (e) => {
  console.log("[Service Worker] Install");
});
const cacheName = "ennio-usa-blog";
const filesToCache = [
  "/",
  "/index.html",
  "/js/index.js",
  "/css/style.css",
  "https://ik.imagekit.io/mystical/Usa-Flag-Background_F2M8-3YYA.jpg?ik-sdk-version=javascript-1.4.3&updatedAt=1666974262647",
  "https://ik.imagekit.io/mystical/Usa-Stamp_HosVLRRm4.png?ik-sdk-version=javascript-1.4.3&updatedAt=1666974266251",
  "https://blog.mystaredia.de/api/posts/get",
];

let data;

self.addEventListener("install", (e) => {
  console.log("[Service Worker] Install");
  e.waitUntil(
    (async () => {
      const cache = await caches.open(cacheName);
      filesToCache.map((url) => {
        console.log("[Service Worker] Caching: ", url);
        return cache.add(url);
      });
    })()
  );
});

self.addEventListener("activate", function (e) {
  e.waitUntil(
    caches.keys().then((keyList) => {
      return Promise.all(
        keyList.map((key) => {
          if (key === cacheName) {
            return;
          }
          return caches.delete(key);
        })
      );
    })
  );
  console.log("Claiming control");
  return self.clients.claim();
});

self.addEventListener("fetch", (e) => {
  e.respondWith(
    (async () => {
      const r = await caches.match(e.request);
      console.log(`[Service Worker] Fetching resource: ${e.request.url}`);
      if (r) {
        return r;
      }
      const response = await fetch(e.request);
      const cache = await caches.open(cacheName);
      console.log(`[Service Worker] Caching new resource: ${e.request.url}`);
      cache.put(e.request, response.clone());
      return response;
    })()
  );
});

self.addEventListener("push", (e) => {
  setTimeout(() => {
    data = e.data.json();
    self.registration.showNotification(data.title, {
      body: data.message,
      image:
        "https://cdn.pixabay.com/photo/2015/12/16/17/41/bell-1096280_960_720.png",
      icon: "https://cdn.pixabay.com/photo/2015/12/16/17/41/bell-1096280_960_720.png",
    });
  }, 100);
});

self.addEventListener("notificationclick", function (e) {
  if (data.postId == "test") {
    e.notification.close();
    return;
  }
  e.waitUntil(
    self.clients.openWindow("https://blog.mystaredia.de/post?id=" + data.postId)
  );
});
