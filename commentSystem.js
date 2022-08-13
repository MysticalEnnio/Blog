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
        comment: "comment",
        timestamp: 123456789,
        replyComments: [
          {
            id: 987654321fedcba,
            author: "authorId",
            comment: "comment",
          },
          {
            id: 123456789abcdef,
            author: "authorId",
            comment: "comment",
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
              comments: [],
            });
          }
        });
      if (reqData.replyId || reqData.replyCommentId) {
        db.collection("Comments")
          .find({ id: reqData.postId, "comments.id": reqData.replyId })
          .toArray()
          .then((comments) => {
            console.log(comments);
            if (comments.length == 0) {
              res.send({ status: 400, message: "invalid reply id" });
              return;
            }
            let timestamp = new Date().getTime();
            let id = crypto
              .createHash("md5")
              .update(reqData.author + reqData.comment + timestamp)
              .digest("hex");
            let comment = {
              id,
              author: reqData.author,
              comment: reqData.comment,
              timestamp,
            };
            //check if reply to replycomment
            if (reqData.replyCommentId) {
              //Push comment to replyComments from replyId with replyCommentId
              db.collection("Comments")
                .updateOne(
                  { id: reqData.postId, "comments.id": reqData.replyId },
                  {
                    $push: {
                      "comments.$.replyComments": {
                        replyTo: reqData.replyCommentId,
                        ...comment,
                      },
                    },
                  }
                )
                .then((result) => {
                  res.send({
                    status: 200,
                    message: "reply comment added to reply comment",
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
                      "comments.$.replyComments": comment,
                    },
                  }
                )
                .then((result) => {
                  res.send({ status: 200, message: "reply comment added" });
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
          timestamp,
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
            res.send({ status: 200, message: "comment added" });
          })
          .catch((err) => {
            res.send({ status: 500, message: "internal server error: " + err });
          });
      }
    });
  },
  get: function (connectToDb, req, res, reqData) {
    connectToDb((db) => {
      db.collection("Comments")
        .find({ id: reqData.postId })
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
