let data;

self.addEventListener("push", (e) => {
  setTimeout(() => {
    data = e.data.json();
    self.registration.showNotification(data.title, {
      body: data.message,
      image:
        "https://pixabay.com/vectors/bell-notification-communication-1096280/",
      icon: "https://pixabay.com/vectors/bell-notification-communication-1096280/",
    });
  }, 100);
});

self.addEventListener("notificationclick", function (e) {
  if (data.postId == "test") {
    e.notification.close();
    return;
  }
  fetch("api/seenNotification?id=" + data.postId);
  e.waitUntil(
    clients.openWindow("https://blog.mystaredia.de/post?id=" + data.postId)
  );
});

console.log(self);
