var express = require("express");
var router  = express.Router();
var User    = require("../models/user");
var passport = require("passport");
var middleware = require("../middleware/index");

//root route
router.get("/",function(req,res){
    res.redirect("/projects");
});

//show register form
router.get("/register",middleware.isNotLoggedIn,function(req,res){
    res.render("register");
});

//handle sign up logic
router.post("/register",function(req,res){
    var newUser = new User({username: req.body.username});
    User.register(newUser,req.body.password,function(err,user){
        if(err){
            console.log(err);
            return res.render("register", {error: err.message});
        }else{
            passport.authenticate("local")(req,res,function(){
                req.flash("success","Welcome to Afeka Kick Start " + user.username);
                res.redirect("/projects");
            });
        }
    });
});

//show login form
router.get("/login",middleware.isNotLoggedIn,function(req,res){
    res.render("login", {referer:req.headers.referer});
    
});

//handle login logic
router.post("/login",passport.authenticate("local",
    { 
        failureRedirect: "/login"
    }), function(req,res){
        if (req.body.referer && (req.body.referer !== undefined && req.body.referer.slice(-6) !== "/login")) {
            req.flash("success","logged in");
        res.redirect(req.body.referer);
    } else {
        res.redirect("/projects");
    }
});

//logout route
router.get("/logout",middleware.isLoggedIn,function(req,res){
    req.logout();
    req.flash("success","Logged out");
    res.redirect("back");
});
router.get("/user/:id",middleware.isLoggedIn,function(req,res){
   if(res.locals.currentUser._id.equals(req.params.id)){
       User.findById(res.locals.currentUser._id).populate("projects").exec(function(err,foundUser){
           if(err){
               res.redirect("back");
           }
           else{
               res.render("user",{projects:foundUser.projects});
           }
       });
   } 
});
//admin register
router.get("/admin",middleware.isNotLoggedIn,function(req,res){
    res.render("admin");
});
//admin register post
router.post("/admin",middleware.isNotLoggedIn,function(req,res){
    if(req.body.adminCode === "Afeka Kick Start 2018"){
        var newUser = new User({username: req.body.username,isAdmin:true});
        User.register(newUser,req.body.password,function(err,user){
            if(err){
                console.log(err);
                return res.render("register", {error: err.message});
            }else{
                passport.authenticate("local")(req,res,function(){
                    req.flash("success","Hello "+ user.username+", Successfully signed up as admin " );
                    res.redirect("/projects");
                });
            }
        });
    }else{
        res.render("admin",{error:"Failed to sign up as Admin"});
    }
});
module.exports = router;