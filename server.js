import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import { requestLogger } from './middleware/requestLogger.js';
import { errorHandler } from './middleware/errorHandler.js';
import { createError } from './middleware/errorTypes.js';
//routes
import hospitalOperationsRoutes from "./routes/hospitalOperationsRoutes.js"
import treatmentOutcomeRoutes from "./routes/treatmenOutcomeRoutes.js"
import patientRoutes from "./routes/patientRoutes.js"
import patientHealthRoutes from "./routes/patientHealthRoutes.js";
import temporalAnalyticsRoutes from "./routes/temporalAnalyticsRoutes.js";
import populatoinHealthRoutes from "./routes/populationHealthRoutes.js";

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


// routes
app.use('/api/reports/', hospitalOperationsRoutes);
app.use('/api/treatmentOutcome/', treatmentOutcomeRoutes);
app.use('/api/', patientRoutes)
app.use('/api/reports/', patientHealthRoutes);
// analytics routes
app.use('/api/analytics/', temporalAnalyticsRoutes);
app.use('/api/analytics/', populatoinHealthRoutes);

//handling unknown routes other than defined

app.all('*', (_req, _res, next) => {
  next(createError(404, `Can't find ${_req.originalUrl} on this server`));
});



//db
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch((error) => console.error('MongoDB connection error:', error));




app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});