import express from "express";
import { createProxyMiddleware } from "http-proxy-middleware";
import cors from "cors";
import morgan from "morgan";
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { requireGatewayAuth } from "./middlewares/auth.js";

dotenv.config({ path: fileURLToPath(new URL('./.env', import.meta.url)) });

const app = express();
const PORT = Number(process.env.PORT) || 8000;

app.use(cors({
    origin: '*',
    credentials: true
}));

app.use(morgan('dev'));

const services = {
    '/api/user': 'http://localhost:8001',
    '/api/product': 'http://localhost:8002',
    '/api/cart': 'http://localhost:8003',
    '/api/orders': 'http://localhost:8004'
};

const userProxy = createProxyMiddleware({
    target: services['/api/user'],
    changeOrigin: true,
});

const productProxy = createProxyMiddleware({
    target: services['/api/product'],
    changeOrigin: true,
});

const cartProxy = createProxyMiddleware({
    target: services['/api/cart'],
    changeOrigin: true,
});

const orderProxy = createProxyMiddleware({
    target: services['/api/orders'],
    changeOrigin: true,
});

app.use('/api/user/logout', requireGatewayAuth(), userProxy);
app.use('/api/user/get-user', requireGatewayAuth(), userProxy);
app.use('/api/user/update', requireGatewayAuth(), userProxy);
app.use('/api/user/all-user', requireGatewayAuth('admin'), userProxy);
app.use('/api/user', userProxy);

app.use('/api/product/add-product', requireGatewayAuth('admin'), productProxy);
app.use('/api/product/delete', requireGatewayAuth('admin'), productProxy);
app.use('/api/product/update', requireGatewayAuth('admin'), productProxy);
app.use('/api/product', productProxy);

app.use('/api/cart', requireGatewayAuth(), cartProxy);

app.use('/api/orders/user-order', requireGatewayAuth('admin'), orderProxy);
app.use('/api/orders/all-orders', requireGatewayAuth('admin'), orderProxy);
app.use('/api/orders/sales', requireGatewayAuth('admin'), orderProxy);
app.use('/api/orders/create-order', requireGatewayAuth(), orderProxy);
app.use('/api/orders/verify-payment', requireGatewayAuth(), orderProxy);
app.use('/api/orders/my-order', requireGatewayAuth(), orderProxy);
app.use('/api/orders', requireGatewayAuth(), orderProxy);

app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: "API Gateway: Route Not Found"
    });
});

app.listen(PORT, () => {
    console.log(`API Gateway is running on port ${PORT}`);
});
