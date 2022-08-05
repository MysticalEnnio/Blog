require("dotenv").config();
const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const fileUpload = require("express-fileupload");
const crypto = require("crypto");
const fetch = require("node-fetch");
const post = require("./postHandler.js");
const fs = require("fs");
const dbo = require("./db/connection");
//const CyclicDb = require("cyclic-dynamodb");
const app = express();
const port = process.env.PORT || 80;

//const db = CyclicDb("encouraging-clothes-bearCyclicDB");
//const posts = db.collection("posts");

let db;
let posts = [];

app.use(express.static("public"));
app.use(cors());
app.use(bodyParser.json());
app.use(fileUpload());

app.post("/api/image/uploadFile", function (req, res) {
  let imgB64 = req.files.image
    .mv(`public/images/${req.files.image.md5}.png`)
    .then(() => {
      res.send({
        success: 1,
        file: {
          url: `http://localhost/images/${req.files.image.md5}.png`,
          //`https://blog.mystaredia.de/images/${req.files.image.md5}.png`
          // ... and any additional fields you want to store, such as width, height, color, extension, etc
        },
      });
    });
});

app.post("/api/image/uploadUrl", function (req, res) {
  console.log("uploadUrl");
});

app.get("/api/addTag", function (req, res) {
  fs.readFile("public/json/tags.json", (err, data) => {
    if (err) throw err;
    let tags = JSON.parse(data);
    tags.push(req.query.tag);
    fs.writeFile("public/json/tags.json", JSON.stringify(tags), (err) => {
      if (err) throw err;
      res.send("200");
    });
  });
});

app.get("/post", function (req, res) {
  console.log("post: " + req.query.id);
  if (req.query.id) {
    if (db != undefined) {
      db.collection("Posts")
        .find({ id: req.query.id })
        .toArray()
        .then((posts) => post.show(posts[0], res));
    } else {
      connectToDb(() => {
        db.collection("Posts")
          .find({ id: req.query.id })
          .toArray()
          .then((posts) => post.show(posts[0], res));
      });
    }
  } else {
    res.redirect("/");
  }
});

app.get("/api/getPosts", function (req, res) {
  db.collection("Posts")
    .find({})
    .toArray()
    .then((posts) => res.send(posts));
});

app.post("/api/newPost", function (req, res) {
  let reqData = req.body;
  if (!reqData.author) res.send("missing author");
  if (!reqData.heading) res.send("missing heading");
  if (!reqData.summary) res.send("missing summary");
  if (!reqData.content) res.send("missing content");
  console.log(reqData);
  let id = crypto.createHash("md5").update(reqData.heading).digest("hex");
  let post = {
    id: id,
    author: reqData.author,
    heading: reqData.heading,
    tags: reqData.tags ? reqData.tags : [],
    summary: reqData.summary,
    timestamp: reqData.timestamp,
    content: reqData.content,
  };

  db.collection("Posts").insertOne(post);

  //posts.set(id, post);

  /*fs.readFile("public/json/posts.json", function (err, data) {
    if (err) throw err;
    let posts = JSON.parse(data);
    posts.push({
      id: id,
      author: reqData.author,
      heading: reqData.heading,
      tags: reqData.tags ? reqData.tags : [],
      summary: reqData.summary,
      timestamp: reqData.timestamp,
      content: reqData.content,
    });
    fs.writeFile(
      "public/json/posts.json",
      JSON.stringify(posts),
      function (err) {
        if (err) throw err;
        res.send("200");
      }
    );
  });*/
});

function connectToDb(callback) {
  dbo.connectToServer((err, _db) => {
    if (err) console.error(err);
    db = _db;
    if (callback) callback();
  });
}

app.listen(port, function () {
  console.log("CORS-enabled web server listening on port " + port);
});

connectToDb();
