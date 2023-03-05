document.addEventListener("DOMContentLoaded", function () {
  var loginButton = document.getElementById("login");

  loginButton.addEventListener("click", function () {
    var identifier = document.getElementById("identifier").value;
    chrome.runtime.sendMessage(
      { type: "login", identifier: identifier },
      function (response) {
        if (response?.success) {
          // The user's email address was saved
          // redirect to the dashboard
          window.location.href = "redirect.html";
        } else {
          // There was an error
          alert("There was an error saving your email address.");
        }
      }
    );
  });
});
