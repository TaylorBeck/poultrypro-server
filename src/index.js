import express from 'express';
import dotenv from 'dotenv';
import bodyParser from 'body-parser';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';

/* ROUTE IMPORTS */
import authRoutes from './routes/auth.js';
import chickenRoutes from './routes/chickens.js';

/* CONFIG */
dotenv.config();

const app = express();
app.use(express.json());
app.use(helmet());
app.use(helmet.crossOriginResourcePolicy({ policy: 'cross-origin' }));
app.use(morgan('common'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cors());

/* ROUTES */
app.use('/api/auth', authRoutes);
app.use('/api/chickens', chickenRoutes);

/* SERVER */
const port = Number(process.env.PORT) || 3001;
app.listen(port, '0.0.0.0', () => {
  console.log(`Server running on port ${port}`);
});
