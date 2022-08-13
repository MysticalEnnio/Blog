document.addEventListener("DOMContentLoaded", () => {
  (async () => {
    if (localStorage.getItem("password") && localStorage.getItem("id")) {
      fetch("/api/verifyId", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          password: localStorage.getItem("password"),
          id: localStorage.getItem("id"),
        }),
      })
        .then((response) => response.json())
        .then((data) => {
          console.log(data);
          if (data.status == 400) {
            console.log("Error: " + data.status + "\n" + data.message);
            window.location.href = "/login";
          }
        });
    } else {
      console.log("No password or id saved in local storage");
      window.location.href = "/login";
    }
  })();

  document.getElementById("postHeading").textContent = postData.heading;
  document.getElementById("postDate").textContent = new Date(
    postData.timestamp * 1
  ).toLocaleDateString(undefined, {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  let tags = document.getElementById("postTags");
  postData.tags.forEach((tag) => {
    tagEl = document.createElement("div");
    tagEl.classList.add("post-tag");
    tagEl.textContent = tag;
    tags.appendChild(tagEl);
  });
  document.getElementById("postContent").innerHTML = postContent;
  //remove first child
  document.getElementById("postContent").firstChild.remove();
});
