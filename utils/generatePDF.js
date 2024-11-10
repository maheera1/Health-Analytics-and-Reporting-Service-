import fs from 'fs';
import path from 'path';
import puppeteer from 'puppeteer';
import Handlebars from 'handlebars';

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
    const outputPath = `Patient_Health_Report_${data.patient.id}.pdf`;

    // Load and compile the HTML template with Handlebars
    const templateSource = await fs.promises.readFile(templatePath, 'utf8');
    const template = Handlebars.compile(templateSource);
    const htmlContent = template(data);

    // Generate the PDF
    await generatePDF(outputPath, htmlContent, "Patient Health Report");

    console.log('Patient Health PDF generation completed');
  } catch (error) {
    console.error("Error generating Patient Health report PDF:", error);
  }
};
