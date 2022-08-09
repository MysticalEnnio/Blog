//wait for dom to load
document.addEventListener("DOMContentLoaded", function (event) {
  //submit button
  var submit = document.getElementById("Submit");
  //name input
  var name = document.getElementById("Name");
  //email input
  var email = document.getElementById("Email");
  //password input
  var password = document.getElementById("Password");
  //add event listener to submit button
  submit.addEventListener("click", function (event) {
    fetch("/api/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "same-origin",
      body: JSON.stringify({
        name: name.value,
        password: password.value,
        email: email.value,
      }),
    })
      .then((response) => response.json())
      .then((data) => {
        console.log(data.status);
        if (data.status == 200) {
          //save name, email, password and id to cookies
          document.cookie = `name=${name.value}; path=/`;
          document.cookie = `email=${email.value}; path=/`;
          document.cookie = `password=${password.value}; path=/`;
          document.cookie = `id=${data.id}; path=/`;
          //redirect to Home page
          window.location.href = "/";
        } else {
          alert("Error: " + data.status + "\n" + data.message);
        }
      });
  });
});