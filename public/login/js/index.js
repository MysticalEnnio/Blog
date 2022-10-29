function togglePasswordVisibility() {
  var x = document.getElementById("passwordInput");
  if (x.type === "password") {
    x.type = "text";
  } else {
    x.type = "password";
  }
}

let passwordColors = new Map([
  [0, "#F87171"],
  [1, "#F87171"],
  [2, "#FB923C"],
  [3, "#FACC15"],
  [4, "#22C55E"],
]);

const validateEmail = (email) => {
  return email.match(
    /^(([^<>()[\]\.,;:\s@\"]+(\.[^<>()[\]\.,;:\s@\"]+)*)|(\".+\"))@(([^<>()[\]\.,;:\s@\"]+\.)+[^<>()[\]\.,;:\s@\"]{2,})$/i
  );
};

let styleEl = document.head.appendChild(document.createElement("style"));
let styles = new Map();
let style = "";

function applyStyles() {
  styles.forEach((val) => {
    style += val + "\n";
  });
  styleEl.innerHTML = style;
}

document.addEventListener("DOMContentLoaded", () => {
  let passwordInputEl = document.getElementById("passwordInput");
  let emailInputEl = document.getElementById("emailInput");
  let loaderEl = document.getElementById("loader");

  emailInputEl.addEventListener("input", () => {
    if (emailInputEl.value.length > 0) {
      if (validateEmail(emailInputEl.value)) {
        styles.set("email", `#emailInput {border-color:#22C55E;}`);
        applyStyles();
        return;
      }
      styles.set("email", `#emailInput {border-color:#F87171;}`);
      applyStyles();
      return;
    }
    styles.set("email", `#emailInput {border-color:#6B7280;}`);
    applyStyles();
  });

  document.getElementById("login").addEventListener("click", (e) => {
    let error = false;
    if (!validateEmail(emailInputEl.value)) {
      emailInputEl.nextElementSibling.classList.add(
        "animate-[shake_linear_0.3s_1]"
      );
      error = true;
      setTimeout(() => {
        emailInputEl.nextElementSibling.classList.remove(
          "animate-[shake_linear_0.3s_1]"
        );
      }, 300);
    }

    if (passwordInputEl.value.length == 0) {
      passwordInputEl.nextElementSibling.classList.add(
        "animate-[shake_linear_0.3s_1]"
      );
      error = true;
      setTimeout(() => {
        passwordInputEl.nextElementSibling.classList.remove(
          "animate-[shake_linear_0.3s_1]"
        );
      }, 300);
    }
    if (error) return;

    loaderEl.classList.remove("!hidden");
    signIn(emailInputEl.value, passwordInputEl.value);
  });

  document.getElementById("googleLogin").addEventListener("click", () => {
    loaderEl.classList.remove("!hidden");
    signInWithGoogle();
  });
});
