const mongoose=require('mongoose')

const valid=new mongoose.Schema({
    userId:{
        type: mongoose.Schema.Types.ObjectId,  
        ref:'keep_clone'   
    },
    message:String,
    imageUrl: String,
     Title: String,
    
})
module.exports=mongoose.model("message",valid)