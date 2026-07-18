import "dotenv/config";
import express from "express";
import { createProxyMiddleware } from "http-proxy-middleware";
import cors from "cors";
import morgan from "morgan";

const app = express();
const PORT = process.env.PORT || 8000;

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


for (const [path, target] of Object.entries(services)) {
    app.use(
        path,
        createProxyMiddleware({
            target,
            changeOrigin: true,
        })
    );
}

app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: "API Gateway: Route Not Found"
    });
});

app.listen(PORT, () => {
    console.log(`API Gateway is running on port ${PORT}`);
});
