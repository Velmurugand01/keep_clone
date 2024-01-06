const mongoose=require('mongoose')

const valid=new mongoose.Schema({
    userId:{
        type: mongoose.Schema.Types.ObjectId,  
        ref:'keep_clone'   
    },
    message:String,
    imageUrl: String,
     Title: String,
     Price:String,
     Description: String,
     Category: String,
     Availability: {
       type: String,
       enum: ['Available', 'NotAvailable']
  }
})
module.exports=mongoose.model("message",valid)