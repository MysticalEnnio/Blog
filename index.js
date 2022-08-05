require("dotenv").config();
const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const fileUpload = require("express-fileupload");
const crypto = require("crypto");
var ImageKit = require("imagekit");
const post = require("./postHandler.js");
const fs = require("fs");
const webpush = require("web-push");
const dbo = require("./db/connection");
//const CyclicDb = require("cyclic-dynamodb");
const app = express();
const port = process.env.PORT || 80;

//const db = CyclicDb("encouraging-clothes-bearCyclicDB");
//const posts = db.collection("posts");

let db;
let posts = [];
var imagekit = new ImageKit({
  publicKey: "public_D202xiGxO/ZlrH8PUHojBH95ft8=",
  privateKey: process.env.IMAGEKIT_PRIVATE_KEY,
  urlEndpoint: "https://ik.imagekit.io/mystical/",
});

//storing the keys in variables
const publicVapidKey =
  "BH6sYvnAi9yM8aPtp8lHE0h9Her_ERKt6_XwTKiOA_6L0rUPsipAo-TL30QLj37DrVJkxk0fVCiWskd3sfZnSg0";
const privateVapidKey = process.env.VAPID_PRIVATE_KEY;

//setting vapid keys details
webpush.setVapidDetails(
  "mailto:ennio@mystaredia.de",
  publicVapidKey,
  privateVapidKey
);

app.use(express.static("public"));
app.use(cors());
app.use(bodyParser.json());
app.use(fileUpload());

//subscribe route
app.post("/subscribe", (req, res) => {
  //get push subscription object from the request
  const notificationSubscription = req.body;

  db.collection("Subscriptions")
    .find({
      endpoint: notificationSubscription.endpoint,
    })
    .toArray()
    .then((data) => console.log);

  if (db != undefined) {
    db.collection("Subscriptions")
      .find({
        endpoint: notificationSubscription.endpoint,
      })
      .toArray()
      .then((data) => {
        console.log(data);
        if (data.length == 0) {
          db.collection("Subscriptions").insertOne(notificationSubscription);
        }
      });
  } else {
    connectToDb(() => {
      db.collection("Subscriptions")
        .find({
          keys: { auth: notificationSubscription.keys.auth },
        })
        .toArray()
        .then((data) => {
          console.log(data);
          if (data.length == 0) {
            db.collection("Subscriptions").insertOne(notificationSubscription);
          }
        });
    });
  }

  //send status 201 for the request
  res.status(201).json({});
});

app.post("/api/image/uploadFile", function (req, res) {
  imagekit.upload(
    {
      file: req.files.image.data, //required
      fileName: req.files.image.md5, //required
      tags: ["usa-blog"],
    },
    function (error, result) {
      if (error) {
        console.log(error);
        res.send({
          success: 0,
        });
      } else {
        console.log(result);
        res.send({
          success: 1,
          file: {
            url: result.url,
            // ... and any additional fields you want to store, such as width, height, color, extension, etc
          },
        });
      }
    }
  );
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
  if (db != undefined) {
    db.collection("Posts")
      .find({})
      .toArray()
      .then((posts) => res.send(posts));
  } else {
    connectToDb(() => {
      db.collection("Posts")
        .find({})
        .toArray()
        .then((posts) => res.send(posts));
    });
  }
});

app.get("/deleteTestPosts", function (req, res) {
  if (db != undefined) {
    db.collection("Posts").deleteMany({ summary: "test" });
  } else {
    connectToDb(() => {
      db.collection("Posts").deleteMany({ summary: "test" });
    });
  }
  res.sendStatus(200);
});

app.post("/api/newPost", function (req, res) {
  console.log("newPost");
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

  res.send("200");
  if (db != undefined) {
    db.collection("Posts").insertOne(post);
    db.collection("Subscriptions")
      .find({})
      .toArray()
      .then((subscriptions) => sendNotifications(subscriptions, id));
  } else {
    connectToDb(() => {
      db.collection("Posts").insertOne(post);
      db.collection("Subscriptions")
        .find({})
        .toArray()
        .then((subscriptions) => sendNotifications(subscriptions, id));
    });
  }
});

function sendNotifications(subscriptions, id) {
  console.log(subscriptions);
  //create paylod: specified the detals of the push notification
  const payload = JSON.stringify({
    title: "Es ist ein neuer Blogbeitrag von Ennio verfügbar",
    message: "Klicke hier um ihn zu lesen",
    postId: id,
  });
  console.log("Sending notification...");
  //pass the object into sendNotification fucntion and catch any error
  subscriptions.forEach((subscription) => {
    webpush
      .sendNotification(subscription, payload)
      .then((data) => console.log(data))
      .catch((err) => console.error(err));
  });
  console.log("All notifications send");
}

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
