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
const publicVapidKey =
  "BH6sYvnAi9yM8aPtp8lHE0h9Her_ERKt6_XwTKiOA_6L0rUPsipAo-TL30QLj37DrVJkxk0fVCiWskd3sfZnSg0";

let postsData = [];
let tags = [];

function urlBase64ToUint8Array(base64String) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding)
    .replace(/\-/g, "+")
    .replace(/_/g, "/");

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

//register the service worker, register our push api, send the notification
async function send() {
  //register service worker
  navigator.serviceWorker
    .register("/sw.js", {
      scope: "/",
    })
    .then((reg) => {
      var serviceWorker;
      if (reg.installing) {
        serviceWorker = reg.installing;
        // console.log('Service worker installing');
      } else if (reg.waiting) {
        serviceWorker = reg.waiting;
        // console.log('Service worker installed & waiting');
      } else if (reg.active) {
        serviceWorker = reg.active;
        // console.log('Service worker active');
      }

      if (serviceWorker) {
        serviceWorker.addEventListener("statechange", function (e) {
          if (e.target.state == "activated") {
            reg.pushManager
              .subscribe({
                userVisibleOnly: true,

                //public vapid key
                applicationServerKey: urlBase64ToUint8Array(publicVapidKey),
              })
              .then((subscription) => {
                console.log("Subscribed to push service");
                //Send push notification
                fetch("/subscribe", {
                  method: "POST",
                  body: JSON.stringify({
                    ...subscription,
                    userId: localStorage.getItem("id"),
                    userName: localStorage.getItem("name"),
                    userEmail: localStorage.getItem("email"),
                  }),
                  headers: {
                    "content-type": "application/json",
                  },
                });
              });
          }
        });
      }
    })
    .catch(function (error) {
      alert(
        "Service Worker registration failed: \n" +
          error +
          "\nPlease contact the administrator"
      );
    });
}

$(document).ready(() => {
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

  const postTemplate = document.querySelector("[data-post-template]");
  const tagTemplate = document.querySelector("[data-tag-template]");
  const postsContainer = $("#posts");
  const searchInput = $("#search");

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

  loadPostData(postTemplate, postsContainer, tagTemplate, searchInput);
});

function loadPostData(postTemplate, postsContainer, tagTemplate, searchInput) {
  fetch("/api/getPosts")
    .then((res) => {
      if (res.status == 200) return res.json();
      else {
        loadPostData(postTemplate, postsContainer, tagTemplate);
        return;
      }
    })
    .then((posts) => {
      if (posts == undefined) return;
      let lang = localStorage.getItem("language");
      lang ??= "de";
      postsData = posts.map((post) => {
        let postCard = postTemplate.content.cloneNode(true).children[0];

        postCard.querySelector("[data-heading]").firstChild.textContent =
          post.heading;
        postCard.querySelector(
          "[data-heading]"
        ).firstChild.href = `/post?id=${post.id}&lang=${lang}`;
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
        postCard.querySelector(
          "[data-more]"
        ).href = `/post?id=${post.id}&lang=${lang}`;

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

      //event listeners for settings menu
      $(".sl-nav li ul")
        .children()
        .each(function () {
          if (
            this.querySelector("[language]").getAttribute("language") == lang
          ) {
            this.querySelector("[language]").classList.add("active");
            $(".sl-nav li b").text(this.querySelector("[language]").innerHTML);
          }
        });
      $("#settingsButton").click((e) => {
        $("#settingsMenu").toggleClass("show");
      });
      $(".sl-nav li ul li span").click((e) => {
        $(".sl-nav li ul li span").removeClass("active");
        e.target.classList.add("active");
        $(".sl-nav li b").text(e.target.innerHTML);
        localStorage.setItem("language", e.target.getAttribute("language"));
        postsContainer.children().each(function () {
          let postHref = this.querySelector("[data-more]").href;
          let newHref = `${postHref.slice(
            0,
            postHref.indexOf("&")
          )}&lang=${e.target.getAttribute("language")}`;
          this.querySelector("[data-more]").href = newHref;
          this.querySelector("[data-heading]").firstChild.href = newHref;
        });
      });

      //set up service worker for notifications

      //check if the serveice worker can work in the current browser
      if ("serviceWorker" in navigator) {
        send().catch((err) => console.error(err));
      }
    })
    .catch((err) => console.error(err));
}

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
