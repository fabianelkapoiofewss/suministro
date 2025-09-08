import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import helmet from 'helmet';
import { connectDB } from '../config/connection.js';
import router from '../routers/index.route.js';
import { config } from 'dotenv';
config();

const app = express();
const PORT = process.env.PORT || 3434;


// Middlewares
app.use(helmet());
app.use(cors(
    {
        origin: 'http://suministros:5173',
    }
));
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use(router);

// Start server
export const startServer = async () => {
    try {
        await connectDB();
        app.listen(PORT, () => {
            console.log(`Server is running on port ${PORT}`);
        });
    } catch (error) {
        console.error('Error starting server:', error);
    }
};