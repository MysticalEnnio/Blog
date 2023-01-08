const userData = (await getUserData()).data.user;

const params = new Proxy(new URLSearchParams(window.location.search), {
  get: (searchParams, prop) => searchParams.get(prop),
});

document.addEventListener("DOMContentLoaded", () => {
  document.getElementById("email").innerHTML = params.email;
});
