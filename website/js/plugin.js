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
        <div class="plugin_item" >
            <div class="left_box">
                <h3>News Research Tracker</h3>
                <p>
                    <span class="title">Assigned Gmail:</span>
                    <span class="content">${data.assignedEmail}</span>
                </p>
                <p>
                    <span class="title">Assigned Password:</span>
                    <span class="content">${data.assignedPassword}</span>
                </p>
                <p>
                    <span class="title">Assigned Recovery Gmail:</span>
                    <span class="content">${data.assignedRecoveryEmail}</span>
                </p>
                <p>
                    <img src="./images/bg.png"/>
                </p>
            </div>
            <div class="right_box">
                
            </div>
        </div>
    `;
  plugin_row.html(str);
}

function openDownload() {
  const w = window.open("about:blank");
  w.location.href =
    "https://chrome.google.com/webstore/detail/news-research-tracker/cahcdhhjliadadbbabnlkhffdlfmepca?hl=en&authuser=0";
}
