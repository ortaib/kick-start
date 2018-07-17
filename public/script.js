var xhr = new XMLHttpRequest(); 

function postComment(){
    var comment = document.querySelector("#tryajax");
    var postCommentBtn = document.querySelector("#btnajax");
    postCommentBtn.addEventListener("click",function(){
        if(!document.querySelector("#loginBtn")){
            var url = window.location.href+"/comments";
            xhr.open("POST",url, true);
            xhr.setRequestHeader("Content-type", "application/json");
            xhr.onreadystatechange = function() {//Call a function when the state changes.
                if(this.readyState == XMLHttpRequest.DONE && this.status == 200) {
                        var data = JSON.parse(xhr.responseText);
                        if(data.status == 200){
                        // Request finished. Do processing here.
                        //var data = JSON.parse(xhr.responseText);
                            var commentswell = document.querySelector("#commentswell");
                            var commentDiv = document.createElement("div");
                            var backerswell = document.querySelector("#backerswell");
                            commentDiv.classList.add("row");
                            commentDiv.innerHTML = '<div class="col-md-12"><strong>'+data.comment.author.username+'</strong>'
                            +'<span class="pull-right">a few seconds ago </span> <p>'+data.comment.text+'</p>'
                            +'<a class="btn btn-xs btn-warning" href="/projects/'+data.projectid+'/comments/'+data.comment._id+'/edit">Edit</a>'
                            +'<form id="delete-form" action="/projects/'+data.projectid+'/comments/'+data.comment._id+'?_method=DELETE" method="POST">'
                            +'<button  class="btn btn-xs btn-danger">Delete</button></form></div>';
                            commentswell.insertBefore(commentDiv, commentswell.childNodes[2]);
                            commentswell.appendChild(document.createElement("hr"));
                        }
                        else{
                            alert("something went wront");
                        }
                    }
                }
                xhr.send(JSON.stringify({comment:comment.value}));
                comment.value="";
            }
            else{
                alert("You need to be logged in to comment");
            }
    });
    
}
function loadMoreComments(){
    var reqnum=1;
    var loadMoreBtn = document.querySelector("#loadMore");
    loadMoreBtn.addEventListener("click",function(){
        xhr.onreadystatechange = function() {
            if (this.readyState == 4 && this.status == 200) {
                var data = JSON.parse(xhr.responseText);
                if(data.comments.length>0){
                    var commentswell = document.querySelector("#commentswell");
                    for(var i=0;i<data.comments.length;i++){
                        var commentDiv = document.createElement("div");
                        commentDiv.classList.add("row");
                        if(data.ownership && data.ownership[i]){
                            commentDiv.innerHTML = '<div class="col-md-12"><strong>'+data.comments[i].author.username+'</strong>'
                            +'<span class="pull-right">'+data.timeleft[i]+'</span> <p>'+data.comments[i].text+'</p>'
                            +'<a class="btn btn-xs btn-warning" href="/projects/'+data.projectid+'/comments/'+data.comments[i]._id+'/edit">Edit</a>'
                            +'<form id="delete-form" action="/projects/'+data.projectid+'/comments/'+data.comments[i]._id+'?_method=DELETE" method="POST">'
                            +'<button  class="btn btn-xs btn-danger">Delete</button></form></div>';
                        }else{
                            commentDiv.innerHTML = '<div class="col-md-12"><strong>'+data.comments[i].author.username+'</strong>'
                            +'<span class="pull-right">'+data.timeleft[i]+'</span> <p>'+data.comments[i].text+'</p></div>';
                        }
                        
                        commentswell.appendChild(commentDiv);
                        commentswell.appendChild(document.createElement("hr"),);
                    }
                }
                 else{
                        var container = document.querySelector("#ctnr");
                        container.removeChild(document.querySelector("#loadmorediv"));
                    }
                    
                
            }
        }
        var temp = window.location.href +"/comments/more";
        var url = temp+"/"+reqnum;
        console.log(url);
        reqnum++;
        xhr.open("GET",url);
        xhr.send();
    });
}   
function postPledge(){
    var pledgeBtn = document.querySelector("#pledgeBtn");
    var backerswell = document.querySelector("#backerswell");
        pledgeBtn.addEventListener("click",function(){
        if(!document.querySelector("#loginBtn")){
            var pledgeAmount = document.querySelector("#pledgeAmount");
            if(pledgeAmount.value>0){
                var url = window.location.href +"/pledge";
                xhr.open("POST",url, true);
                xhr.setRequestHeader("Content-type", "application/json");
                xhr.onreadystatechange = function() {//Call a function when the state changes.
                    if(this.readyState == XMLHttpRequest.DONE && this.status == 200) {
                            var data = JSON.parse(xhr.responseText);
                            console.log(data);
                            if(data.status == 200){
                                var pledgediv = document.createElement("div");
                                pledgediv.classList.add("row");
                                pledgediv.innerHTML = '<div class="col-md-12"><em>a few seconds ago</em>'
                                +'<span class="author-name">'+data.pledge.author.username+'</span>'
                                +'<span>has donated &nbsp</span><strong class="amount">'+(data.pledge.amount).toLocaleString() +' $</strong><hr>';
                                backerswell.insertBefore(pledgediv,backerswell.childNodes[0]);
                                pledgeAmount.value="";
                                var projectFunded = document.querySelector("#projectFunded");
                                projectFunded.innerHTML = ""+(data.projectFunded).toLocaleString()+' <span style="font-size:25px;">$</span>';
                                var raisedBar = document.querySelector("#raisedBar");
                                raisedBar.style.width = 100*data.projectFunded/data.projectPledge+"%";
                                raisedBar.textContent = (100*data.projectFunded/data.projectPledge).toFixed(1)+"%";
                                var numOfBackers = document.querySelector("#numOfBackers");
                                numOfBackers.textContent = Number(numOfBackers.textContent) +1;
                            }
                    }
                }
                 xhr.send(JSON.stringify({pledge:pledgeAmount.value}));
                 
            }
        }else{
            alert("you need to login inorder to pledge");
        }
    });
}
function loadMoreProjects(){
    var reqnum=1;
    var url= window.location.href +"/more";
    var xhrBtn = document.querySelector("#xhrBtn");
    xhrBtn.addEventListener("click",function(){
        var xhr = new XMLHttpRequest();
        xhr.onreadystatechange = function() {
            if (this.readyState == 4 && this.status == 200) {
               var container = document.querySelector("#projectscontainer");
               var data = JSON.parse(xhr.responseText);
               console.log(data);
               if(data.projects.length<4){
                   var cont = document.querySelector("#cont")
                   cont.removeChild(xhrBtn);
               }
               console.log(data.projects.length);
               if(data.projects.length>0){
                   // Typical action to be performed when the document is ready:
                   //adding templets
                   for(var i=0;i<data.projects.length;i++){
                        var div = document.createElement("div");
                        div.classList.add("col-md-3");
                        div.classList.add("col-sm-6");
                        div.innerHTML='<div class="thumbnail info-inside-thumbnail">'
                        +'<div><img class="img-inside-thumb-small" src ="'+ data.projects[i].images[0]+'"></div>'
                        +'<div class="caption aleft"><div class="title-inside-thumb"><h5>'+data.projects[i].name +'</h5></div>'
                        +'<div style="display:inline-block;">Created by &nbsp</div><em>'+data.projects[i].author.username +'</em>'
                        +'<p class="pull-right"> at '+data.createdAt[i]+'</p>'
                        +'<p class="description-inside-thumb">'+data.projects[i].description+'</p>'
                        +'<div class="raised-bar"><span class="progress" style="width:'+100*data.projects[i].funded/data.projects[i].pledge+'%;">'
                        +(100*data.projects[i].funded/data.projects[i].pledge).toFixed(1)+'%</span></div>'
                        +'<div><span>funded</span><span style="margin-left:30px;">pledge</span><span class="pull-right">ends</span></div>'
                        +'<div class="tb"><strong>'+(data.projects[i].funded*100/data.projects[i].pledge).toFixed(1)+'%</strong><em>'+data.timeleft[i]+'</em>'
                        +'<strong >'+ (data.projects[i].pledge).toLocaleString() +' $</strong></div></div>'
                        +'<p><br/><a href="/projects/'+data.projects[i]._id+'" class="btn btn-primary">More info</a></p>'
                        container.appendChild(div);
                   }
                   
                }
            }
        };
        var gurl = url+"/"+reqnum;
        reqnum++;
        xhr.open("GET",gurl);
        xhr.send();
    });
}
function editProject(){
    var try_btn = document.querySelector("#try");
    try_btn.addEventListener("click",function(){
        var myform = document.querySelector("#myform");
        var video = document.querySelector("#video");
        var images = document.querySelectorAll("img");
        images[0].src = myform.fImage.value;
        images[1].src = myform.sImage.value;
        images[2].src = myform.tImage.value;
        if(myform.querySelector("#videoSrc")){
            video.src = "https://www.youtube.com/embed/" + myform.querySelector("#videoSrc").value;
        }
        document.querySelector("h3").textContent = myform.querySelector("input").value;
        document.querySelector("#description").textContent = myform.querySelectorAll("textarea")[0].value;
        document.querySelector("#about").textContent = myform.querySelectorAll("textarea")[1].value;
        if(myform.querySelectorAll("textarea")[1].value.length>0)
            document.querySelector("#about-span").textContent = "About";

    });
}
