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
  const postsContainer = $("#posts");
  const searchInput = $("#search");

  let postsData = [];

  searchInput.on("input propertychange", (e) => {
    const value = e.target.value.toLowerCase();
    postsData.forEach((post) => {
      const isVisible =
        post.heading.toLowerCase().includes(value) ||
        post.content.toLowerCase().includes(value);
      post.element.classList.toggle("hide", !isVisible);
    });
  });

  $(".tag").click((e) => {
    e.target.parentNode.classList.toggle("checked");
    let tags = [];
    $("#tagsWrapper")
      .children()
      .each(function () {
        if ($(this).hasClass("checked")) {
          tags.push($(this).children().first().text());
        }
      });
    if (tags.length == 0) {
      postsData.forEach((post) => {
        post.element.classList.toggle("hide", 0);
      });
      return;
    }
    postsData.forEach((post) => {
      let isVisible = 1;
      tags.forEach((e) => {
        if (
          !post.tags.map((e2) => e2.toLowerCase()).includes(e.toLowerCase())
        ) {
          isVisible = 0;
        }
      });
      if (searchInput.value != undefined) {
        tags.forEach((e) => {
          if (!post.tags.map((e) => e.toLowerCase()).includes()) isVisible = 0;
        });
      }
      post.element.classList.toggle("hide", !isVisible);
    });
  });

  $.get("json/posts.json", (posts) => {
    postsData = posts.map((post) => {
      let card = postTemplate.content.cloneNode(true).children[0];

      card.querySelector("[data-heading]").firstChild.textContent =
        post.heading;
      card.querySelector("[data-heading]").firstChild.href =
        "/post?id=" + post.id;
      card.querySelector("[data-date]").textContent = new Date(
        post.timestamp * 1
      ).toLocaleDateString(undefined, {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
      card.querySelector("[data-preview]").textContent = post.summary;

      let tags = card.querySelector("[data-tags]");
      post.tags.forEach((tag) => {
        tagEl = document.createElement("div");
        tagEl.classList.add("post-tag");
        tagEl.textContent = tag;
        tags.appendChild(tagEl);
      });
      card.querySelector("[data-more]").href = "/post?id=" + post.id;

      postsContainer.append(card);
      return {
        heading: post.heading,
        timestamp: post.timestamp,
        content: post.content,
        tags: post.tags,
        element: card,
      };
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
