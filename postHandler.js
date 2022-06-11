const base64url = require("base64url");
const fs = require("fs");
const ejs = require("ejs");
var posts = JSON.parse(fs.readFileSync("public/json/posts.json", "utf8"));

module.exports = {
  show: function (postId, res) {
    const html = fs.readFileSync(__dirname + "/static/page.html", "utf8");
    const postData = posts.find((e) => e.id == postId);
    console.log("postData: " + JSON.stringify(postData));
    res.send(ejs.render(html, { postData: JSON.stringify(postData) }));
  },
};
