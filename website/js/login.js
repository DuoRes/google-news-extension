function login(e) {
  var prolific_id = $("#prolific_id").val();
  if (prolific_id) {
    window.localStorage.setItem("prolific_id", prolific_id);
    window.location.href = "./plugin.html";
  } else {
    alert("The prolific id cannot be empty!");
  }
}
