document.addEventListener("DOMContentLoaded", function () {
  var loginButton = document.getElementById("login");

  loginButton.addEventListener("click", function () {
    var email = document.getElementById("email").value;
    chrome.runtime.sendMessage(
      { type: "login", email: email },
      function (response) {
        if (response.success) {
          // The user's email address was saved
          window.close();
        } else {
          // There was an error
          alert("There was an error saving your email address.");
        }
      }
    );
  });
});
