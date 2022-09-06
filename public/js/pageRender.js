const userProfilePicture =
  localStorage.getItem("profilePicture") ??
  "https://ik.imagekit.io/mystical/Default_Pb_vXykZsFHE.png";
const userId = localStorage.getItem("id");
const userName = localStorage.getItem("name");
const userPassword = localStorage.getItem("password");

function auto_grow(element) {
  element.style.height = "5px";
  element.style.height = element.scrollHeight + 2 + "px";
}

document.addEventListener("DOMContentLoaded", () => {
  (async () => {
    if (userPassword && userId) {
      fetch("/api/account/verifyId", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          password: userPassword,
          id: userId,
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
    tags.prepend(tagEl);
  });
  document.getElementById("postContent").innerHTML = postContent;
  //remove first child
  document.getElementById("postContent").firstChild.remove();

  document.querySelector(".profilePicture").src = userProfilePicture;

  /*
  Comment loader

  dbStructure: comments [
      {
        id: 123456789abcdef,
        author: "authorId",
        authorName: "authorName",
        authorProfilePicture: "authorProfilePicture",
        comment: "comment",
        timestamp: 123456789,
        replyComments: [
          {
            id: 987654321fedcba,
            author: "authorId",
            authorName: "authorName",
            authorProfilePicture: "authorProfilePicture",
            comment: "comment",
            timestamp: 123456789,
          },
          {
            id: 123456789abcdef,
            author: "authorId",
            authorName: "authorName",
            authorProfilePicture: "authorProfilePicture",
            comment: "comment",
            timestamp: 123456789,
            replyTo: 987654321fedcba,
          }
        ]
      }
    ]

  1. Get all comments from the database (GET /api/comments/get?postId=postId)
    1.1. If there are no comments, display a message saying so
  2. Load all direct Comments
  3. Load all replies to comments and append them to the correct comment
  4. Load all replies to replies and place them under the correct reply
  */
  fetch("/api/comments/get?postId=" + postData.id)
    .then((res) => res.json())
    .then((data) => {
      if (data.comments.length == 0) {
        document.getElementById("noComments").classList.remove("hide");
      } else {
        data.comments.map((comment) => {
          loadComment({
            id: comment.id,
            authorName: comment.authorName,
            authorProfilePicture: comment.authorProfilePicture,
            comment: comment.comment,
            timestamp: new Date(comment.timestamp * 1).toLocaleDateString(
              undefined,
              {
                year: "numeric",
                month: "long",
                day: "numeric",
              }
            ),
            likes: comment.likes,
          });
          if (comment.replyComments.length > 0) {
            comment.replyComments
              .filter((commentF) => !commentF.replyTo)
              .sort((a, b) => a.timestamp - b.timestamp)
              .map((replyComment) => {
                loadComment({
                  id: replyComment.id,
                  replyId: comment.id,
                  authorName: replyComment.authorName,
                  authorProfilePicture: replyComment.authorProfilePicture,
                  comment: replyComment.comment,
                  timestamp: new Date(
                    replyComment.timestamp * 1
                  ).toLocaleDateString(undefined, {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  }),
                  likes: replyComment.likes,
                });
                replyToComment = comment.replyComments.filter(
                  (commentF) => commentF.replyTo == replyComment.id
                );
                if (replyToComment.length > 0) {
                  replyToComment
                    .sort((a, b) => a.timestamp - b.timestamp)
                    .map((replyToComment) => {
                      loadComment({
                        id: replyToComment.id,
                        replyId: comment.id,
                        replyCommentId: replyComment.id,
                        replyCommentAuthor: replyComment.authorName,
                        authorName: replyToComment.authorName,
                        authorProfilePicture:
                          replyToComment.authorProfilePicture,
                        comment: replyToComment.comment,
                        timestamp: new Date(
                          replyToComment.timestamp * 1
                        ).toLocaleDateString(undefined, {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        }),
                        likes: replyToComment.likes,
                      });
                    });
                }
              });
          }
        });
      }
    });
});

function loadComment(options) {
  const commentTemplate = options.replyId
    ? document
        .querySelector("[data-reply-comment-template]")
        .content.cloneNode(true)
    : document.querySelector("[data-comment-template]").content.cloneNode(true);
  commentTemplate
    .querySelector(".comment, .replyComment")
    .setAttribute("comment-id", options.id);
  commentTemplate.querySelector(".commentAuthor").textContent =
    options.authorName;
  commentTemplate.querySelector(".commentDate").textContent = options.timestamp;
  commentTemplate.querySelector(".commentContent").textContent =
    options.comment;
  commentTemplate.querySelector(".commentLikes").textContent =
    options.likes?.length || 0;
  commentTemplate.querySelector(".toggleLike").checked = options.likes?.find(
    (e) => e == userName
  );
  //check if profile picture is set(Default: https://ik.imagekit.io/mystical/Default_Pb_vXykZsFHE.png)
  if (
    options.authorProfilePicture !=
    "https://ik.imagekit.io/mystical/Default_Pb_vXykZsFHE.png"
  ) {
    commentTemplate.querySelector(".profilePicture").src =
      options.authorProfilePicture;
  } else {
    //check if user has a profile picture asynchronusly
    let profilePictueRef = commentTemplate.querySelector(".profilePicture");
    (async () => {
      let profilePictue = profilePictueRef;
      const res = await fetch("/api/users/get?name=" + options.authorName);
      const data = await res.json();
      console.log(data);
      if (
        data.profilePicture !=
          "https://ik.imagekit.io/mystical/Default_Pb_vXykZsFHE.png" &&
        data.profilePicture != undefined
      ) {
        profilePictue.src = data.profilePicture;
      }
    })();
  }
  commentTemplate.querySelector(".newCommentWrapper .profilePicture").src =
    userProfilePicture;
  if (options.replyId) {
    const replyComment = document.querySelector(
      "[comment-id='" + options.replyId + "']"
    );
    console.log(options.replyId);
    if (options.replyCommentId) {
      commentTemplate
        .querySelector(".comment, .replyComment")
        .setAttribute("reply-to-id", options.replyCommentId);
      const replyToTemplate = document
        .querySelector("[data-reply-to-template]")
        .content.cloneNode(true);
      replyToTemplate.querySelector(".commentReplyToUser").textContent =
        options.replyCommentAuthor;
      commentTemplate
        .querySelector(".commentContentWrapper")
        .prepend(replyToTemplate);

      if (options.properInsert) {
        const replyToComment = document.querySelector(
          "[comment-id='" + options.replyCommentId + "']"
        );
        let nodeAfter = replyToComment.nextElementSibling;
        if (!nodeAfter) {
          replyComment.querySelector(".commentReplys").append(commentTemplate);
          return;
        }
        let nodeAfterReply = 1;
        while (nodeAfterReply) {
          if (
            nodeAfter?.getAttribute("reply-to-id") != options.replyCommentId
          ) {
            nodeAfterReply = 0;
            if (!nodeAfter) {
              replyComment
                .querySelector(".commentReplys")
                .append(commentTemplate);
              console.log("nodeAfter undefined");
              return;
            }
          } else {
            nodeAfter = nodeAfter.nextElementSibling;
          }
        }
        replyComment
          .querySelector(".commentReplys")
          .insertBefore(commentTemplate, nodeAfter);
      }
      replyComment.querySelector(".commentReplys").append(commentTemplate);
      return;
    }
    document
      .querySelector("[comment-id='" + options.replyId + "']")
      .querySelector(".commentReplys")
      .append(commentTemplate);
  } else {
    document.getElementById("commentsWrapper").prepend(commentTemplate);
  }
}

function sendComment() {
  const comment = document.querySelector(".newCommentInput").value;
  if (comment == "") {
    return;
  }
  const data = {
    postId: postData.id,
    comment: comment,
    author: userId,
    authorName: userName,
    authorProfilePicture: userProfilePicture,
  };
  fetch("/api/comments/add", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  })
    .then((res) => res.json())
    .then((data) => {
      if (data.status == "200") {
        loadComment({
          id: data.id,
          authorName: userName,
          timestamp: "now",
          comment: comment,
          authorProfilePicture: userProfilePicture,
        });
        document.querySelector(".newCommentInput").value = "";
        document.getElementById("noComments").classList.toggle("hide", true);
      }
    });
}

function sendReplyComment(element, replyToReply = 0) {
  /*
        <div class="commentFooter">
          <div class="commentFooterTools">
            <div class="commentLikesWrapper">
              <input type="checkbox" class="toggleLike" onchange="toggleLike(this)">
              <div class="like-icon"></div>
              </input>
              <p class="commentLikes">0</p>
            </div>
            <p class="replyToComment disable-select" onclick="toggleReply(this)">reply</p>
          </div>
          <div class="newCommentWrapper hide">
            <div class="profilePictureWrapper"><img src="https://ik.imagekit.io/mystical/Default_Pb_vXykZsFHE.png"
                class="profilePicture"></div>
            <textarea class="newCommentInput" rows="1" oninput="auto_grow(this)" onload="auto_grow(this)"></textarea>
            <div class="sendCommentWrapper">
              <button class="sendComment" onclick="sendReplyComment(this, 1)">Send</button>
            </div>
          </div>
        </div>
  */

  let commentInput =
    element.parentElement.parentElement.querySelector(".newCommentInput");
  if (commentInput.value == "") {
    return;
  }
  let data = {};
  let replyId;
  let replyCommentId;
  let replyCommentAuthor;
  if (replyToReply) {
    replyId =
      element.parentElement.parentElement.parentElement.parentElement.parentElement.parentElement.parentElement.parentElement.getAttribute(
        "comment-id"
      );
    replyCommentId =
      element.parentElement.parentElement.parentElement.parentElement.parentElement.getAttribute(
        "comment-id"
      );
    replyCommentAuthor =
      element.parentElement.parentElement.parentElement.parentElement.parentElement.querySelector(
        ".commentAuthor"
      ).textContent;
    data = {
      postId: postData.id,
      comment: commentInput.value,
      author: userId,
      authorName: userName,
      authorProfilePicture: userProfilePicture,
      replyId,
      replyCommentId,
      replyCommentAuthor,
    };
  } else {
    replyId =
      element.parentElement.parentElement.parentElement.parentElement.parentElement.getAttribute(
        "comment-id"
      );
    data = {
      postId: postData.id,
      comment: commentInput.value,
      author: userId,
      authorName: userName,
      authorProfilePicture: userProfilePicture,
      replyId,
    };
  }
  fetch("/api/comments/add", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  })
    .then((res) => res.json())
    .then((data) => {
      if (data.status == "200") {
        let commentData = {
          id: data.id,
          authorName: userName,
          timestamp: "now",
          comment: commentInput.value,
          authorProfilePicture: userProfilePicture,
          replyId,
        };
        if (replyToReply) {
          commentData.replyCommentId = replyCommentId;
          commentData.replyCommentAuthor = replyCommentAuthor;
          commentData.properInsert = true;
        }
        loadComment(commentData);
        element.parentElement.parentElement.querySelector(
          ".newCommentInput"
        ).value = "";
        element.parentElement.parentElement.classList.add("hide");
      }
    });
}

