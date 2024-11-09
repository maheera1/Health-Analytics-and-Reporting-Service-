import fs from 'fs';
import path from 'path';
import puppeteer from 'puppeteer';

export const generatePDF = async (outputPath, htmlContent, dataKey) => {
  try {
    const outputDir = path.resolve('./pdf_output');
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    const browser = await puppeteer.launch({
      headless: 'new',
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    const page = await browser.newPage();
    
    await page.setViewport({
      width: 794,
      height: 1123,
      deviceScaleFactor: 1
    });

    await page.setContent(htmlContent, {
      waitUntil: ['load', 'networkidle0']
    });

    await page.pdf({
      path: path.join(outputDir, outputPath),
      format: 'A4',
      printBackground: true,
      margin: {
        top: '20mm',
        right: '20mm',
        bottom: '20mm',
        left: '20mm'
      }
    });

    await browser.close();
    console.log(`${dataKey} PDF generated successfully`);

  } catch (error) {
    console.error(`Error generating PDF for ${dataKey}:`, error);
    throw error;
  }
};

export const generatePatientHealthPDF = async (data) => {
  try {
    const templatePath = path.resolve('templates', 'patient_health_report.html'); // Path to the template
    const outputPath = `Patient_Health_Report_${data.patientId}.pdf`;

    // Load and compile the HTML template
    const templateSource = await fs.promises.readFile(templatePath, 'utf8');
    const htmlContent = compileTemplate(templateSource, data);

    // Generate the PDF
    await generatePDF(outputPath, htmlContent, "Patient Health Report");

    console.log('Patient Health PDF generation completed');
  } catch (error) {
    console.error("Error generating Patient Health report PDF:", error);
  }
};

// Helper function to replace placeholders in the template
const compileTemplate = (template, data) => {
  return template
    .replace('{{patient.name}}', data.patient.name)
    .replace('{{patient.age}}', data.patient.age)
    .replace('{{patient.gender}}', data.patient.gender)
    .replace('{{patient.id}}', data.patient.id)
    .replace('{{diagnosis}}', data.diagnosis || "N/A")
    .replace('{{medications}}', data.medications.map(med => `<li>${med}</li>`).join(''))
    .replace('{{labResults}}', data.labResults.map(result => 
      `<tr><td>${result.testName}</td><td>${result.value} ${result.unit}</td><td>${result.referenceRange}</td><td>${result.timestamp}</td></tr>`
    ).join(''))
    .replace('{{metadata.createdBy}}', data.metadata.createdBy)
    .replace('{{metadata.createdAt}}', data.metadata.createdAt);
};
