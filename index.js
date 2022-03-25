var express = require("express");
var cors = require("cors");
var app = express();
const port = 3000 || 3000;

app.use(cors());
app.use(express.static("public"));

app.listen(port, function () {
  console.log("CORS-enabled web server listening on port " + port);
});
