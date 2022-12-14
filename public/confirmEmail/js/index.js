const params = new Proxy(new URLSearchParams(window.location.search), {
  get: (searchParams, prop) => searchParams.get(prop),
});

document.addEventListener("DOMContentLoaded", () => {
  document.getElementById("email").innerHTML = params.email;
  document.getElementById("submit").addEventListener("click", () => {
    const token = document.getElementById("codeInput").value;
    if (token.length != 6 || !/^\d+$/.test(token)) {
      swal({
        title: "Error",
        text: "Please enter a valid code",
        icon: "error",
        button: "Ok",
      });
    }
    submitCode(params.email, token);
  });
});
