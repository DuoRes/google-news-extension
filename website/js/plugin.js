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

function create(data){
  var plugin_row=$("#plugin_row");
  var str=`
      <div class="plugin_item" >
          <div class="left_box">
              <h3>News Research Tracker</h3>
              <p>
                  <span class="title">Gmail:</span>
                  <span class="content">${data.assignedGmail}</span>
              </p>
              <p>
                  <span class="title">Password:</span>
                  <span class="content">${data.assignedPassword}</span>
              </p>
              <p>
                  <span class="title">Recovery mail:</span>
                  <span class="content">${data.assignedBackupGmail}</span>
              </p>
              <p>
                  <img src="./images/bg.png"/>
              </p>
              <p>
                  <a href="https://chrome.google.com/webstore/detail/news-research-tracker/cahcdhhjliadadbbabnlkhffdlfmepca?hl=en&authuser=0">
                  https://chrome.google.com/webstore/detail/news-research-tracker/cahcdhhjliadadbbabnlkhffdlfmepca?hl=en&authuser=0
                  </a>
              </p>
          </div>
          <div class="right_box">
          <li>
              <p><span>Install the extension from the official Google Chrome Web Store. </span></p>
        <p><img alt="example" src="./images/13_annotated.png" style="zoom:30%;" /></p>
      </li>
      <li>
        <p><span>Click Add extension to install the extension.</span></p>
        <p><img alt="example" src="./images/14.png" style="zoom:30%;" /></p>
      </li>
      <li>
        <p><span>Verify that the extension is installed:</span></p>
        <p><img alt="example" src="./images/15.png" style="zoom:30%;" /></p>
      </li>
      <li>
        <p><span>[Optional] Pin the extension to the task bar for easy access</span></p>
        <p><img alt="example" src="./images/16.png" style="zoom:30%;" /></p>
      <li>
        <p><span>Click the extension icon on the top right of the screen, enter your prolific ID and click
            the &#39;Login&#39; button. Be sure to verify that the ID is correct, as we may not be able
            to compensate you if you enter the wrong ID.</span></p>
        <p><img alt="example" src="./images/17.png" style="zoom:30%;" /></p>
      </li>
      <li>
        <p><span>Click on redirect to go directly to the &#39;For You&#39; page on Google News.</span></p>
        <p><img alt="example" src="./images/18.png" style="zoom:30%;" /></p>
      </li>
      <li>
        <p><span>While on the &#39;For You&#39; page, start with the news browsing by clicking on news that
            interests you. The webpage will automatically refresh after you clicked on a news, this is
            the intended behavior. You are not required to read the content of the news article in this
            study.</span></p>
        <p><img alt="example" src="./images/19.png" style="zoom:30%;" /></p>
      </li>

      <li>
        <p><span>Repeat step 12 for 20-30 times.</p>
      </li>
      <li>
        <p><span>The system will give the link to a demographic survey. The link will be displayed once step
            13 is finished.</p>
      </li>
      <li>
        <p><span>Finish the demographic survey and get the confirmation code.</p>
      </li>
      <li>
        <p><span>Finish the main study by typing the confirmation code in the prolific.</p>
      </li>
      <li>
        <p><span>30 days later, take the follow up survey.</p>
      </li>    
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
