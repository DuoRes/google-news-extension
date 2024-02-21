$(function(){
    create();
    // setInterval(scheduledtask,5000);
    scheduledtask();
});

function scheduledtask(){
    var prolific_id=window.localStorage.getItem("prolific_id");
    $.ajax({
        url:"https://duo.up.railway.app/user/login", 
        method:"post",
        data:{
            "token":prolific_id,
        },  
        success:function(data){
            create(data);
            console.log(data);
            window.localStorage.setItem("show_message",JSON.stringify(data));
        },
        error:function(err){
            console.log(err);
        }  
    });
    console.log("Scheduled task.");
}

function create(){
    var plugin_row=$("#plugin_row");
    var str=`
        <div class="plugin_item" >
            <div class="left_box">
                <h3>SSSSSSS</h3>
                <p>
                <span class="title">Name:</span>
                <span class="content">Plug-in name</span>
                </p>
                <p>
                    <span class="title">Introduce:</span>
                    <span class="content">Introduce Introduce Introduce Introduce Introduce Introduce IntroduceIntroduceIntroduce Introduce  Introduce.</span>
                </p>
                <p>
                    <button class="proceed_button" onclick="openProceed()">Proceed</button>
                    <button class="download_button" onclick="openDownload()">Download</button>
                </p>
            </div>
            <div class="right_box">
                <img src="./images/bg.png"/>
            </div>
        </div>
    `;
    plugin_row.html(str);
}

function openDownload(){
    const w = window.open("about:blank");
    w.location.href="https://chrome.google.com/webstore/detail/news-research-tracker/cahcdhhjliadadbbabnlkhffdlfmepca?hl=en&authuser=0";
}

function openProceed(){
    window.location.href="./GoogleNewsLogin.html";
}
