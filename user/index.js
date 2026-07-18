import "dotenv/config"
import express from "express";
import mongoose from "mongoose";
import userRoutes from "./routes/userRoutes.js";
import cors from 'cors';

const app=express();
const PORT=process.env.PORT;


app.use(express.json());
app.use(express.urlencoded({extended:true}));
app.use(cors({
    origin:'*',
    credentails:true
}))

const connectDB=async()=>{
    try{
        await mongoose.connect(process.env.MONGO_URI);
        console.log("Mongodb Connected Successfully");
    }
    catch(err){
        console.log("Mongodb Connection Failed",err);
    }
}
connectDB();

app.use('/api/user/',userRoutes);


app.listen(PORT,()=>{
    console.log(`app is listening on port ${PORT}`);
})