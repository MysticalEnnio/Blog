const fetch = require("node-fetch");

//fetch localhost/api/deleteComment
//include test postId, commentID, userId and password
fetch("http://localhost/api/deleteComment", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    postId: "123456789abcdef",
    commentId: "edb5d3a65eb1b45eb203abcfad29bf02",
    replyCommentId: "50ae82ca03d4d0b8601b05c7ecfaca85",
    userId: "931e624e3e6a9bbf4b8fa1ac446f895a",
    password: "15937Ab!",
  }),
})
  .then((response) => response.json())
  .then((data) => {
    console.log(data);
    process.exit();
  })
  .catch((error) => {
    console.error("Error:", error);
    process.exit();
  });
