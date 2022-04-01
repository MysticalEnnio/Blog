const base64url = require("base64url");
const fs = require("fs");
var posts = JSON.parse(fs.readFileSync("public/json/posts.json", "utf8"));

module.exports = {
  show: function (postId, res) {
    const html = fs.readFileSync(__dirname + "/static/page.html");
    res.json({
      html: html.toString(),
      data: posts.find((e) => e.id == postId),
    });
  },
};
