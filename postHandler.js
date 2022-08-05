const base64url = require("base64url");
const fs = require("fs");
const ejs = require("ejs");
const translatte = require("translatte");

module.exports = {
  show: function (postData, res) {
    finishedTranslations = 0;
    translatte(postData.heading, { to: "de" })
      .then((res) => {
        postData.heading = res.text;
        finishedTranslations++;
      })
      .catch((err) => {
        console.error(err);
      });
    postData.content.forEach((element) => {
      translatte(element.data.text || element.data.caption, { to: "de" })
        .then((res) => {
          if (element.data.text) element.data.text = res.text;
          else element.data.caption = res.text;
          finishedTranslations++;
        })
        .catch((err) => {
          console.error(err);
        });
    });
    const html = fs.readFileSync(__dirname + "/static/page.html", "utf8");
    console.log("postData: " + JSON.stringify(postData));
    let interval = setInterval(() => {
      if (finishedTranslations > postData.content.length) {
        clearInterval(interval);
        res.send(ejs.render(html, { postData: JSON.stringify(postData) }));
      }
    }, 50);
  },
};
