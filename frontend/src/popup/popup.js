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
    console.log("identifier2:", identifier);

    await chrome.storage.local.set({ identifier }, function () {
      console.log("Identifier Token saved:", identifier);
    });

    const response = await login(identifier);
    console.log("response", response);
  });
