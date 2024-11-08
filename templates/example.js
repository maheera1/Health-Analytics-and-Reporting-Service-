import fs from 'fs';
import path from 'path';
import puppeteer from 'puppeteer';

// Sample iterative data
const userData = [
  { name: 'John Doe', age: 302535, email: 'john.doe@example.com' },
  { name: 'Jane Smith', age: 302535, email: 'jane.smith@example.com' },
  { name: 'Bob Johnson', age: 302535, email: 'bob.johnson@example.com' }
];

const salesData = [
  { product: 'Product A', sales: 1000, revenue: 5000 },
  { product: 'Product B', sales: 750, revenue: 3500 },
  { product: 'Product C', sales: 500, revenue: 2000 }
];

const outputDir = "../pdfs";

// Helper function to generate PDF from HTML template and data
const generatePDFFromTemplate = async (templatePath, outputPath, data, dataKey) => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();

  // Read the HTML template
  const templateDir = path.dirname(new URL(import.meta.url).pathname);
  const template = await fs.promises.readFile(path.join(templateDir, templatePath), 'utf8');

  // Render the template with the data
  let tableRows = '';
  data.forEach((item) => {
    tableRows += Object.keys(item).map((key) => `<td>${item[key]}</td>`).join('');
  });

  console.log(tableRows)

  const html = template.replace('{{rows}}', tableRows);

  // Navigate to the rendered HTML and generate the PDF
  await page.setContent(html);
  await page.pdf({ path: path.join(outputDir, outputPath), format: 'A4' });

  await browser.close();
  console.log(`${dataKey} PDF generated`);
};

// Example usage for a "user_data" template
// const generateUserDataPDF = async () => {
//   await generatePDFFromTemplate('user_data.html', 'user_data.pdf', userData, 'User Data');
// };

// Example usage for a "sales_report" template
const generateSalesReportPDF = async () => {
  await generatePDFFromTemplate('example.html', 'sales_report.pdf', salesData, 'Sales Report');
};

// Usage
// generateUserDataPDF();
generateSalesReportPDF();