self.addEventListener("push", (e) => {
  setTimeout(() => {
    const data = e.data.json();
    self.registration.showNotification(data.title, {
      body: data.message,
      data: {
        click_action: "https://blog.mystaredia.de/post?id=" + data.postId,
        url: "https://blog.mystaredia.de/post?id=" + data.postId,
      },
      image:
        "https://pixabay.com/vectors/bell-notification-communication-1096280/",
      icon: "https://pixabay.com/vectors/bell-notification-communication-1096280/",
    });
  }, 100);
});

self.onnotificationclick(function (event) {
  const data = event.data.json();
  fetch("api/seenNotification?id=" + data.postId);
  event.waitUntil(
    clients.openWindow("https://blog.mystaredia.de/post?id=" + data.postId)
  );
});

console.log(self);
