const base64url = require("base64url");
const fs = require("fs");
var posts = JSON.parse(fs.readFileSync("public/json/posts.json", "utf8"));

module.exports = {
  show: function (postId, res) {
    res.send(posts.find((e) => e.id == postId));
  },
};
