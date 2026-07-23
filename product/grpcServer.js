import grpc from '@grpc/grpc-js';
import protoLoader from '@grpc/proto-loader';
import path from 'path';
import { fileURLToPath } from 'url';
import { Product } from './models/productModel.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PROTO_PATH = path.resolve(__dirname, '../proto/product.proto');

const packageDefinition = protoLoader.loadSync(PROTO_PATH, {
  keepCase: true,
  longs: String,
  enums: String,
  defaults: true,
  oneofs: true
});

const productProto = grpc.loadPackageDefinition(packageDefinition).product;

const getProduct = async (call, callback) => {
  try {
    const { productId } = call.request;
    const product = await Product.findById(productId);

    if (!product) {
      return callback(null, {
        success: false,
        message: "Product not found",
        product: null
      });
    }

    callback(null, {
      success: true,
      message: "Product retrieved via gRPC successfully",
      product: {
        _id: product._id ? product._id.toString() : "",
        productName: product.productName || "",
        productDesc: product.productDesc || "",
        productPrice: product.productPrice || 0,
        category: product.category || "",
        brand: product.brand || "",
        userId: product.userId ? product.userId.toString() : "",
        productImg: (product.productImg || []).map(img => ({
          url: img.url || "",
          public_id: img.public_id || ""
        })),
        createdAt: product.createdAt ? product.createdAt.toISOString() : "",
        updatedAt: product.updatedAt ? product.updatedAt.toISOString() : "",
      }
    });
  } catch (error) {
    callback(null, {
      success: false,
      message: error.message,
      product: null
    });
  }
};

export const startGrpcServer = () => {
  const server = new grpc.Server();
  server.addService(productProto.ProductService.service, { getProduct });
  
  const gRpcPort = process.env.GRPC_PORT || "50051";
  
  server.bindAsync(
    `0.0.0.0:${gRpcPort}`,
    grpc.ServerCredentials.createInsecure(),
    (error, port) => {
      if (error) {
        console.error("Failed to bind gRPC server:", error);
        return;
      }
      console.log(`Product gRPC Server running on port ${port}`);
    }
  );
};
