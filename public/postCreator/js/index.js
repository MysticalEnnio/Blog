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

let tags = [];

document.getElementById("save").addEventListener("click", () => {
  editor
    .save()
    .then((outputData) => {
      if (outputData.blocks[0]?.type != "header") {
        alert("Please add a header as the first block");
        return;
      }
      console.log("Article data: ", outputData);
      let postBody = JSON.stringify({
        timestamp: outputData.time,
        author: "Ennio Marker",
        heading: outputData.blocks[0].data.text,
        tags: tags,
        summary: "Test summary",
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
