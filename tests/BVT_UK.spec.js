import { test } from 'playwright/test';
import { POManager } from '../OCT_PO/POManager.js';
import fs from 'fs';

const inputDataRaw = fs.readFileSync('Utils/BVT_UK.input.json', 'utf-8');
const inputData = JSON.parse(inputDataRaw);
const timestamp = Date.now();

function substitutePlaceholders(obj, ts) {
  const result = {};
  for (const key in obj) {
    if (typeof obj[key] === 'string') {
      result[key] = obj[key].replace(/\{\{timestamp\}\}/g, ts);
    } else {
      result[key] = obj[key];
    }
  }
  return result;
}

const testData = substitutePlaceholders(inputData, timestamp);

test('BVT_UK', async ({ page }) => {
  const poManager = new POManager(page);
  await page.goto(testData.TestURL);
  await poManager.loginToApplication(testData.Username, testData.Password, testData.ClientName);
  let frame = page.frameLocator('iframe[title="Corporate Tax"]');

  // Entity Creation
  await frame.getByRole('button', { name: 'Configuration' }).click();
  await frame.getByText('Entity Manager').click();
  await poManager.createEntity(testData.EntityName, testData.ShortName, testData.Jurisdiction);

  // Dataset Creation
  await frame.getByRole('button', { name: 'Calculations' }).click();
  await frame.getByText('Calculations').nth(1).click();
  const { taxYear } = await poManager.createDataset(testData.DatasetName, testData.EntityName);

  // COA Creation
  await frame.getByRole('button', { name: 'Configuration' }).click();
  await frame.getByText('Chart of Accounts').click();
  await page.waitForTimeout(2000);
  await poManager.createCOA(testData.COAName, taxYear);

  // Map Creation
  await frame.getByRole('button', { name: 'Configuration' }).click();
  await frame.getByText('Mapping').click();
  await page.waitForTimeout(2000);
  await poManager.createNewMap(testData.MapName, testData.DatasetName, testData.COAName, "United Kingdom Corporate Tax 2025 1.121", testData.ImportType);

  // Import Creation
  await frame.getByRole('button', { name: 'Imports' }).click();
  await frame.getByText('ImportDetails').click();
  await page.waitForTimeout(2000);
  await poManager.createNewImport(testData.ImportName, testData.DatasetName, testData.ImportType, testData.EntityName);
});


