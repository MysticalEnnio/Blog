/*************************************************
Copyright © 2021 Ennio Marke
 ____    ____  ____  ____   ______   _________  
|_   \  /   _||_  _||_  _|.' ____ \ |  _   _  | 
  |   \/   |    \ \  / /  | (___ \_||_/ | | \_| 
  | |\  /| |     \ \/ /    _.____`.     | |     
 _| |_\/_| |_    _|  |_   | \____) |   _| |_    
|_____||_____|  |______|   \______.'  |_____| 
*************************************************/

const userLang = navigator.language || navigator.userLanguage;

$(document).ready(() => {
  const postTemplate = document.querySelector("[data-post-template]");
  const tagTemplate = document.querySelector("[data-tag-template]");
  const postsContainer = $("#posts");
  const searchInput = $("#search");

  let postsData = [];
  let tags = [];

  searchInput.on("input propertychange", (e) => {
    const value = e.target.value.toLowerCase();
    postsData.forEach((post) => {
      const isVisible =
        post.heading.toLowerCase().includes(value) ||
        post.content.filter(
          (e) =>
            e.data.text?.toLowerCase().includes(value) ||
            e.data.caption?.toLowerCase().includes(value)
        ).length > 0;
      post.element.classList.toggle("hide", !isVisible);
    });
  });

  $.get("json/posts.json", (posts) => {
    postsData = posts.map((post) => {
      let postCard = postTemplate.content.cloneNode(true).children[0];

      postCard.querySelector("[data-heading]").firstChild.textContent =
        post.heading;
      postCard.querySelector("[data-heading]").firstChild.href =
        "/post?id=" + post.id;
      postCard.querySelector("[data-date]").textContent = new Date(
        post.timestamp * 1
      ).toLocaleDateString(undefined, {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
      postCard.querySelector("[data-preview]").textContent = post.summary;

      let postTags = postCard.querySelector("[data-tags]");
      post.tags.forEach((tag) => {
        tagEl = document.createElement("div");
        tagEl.classList.add("post-tag");
        tagEl.textContent = tag;
        postTags.appendChild(tagEl);
      });
      postCard.querySelector("[data-more]").href = "/post?id=" + post.id;

      postsContainer.append(postCard);

      post.tags.map((e) => {
        if (tags.filter((e2) => e2.name == e)?.length > 0) {
          tags.filter((e2) => e2.name == e)[0].count++;
        } else {
          tags.push({ name: e, count: 1 });
        }
      });

      return {
        heading: post.heading,
        timestamp: post.timestamp,
        content: post.content,
        tags: post.tags,
        element: postCard,
      };
    });
    console.log(tags);
    tags.map((e) => {
      let tagCard = tagTemplate.content.cloneNode(true).children[0];
      tagCard.querySelector("[data-tag-name]").innerHTML = e.name;
      tagCard.querySelector("[data-tag-count]").innerHTML = e.count;
      $("#tagsWrapper").append(tagCard);
    });
    $(".tag").click((e) => {
      e.target.parentNode.classList.toggle("checked");
      let selectedTags = [];
      $("#tagsWrapper")
        .children()
        .each(function () {
          if ($(this).hasClass("checked")) {
            selectedTags.push($(this).children().first().text());
          }
        });
      if (selectedTags.length == 0) {
        postsData.forEach((post) => {
          post.element.classList.toggle("hide", 0);
        });
        return;
      }
      postsData.forEach((post) => {
        let isVisible = 1;
        selectedTags.forEach((e) => {
          if (
            !post.tags.map((e2) => e2.toLowerCase()).includes(e.toLowerCase())
          ) {
            isVisible = 0;
          }
        });
        if (searchInput.value != undefined) {
          selectedTags.forEach((e) => {
            if (!post.tags.map((e) => e.toLowerCase()).includes())
              isVisible = 0;
          });
        }
        post.element.classList.toggle("hide", !isVisible);
      });
    });
  });
});

/*********************************
       :\     /;               _
      ;  \___/  ;             ; ;
     ,:-"'   `"-:.            / ;
    /,---.   ,---.\         _; /
   ((  |  ) (  |  ))    ,-""_,"
    \`````   `````/""""",-""
     '-.._ v _..-'      )
       / ___   ____,..  \
      / /   | |   | ( \. \
     / /    | |    | |  \ \
     `"     `"     `"    `"
*********************************/
