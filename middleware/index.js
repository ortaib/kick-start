var Project = require("../models/project");
var Comment = require("../models/comment");

var middlewareObj = {};

middlewareObj.checkProjectOwnership = function(req,res,next){
    if(req.isAuthenticated()){
        Project.findById(req.params.id,function(err,foundProject){
            if(err || !foundProject){
                req.flash("error","Project not found");
                res.redirect("back");
            }else{
                if(foundProject.author.id.equals(req.user._id)|| (res.locals.currentUser && res.locals.currentUser.isAdmin)){
                   next(); 
                }
                else{
                    req.flash("error","You don't have permission to do that");
                    res.redirect("back");
                }
            }
        });
    }else{
        req.flash("error","You need to be logged in to do that");
        res.redirect("/login");
    }
}

middlewareObj.checkCommentOwnership = function(req,res,next){
    
    if(req.isAuthenticated() ){
        Comment.findById(req.params.comment_id,function(err,foundComment){
            if(err || !foundComment){
                req.flash("error","Comment not found");
                res.redirect("back");
            }else{
                if(foundComment.author.id.equals(req.user._id) || (res.locals.currentUser && res.locals.currentUser.isAdmin)){
                   next(); 
                }
                else{
                    req.flash("error","You don't have permission to do that");
                    res.redirect("back");
                }
            }
        });
    }else{
        req.flash("error","You need to be logged in to do that");
        res.redirect("/login");
    }
}

middlewareObj.isLoggedIn = function (req,res,next){
    if(req.isAuthenticated()){
        return next();
    }else{
        req.flash("error","You need to be logged in to do that");
        res.redirect("/login");
    }
}

middlewareObj.isNotLoggedIn = function(req,res,next){
    if(req.user){
        req.flash("error","You are already logged in");
        res.redirect("back");
    }
    else{
        next();
    }
}
middlewareObj.hasEnoughMoney = function(req,res,next){
    if(req.user.cash < req.body.amount){
        req.flash("error","You cant pledge more than you have");
        res.redirect("back");
    }else{
        next();
    }
}
module.exports = middlewareObj;