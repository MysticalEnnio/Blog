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
