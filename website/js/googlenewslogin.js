$(function(){
    setInterval(scheduledtask,10000);
    var show_message=JSON.parse(window.localStorage.getItem("show_message"));
    $("#show_message").html(data);
});

function scheduledtask(){
    $.ajax({
        url:"",
        method:"post",
        success:function(data){
            if(data=="ss"){
                alert("compleion code");
            }
        },
        error:function(err){
            console.log(err);
        }  
    });
}

function login(e){
    var prolific_id=window.localStorage.getItem("prolific_id");
    $.ajax({
        url: "",
        type: "post",
        data: {"prolific_id":prolific_id},
        success: function(res) {
            console.log(res);
            var bl=confirm("Users need to sign in to our given Google account.");
            if(bl){

            }
        },
        error: function(res) {
            
        }
    })
   
}

function upload(){
    var prolific_id=window.localStorage.getItem("prolific_id");
    var formData = new FormData();
    formData.append("image", $("#License")[0].files[0]);
    formData.append("token",prolific_id);
    $.ajax({
        url: "http://localhost:5000/verify_image",
        type: "post",
        data: formData,
        processData: false, 
        contentType: false,
        success: function(res) {
            console.log(res);
        },
        error: function(err) {
            console.log(err);
        }
    })
}