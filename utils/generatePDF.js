

import puppeteer from 'puppeteer';
import path from 'path';

export const generatePDF = async (outputPath, htmlData, dataKey) => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();

  // Load the HTML content into the page
  await page.setContent(htmlData, { waitUntil: 'load' });
  
  // Generate and save the PDF
  const outputDir = path.resolve('./pdf_output'); // Set your output directory path
  await page.pdf({ path: path.join(outputDir, outputPath), format: 'A4' });

  await browser.close();
  console.log(`${dataKey} PDF generated`);
};
