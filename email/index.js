import express from 'express';
import 'dotenv/config';
import { startEmailWorker } from './workers/emailWorker.js';
import cors from 'cors';

const app = express();
app.use(express.json());
app.use(cors());

// Starting the background worker
startEmailWorker();

app.get('/health', (req, res) => {
    res.status(200).json({ status: 'OK', service: 'Email Service' });
});

const PORT = process.env.PORT || 5004;

app.listen(PORT, () => {
    console.log(`Email service is running on port ${PORT}`);
});
