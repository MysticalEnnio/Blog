tailwind.config = {
  theme: {
    extend: {
      colors: {
        pastel: {
          1: "#01002E",
          2: "#2F72BA",
          3: "#3D9FDD",
          4: "#EFB2EF",
          5: "#D5BAC7",
          6: "#DD74CF",
          7: "#DD53B4",
        },
      },
    },
  },
};

console.log(window.location.origin);

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

const validateName = (name) => {
  return name.match(
    /^[a-zA-ZàáâäãåąčćęèéêëėįìíîïłńòóôöõøùúûüųūÿýżźñçčšžÀÁÂÄÃÅĄĆČĖĘÈÉÊËÌÍÎÏĮŁŃÒÓÔÖÕØÙÚÛÜŲŪŸÝŻŹÑßÇŒÆČŠŽ∂ð ,.'-]+$/u
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
  let nameInputEl = document.getElementById("nameInput");
  let passwordWarning = document.getElementById("passwordWarning");
  let passwordSuggestion = document.getElementById("passwordSuggestion");
  let nameError = document.getElementById("nameError");
  let loaderEl = document.getElementById("loader");

  passwordInputEl.addEventListener("input", () => {
    passwordStrength = zxcvbn(passwordInputEl.value);
    passwordSuggestion.innerHTML =
      passwordStrength.feedback.suggestions.join(". ");
    passwordWarning.innerHTML = passwordStrength.feedback.warning;
    if (passwordInputEl.value.length == 0) passwordSuggestion.innerHTML = "";
    if (passwordInputEl.value.length > 0 && passwordStrength.score == 0) {
      styles.set(
        "psw",
        `#passwordInput + label::after {width: ${
          passwordInputEl.clientWidth / 4
        }px; background: #F87171;}`
      );
      applyStyles();
      return;
    }
    styles.set(
      "psw",
      `#passwordInput + label::after {width: ${
        (passwordInputEl.clientWidth / 4) * passwordStrength.score
      }px; background: ${passwordColors.get(passwordStrength.score)};}`
    );
    applyStyles();
  });

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

  nameInputEl.addEventListener("input", () => {
    if (nameInputEl.value.length > 0) {
      if (validateName(nameInputEl.value) && nameInputEl.value.length > 2) {
        styles.set("name", `#nameInput {border-color:#22C55E;}`);
        nameError.classList.add("hidden");
        applyStyles();
        return;
      }
      styles.set("name", `#nameInput {border-color:#F87171;}`);
      nameError.classList.remove("hidden");
      applyStyles();
      return;
    }
    styles.set("name", `#nameInput {border-color:#6B7280;}`);
    nameError.classList.add("hidden");
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
    if (passwordWarning.innerHTML != "" || passwordSuggestion.innerHTML != "") {
      passwordWarning.parentElement.classList.add(
        "animate-[shake_linear_0.3s_1]"
      );
      error = true;
      setTimeout(() => {
        passwordWarning.parentElement.classList.remove(
          "animate-[shake_linear_0.3s_1]"
        );
      }, 300);
    }
    if (nameInputEl.value.length == 0) {
      nameInputEl.nextElementSibling.classList.add(
        "animate-[shake_linear_0.3s_1]"
      );
      error = true;
      setTimeout(() => {
        nameInputEl.nextElementSibling.classList.remove(
          "animate-[shake_linear_0.3s_1]"
        );
      }, 300);
    }
    if (!nameError.classList.contains("hidden")) {
      nameError.classList.add("animate-[shake_linear_0.3s_1]");
      error = true;
      setTimeout(() => {
        nameError.classList.remove("animate-[shake_linear_0.3s_1]");
      }, 300);
    }
    if (error) return;

    loaderEl.classList.remove("!hidden");
    signUp(emailInputEl.value, passwordInputEl.value, nameInputEl.value);
  });

  document.getElementById("googleLogin").addEventListener("click", () => {
    loaderEl.classList.remove("!hidden");
    signUpWithGoogle();
  });
});
