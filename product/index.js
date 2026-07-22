import express from "express";
import mongoose from "mongoose";
import cors from 'cors';
import productRoutes from "./routes/productRoutes.js";
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';

dotenv.config({ path: fileURLToPath(new URL('./.env', import.meta.url)) });

const app=express();
const PORT=Number(process.env.PORT) || 8002;


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

app.use('/api/product/',productRoutes);


app.listen(PORT,()=>{
    console.log(`app is listening on port ${PORT}`);
})
