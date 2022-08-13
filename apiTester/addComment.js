const fetch = require("node-fetch");

//fetch localhost/api/addComment
//include test postId, comment and author(authorId)
fetch("http://localhost/api/addComment", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    postId: "123456789abcdef",
    comment: "comment",
    author: "authorId",
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
