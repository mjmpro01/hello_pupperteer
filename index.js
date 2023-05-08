const { GoogleSpreadsheet } = require("google-spreadsheet");
const creds = require("./google_cred.json");
// const axios = require("axios");
require("dotenv").config();
const puppeteer = require("puppeteer");

const main = async () => {
 try {
  console.log("START: READING FILE");
  const sheetId = process.env.SHEET_ID;
  console.log("🚀 ~ file: index.js:11 ~ main ~ sheetId:", sheetId)
  const doc = new GoogleSpreadsheet(sheetId);

  await doc.useServiceAccountAuth(creds);
  await doc.loadInfo();
  const defaultSheet = doc.sheetsByIndex[parseInt(process.env.SHEET_INDEX, 10)];
  await defaultSheet.loadCells();
  const lines = await defaultSheet.getRows();

  for (let line of lines) {
   const username = defaultSheet.getCell(line.rowIndex - 2 , 0).value;
   const password = defaultSheet.getCell(line.rowIndex - 2 , 1).value;
   console.log(username, password);
   console.log('----------');

  const browser = await puppeteer.launch({headless: false});

  const page = await browser.newPage();

  await page.goto('https://vuigher.com/');
 
  await page.click('div.navbar-avatar')
  await page.type('input[name="username"]', username);
  await page.type('input[name="password"]', password);
  // Set screen size

  await page.click('input[name="submit');
  }
 } catch (e) {
  console.log(e);
 }
}

main();