const mongoose=require('mongoose')

const validation=new mongoose.Schema({
    user:String,
    emailOrPhone:String,
    password:String
})
module.exports=mongoose.model("keep_clone",validation)