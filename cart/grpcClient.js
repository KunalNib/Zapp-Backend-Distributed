import grpc from '@grpc/grpc-js';
import protoLoader from '@grpc/proto-loader';
import path from 'path';
import { fileURLToPath } from 'url';

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
const PRODUCT_GRPC_URL = process.env.PRODUCT_GRPC_URL || "localhost:50051";

const client = new productProto.ProductService(
  PRODUCT_GRPC_URL,
  grpc.credentials.createInsecure()
);

export const getProductViaGrpc = (productId) => {
  return new Promise((resolve, reject) => {
    client.GetProduct({ productId }, (error, response) => {
      if (error) {
        return reject(error);
      }
      if (!response.success) {
        const err = new Error(response.message || "Product not found");
        err.statusCode = 404;
        return reject(err);
      }
      resolve(response.product);
    });
  });
};
