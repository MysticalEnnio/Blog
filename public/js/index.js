let postsWrapper, postTemplate, tagTemplat;

function fetchBlogData() {
  fetch("https://blog.mystaredia.de/api/posts/get")
    .then((res) => {
      if (res.status == 200) return res.json();
      else {
        loadPostData(postTemplate, postsContainer, tagTemplate);
        return;
      }
    })
    .then((posts) => {
      if (posts == undefined) fetchBlogData();
      loadPosts(posts);
    });
}

function loadPosts(posts) {
  console.log("Posts", posts);
  postsWrapper = document.getElementById("postsWrapper");
  postTemplate = document.getElementById("postTemplate").content;
  tagTemplate = document.getElementById("tagTemplate").content;
  posts.map((post) => {
    let postElement = postTemplate.cloneNode(true).children[0];
    postElement.querySelector(".postImage").src = post.image;
    postElement.querySelector(".postHeading").innerHTML = post.heading;
    postElement.querySelector(".postSummary").innerHTML = post.summary;
    let postTags = postElement.querySelector(".postTagsWrapper");
    post.tags.forEach((tag) => {
      let tagElement = tagTemplate.cloneNode(true).children[0];
      tagElement.innerHTML = tag;
      postTags.append(tagElement);
    });
    postElement.onclick = () => {
      if (localStorage.getItem("lang")) {
        window.location.href = `https://blog.mystaredia.de/post?id=${
          post.id
        }&lang=${localStorage.getItem("lang")}`;
        return;
      }
      window.location.href = `https://blog.mystaredia.de/post?id=${post.id}`;
    };

    postsWrapper.append(postElement);
  });
}

fetchBlogData();

if ("serviceWorker" in navigator) {
  navigator.serviceWorker.register("/sw.js", {
    scope: "/",
  });
}
