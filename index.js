require("dotenv").config();
const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const fileUpload = require("express-fileupload");
const crypto = require("crypto");
var ImageKit = require("imagekit");
const post = require("./postHandler.js");
const comment = require("./commentSystem.js");
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
let authorizedUsers = [];

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

app.use(cookieParser());
app.use(cors());
app.use(bodyParser.json());
app.use(fileUpload());
app.use(express.static("public"));

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

app.all("/api/ping", (req, res) => res.send("pong"));

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
  if (req.query.id && !req.query.id == "test") {
    connectToDb(() => {
      db.collection("Posts")
        .find({ id: req.query.id })
        .toArray()
        .then((posts) => post.show(posts[0], res, req.query.lang));
    });
  } else {
    res.redirect("/");
  }
});

app.get("/api/getPosts", function (req, res) {
  console.log("getPosts");
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
        res.setHeader("Content-Type", "application/json");
        res.setHeader(
          "Content-disposition",
          `attachment; filename=${posts[0].id}.json`
        );
        res.send(JSON.stringify(posts[0]));
      });
  });
});

app.get("/api/deleteTestPosts", function (req, res) {
  connectToDb(() => {
    db.collection("Posts").deleteMany({ summary: /^test$/i });
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
    if (post.summary.toLowerCase() == "test") return;
    db.collection("Subscriptions")
      .find({})
      .toArray()
      .then((subscriptions) => sendNotifications(subscriptions, id));
  });
});

app.post("/api/addComment", function (req, res) {
  let reqData = req.body;
  if (!reqData.postId) {
    res.send({ status: 400, message: "missing post id" });
    return;
  }
  if (!reqData.comment) {
    res.send({ status: 400, message: "missing comment" });
    return;
  }
  if (!reqData.author) {
    res.send({ status: 400, message: "missing author" });
    return;
  }
  comment.add(connectToDb, crypto, res, reqData);
});

app.post("/api/deleteComment", function (req, res) {
  let reqData = req.body;
  if (!reqData.postId) {
    res.send({ status: 400, message: "missing post id" });
    return;
  }
  if (!reqData.commentId) {
    res.send({ status: 400, message: "missing comment id" });
    return;
  }
  if (!reqData.userId) {
    res.send({ status: 400, message: "missing user id" });
    return;
  }
  if (!reqData.password) {
    res.send({ status: 400, message: "missing password" });
    return;
  }
  comment.delete(connectToDb, res, reqData);
});

app.get("/api/makeAdmin", function (req, res) {
  if (!req.query.id) {
    res.send("No id specified");
    return;
  }
  connectToDb(() => {
    db.collection("Users").updateOne(
      { id: req.query.id },
      { $set: { admin: true } }
    );
    res.send(200);
  });
});

app.get("/api/notificationTest", function (req, res) {
  connectToDb(() => {
    res.sendStatus(200);
    db.collection("Subscriptions")
      .find({})
      .toArray()
      .then((subscriptions) => {
        const payload = JSON.stringify({
          title: "Benachrichtigungstest",
          message: "Bitte diesen test ignorieren",
          postId: "test",
        });
        console.log("Sending notification...");
        //pass the object into sendNotification fucntion and catch any error
        subscriptions.forEach((subscription) => {
          webpush
            .sendNotification(subscription, payload)
            .then((data) => {
              console.log(data.statusCode);
            })
            .catch((err) => {
              console.error(err.statusCode + ": " + err.body);
              db.collection("Subscriptions").deleteOne({
                endpoint: subscription.endpoint,
              });
            });
        });
        console.log("All notifications send");
      });
  });
});

app.get("/api/seenNotification", function (req, res) {
  console.log("seenNotification: " + req.query.id);
});

app.post("/api/addNotificationName", function (req, res) {
  let reqData = req.body;
  connectToDb(() => {
    db.collection("Subscriptions")
      .updateOne(
        {
          endpoint: reqData.subscription.endpoint,
        },
        {
          $set: {
            userId: reqData.userId,
          },
        }
      )
      .then(() => res.send({ status: 200 }));
  });
});

