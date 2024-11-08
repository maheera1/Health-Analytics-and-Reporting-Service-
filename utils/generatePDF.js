import fs from 'fs';
import path from 'path';
import puppeteer from 'puppeteer';

export const generatePDF = async (outputPath, htmlData, dataKey) => {
  // Ensure the output directory exists
  const outputDir = path.resolve('./pdf_output');
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  const browser = await puppeteer.launch();
  const page = await browser.newPage();

  // Load the HTML content into the page
  await page.setContent(htmlData, { waitUntil: 'load' });
  
  // Generate and save the PDF
  await page.pdf({ path: path.join(outputDir, outputPath), format: 'A4' });

  await browser.close();
  console.log(`${dataKey} PDF generated`);
};
