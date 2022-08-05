self.addEventListener("push", (e) => {
  const data = e.data.json();
  self.registration.showNotification(data.title, {
    body: data.message,
    data: {
      url: "https://blog.mystaredia.de/post?id=" + data.postId,
    },
    image:
      "https://pixabay.com/vectors/bell-notification-communication-1096280/",
    icon: "https://pixabay.com/vectors/bell-notification-communication-1096280/",
  });
});
