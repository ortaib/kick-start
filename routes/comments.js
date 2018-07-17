var express = require("express");
var router = express.Router({mergeParams:true});
var Project = require("../models/project");
var Comment = require("../models/comment");
var middleware = require("../middleware/index");
var moment = require("moment");

//Comment New
router.get("/new",middleware.isLoggedIn,function(req,res){
    Project.findById(req.params.id,function(err,foundProject){
        if(err){
            console.log(err);
        }
        else{
            res.render("comments/new",{project : foundProject});
        }
    });
});
//Comment Create
router.post("/",middleware.isLoggedIn,function(req,res){
    Project.findById(req.params.id,function(err,foundProject){
        if(err){
            console.log(err);
            res.send({status:404});
        }
        else{
            Comment.create(null,function(err,comment){
               if(err){
                   req.flash("error","Something went wrong");
                   console.log(err);
                   res.send({status:404});
               }else{
                   comment.author.id = req.user._id;
                   comment.author.username = req.user.username;
                   comment.text = req.body.comment;
                   comment.save();
                   foundProject.comments.push(comment);
                   foundProject.save();
                   res.send({comment:comment,status:200,projectid:foundProject._id});
               }
            });
        }
    });
});
router.get("/more/:more_id",function(req,res){
    console.log("sending more comments");
    Project.findById(req.params.id).populate({path :"comments",options: { sort: { 'createdAt': -1 },skip:req.params.more_id*5,limit:5}}).exec(function(err,foundProject){
        if(err){
            console.log(err);
        }else{
            var id;
            var ownership = [];
            if(req.isAuthenticated()){
                id = req.user._id;
            }
            var timeleft = [];
            for(var i=0;i<foundProject.comments.length;i++){
                timeleft.push(moment(foundProject.comments[i].createdAt).fromNow());
                if(id){
                    ownership.push(foundProject.comments[i].author.id.equals(id));
                }
            }
            res.send({comments:foundProject.comments,projectid:req.params.id,timeleft:timeleft,ownership:ownership});
        }
    });
});
//edit comment route
router.get("/:comment_id/edit",middleware.checkCommentOwnership,function(req,res){
    Project.findById(req.params.id,function(err,foundProject){
        if(err || !foundProject){
            req.flash("error","Project not found");
            res.redirect("back");
        }else{
            Comment.findById(req.params.comment_id,function(err,foundComment){
                if(err){
                    res.redirect("back");
                }
                else{
                    res.render("comments/edit",{project_id:req.params.id,comment:foundComment});
                }
            });
        }
    });
});

//comment update route
router.put("/:comment_id",middleware.checkCommentOwnership,function(req,res){
        Comment.findByIdAndUpdate(req.params.comment_id,req.body.comment,function(err,updatedComment){
            if(err){
                res.redirect("back");
            }
            else{
                res.redirect("/projects/"+req.params.id);
            }
        }); 
});
//comment delete route
router.delete("/:comment_id",middleware.checkCommentOwnership,function(req,res){
    Comment.findByIdAndRemove(req.params.comment_id,function(err,deletedComment){
       if(err){
           res.redirect("back");
       }else{
           req.flash("success","Comment deleted");
           res.redirect("/projects/"+req.params.id);
       } 
    });
});
//get more comments

module.exports = router;