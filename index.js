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
  const cellA1 = defaultSheet.getCell(0, 0);

  for (let line of lines) {
   const username = defaultSheet.getCell(line.rowIndex - 2 , 0).value;
   const password = defaultSheet.getCell(line.rowIndex - 2 , 1).value;
   console.log(username, password);
   console.log('----------');

  const browser = await puppeteer.launch({executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'});

  const page = await browser.newPage();

  await page.goto('https://developer.chrome.com/');

  // Set screen size
  await page.setViewport({width: 1080, height: 1024});


  // Set screen size
  }


 } catch (e) {
  console.log(e);
 }
}

main();