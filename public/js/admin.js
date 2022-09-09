const changeProfilePicture = (event) => {
  const files = event.target.files;
  const formData = new FormData();
  formData.append("image", files[0]);
  formData.append("userId", localStorage.getItem("id"));

  fetch("/api/account/profilePicture/change", {
    method: "POST",
    body: formData,
  })
    .then((response) => response.json())
    .then((data) => {
      console.log(data);
      $("#profilePicture").attr("src", data.file.url);
      localStorage.setItem("profilePicture", data.file.url);
    })
    .catch((error) => {
      console.error(error);
      alert(error);
    });
};

$(document).ready(() => {
  let profilePicture = localStorage.getItem("profilePicture");
  if (profilePicture) $("#profilePicture").attr("src", profilePicture);

  $("#heading").text(localStorage.getItem("name"));

  $("#profilePicture").click(function () {
    $("#profilePictureInput").click();
  });

  document
    .querySelector("#profilePictureInput")
    .addEventListener("change", (event) => {
      changeProfilePicture(event);
    });
});
