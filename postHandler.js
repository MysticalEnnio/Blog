const base64url = require("base64url");
const fs = require("fs");
const ejs = require("ejs");

module.exports = {
  show: function (postData, res) {
    const html = fs.readFileSync(__dirname + "/static/page.html", "utf8");
    console.log("postData: " + JSON.stringify(postData));
    res.send(ejs.render(html, { postData: JSON.stringify(postData) }));
  },
};
