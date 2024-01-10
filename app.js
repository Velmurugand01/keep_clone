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

 const{emailOrPhone}=req.body
const email= await schema.findOne({emailOrPhone})
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

   
      const jsonwebtoken=jwt.sign({id:verifyEmail._id,emailOrPhone:verifyEmail.emailOrPhone},process.env.secret_key,{expiresIn:"3h"})
     res.cookie("jwt",jsonwebtoken,{httpOnly:true})
  
    res.json("Login Sucessfullly")


})
app.post('/forgot',async(req,res)=>{
    
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
           
        });

       
            await details.save()
            .then(()=>{
                res.status(200).json({ message: 'Details saved successfully',info:details });
                console.log(details);
            })
            .catch(()=>{
                res.status(500).json({ message: "Something went wrong while saving data" });
            }) 
        
    }).end(req.file.buffer);
});

// get Data
// app.get('/getData',verifyToken,async(req,res)=>{
//     const id=req.verifyEmail.userId
//     const getData=await schema_2.find({id})

//     res.json({message:"Data Fetching successfully" ,data:getData})
//     console.log(getData);
// })

app.get('/getData', verifyToken, async (req, res) => {
    const userId = req.verifyEmail.id; // Assuming `id` is the correct field in the `verifyEmail` object

    try {
        const getData = await schema_2.find({ userId }); // Finding data based on userId

        res.json({ message: "Data fetched successfully", data: getData });
        console.log(getData);
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch data" });
    }
});


// Ubdate Data
// app.put('/ubdateData/:id',verifyToken,async(req,res)=>{
//    const ubdateData=await schema_2.findByIdAndUpdate(req.params.id,{$set:req.body},{new:true})
//    // {set:req.body}=> // New data to update (received from the request body)
//    //req.params.id =>ID of the document to be updated
//    res.json(ubdateData)
// })
app.put('/ubdateData/:id', verifyToken, async (req, res) => {
    try {
       const existingData = await schema_2.findOne({ _id: req.params.id });
 
       if (!existingData) {
          return res.status(404).json({ message: 'Data not found for the given ID.' });
       }
 
       const updatedData = await schema_2.findByIdAndUpdate(
          req.params.id,
          { $set: req.body },
          { new: true }
       );
 
       res.json(updatedData); // Send updated data as JSON response
    } catch (error) {
       console.error('Update Error:', error); // Log the specific error that occurred
       res.status(500).json({ message: 'Internal server error during update.' });
    }
 });
 
 
app.delete('/deleteData/:id',verifyToken,async(req,res)=>{
    const deleteData= await schema_2.findByIdAndDelete(req.params.id)
    res.json("delete Successfully")
    console.log("delete Successfully");
})


app.listen(process.env.port,()=>{
    console.log("Server is listening",process.env.port);
})