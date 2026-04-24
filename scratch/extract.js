const XLSX = require('xlsx');
const path = require('path');
const fs = require('fs');

const inputFile = path.join(__dirname, '..', 'PriceList', 'Price lists1.xlsx');
const outputFile = path.join(__dirname, 'prices.json');

const workbook = XLSX.readFile(inputFile);
const sheetName = workbook.SheetNames[0];
const worksheet = workbook.Sheets[sheetName];
const data = XLSX.utils.sheet_to_json(worksheet);

fs.writeFileSync(outputFile, JSON.stringify(data, null, 2), 'utf8');
console.log(`✅ Extracted ${data.length} items to ${outputFile}`);
