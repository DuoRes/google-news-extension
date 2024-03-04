$(function(){
    // setInterval(scheduledtask,5000);
    scheduledtask();
});

async function scheduledtask(){
    var prolific_id=window.localStorage.getItem("prolific_id");
    var now_data=JSON.stringify({
        "token":prolific_id,
    });

    $.ajax({
        headers: {
            "contentType": "application/json;charset=utf-8",
            "Accept":"*/*",
        },
        contentType: "application/json;charset=utf-8",
        url:"https://duo.up.railway.app/user/login", 
        method:"post",
        data:now_data,  
        success:function(data){
            create(data);
            console.log(data);
            window.localStorage.setItem("show_message",JSON.stringify(data));
        },
        error: function(xhr, status, error) {
            // 处理错误响应数据
            console.log();
            console.log(xhr.responseText); // 错误的响应数据
            console.log(status);
        }
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
                    <span class="title">Assigned Gmail:</span>
                    <span class="content">${data.assignedGmail}</span>
                </p>
                <p>
                    <span class="title">Assigned Password:</span>
                    <span class="content">${data.assignedPassword}</span>
                </p>
                <p>
                    <span class="title">Assigned Backup Gmail:</span>
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
                
            </div>
        </div>
    `;
    plugin_row.html(str);
}

function openDownload(){
    const w = window.open("about:blank");
    w.location.href="https://chrome.google.com/webstore/detail/news-research-tracker/cahcdhhjliadadbbabnlkhffdlfmepca?hl=en&authuser=0";
}
