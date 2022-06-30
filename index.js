const express = require("express");
const cors = require("cors");
const app = express();
const port = 80 || 8080;
const post = require("./postHandler.js");
const fs = require("fs");

app.use(cors());
app.use(express.static("public"));

app.get("/post", function (req, res) {
  console.log("post: " + req.query.id);
  if (req.query.id) {
    post.show(req.query.id, res);
  } else {
    res.redirect("/");
  }
});

app.get("/newPost", function (req, res) {
  if (!req.query.id) res.send("missing id");
  if (!req.query.author) res.send("missing author");
  if (!req.query.heading) res.send("missing heading");
  if (!req.query.summary) res.send("missing summary");
  if (!req.query.content) res.send("missing content");

  fs.readFile("public/json/posts.json", function (err, data) {
    if (err) throw err;
    let posts = JSON.parse(data);
    posts.push({
      id: req.query.id,
      timestamp: Date.now(),
      author: req.query.author,
      heading: req.query.heading,
      tags: req.query.tags ? req.query.tags : [],
      summary: req.query.summary,
      content: req.query.content,
    });
    fs.writeFile(
      "public/json/posts.json",
      JSON.stringify(posts),
      function (err) {
        if (err) throw err;
        res.send("200");
      }
    );
  });
});

app.listen(port, function () {
  console.log("CORS-enabled web server listening on port " + port);
});
