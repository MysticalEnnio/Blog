let avaibleTags = [];
let selectedTags = [];

(function loadTags() {
  //fetch the tags from the server
  fetch("/api/tags/get")
    .then((response) => response.json())
    .then((data) => {
      avaibleTags = [];
      data.forEach((tag) => {
        avaibleTags.push({
          type: "checkbox",
          name: tag.name,
          label: tag.name,
        });
      });
    });
})();

//Wait for dom to load
document.addEventListener("DOMContentLoaded", () => {
  (async () => {
    if (localStorage.getItem("password") && localStorage.getItem("id")) {
      fetch("/api/account/verifyId", {
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

  var useDarkMode = window.matchMedia("(prefers-color-scheme: dark)").matches;

  tinymce.init({
    selector: "textarea#editor",
    plugins:
      "preview paste importcss searchreplace autolink autosave save directionality code visualblocks visualchars fullscreen image editimage link media template codesample table charmap pagebreak nonbreaking anchor toc insertdatetime advlist lists wordcount imagetools textpattern noneditable help charmap quickbars emoticons autoresize",
    imagetools_cors_hosts: ["picsum.photos"],
    menubar: "file edit view insert format tools table help",
    menu: {
      file: {
        title: "File",
        items:
          "savetoserver | newdocument restoredraft | preview | export print | deleteallconversations",
      },
    },
    toolbar:
      "undo redo | styles | fontselect fontsizeselect formatselect | alignleft aligncenter alignright alignjustify | outdent indent |  numlist bullist | forecolor backcolor removeformat | pagebreak | charmap emoticons | fullscreen  preview save | insertfile image media template link anchor codesample | ltr rtl",
    setup: (editor) => {
      editor.ui.registry.addMenuItem("savetoserver", {
        text: "Save",
        onAction: () => {
          if (
            document
              .getElementById("editor_ifr")
              .contentWindow.document.getElementById("tinymce")?.firstChild
              ?.nodeName != "H1"
          ) {
            alert(
              "Please add a h1 tag to the start of your post to use as a title"
            );
            return;
          }
          tinymce.activeEditor.windowManager.open({
            title: "Post Summary", // The dialog's title - displayed in the dialog header
            body: {
              type: "panel", // The root body type - a Panel or TabPanel
              items: [
                {
                  type: "input",
                  name: "summary",
                  label: "enter a summary for your post",
                },
              ],
            },
            buttons: [
              {
                type: "cancel",
                name: "closeButton",
                text: "Cancel",
              },
              {
                type: "submit",
                name: "nextButton",
                text: "Next",
                buttonType: "primary",
              },
            ],
            onSubmit: (api) => {
              const summary = api.getData().summary;
              if (summary.length > 150) {
                alert(
                  "Summary is too long, please keep it under 150 characters"
                );
              } else if (summary.length < 3) {
                alert("Summary is too short, please make it longer");
              } else {
                api.close();
                tinymce.activeEditor.windowManager.open({
                  title: "Post Tags", // The dialog's title - displayed in the dialog header
                  body: {
                    type: "panel", // The root body type - a Panel or TabPanel
                    items: avaibleTags,
                  },
                  buttons: [
                    {
                      type: "cancel",
                      name: "closeButton",
                      text: "Cancel",
                    },
                    {
                      type: "submit",
                      name: "nextButton",
                      text: "Next",
                      buttonType: "primary",
                    },
                  ],
                  onSubmit: (api) => {
                    const data = api.getData();
                    selectedTags = [];
                    Object.keys(data).forEach(function (key, index) {
                      selectedTags.push(key);
                    });
                    if (selectedTags.length == 0) {
                      alert("Please select at least one tag for your post");
                    } else {
                      let postBody = JSON.stringify({
                        timestamp: Date.now(),
                        author: "Ennio Marke",
                        heading: document
                          .getElementById("editor_ifr")
                          .contentWindow.document.getElementById("tinymce")
                          .firstChild.innerHTML,
                        tags: selectedTags,
                        summary,
                        content: tinymce.activeEditor.getContent(),
                      });
                      console.log("Post body: ", postBody);
                      fetch(`/api/posts/new`, {
                        method: "POST",
                        headers: {
                          Accept: "application/json",
                          "Content-Type": "application/json",
                        },
                        body: postBody,
                      })
                        .then((res) => res.json())
                        .then((response) => {
                          console.log(response);
                          if (response.status == "200") {
                            /*window.open("/api/downloadPost?id=" + response.id);
                            //redirect to start page*/
                            window.location.href = "/";
                            api.close();
                          }
                        })
                        .catch((error) => alert("Error:", error));
                    }
                  },
                });
              }
            },
          });
        },
      });
    },
    images_upload_url: "/api/image/uploadFile",
    toolbar_sticky: true,
    autosave_ask_before_unload: true,
    autosave_interval: "30s",
    autosave_prefix: "{path}{query}-{id}-",
    autosave_restore_when_empty: false,
    autosave_retention: "2m",
    image_advtab: true,
    importcss_append: true,
    file_picker_callback: function (callback, value, meta) {
      /* Provide file and text for the link dialog */
      if (meta.filetype === "file") {
        callback("https://www.google.com/logos/google.jpg", {
          text: "My text",
        });
      }

      /* Provide image and alt text for the image dialog */
      if (meta.filetype === "image") {
        callback("https://www.google.com/logos/google.jpg", {
          alt: "My alt text",
        });
      }

      /* Provide alternative source and posted for the media dialog */
      if (meta.filetype === "media") {
        callback("movie.mp4", {
          source2: "alt.ogg",
          poster: "https://www.google.com/logos/google.jpg",
        });
      }
    },
    templates: [
      {
        title: "New Table",
        description: "creates a new table",
        content:
          '<div class="mceTmpl"><table width="98%%"  border="0" cellspacing="0" cellpadding="0"><tr><th scope="col"> </th><th scope="col"> </th></tr><tr><td> </td><td> </td></tr></table></div>',
      },
      {
        title: "Starting my story",
        description: "A cure for writers block",
        content: "Once upon a time...",
      },
      {
        title: "New list with dates",
        description: "New List with dates",
        content:
          '<div class="mceTmpl"><span class="cdate">cdate</span><br /><span class="mdate">mdate</span><h2>My List</h2><ul><li></li><li></li></ul></div>',
      },
    ],
    template_cdate_format: "[Date Created (CDATE): %m/%d/%Y : %H:%M:%S]",
    template_mdate_format: "[Date Modified (MDATE): %m/%d/%Y : %H:%M:%S]",
    image_caption: true,
    quickbars_selection_toolbar:
      "bold italic | quicklink h2 h3 blockquote quickimage quicktable",
    noneditable_noneditable_class: "mceNonEditable",
    toolbar_mode: "sliding",
    contextmenu: "link image imagetools table",
    skin: useDarkMode ? "oxide-dark" : "oxide",
    content_css: useDarkMode ? "dark" : "default",
    content_style:
      "body { font-family:Helvetica,Arial,sans-serif; font-size:14px }",
  });
});
