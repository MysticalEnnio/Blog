const base64url = require("base64url");
const fs = require("fs");
const ejs = require("ejs");
const fetch = require("node-fetch");

function translate(toTranslate, language) {
  const url = "https://deep-translate1.p.rapidapi.com/language/translate/v2";

  const options = {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "X-RapidAPI-Key": "77d4e8d36bmsh5206e9dbe3c517fp16b990jsnfbec6919a5cb",
      "X-RapidAPI-Host": "deep-translate1.p.rapidapi.com",
    },
    body: JSON.stringify({
      q: toTranslate,
      source: "en",
      target: language,
    }),
  };

  return new Promise((resolve, reject) => {
    fetch(url, options)
      .then((res) => res.json())
      .then((data) => {
        resolve(data);
      })
      .catch((err) => {
        reject(err);
      });
  });
}

module.exports = {
  show: function (postData, res, lang = "de", connectToDb) {
    const html = fs.readFileSync(__dirname + "/static/page.html", "utf8");
    //check if translation exists
    connectToDb((db) => {
      db.collection("Translations")
        .findOne({ id: postData.id })
        .then((result) => {
          if (
            result?.translations.filter((t) => t.language == lang).length > 0
          ) {
            res.send(
              ejs.render(html, {
                postData: JSON.stringify(
                  result?.translations.filter((t) => t.language == lang)[0]
                    .postData
                ),
              })
            );
            return;
          }
          finishedTranslations = 0;
          translate(postData.heading, lang)
            .then((res) => {
              postData.heading = res.data.translations.translatedText;
              finishedTranslations++;
            })
            .catch((err) => {
              console.error(err);
            });
          postData.content.forEach((element) => {
            translate(element.data.text || element.data.caption, lang)
              .then((res) => {
                if (element.data.text)
                  element.data.text = res.data.translations.translatedText;
                else
                  element.data.caption = res.data.translations.translatedText;
                finishedTranslations++;
              })
              .catch((err) => {
                console.error(err);
              });
          });

          let interval = setInterval(() => {
            if (finishedTranslations > postData.content.length) {
              clearInterval(interval);
              res.send(
                ejs.render(html, { postData: JSON.stringify(postData) })
              );
              /*
              save post translation to database
      
              dbStructure:
              {
                id: "postID",
                translations: [
                  {
                    language: "de",
                    postData: postData
                  }
                ]
              }
      
              1. get post id
                1.1 check if postId exists in database
                  1.1.1 if not, create new entry with translation and return
              2 check if translation exists
                2.1 if not, add translation to database and return
              3. if translation exists, do nothing
              */

              db.collection("Translations")
                .findOne({ id: postData.id })
                .then((result) => {
                  if (result) {
                    result.translations.forEach((translation) => {
                      if (translation.language == lang) {
                        return;
                      }
                    });
                    db.collection("Translations").updateOne(
                      { id: postData.id },
                      {
                        $push: {
                          translations: {
                            language: lang,
                            postData: postData,
                          },
                        },
                      }
                    );
                  } else {
                    db.collection("Translations").insertOne({
                      id: postData.id,
                      translations: [
                        {
                          language: lang,
                          postData: postData,
                        },
                      ],
                    });
                  }
                });
            }
          }, 50);
        });
    });
  },
};
