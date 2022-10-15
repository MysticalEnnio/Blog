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

let passwordColors = new Map([
  [0, "#F87171"],
  [1, "#F87171"],
  [2, "#FB923C"],
  [3, "#FACC15"],
  [4, "#22C55E"],
]);

function togglePasswordVisibility() {
  var x = document.getElementById("passwordInput");
  if (x.type === "password") {
    x.type = "text";
  } else {
    x.type = "password";
  }
}

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

const changeProfilePicture = (event) => {
  const files = event.target.files;
  const formData = new FormData();
  formData.append("image", files[0]);

  fetch("/api/image/upload/profilePicture", {
    method: "POST",
    body: formData,
  })
    .then((response) => response.json())
    .then(async (data) => {
      console.log(data);
      //change avatar_url supabase user_metadata
      const { user, error } = await db.auth.update({
        data: { avatar_url: data.file.url },
      });
      document.getElementById("profilePicture").src = data.file.url;
    })
    .catch((error) => {
      console.error(error);
    });
};

document.addEventListener("DOMContentLoaded", async () => {
  let passwordInputEl = document.getElementById("passwordInput");
  let emailInputEl = document.getElementById("emailInput");
  let nameInputEl = document.getElementById("nameInput");
  let passwordWarning = document.getElementById("passwordWarning");
  let passwordSuggestion = document.getElementById("passwordSuggestion");
  let nameError = document.getElementById("nameError");
  let saveButtonEl = document.getElementById("save");

  let userData = (await getUserData()).data.user;
  if (!userData) {
    window.location.href = "/login";
  }
  if (!userData.user_metadata.realName) {
    window.location.href = "/createName";
    return;
  }
  console.log(userData);

  function changePasswordBar() {
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
  }

  document.getElementById("editButton").addEventListener("click", () => {
    //click #profilePictureInput
    document.getElementById("profilePictureInput").click();
  });

  document
    .getElementById("profilePictureInput")
    .addEventListener("change", (event) => {
      changeProfilePicture(event);
    });

  passwordInputEl.addEventListener("input", () => {
    changePasswordBar();
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
      if (validateName(nameInputEl.value) && nameInputEl.value.length > 4) {
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

  saveButtonEl.addEventListener("click", () => {
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
    let options = { data: {} };
    if (passwordInputEl.value.length > 0) {
      options.password = passwordInputEl.value;
    }
    if (emailInputEl.value != userData.email) {
      options.email = emailInputEl.value;
      options.data.email = emailInputEl.value;
    }
    if (nameInputEl.value != userData.user_metadata.name) {
      options.data.name = nameInputEl.value;
    }
    if (Object.keys(options).length == 1) {
      if (Object.keys(options.data).length == 0) return;
    }
    console.log(options);
    saveUserData(options);
  });

  document.getElementById("name").innerHTML = userData.user_metadata.name;
  emailInputEl.value = userData.email;
  styles.set("email", `#emailInput {border-color:#22C55E;}`);
  nameInputEl.value = userData.user_metadata.name;
  styles.set("name", `#nameInput {border-color:#22C55E;}`);
  applyStyles();

  if (userData.user_metadata.avatar_url) {
    document.getElementById("pPWrapper").firstElementChild.src =
      userData.user_metadata.avatar_url;
  } else {
    let emailHash = md5(userData.email.toLowerCase());
    document.getElementById("pPWrapper").firstElementChild.src =
      "https://www.gravatar.com/avatar/" + emailHash + "?d=mp";
  }
});
