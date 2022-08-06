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
let dbConnected = false;
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

  connectToDb(() => {
    db.collection("Subscriptions")
      .find({
        endpoint: notificationSubscription.endpoint,
      })
      .toArray()
      .then((data) => {
        if (data.length == 0) {
          db.collection("Subscriptions").insertOne(notificationSubscription);
          //send status 201 for the request
          res.status(201).json({});
        }
      });
  });
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
  imagekit.upload(
    {
      file: req.body.url, //required
      fileName: req.body.url.slice(
        req.body.url.lastIndexOf("/"),
        req.body.url.length
      ), //required
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

app.get("/api/addTag", function (req, res) {
  if (!req.query.name) {
    res.send("No tag specified");
    return;
  }
  connectToDb(() => {
    db.collection("Tags").insertOne({
      name: req.query.name,
    });
    res.send(200);
  });
});

app.get("/api/getTags", function (req, res) {
  connectToDb(() => {
    db.collection("Tags")
      .find({})
      .toArray()
      .then((tags) => res.send(tags));
  });
});

app.get("/post", function (req, res) {
  console.log("post: " + req.query.id);
  if (req.query.id) {
    connectToDb(() => {
      db.collection("Posts")
        .find({ id: req.query.id })
        .toArray()
        .then((posts) => post.show(posts[0], res));
    });
  } else {
    res.redirect("/");
  }
});

app.get("/api/getPosts", function (req, res) {
  connectToDb(() => {
    db.collection("Posts")
      .find({})
      .toArray()
      .then((posts) => res.send(posts));
  });
});

app.get("/api/downloadPost", function (req, res) {
  connectToDb(() => {
    db.collection("Posts")
      .find({ id: req.query.id })
      .toArray()
      .then((posts) => {
        const file = `public/posts/${posts[0].id}.json`;
        fs.writeFile(
          file,
          JSON.stringify(posts[0]),
          { overwrite: false },
          function (err) {
            if (err) throw err;
            console.log("It's saved!");
            res.download(`${__dirname}/${file}`);
          }
        );
      });
  });
});

app.get("/api/deleteTestPosts", function (req, res) {
  connectToDb(() => {
    db.collection("Posts").deleteMany({ summary: "test" });
    res.sendStatus(200);
  });
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

  connectToDb(() => {
    db.collection("Posts").insertOne(post);
    res.send({ status: 200, id });
    if (post.summary == "test") return;
    db.collection("Subscriptions")
      .find({})
      .toArray()
      .then((subscriptions) => sendNotifications(subscriptions, id));
  });
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
  if (db) {
    if (callback) callback();
    return;
  }
  if (dbConnected) {
    db = dbo.getDb;
    if (callback) callback();
  } else
    dbo.connectToServer((err, _db) => {
      if (err) console.error(err);
      db = _db;
      dbConnected = true;
      if (callback) callback();
    });
}

app.listen(port, function () {
  console.log("CORS-enabled web server listening on port " + port);
});

connectToDb();
