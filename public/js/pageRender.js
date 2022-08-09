function getCookie(cname) {
  let name = cname + "=";
  let decodedCookie = decodeURIComponent(document.cookie);
  let ca = decodedCookie.split(";");
  for (let i = 0; i < ca.length; i++) {
    let c = ca[i];
    while (c.charAt(0) == " ") {
      c = c.substring(1);
    }
    if (c.indexOf(name) == 0) {
      return c.substring(name.length, c.length);
    }
  }
  return "";
}

document.addEventListener("DOMContentLoaded", () => {
  (async () => {
    if (
      document.cookie.includes("password=") &&
      document.cookie.includes("id=")
    ) {
      fetch("/api/verifyId", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          password: getCookie("password"),
          id: getCookie("id"),
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
      console.log("No password or id cookie");
      window.location.href = "/login";
    }
  })();

  console.log(postData);
  const editor = new EditorJS({
    /**
     * Id of Element that should contain the Editor
     */
    holder: "postContent",
    readOnly: true,

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
  editor.isReady.then(() => {
    postData.content.forEach((block) => {
      editor.blocks.insert(block.type, block.data);
    });
    editor.blocks.delete(0);
  });
});
