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
        chat: {
          1: "#c4c5c7",
          2: "#1b2944",
          3: "#6f7786",
          4: "#3668e5",
        },
      },
    },
  },
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

document.addEventListener("DOMContentLoaded", async () => {
  let nameInputEl = document.getElementById("nameInput");
  let nameError = document.getElementById("nameError");
  let submitButton = document.getElementById("submit");

  let userData = (await getUserData()).data.user;

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

  submitButton.addEventListener("click", () => {
    if (nameInputEl.value.length == 0) {
      nameInputEl.nextElementSibling.classList.add(
        "animate-[shake_linear_0.3s_1]"
      );
      setTimeout(() => {
        nameInputEl.nextElementSibling.classList.remove(
          "animate-[shake_linear_0.3s_1]"
        );
      }, 300);
      return;
    }
    if (validateName(nameInputEl.value) && nameInputEl.value.length > 4) {
      submitName(nameInputEl.value);
    } else {
      nameError.classList.add("animate-[shake_linear_0.3s_1]");
      setTimeout(() => {
        nameError.classList.remove("animate-[shake_linear_0.3s_1]");
      }, 300);
      return;
    }
  });
});
