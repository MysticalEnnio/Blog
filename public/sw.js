self.addEventListener("push", (e) => {
  const data = e.data.json();
  self.registration.showNotification(data.title, {
    body: data.message,
    image:
      "https://pixabay.com/vectors/bell-notification-communication-1096280/",
    icon: "https://pixabay.com/vectors/bell-notification-communication-1096280/",
  });
});

self.addEventListener("notificationclick", function (e) {
  const data = e.data.json();
  e.notification.close();
  clients.openWindow("https://blog.mystaredia.de/post?id=" + data.postId);
});
