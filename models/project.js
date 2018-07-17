var mongoose = require("mongoose");

var projectSchema = new mongoose.Schema({
    name : String,
    images : [],
    about  : String,
    description:String,
    video : String,
    tryNow : String,
    pledge:Number,
    funded:{type : Number, default : 0},
    createdAt: { type: Date, default: Date.now },
    endsAt   : { type: Date },
    isAlive : {type : Boolean , default :true},
    kickStarted : {type : Boolean , default :false},
    author:{
        id: {
            type:mongoose.Schema.Types.ObjectId,
            ref:"User" 
        },
        username:String
    },
    comments : [{
        type : mongoose.Schema.Types.ObjectId,
        ref  : "Comment"
               }],
    pledges : [{
        type : mongoose.Schema.Types.ObjectId,
        ref  : "Pledge"
              }]
});
module.exports =  mongoose.model("Project",projectSchema);