function toggleLike(element) {
  if (element.checked) {
    element.parentElement.querySelector(".commentLikes").textContent =
      parseInt(
        element.parentElement.querySelector(".commentLikes").textContent
      ) + 1;
    fetch("/api/likes/add", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        postId: postData.id,
        commentId:
          element.parentElement.parentElement.parentElement.parentElement.parentElement.getAttribute(
            "comment-id"
          ),
        userName,
      }),
    });
  } else {
    element.parentElement.querySelector(".commentLikes").textContent =
      parseInt(
        element.parentElement.querySelector(".commentLikes").textContent
      ) - 1;
    fetch("/api/likes/remove", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        postId: postData.id,
        commentId:
          element.parentElement.parentElement.parentElement.parentElement.parentElement.getAttribute(
            "comment-id"
          ),
        userName,
      }),
    });
  }
}

function toggleReply(element) {
  element.parentElement.parentElement.parentElement
    .querySelector(".newCommentWrapper")
    .classList.toggle("hide");
  /*let replyTo =
    element.parentElement.parentElement.querySelector(
      ".commentAuthor"
    ).innerHTML;
  let commentInput = document.getElementById("newCommentInput");
  if (!commentInput.value.includes("@" + replyTo))
    commentInput.value = "@" + replyTo + " " + commentInput.value;
  commentInput.focus();*/
}

