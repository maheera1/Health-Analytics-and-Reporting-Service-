import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import { fileURLToPath } from 'url';
import path from 'path';
import fs from 'fs';
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

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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

app.get('/api/reports/download/:type/:id?', async (req, res) => {
  const { type, id } = req.params;

  try {
    let fileName;

    // Determine the file name based on the report type
    if (type === 'patientHealth') {
      if (!id) {
        return res.status(400).json({ error: 'ID is required for patientHealth reports' });
      }
      fileName = `Patient_Health_Report_${id}.pdf`;
    } else if (type === 'hospitalOperations') {
      fileName = `Hospital_Operations_Report.pdf`;
    } else if (type === 'treatmentOutcome') {
      fileName = `Treatment_Outcome_Report.pdf`;
    } else if (type === 'financialAnalytics') {
      fileName = `Financial_Analytics_Report.pdf`;
    } else {
      return res.status(400).json({ error: 'Invalid report type' });
    }

    const filePath = path.join(__dirname, 'pdf_output', fileName);

    if (!fs.existsSync(filePath)) {
      console.error(`File not found at: ${filePath}`);
      return res.status(404).json({ error: `File not found: ${filePath}` });
    }

    // Log the headers being sent
    console.log("Sending file with headers:", {
      "Content-Type": "application/pdf",
      "Content-Disposition": `inline; filename="${fileName}"`,
    });

    // Set headers and stream the file
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `inline; filename="${fileName}"`);
    const fileStream = fs.createReadStream(filePath);
    fileStream.pipe(res);
  } catch (error) {
    console.error('Error handling download:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});



// Handling unknown routes
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