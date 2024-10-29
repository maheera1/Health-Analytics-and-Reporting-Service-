import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import exampleRouter from './routes/exampleRoute.js';
import { requestLogger } from './middleware/requestLogger.js';
import { errorHandler } from './middleware/errorHandler.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));


//this is part of global error handling/middlewares
app.use(requestLogger)
app.use(express.json({ limit: '10kb' }));
app.use(errorHandler)


//limiting the rate of requests
const limiter = rateLimit({
  max: 100,
  windowMs: 60 * 60 * 1000,
  message: 'Too many requests from this IP, please try again in an hour'
});
app.use('/api', limiter); 


//handling unknown routes other than defined

app.all('*', (_req, _res, next) => {
  next(createError(404, `Can't find ${_req.originalUrl} on this server`));
});



//db
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch((error) => console.error('MongoDB connection error:', error));




// routes
app.use('/api', exampleRouter);





app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});