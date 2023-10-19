$(function(){
    setInterval(scheduledtask,10000);
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
    var formData = new FormData();
    formData.append("file", $("#License")[0].files[0]);
    console.log(formData);
    $.ajax({
        url: "",
        type: "post",
        data: formData,
        processData: false, 
        contentType: false,
        Cache: false,
        success: function(res) {
            console.log(res);
        },
        error: function(res) {
            
        }
    })
}