app.post("/api/login", function (req, res) {
  /*
  1: Check if name, password, and email are provided
  2: Check if account exists with email or name
    2.2: Check if password, name and email is correct
      2.2.2: If one wrong, send error
      2.2.3: If all correct, send success and id
  3: If account does not exist create account and send success and id
  */
  let reqData = req.body;
  if (!reqData.name) {
    res.send({ status: 400, message: "missing name" });
    return;
  }
  if (!reqData.password) {
    res.send({ status: 400, message: "missing password" });
    return;
  }
  if (!reqData.email) {
    res.send({ status: 400, message: "missing email" });
    return;
  }
  console.log("all data provided");
  setTimeout(() => {
    connectToDb(() => {
      console.log("connected to db");
      db.collection("Users")
        .find({ $or: [{ email: reqData.email }, { name: reqData.name }] })
        .toArray()
        .then((users) => {
          if (users.length == 0) {
            console.log("no user found");
            //create account
            let id = crypto
              .createHash("md5")
              .update(reqData.name)
              .digest("hex");
            db.collection("Users").insertOne({
              id: id,
              name: reqData.name,
              email: reqData.email,
              password: reqData.password,
            });
            res.send({ status: 200, id });
          } else {
            //check if email is correct
            if (users[0].email != reqData.email) {
              console.log("email wrong");
              res.send({ status: 400, message: "wrong email" });
              return;
            }
            //check if name is correct
            if (users[0].name != reqData.name) {
              console.log("name wrong");
              res.send({ status: 400, message: "wrong name" });
              return;
            }
            //check if password is correct
            if (users[0].password == reqData.password) {
              console.log("password correct");
              res.send({ status: 200, id: users[0].id });
            }
          }
        });
    });
  }, 1000);
});

app.post("/api/verifyId", function (req, res) {
  console.log("verifyId");
  /*
  1: Check if id is provided
  2: Check if password is provided
  3: call verifyId
  */
  let reqData = req.body;
  if (!reqData.id) res.send({ status: 400, message: "missing id" });
  if (!reqData.password) res.send({ status: 400, message: "missing password" });
  verifyId(reqData.id, reqData.password, (resData) => res.send(resData));
});

function verifyId(id, password, callback) {
  /*
  1: Check if account exists with id
    1.2: Check if password is correct
      1.2.2: If wrong, send error
      1.2.3: If correct, send success
  2: If account does not exist send error
  */
  if (!authorizedUsers.includes(id)) {
    connectToDb(() => {
      db.collection("Users")
        .find({ id: id })
        .toArray()
        .then((users) => {
          if (users.length == 0) {
            callback({ status: 400, message: "wrong id" });
          } else {
            if (users[0].password == password) {
              authorizedUsers.push(id);
              callback({ status: 200 });
            } else {
              callback({ status: 400, message: "wrong password" });
            }
          }
        });
    });
  } else {
    callback({ status: 200 });
  }
}

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
      .then((data) => {
        console.log(data.statusCode + ": " + data.body);
      })
      .catch((err) => {
        console.error(err.statusCode + ": " + err.body);
        db.collection("Subscriptions").deleteOne({
          endpoint: subscription.endpoint,
        });
      });
  });
  console.log("All notifications send");
}

function connectToDb(callback) {
  if (db) {
    if (callback) callback(db);
    return;
  }
  if (dbConnected) {
    db = dbo.getDb;
    if (callback) callback(db);
  } else
    dbo.connectToServer((err, _db) => {
      if (err) console.error(err);
      connectToDb(callback);
      return;
      db = _db;
      dbConnected = true;
      if (callback) callback(db);
    });
}

app.listen(port, function () {
  console.log("CORS-enabled web server listening on port " + port);
});

connectToDb();
