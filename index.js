const express = require("express");
const cors = require("cors");
const app = express();
const port = 80 || 8080;
const post = require("./postHandler.js");

app.use(cors());
app.use(express.static("public"));

app.get("/", function (req, res) {
  res.sendFile(__dirname + "/static/index.html");
});

app.get("/post", function (req, res) {
  console.log("post: " + req.query.id);
  if (req.query.id) {
    post.show(req.query.id, res);
  } else {
    res.redirect("/");
  }
});

app.listen(port, function () {
  console.log("CORS-enabled web server listening on port " + port);
});
