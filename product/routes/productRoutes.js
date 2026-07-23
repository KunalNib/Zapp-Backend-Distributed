import express from "express";
import { getAllProducts, getProductById, addProduct, deleteProduct, updateProduct} from "../controllers/productController.js";
import { multipleUpload } from "../middlewares/multer.js";

const router = express.Router();

router.get("/all-products", getAllProducts);
router.get("/:productId", getProductById);
router.post("/add-product", multipleUpload, addProduct);
router.delete("/delete/:productId", deleteProduct);
router.put("/update/:productId", multipleUpload, updateProduct);
export default router;

