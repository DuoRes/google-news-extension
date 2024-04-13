function showVerification() {
  document.getElementById("verificationContainer").style.display = "block";
  window.open("https://berkeley.qualtrics.com/jfe/form/SV_0oCZvgUsNwzTaiq");
  document.getElementById("iagree").setAttribute("hidden", "true");
}

function verifyCompletionCode(e) {
  var Indentifier = $("#Indentifier").val();
  if (Indentifier) {
    if (
      Indentifier == "QWMN2"
    ) {
      window.location.href = "./ProlificLoginPage.html";
    } else {
      alert("You have entered the wrong completion code. Please try again.");
    }
  } else {
    alert("The completion code cannot be empty. Please try again.");
  }
}