function editComment(element) {
  let commentContent =
      element.parentElement.parentElement.parentElement.parentElement.parentElement.querySelector(
        ".commentContent"
      ),
    s = window.getSelection(),
    r = document.createRange();
  element.parentElement.querySelector(".editComment").classList.add("hide");
  element.parentElement.querySelector(".cancleEdit").classList.remove("hide");
  commentContent.setAttribute("contenteditable", "true");
  commentContent.setAttribute("commentBefore", commentContent.innerHTML);
  commentContent.focus();
  if (
    typeof window.getSelection != "undefined" &&
    typeof document.createRange != "undefined"
  ) {
    var range = document.createRange();
    range.selectNodeContents(commentContent);
    range.collapse(false);
    var sel = window.getSelection();
    sel.removeAllRanges();
    sel.addRange(range);
  } else if (typeof document.body.createTextRange != "undefined") {
    var textRange = document.body.createTextRange();
    textRange.moveToElementText(commentContent);
    textRange.collapse(false);
    textRange.select();
  }
}

function cancleEdit(element) {
  let commentContent =
    element.parentElement.parentElement.parentElement.parentElement.parentElement.querySelector(
      ".commentContent"
    );
  element.parentElement.querySelector(".editComment").classList.remove("hide");
  element.parentElement.querySelector(".cancleEdit").classList.add("hide");
  commentContent.setAttribute("contenteditable", "false");
  commentContent.innerHTML = commentContent.getAttribute("commentBefore");
  commentContent.removeAttribute("commentBefore");
}
