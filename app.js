const express=require('express')
const app=express()
const mongoose=require('mongoose')
const cloudinary=require('cloudinary').v2
const multer=require("multer")
const cors=require('cors')
const jwt=require('jsonwebtoken')
const cookie=require('cookie-parser')
require('dotenv').config()


// import modules
const schema=require('./schema')
const schema_2=require('./schema_2')
const verifyToken=require('./middleware')

//cloudinary
cloudinary.config({
    cloud_name: 'dxecndiv4',
    api_key: '645558696592378',
    api_secret: 'H6y4ufLJkbSS0ixp_X3wTuGUobM',
    secure: true,
  });


mongoose.connect(process.env.dataBase)
.then(()=>{
    console.log("Database is connected Successfully");
})
.catch(()=>{
    console.log("Database is not connected");
})

// middlewware
app.use(express.urlencoded({extended:false}))
app.use(cors())
app.use(cookie());

//multer
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });



app.post('/signUp',async(req,res)=>{ 
   const details=new schema({
    ...req.body
})

// const{emailOrPhone}=req.body
const email= await schema.findOne(req.body.emailOrphone)
if(email){
  return  res.send("You Have Already Account")
}
 
await details.save()
.then(()=>{
   res.send("Register Sucessfully") 
   console.log(details);
})
.catch(()=>{
    res.send("Data not Saved")
})

})

app.post('/login',async(req,res)=>{
    const{emailOrPhone,password}=req.body
    const verifyEmail=await schema.findOne({emailOrPhone})
    if(!verifyEmail){
        res.send("Invalid Email")
    }
    // password verify and jwt token create
    // const{password}=req.body
  const verifyPassword=(password===verifyEmail.password)
  if(!verifyPassword){
    res.json("Something Wrong")
  }

   
      const jsonwebtoken=jwt.sign({id:verifyEmail._id,emailOrPhone:verifyEmail.emailOrPhone},process.env.secret_key,{expiresIn:"7d"})
     res.cookie("jwt",jsonwebtoken,{httpOnly:true})
  
    res.json("Login Sucessfullly")


})
// post data 
// app.post('/postData',verifyToken,upload.single('image'),async(req,res)=>{

//     if(!req.file){
//         res.json("No image file is provided")
//     }
//   cloudinary.Uploader.upload_stream({resource_type:'image'},async(error,result)=>{
//     if(error){
//         return res.json("error is Occuered during image uplod")
//     }
//     //Cloudinary Saved image transferurl into database
//     const details=new  schema_2({
//             imageUrl: result.url,
//             userId:req.verifyEmail.id,
//             Title: req.body.Title,
//             Price: req.body.Price,
//             Description: req.body.Description,
//             Category: req.body.Category,
//             Count: req.body.Count,
//             Availability: req.body.Availability
            
//           });
//           await details.save()
//           .then(()=>{
//             res.json(' details saved successfully')
//            })
//            .catch(()=>{
//               res.json("Something Wrong")
//            }).end(req.file.bufferS)
          
//     }).end(req.file.buffer)


// })
app.post('/postData', verifyToken, upload.single('image'), async (req, res) => {
    if (!req.file) {
        return res.status(400).json({ message: "No image file provided" });
    }

    cloudinary.uploader.upload_stream({ resource_type: 'image' }, async (error, result) => {
        if (error) {
            return res.status(500).json({ message: "Error occurred during image upload" });
        }

        const details = new schema_2({
            imageUrl: result.url,
            userId: req.verifyEmail.id,
            Title: req.body.Title,
            Price: req.body.Price,
            Description: req.body.Description,
            Category: req.body.Category,
            Availability: req.body.Availability
        });

       
            await details.save()
            .then(()=>{
                res.status(200).json({ message: 'Details saved successfully',info:details });
            })
            .catch(()=>{
                res.status(500).json({ message: "Something went wrong while saving data" });
            }) 
        
    }).end(req.file.buffer);
});

// get Data
app.get('/getData',verifyToken,async(req,res)=>{
    const{emailOrPhone}=req.verifyEmail.emailOrPhone
    const getData=await schema_2.find({emailOrPhone})

    res.json({message:"Data Fetching successfully" ,data:getData})
    console.log(getData);
})

// Ubdate Data
app.put('/ubdateData/:id',verifyToken,async(req,res)=>{
   const ubdateData=await schema_2.findByIdAndUpdate(req.params.id,{$set:req.body},{new:true})
   res.json(ubdateData)
})

app.delete('/deleteData/:id',verifyToken,async(req,res)=>{
    const deleteData= await schema_2.findByIdAndDelete(req.params.id)
    res.json("delete Successfully")
    console.log("delete Successfully");
})


app.listen(process.env.port,()=>{
    console.log("Server is listening",process.env.port);
})