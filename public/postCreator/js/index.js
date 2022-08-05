const editor = new EditorJS({
  /**
   * Id of Element that should contain the Editor
   */
  holder: "editor",
  placeholder: "Today was a wonderful day",

  /**
   * Available Tools list.
   * Pass Tool's class or Settings object for each Tool you want to use
   */
  tools: {
    header: Header,
    raw: RawTool,
    image: {
      class: ImageTool,
      config: {
        endpoints: {
          byFile: "/api/image/uploadFile", // Your backend file uploader endpoint
          byUrl: "/api/image/uploadUrl", // Your endpoint that provides uploading by Url
        },
      },
    },
    checklist: {
      class: Checklist,
      inlineToolbar: true,
    },
    list: {
      class: List,
      inlineToolbar: true,
      config: {
        defaultStyle: "unordered",
      },
    },
    embed: Embed,
    quote: Quote,
  },
});

let avaibleTags = [];
let selectedTags = [];

function loadTags() {
  let tagTemplate = document.querySelector("[data-tag-template]");
  let tagContainer = document.getElementById("tags");
  //fetch the tags from the server
  fetch("/api/getTags")
    .then((response) => response.json())
    .then((data) => {
      avaibleTags = [];
      data.forEach((tag) => {
        avaibleTags.push(tag.name);
      });
      avaibleTags.map((tag) => {
        let tagCard = tagTemplate.content.cloneNode(true).children[0];
        tagCard.querySelector("[data-tag-name]").innerHTML = tag;
        tagContainer.appendChild(tagCard);
      });
      $(".tag").click((e) => {
        e.target.parentNode.classList.toggle("checked");
        selectedTags = [];
        $("#tags")
          .children()
          .each(function () {
            if ($(this).hasClass("checked")) {
              selectedTags.push($(this).children().first().text());
            }
          });
      });
      let tagCard = tagTemplate.content.cloneNode(true).children[0];
      tagCard.querySelector("[data-tag-name]").innerHTML = "add";
      tagContainer.appendChild(tagCard);
      tagCard.addEventListener("click", () => {
        let tag = prompt("Enter a tag");
        if (tag) {
          fetch("/api/addTag?name=" + tag)
            .then((response) => response.json())
            .then((data) => {
              if (data == "200") avaibleTags.push(tag);
              tagContainer.innerHTML = "";
              loadTags();
            });
        }
      });
    });
}

//Wait for dom to load
document.addEventListener("DOMContentLoaded", () => {
  loadTags();

  document.getElementById("save").addEventListener("click", () => {
    editor
      .save()
      .then((outputData) => {
        if (outputData.blocks[0]?.type != "header") {
          alert("Please add a header as the first block");
          return;
        }
        if (selectedTags.length < 1) {
          alert("Please add at least one tag");
          return;
        }
        console.log("Article data: ", outputData);
        let postBody = JSON.stringify({
          timestamp: outputData.time,
          author: "Ennio Marke",
          heading: outputData.blocks[0].data.text,
          tags: selectedTags,
          summary: document.getElementById("summary").value,
          content: outputData.blocks.slice(1),
        });
        console.log("Post body: ", postBody);
        fetch(`/api/newPost`, {
          method: "POST",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
          },
          body: postBody,
        })
          .then((res) => res.json())
          .then((response) => {
            if (response == "200") window.location.replace("/");
          });
      })
      .catch((error) => {
        console.log("Saving failed: ", error);
      });
  });
});
