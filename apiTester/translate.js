const fetch = require("node-fetch");

translate("Hello World!", "de")
  .then((res) => {
    console.log(res.data);
    process.exit();
  })
  .catch((err) => {
    console.error(err);
  });
