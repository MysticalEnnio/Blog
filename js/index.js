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

document.addEventListener("DOMContentLoaded", () => {
  const postTemplate = document.querySelector("[data-post-template]");
  const postsContainer = document.getElementById("posts");
  const searchInput = document.getElementById("search");

  let postsData = [];

  searchInput.addEventListener("input", (e) => {
    const value = e.target.value.toLowerCase();
    postsData.forEach((post) => {
      const isVisible =
        post.heading.toLowerCase().includes(value) ||
        post.content.toLowerCase().includes(value);
      post.element.classList.toggle("hide", !isVisible);
    });
  });

  $.get("json/posts.json", (posts) => {
    console.log(posts);

    postsData = posts.map((post) => {
      let card = postTemplate.content.cloneNode(true).children[0];

      card.querySelector("[data-heading]").textContent = post.heading;
      card.querySelector("[data-date]").textContent = new Date(
        post.timestamp * 1
      ).toLocaleDateString(undefined, {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
      card.querySelector("[data-preview]").textContent = post.content;

      let tags = card.querySelector("[data-tags]");
      post.tags.forEach((tag) => {
        tagEl = document.createElement("div");
        tagEl.classList.add("postTag");
        tagEl.textContent = tag;
        tags.appendChild(tagEl);
      });

      postsContainer.append(card);
      return {
        heading: post.heading,
        timestamp: post.timestamp,
        content: post.content,
        tags: post.tags,
        element: card,
      };
    });
    console.log(postsData);
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
