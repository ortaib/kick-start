var express               = require("express"),
    app                   = express(),
    bodyParser            = require("body-parser"),
    mongoose              = require("mongoose"),
    methodOverride        = require("method-override"),
    flash                 = require("connect-flash"),
    passport              = require("passport"),
    LocalStrategy         = require("passport-local"),
    User                  = require("./models/user")

var commentRoutes = require("./routes/comments"),
    projectRoutes = require("./routes/projects"),
    indexRoutes   = require("./routes/index")
    
//mongoose.connect("mongodb://localhost/kick_start");
mongoose.connect("mongodb://or:ortea91@ds018848.mlab.com:18848/kickstart");
app.use(bodyParser.urlencoded({extended:true}));
app.use(bodyParser.json());
app.set("view engine","ejs");
app.use(express.static(__dirname+"/public"));
app.use(methodOverride("_method"));
app.locals.moment = require("moment");

app.use(require("express-session")({
    secret: "Once again rusty wins cutest dog!",
    resave: false,
    saveOnInitialize: false
}));

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());
app.use(flash());


//make sure all routes gets req.user
app.use(function(req,res,next){
    res.locals.currentUser = req.user;
    res.locals.error = req.flash("error");
    res.locals.success = req.flash("success");
    next();
});

app.use(indexRoutes);
app.use("/projects",projectRoutes);
app.use("/projects/:id/comments/",commentRoutes);

app.listen(process.env.PORT,process.env.IP,function(){
    console.log("Kick start server has started"); 
});