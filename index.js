var express = require("express");
var cors = require("cors");
var app = express();
const port = 80;

app.use(cors());
app.use(express.static("public"));

app.get("/", function (req, res) {
  console.log("post: " + req.query.post);
  if (req.query.post) {
    post.show(req.query.post, res);
  } else {
    res.sendFile(__dirname + "/static/index.html");
  }
});

module.exports = app;
/*app.listen(port, function () {
  console.log("CORS-enabled web server listening on port " + port);
});*/
