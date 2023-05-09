const { GoogleSpreadsheet } = require("google-spreadsheet");
const creds = require("./google_cred.json");
const axios = require("axios");
require("dotenv").config();
const puppeteer = require("puppeteer");

const main = async () => {
  try {
    console.log("START: READING FILE");
    const doc = new GoogleSpreadsheet(process.env.SHEET_ID);
    await doc.useServiceAccountAuth(creds);
    await doc.loadInfo();
    const defaultSheet =
      doc.sheetsByIndex[parseInt(process.env.SHEET_INDEX, 10)];
    await defaultSheet.loadCells();
    const lines = await defaultSheet.getRows();
    let count = 0;
    for (let line of lines.slice(1)) {
      const username = defaultSheet.getCell(line.rowIndex - 2, 0).value;
      const password = defaultSheet.getCell(line.rowIndex - 2, 1).value;
      const code2F = defaultSheet.getCell(line.rowIndex - 2, 2).value;
      const value = await axios.get(`https://2fa.live/tok/${code2F}`);
      const resultCell = defaultSheet.getCell(line.rowIndex - 2, 3);

      console.log(username, password);
      console.log("----------");

      const browser = await puppeteer.launch({
        executablePath: process.env.CHROME_PATH,
        headless: false,
      });

      const page = await browser.newPage();

      const client = await page.target().createCDPSession();
      await client.send("Network.clearBrowserCookies");
      await client.send("Network.clearBrowserCache");
      await page.goto(process.env.PRIME_GAMING_LINK, {
        waitUntil: "networkidle2",
      });

      // click sign in button
      await page.waitForSelector(
        'button[aria-label="User dropdown and more options"]'
      ); // wait for the button to appear
      await page.click('button[aria-label="User dropdown and more options"]');
      await page.click('button[data-a-target="user-dropdown__sign-in"]');

      console.log("Start redirect ...");

      // Waiting load aws login
      await page.waitForSelector('input[id="ap_email"]');

      console.log("Signing in...");
      await page.type('input[id="ap_email"]', username);
      await page.type('input[id="ap_password"]', password);
      await page.click('input[id="signInSubmit');

      await page.waitForNavigation({ waitUntil: "networkidle2" });

      if (value.data) {
        try {
          await page.type('input[id="auth-mfa-otpcode"]', value.data.token);
          await page.click('input[id="auth-signin-button"]');
          await page.waitForNavigation({ waitUntil: "networkidle2" });
          let valueAccount;
          try {
            const displayNameElement = await page.$(
              'p.tw-amazon-ember-regular[data-a-target="Customer3PDisplayName"]'
            );
            const displayNameValue = await displayNameElement.evaluate(
              (element) => element.getAttribute("title")
            );
            valueAccount = `Account Link ${displayNameValue}`;
          } catch (e) {
            valueAccount = "New";
          }

          resultCell.value = valueAccount;
          await defaultSheet.saveUpdatedCells();
        } catch (e) {
          // const error = await page.$('#auth-error-message-box');
          resultCell.value = "error";
          await defaultSheet.saveUpdatedCells();
        }
        count++;
        await browser.close();
      }
    }
    console.log("🚀 Count user processed:", count);
  } catch (e) {
    console.log(e);
  }
};

main();
