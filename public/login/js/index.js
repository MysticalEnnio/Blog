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
          //save name, email, password and id to local storage
          localStorage.setItem("name", name.value);
          localStorage.setItem("email", email.value);
          localStorage.setItem("password", password.value);
          localStorage.setItem("id", data.id);
          if (data.profilePicture)
            localStorage.setItem("profilePicture", data.profilePicture);
          //redirect to Home page
          window.location.href = "/";
        } else {
          alert("Error: " + data.status + "\n" + data.message);
        }
      });
  });
});
