$(function () {
  // setInterval(scheduledtask,5000);
  scheduledtask();
});

async function scheduledtask() {
  var prolific_id = window.localStorage.getItem("prolific_id");
  var now_data = JSON.stringify({
    token: prolific_id,
  });

  $.ajax({
    headers: {
      "content-type": "application/json",
      Accept: "*/*",
    },
    url: "https://duo.up.railway.app/user/login",
    method: "post",
    data: now_data,
    success: function (data) {
      create(data);
      console.log(data);
      window.localStorage.setItem("show_message", JSON.stringify(data));
    },
    error: function (xhr, status, error) {
      console.log(xhr.responseText);
      console.log(xhr);
    },
  });
  console.log("Scheduled task.");
}

function create(data) {
  var plugin_row = $("#plugin_row");
  var str = `
    <div class="plugin_item">
        <div class="left_box">
            <label for="License" style="display: inline-block; padding: 0vw 2vw; border: 1px solid green; text-align: center;" class="update buttons">
                <input type="file" id="License" onchange="upload(this);" style="display: none">
                <span class="button-text">Upload local files</span>
            </label>
        </div>
    </div>
`;
  plugin_row.html(str);
}

function upload() {
  var prolific_id = window.localStorage.getItem("prolific_id");
  var formData = new FormData();
  formData.append("screenshot", $("#License")[0].files[0]);
  formData.append("token", prolific_id);

  // Show spinner while waiting
  showSpinner();

  $.ajax({
    url: "https://duo.up.railway.app/user/validateImageOCR",
    type: "post",
    data: formData,
    processData: false,
    contentType: false,
    success: function (res) {
      // Hide spinner
      hideSpinner();

      console.log(res);
      // Show success popup
      showSuccessPopup();

      // Redirect to end.html
      window.location.href = "PluginDownloadPage.html";
    },
    error: function (err) {
      // Hide spinner
      hideSpinner();
      window.location.href = "PluginDownloadPage.html"; // TODO: Remove this line after implementing error handling
      console.log(err);
    },
  });
}

function showSpinner() {
  // Show spinner logic here
}

function hideSpinner() {
  // Hide spinner logic here
}

function showSuccessPopup() {
  // Show success popup logic here
}
