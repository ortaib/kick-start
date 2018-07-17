var express = require("express");
var router = express.Router();
var User   =  require("../models/user");
var middleware = require("../middleware/index");
var Project = require("../models/project");
var Pledge = require("../models/pledge");
var moment = require("moment");


router.get("/",function(req,res){
    Project.find().where("isAlive").equals(true).limit(4).sort({funded:-1}).exec(function(err,allProjects){
        if(err){
            console.log(err);
        }
        else{
            for(var i =0;i<allProjects.length;i++){
                if(allProjects[i].endsAt < Date.now()){
                    allProjects[i].isAlive=false;
                    if(allProjects[i].funded >= allProjects[i].pledge){
                        allProjects[i].kickStarted=true;
                    }
                    allProjects[i].save();
                    allProjects.splice(i,1);
                    i--;
                }
            }
            Project.find().where("isAlive").equals(true).count().exec(function(err,numOfProjects){
                Project.find().where("kickStarted").equals(true).count().exec(function(err,kickedout){
                   if(err){
                       console.log(err);
                       req.flash("error","something went wrong");
                       res.redirect("back");
                   }else{
                        res.render("projects/index", {projects : allProjects,numOfKickedout:kickedout,numOfProjects:numOfProjects});
                   }
                });
        }); 
        }
    });
});
//show new project form
router.get("/new",middleware.isLoggedIn,function(req,res){
    res.render("projects/new"); 
});
//xhr
router.get("/more/:id",function(req,res){
    Project.find().where("isAlive").equals(true).skip(req.params.id*4).limit(4).sort({funded:-1}).exec(function(err,allProjects){
        if(err){
            console.log(err);
        }
        else{
            for(var i =0;i<allProjects.length;i++){
                if(allProjects[i].endsAt < Date.now()){
                    allProjects[i].isAlive=false;
                    if(allProjects[i].funded >= allProjects[i].pledge){
                        allProjects[i].kickStarted=true;
                    }
                    allProjects[i].save();
                    allProjects.splice(i,1);
                    i--;
                }
            var timeleft = [];
            var createdAt = []
            allProjects.forEach(function(project){
               timeleft.push(moment(project.endsAt).fromNow()); 
               createdAt.push(moment(project.createdAt).format("MMM Do YY"));
            });
            res.send({projects:allProjects,timeleft:timeleft,createdAt:createdAt});
        }
    });
});
//kicked out
router.get("/kickedout",function(req,res){
    Project.find().where("kickStarted").equals(true).exec(function(err,projects){
       if(err || !projects){
           req.flash("something went wrong");
           res.redirect("back");
       }else{
           res.render("projects/kickedout",{projects:projects});
       }
    });
});
//show project
router.get("/:id",function(req,res){
    //find project with id
    Project.findById(req.params.id).populate({path :"comments",options: { sort: { 'createdAt': -1 },limit:5}}).populate({path:"pledges",options:{sort:{'createdAt':-1}}}).exec(function(err,foundProject){
       if(err || !foundProject){
           req.flash("error","Project not found");
           //console.log(err);
           res.redirect("back");
       }
       else{
           if(foundProject.isAlive === true || (res.locals.currentUser && res.locals.currentUser.isAdmin) || foundProject.kickStarted){
                //show project with id
                foundProject.populate("author");
                res.render("projects/show",{project:foundProject});
           }
           else{
               req.flash("error","can't find project");
               res.redirect("back");
           }
       }
    });
});
//Project Create
router.post("/",middleware.isLoggedIn,function(req,res){
    //get data from form and add to project array
    //var name = req.body.name;
    req.body.project.images = [req.body.fImage,req.body.sImage,req.body.tImage];
    //var description = req.body.description;
    //var about = req.body.about;
    req.body.project.author = {id:req.user._id,username:req.user.username};
    //var pledge = req.body.pledge;
    //var video = req.body.video;
    req.body.project.endsAt = Date.now()+(1000*60*60*24*(parseInt(req.body.days)))+(1000*60*60*parseInt(req.body.hours));
    //var newProject = {name: name,images:images,description:description,author:author,endsAt:endsAt,pledge:pledge,about:about,video:video};
    Project.create(req.body.project,function(err,project){
        if(err){
            console.log(err);
            res.redirect("/");
        }
        else{
            console.log("created new project");
            User.findById(res.locals.currentUser._id,function(err,foundUser){
                if(err || !foundUser){
                    res.redirect("back");
                }
                foundUser.projects.push(project._id);
                foundUser.save();
                res.redirect("/projects");
            });
        }
    });
    //redirect to projects page
    
});

//edit project route
router.get("/:id/edit",middleware.checkProjectOwnership,function(req,res){
    Project.findById(req.params.id,function(err,foundProject){
        if(err){
            console.log(err);
            res.redirect("back");
        }else{
            if(foundProject.isAlive === true || (res.locals.currentUser && res.locals.currentUser.isAdmin) ){
                res.render("projects/edit",{project:foundProject});
            }
            else{
                req.flash("error","can't edit dead project");
                res.redirect("back");
            }
        }
    });
});

//update project route
router.put("/:id",middleware.checkProjectOwnership,function(req,res){
    req.body.project.images = [req.body.fImage,req.body.sImage,req.body.tImage];
    Project.findByIdAndUpdate(req.params.id,req.body.project,function(err,updatedProject){
        if(err){
            res.redirect("/projects");
        }
        else{
            res.redirect("/projects/" + req.params.id);
        } 
   });
});
//delete project route
router.delete("/:id",middleware.checkProjectOwnership,function(req,res){
    Project.findByIdAndRemove(req.params.id,function(err){
        if(err){
           res.redirect("/"); 
        }
        else{
            res.redirect("/");
        }
    });
});
router.post("/:id/pledge",[middleware.isLoggedIn,middleware.hasEnoughMoney],function(req,res){
    User.findById(req.user._id,function(err,foundUser){
       if(err || !foundUser){
           console.log(err);
           res.redirect("back");
       }
       else{
           Project.findById(req.params.id,function(err,foundProject){
               if(err || !foundProject){
                   console.log(err);
                   res.redirect("back");
               }
                else if(foundProject.isAlive){
                    var pledge = {author:{id:req.user._id,username:req.user.username},amount:req.body.pledge};
                    Pledge.create(pledge,function(err,createdPledge){
                        if(err){
                            console.log(err);
                            res.redirect("back");
                        }else{
                            foundProject.pledges.push(createdPledge);
                            foundProject.funded += createdPledge.amount;
                            foundProject.save();
                            foundUser.cash -= createdPledge.amount;
                            foundUser.save();
                            //req.flash("success","Successfully pledged!");
                            res.send({pledge:createdPledge,status:200,projectPledge:foundProject.pledge,projectFunded:foundProject.funded});
                        }
                    });
                }
                else{
                    req.flash("error","cant make a pledge on dead project");
                    res.redirect("back");
                }
           });
       }
    });
});

module.exports = router;