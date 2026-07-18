import { Product } from '../models/productModel.js';
import cloudinary from '../utils/cloudinary.js';
import getDataUri from '../utils/dataUri.js';

export const addProduct = async (req, res) => {
  try {
    const { productName, productDesc, productPrice, category, brand } = req.body;
    const userId = req.id;
    if (!productName || !productDesc || !productPrice || !category || !brand) {
      return res.status(400).json({
        success: false,
        message: "all fields are required"
      })
    }
    
    let productImg = [];
    if (req.files && req.files.length > 0) {
      for (let file of req.files) {
        const fileUri = getDataUri(file);
        const result = await cloudinary.uploader.upload(fileUri, {
          folder:"products"
        });
        productImg.push({
          url: result.secure_url,
          public_id: result.public_id,
        });
      }
    }
    
    const product = await Product.create({
      productName,
      productDesc,
      productPrice,
      category,
      brand,
      userId,
      productImg,
    });
    
    return res.status(201).json({
      success: true,
      message: "product added successfully",
      product,
    })
  }
  catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    })
  }
};

export const getAllProducts = async (req, res) => {
  try {
    const products = await Product.find();
    if (!products) {
      return res.status(404).json({
        success: false,
        message:"no products available"
      })
    }
    return res.status(200).json({
      success: true,
      message: "products fetched successfully",
      products,
    })
  }
  catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    })
  }
};

export const deleteProduct = async (req, res) => {
  try {
    const {productId} = req.params;
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: "product not found"
      })
    }
    //deleting images from cloudinary
    if (product.productImg && product.productImg.length>0) {
      for (let img of product.productImg) {
        const result=await cloudinary.uploader.destroy(img.public_id);
      }
    }
    
    await Product.findByIdAndDelete(productId);
    
    return res.status(200).json({
      success: true,
      message: "product deleted successfully",
    })
  }
  catch (error) {
    return res.status(500).json({
      success: false,
      message:error.message
    })
  }
}

export const updateProduct = async (req, res) => {
  try {
    const { productId } = req.params;
    const { productName, productDesc, productPrice, category, brand ,existingImages} = req.body;
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: "product not found"
      })
    }
    
    let updatedImages = [];
    if (existingImages) {
      const keepIds = JSON.parse(existingImages);
      updatedImages = product.productImg.filter((img) => keepIds.includes(img.public_id));
      const removedImages = product.productImg.filter((img) => !keepIds.includes(img.public_id));
      
      for (let img of removedImages) {
        await cloudinary.uploader.destroy(img.public_id);
      }
    } else {
      updatedImages = product.productImg;
    }
    if (req.files && req.files.length > 0) {
      for (let file of req.files) {
        const fileUri = getDataUri(file);
        const result = await cloudinary.uploader.upload(fileUri, { folder: "products" });
        
        updatedImages.push({
          url: result.secure_url,
          public_id:result.public_id
        })
        
      }
    }
    product.productName = productName || product.productName;
    product.productDesc = productDesc || product.productDesc;
    product.productPrice = productPrice || product.productPrice;
    product.category = category || product.category;
    product.brand = brand || product.brand;
    product.productImg = updatedImages;
    
    await product.save();
    return res.status(200).json({
      success: true,
      message: "product updated successfully",
      product
    })
    
  }catch (error) {
    return res.status(500).json({
      success: false,
      message:error.message
    })
  }
}