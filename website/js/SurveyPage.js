function login(e) {
  var Indentifier = $("#Indentifier").val();
  if (Indentifier) {
    if (
      Indentifier == "thank_you_for_completing_the_haas_research_pre_survey"
    ) {
      window.location.href = "./Login.html";
    } else {
      alert("You have entered the wrong identifier.");
    }
  } else {
    alert("The Unique Indentifier cannot be empty!");
  }
}
