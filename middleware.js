const jwt=require('jsonwebtoken')
const verifyToken=(req,res,next)=>{
  
 const token = req.cookies.jwt;
   if(!token){
 return res.json("Jwt token required")
   }
    jwt.verify(token,process.env.secret_Key,(err,decode)=>{
       if(err){
    res.json("wrong Jwt")
       }
       req.verifyEmail=decode
       console.log(req.verifyEmail);
       next()
    })

}
module.exports=verifyToken