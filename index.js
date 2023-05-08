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
   const resultCell = defaultSheet.getCell(line.rowIndex - 2 , 2);
   console.log(username, password);
   console.log('----------');

  const browser = await puppeteer.launch({executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: false});

  const page = await browser.newPage();

  await page.goto('https://vuigher.com/');
 
  await page.click('div.navbar-avatar')
  await page.type('input[name="username"]', username);
  await page.type('input[name="password"]', password);
  // Set screen size

  await page.click('input[name="submit');

  await page.waitForNavigation();
  await page.click('div.navbar-avatar')
  const greeting = await page.$eval('div.navbar-user-welcome span', element => element.textContent.trim());
  if (greeting) {
    console.log(greeting);
    resultCell.value = 'oke';
    await defaultSheet.saveUpdatedCells();
  } else {
    console.log('The page does not contain a div element with class "navbar-user-welcome"');
  }
  }
 } catch (e) {
  console.log(e);
 }
}

main();