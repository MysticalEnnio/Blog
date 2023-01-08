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
  let emailInputEl = document.getElementById("emailInput");

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

  document.getElementById("resetPassword").addEventListener("click", (e) => {
    if (!validateEmail(emailInputEl.value)) {
      emailInputEl.nextElementSibling.classList.add(
        "animate-[shake_linear_0.3s_1]"
      );
      setTimeout(() => {
        emailInputEl.nextElementSibling.classList.remove(
          "animate-[shake_linear_0.3s_1]"
        );
      }, 300);
      return;
    }

    resetPassword(emailInputEl.value);
  });
});
