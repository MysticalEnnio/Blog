module.exports = {
  add: function (connectToDb, crypto, res, reqData) {
    /*
  db: Comments
  dbStructure: {
    id: 123456789abcdef,
    comments [
      {
        id: 123456789abcdef,
        author: "authorId",
        authorName: "authorName",
        authorProfilePicture: "authorProfilePicture",
        comment: "comment",
        timestamp: 123456789,
        replyComments: [
          {
            id: 987654321fedcba,
            author: "authorId",
            authorName: "authorName",
            authorProfilePicture: "authorProfilePicture",
            comment: "comment",
            timestamp: 123456789,
          },
          {
            id: 123456789abcdef,
            author: "authorId",
            authorName: "authorName",
            authorProfilePicture: "authorProfilePicture",
            comment: "comment",
            timestamp: 123456789,
            replyTo: 987654321fedcba,
          }
        ]
      }
    ]
  }

  1. get body and check if post id, comment and author are present
    1.1 if not, send error and return
  1.2 check if post id is valid  
  2. check if comment is in reply to another comment
    2.1 if yes, check if comment reply id is present
      2.1.1 if not, send error and return
      2.1.2 if yes, check if comment reply id is valid
        2.1.2.1 if not, send error and return
    2.2 generate id for comment add to replyComments from reply
  */
    connectToDb((db) => {
      db.collection("Comments")
        .find({ id: reqData.postId })
        .toArray()
        .then((posts) => {
          if (posts.length === 0) {
            //create new post
            let timestamp = new Date().getTime();
            let id = crypto
              .createHash("md5")
              .update(reqData.author + reqData.comment + timestamp)
              .digest("hex");
            db.collection("Comments").insertOne({
              id: reqData.postId,
              comments: [
                {
                  id,
                  author: reqData.author,
                  authorName: reqData.authorName,
                  authorProfilePicture: reqData.authorProfilePicture,
                  comment: reqData.comment,
                  timestamp,
                  likes: [],
                  replyComments: [],
                },
              ],
            });
            res.send({
              status: 200,
              message: "Comment added successfully",
              id,
            });
            return;
          }

          if (reqData.replyId || reqData.replyCommentId) {
            db.collection("Comments")
              .find({ id: reqData.postId, "comments.id": reqData.replyId })
              .toArray()
              .then((comments) => {
                console.log("comments");
                if (comments.length == 0) {
                  res.send({ status: 400, message: "invalid reply id" });
                  return;
                }
                let timestamp = new Date().getTime();
                let id = crypto
                  .createHash("md5")
                  .update(reqData.author + reqData.comment + timestamp)
                  .digest("hex");
                let commentData = {
                  id,
                  author: reqData.author,
                  authorName: reqData.authorName,
                  authorProfilePicture: reqData.authorProfilePicture,
                  comment: reqData.comment,
                  likes: [],
                  timestamp,
                };
                //check if reply to replycomment
                if (reqData.replyCommentId && reqData.replyCommentAuthor) {
                  //Push comment to replyComments from replyId with replyCommentId
                  db.collection("Comments")
                    .updateOne(
                      { id: reqData.postId, "comments.id": reqData.replyId },
                      {
                        $push: {
                          "comments.$.replyComments": {
                            replyTo: reqData.replyCommentId,
                            replyToAuthor: reqData.replyCommentAuthor,
                            ...commentData,
                          },
                        },
                      }
                    )
                    .then((result) => {
                      res.send({
                        status: 200,
                        message: "reply comment added to reply comment",
                        id,
                      });
                    })
                    .catch((err) => {
                      res.send({
                        status: 500,
                        message: "internal server error: " + err,
                      });
                    });
                } else {
                  //Push comment to replyComments from replyId
                  db.collection("Comments")
                    .updateOne(
                      { id: reqData.postId, "comments.id": reqData.replyId },
                      {
                        $push: {
                          "comments.$.replyComments": commentData,
                        },
                      }
                    )
                    .then((result) => {
                      res.send({
                        status: 200,
                        message: "reply comment added",
                        id,
                      });
                    })
                    .catch((err) => {
                      res.send({
                        status: 500,
                        message: "internal server error " + err,
                      });
                    });
                }
              });
          } else {
            let timestamp = new Date().getTime();
            let id = crypto
              .createHash("md5")
              .update(reqData.author + reqData.comment + timestamp)
              .digest("hex");
            let comment = {
              id,
              comment: reqData.comment,
              author: reqData.author,
              authorName: reqData.authorName,
              authorProfilePicture: reqData.authorProfilePicture,
              timestamp,
              likes: [],
              replyComments: [],
            };
            db.collection("Comments")
              .updateOne(
                { id: reqData.postId },
                {
                  $push: {
                    comments: comment,
                  },
                }
              )
              .then((result) => {
                res.send({ status: 200, message: "comment added", id });
              })
              .catch((err) => {
                res.send({
                  status: 500,
                  message: "internal server error: " + err,
                });
              });
          }
        });
    });
  },
  get: function (connectToDb, res, postId) {
    connectToDb((db) => {
      db.collection("Comments")
        .find({ id: postId })
        .toArray()
        .then((posts) => {
          if (posts.length === 0) {
            res.send({ status: 200, comments: [] });
          } else {
            res.send({ status: 200, comments: posts[0].comments });
          }
        })
        .catch((err) => {
          res.send({ status: 500, message: "internal server error: " + err });
        });
    });
  },
  delete: function (connectToDb, res, reqData) {
    connectToDb((db) => {
      //check if user is admin
      db.collection("Users")
        .find({ id: reqData.userId })
        .toArray()
        .then((users) => {
          if (users.length === 0) {
            res.send({ status: 401, message: "unauthorized" });
            return;
          }
          if (users[0].admin === false) {
            res.send({ status: 401, message: "unauthorized" });
            return;
          }
          //check if password is correct
          if (users[0].password !== reqData.password) {
            res.send({ status: 401, message: "unauthorized" });
            return;
          }
          //check if postId is valid
          db.collection("Comments")
            .find({ id: reqData.postId })
            .toArray()
            .then((posts) => {
              if (posts.length === 0) {
                res.send({ status: 400, message: "invalid post id" });
                return;
              } else {
                if (reqData.replyCommentId) {
                  db.collection("Comments")
                    .find({
                      id: reqData.postId,
                      "comments.replyComments.id": reqData.replyCommentId,
                    })
                    .toArray()
                    .then((replyComments) => {
                      if (replyComments.length === 0) {
                        res.send({
                          status: 400,
                          message: "invalid reply comment id",
                        });
                        return;
                      }
                      //add removed: true to replyComment
                      db.collection("Comments")
                        .updateOne(
                          {
                            id: reqData.postId,
                            "comments.replyComments.id": reqData.replyCommentId,
                          },
                          {
                            $set: {
                              "comments.$[i].replyComments.$[j].removed": true,
                            },
                          },
                          {
                            arrayFilters: [
                              {
                                "i.id": reqData.commentId,
                              },
                              {
                                "j.id": reqData.replyCommentId,
                              },
                            ],
                          }
                        )
                        .then((result) => {
                          res.send({ status: 200, message: "comment removed" });
                        })
                        .catch((err) => {
                          res.send({
                            status: 500,
                            message: "internal server error: " + err,
                          });
                        });
                    });
                } else {
                  //check if comment exists
                  db.collection("Comments")
                    .find({
                      id: reqData.postId,
                      "comments.id": reqData.commentId,
                    })
                    .toArray()
                    .then((comments) => {
                      if (comments.length === 0) {
                        res.send({
                          status: 400,
                          message: "invalid comment id",
                        });
                        return;
                      }
                      //add removed: true to comment
                      db.collection("Comments")
                        .updateOne(
                          {
                            id: reqData.postId,
                            "comments.id": reqData.commentId,
                          },
                          {
                            $set: {
                              "comments.$.removed": true,
                            },
                          }
                        )
                        .then((result) => {
                          res.send({ status: 200, message: "comment removed" });
                        })
                        .catch((err) => {
                          res.send({
                            status: 500,
                            message: "internal server error: " + err,
                          });
                        });
                    });
                }
              }
            });
        });
    });
  },
};
module.exports.like = {
  add: function (connectToDb, res, reqData) {
    toSearch = {
      id: reqData.postId,
    };
    if (reqData.replyCommentId) {
      if (!reqData.commentId) {
        res.send({ status: 400, message: "no comment id" });
        return;
      }
      toSearch["comments.replyComments.id"] = reqData.replyCommentId;
    } else {
      toSearch["comments.id"] = reqData.commentId;
    }

    connectToDb((db) => {
      db.collection("Comments")
        .find(toSearch)
        .toArray()
        .then((comments) => {
          if (comments.length === 0) {
            res.send({ status: 400, message: "invalid comment id" });
            return;
          }
          if (reqData.replyCommentId) {
            if (
              comments[0].comments[0].replyComments[0].likes.includes(
                reqData.userName
              )
            ) {
              res.send({ status: 400, message: "user already liked comment" });
              return;
            }
            db.collection("Comments")
              .updateOne(
                {
                  id: reqData.postId,
                  "comments.replyComments.id": reqData.replyCommentId,
                },
                {
                  $push: {
                    "comments.$[i].replyComments.$[j].likes": reqData.userName,
                  },
                },
                {
                  arrayFilters: [
                    {
                      "i.id": reqData.commentId,
                    },
                    {
                      "j.id": reqData.replyCommentId,
                    },
                  ],
                }
              )
              .then((result) => {
                res.send({ status: 200, message: "comment liked" });
              })
              .catch((err) => {
                res.send({
                  status: 500,
                  message: "internal server error: " + err,
                });
              });
          } else {
            if (comments[0].comments[0].likes.includes(reqData.userName)) {
              res.send({ status: 400, message: "user already liked comment" });
              return;
            }
            db.collection("Comments")
              .updateOne(
                {
                  id: reqData.postId,
                  "comments.id": reqData.commentId,
                },
                {
                  $push: {
                    "comments.$.likes": reqData.userName,
                  },
                }
              )
              .then((result) => {
                res.send({ status: 200, message: "comment liked" });
              })
              .catch((err) => {
                res.send({
                  status: 500,
                  message: "internal server error: " + err,
                });
              });
          }
        });
    });
  },
  remove: function (connectToDb, res, reqData) {
    toSearch = {
      id: reqData.postId,
    };
    if (reqData.replyCommentId) {
      if (!reqData.commentId) {
        res.send({ status: 400, message: "no comment id" });
        return;
      }
      toSearch["comments.replyComments.id"] = reqData.replyCommentId;
    } else {
      toSearch["comments.id"] = reqData.commentId;
    }

    connectToDb((db) => {
      db.collection("Comments")
        .find(toSearch)
        .toArray()
        .then((comments) => {
          if (comments.length === 0) {
            res.send({ status: 400, message: "invalid comment id" });
            return;
          }
          if (reqData.replyCommentId) {
            if (
              !comments[0].comments[0].replyComments[0].likes.includes(
                reqData.userName
              )
            ) {
              res.send({
                status: 400,
                message: "user already unliked comment",
              });
              return;
            }
            db.collection("Comments")
              .updateOne(
                {
                  id: reqData.postId,
                  "comments.replyComments.id": reqData.replyCommentId,
                },
                {
                  $pull: {
                    "comments.$[i].replyComments.$[j].likes": reqData.userName,
                  },
                },
                {
                  arrayFilters: [
                    {
                      "i.id": reqData.commentId,
                    },
                    {
                      "j.id": reqData.replyCommentId,
                    },
                  ],
                }
              )
              .then((result) => {
                res.send({ status: 200, message: "comment unliked" });
              })
              .catch((err) => {
                res.send({
                  status: 500,
                  message: "internal server error: " + err,
                });
              });
          } else {
            if (!comments[0].comments[0].likes.includes(reqData.userName)) {
              res.send({
                status: 400,
                message: "user already unliked comment",
              });
              return;
            }
            db.collection("Comments")
              .updateOne(
                {
                  id: reqData.postId,
                  "comments.id": reqData.commentId,
                },
                {
                  $pull: {
                    "comments.$.likes": reqData.userName,
                  },
                }
              )
              .then((result) => {
                res.send({ status: 200, message: "comment unliked" });
              })
              .catch((err) => {
                res.send({
                  status: 500,
                  message: "internal server error: " + err,
                });
              });
          }
        });
    });
  },
};
