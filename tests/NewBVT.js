import {test} from '@playwright/test';
import {POManager} from '../OCT_PO/POManager.js';

let EntityName=`PWEntity_${Date.now()}`;
let ShortName=`PW_${Date.now()}`;
let Jurisdiction="United Kingdom";
let DatasetName=`PWDataset_${Date.now()}`;
let taxYear;
let COAName=`PWCOA_${Date.now()}`;
let MapName=`PWMap_${Date.now()}`;
let ImportName=`PWImport_${Date.now()}`;

test('NewBVT', async ({ page }) => {
    const poManager = new POManager(page);
    await page.goto('https://emea1.onesourcetax.com/');
    await poManager.loginToApplication('AkshayVadde.fim', '$Admin#135', 'SYS_FIRM');
    let frame= page.frameLocator('iframe[title="Corporate Tax"]');

    // Entity Creation
    await frame.getByRole('button', { name: 'Configuration' }).click();
    await frame.getByText('Entity Manager').click();
    
await frame.locator('[id="athena-grid-cell-1-1:0"]').click();// Entity Name cell
  await page.waitForTimeout(1000);
  await page.keyboard.type(uniqueEntityName);// Type the unique entity name
  await page.keyboard.press('Tab');// Confirm with Tab key


   await frame.locator('[id="athena-grid-cell-1-1:1"]').click(); // Short Name cell 
  await page.keyboard.type(uniqueShortName);// Type the unique short name
  console.log(uniqueShortName);
  await page.keyboard.press('Tab');// Confirm with Tab key

// Click the Legal Entity type cell to open dropdown
await frame.locator('[id="athena-grid-cell-1-1:3"]');
await frame.getByText('Company', { exact: true }).click();
// Confirm selection
await page.keyboard.press('Tab');

   await frame.locator('[id="athena-grid-cell-1-1:4"]').click();// Entity Identifier cell
  await page.keyboard.type(uniqueEntityName);// Type the unique entity identifier
  await page.keyboard.press('Tab');// Confirm with Tab key
  
  await  frame.locator('[id="athena-grid-cell-1-1:5"]');// Jurisdiction cell
  await frame.getByText('United Kingdom', { exact: true }).click();// select Jurisdiction from dropdown
  await page.keyboard.press('Tab');// Confirm with Tab key
  await frame.locator('[id="athena-grid-cell-1-1:6"]').click();// Tax Year Start Date cell
  await page.keyboard.press('Tab');
  await frame.locator('[id="athena-grid-cell-1-1:7"]').click();// Tax Year End Date cell
  await page.keyboard.press('Tab');
  await frame.locator('[id="athena-grid-cell-1-1:20"]').click();// Currency cell
  await page.keyboard.press('Tab');

  await page.keyboard.press('Enter');// Save the entity

  // Wait for grid to refresh after entity creation
  await page.waitForTimeout(3000);
  
  // Click Name header to sort
  //await frame.locator("//div[@id='athena-grid-cell-1-0:1']/button").click();
  await frame.locator("//div[@id='athena-grid-cell-1-0:0']/button").click();
 
 
  
//await frame.locator('.wj-form-control').fill(uniqueShortName);
await frame.locator('.wj-form-control').fill(uniqueEntityName);

console.log(uniqueEntityName);

await page.waitForTimeout(2000);
await frame.getByText('Apply').click();

const EntShort = await frame.locator('[id="athena-grid-cell-1-2:1"]');
await expect(EntShort).toHaveText(uniqueShortName);
await page.close();
// later Add Aseration to verify entity creation 






});
  