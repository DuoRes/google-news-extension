const BACKEND_URL = "http://localhost:8080/";

const login = async (identifier) => {
  const response = await fetch(BACKEND_URL + "user/login", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ token: identifier }),
  });
  return response.json();
};

document
  .getElementById("login-form")
  .addEventListener("submit", async (event) => {
    event.preventDefault();

    const identifier = document.getElementById("identifier").value;

    await chrome.storage.local.set({ identifier }, function () {
      console.log("Identifier Token saved:", identifier);
    });

    const response = await login(identifier);
    console.log("response", response);

    if (response._id) {
      document.location.href = "logged_in.html";
      await chrome.storage.local.set({ user_id: response._id }, function () {
        console.log("User saved:", response);
      });
    } else {
      alert("Login Failed, please try again.");
    }
  });

// if chrome storage has identifier, redirect to logged_in.html
chrome.storage.local.get(["user_id"], function (result) {
  if (result.identifier) {
    document.location.href = "logged_in.html";
  }
});
