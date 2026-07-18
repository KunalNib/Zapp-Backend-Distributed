import express from "express";
import { getAllProducts, addProduct, deleteProduct, updateProduct} from "../controllers/productController.js";

import { isAdmin, isAuthenticated } from "../middlewares/isAuthenticated.js";
import { multipleUpload } from "../middlewares/multer.js";

const router = express.Router();

router.get("/all-products", getAllProducts);
router.post("/add-product", isAuthenticated, isAdmin, multipleUpload, addProduct);
router.delete("/delete/:productId", isAuthenticated, isAdmin, deleteProduct);
router.put("/update/:productId", isAuthenticated, isAdmin,multipleUpload, updateProduct);
export default router;



