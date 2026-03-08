import { test, expect } from '@playwright/test';
let webContext;
let uniqueEntityName;
let uniqueShortName;
let DatasetName
let taxYear;
let COAName;
let MapName;
let ImportName;



test.beforeAll('Login Test', async ({ browser }) => {
  const context = await browser.newContext();
  const page = await context.newPage();
  // Navigate to the login page
  await page.goto('https://emea1.onesourcetax.com/platform/home');
  await page.locator('#txtLogin').fill('AkshayVadde.fim');
  await page.locator('#txtPassword').fill('$Admin#135');
  await page.locator('#btnSignIn').click();
  await page.locator('#HomeProduct-CorporateTax').click();
  await page.locator('#SubClient-Search-Box').fill('SYS_FIRM');
  await page.getByText('SYS_FIRM').click();

  await context.storageState({ path: 'state.json' });
 webContext= await browser.newContext({ storageState: 'state.json' });
 await page.close();
  
});

// Sequential test execution - Entity Creation must run before Dataset Creation
test.describe.serial('OCT BVT flow', () => {

test('Entity Creation', async () => {

  let page = await webContext.newPage();
  await page.goto('https://emea1.onesourcetax.com/platform/apps/modern/oct/entitymanager');
  await page.locator('#SubClient-Search-Box').fill('SYS_FIRM');
  await page.getByText('SYS_FIRM').click();
  const frame = await page.frameLocator('iframe[title="Corporate Tax"]');
  
  // Generate unique entity name with timestamp
  const timestamp = Date.now();
  uniqueEntityName = `PWEntity_${timestamp}`;
  uniqueShortName = `PW_${timestamp}`;
  
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

test('Verify Dataset Creation', async () => {

  let page = await webContext.newPage();
  await page.goto('https://emea1.onesourcetax.com/platform/apps/modern/oct/calculations');
  await page.locator('#SubClient-Search-Box').fill('SYS_FIRM');
  await page.getByText('SYS_FIRM').click();
  
  // Use frameLocator for iframe content
  const frame = await page.frameLocator('iframe[title="Corporate Tax"]');
   DatasetName = `PWDataset_${Date.now()}`;
   console.log(DatasetName);
  // Wait for Add button to be visible and click it
  await frame.locator('#addDataSet, button:has-text("Add")').waitFor({ state: 'visible' });
  await frame.locator('#addDataSet, button:has-text("Add")').click();
  await page.waitForTimeout(2000);
  // Simple approach - target first visible input field
  await frame.locator('input').first().waitFor({ state: 'visible' });
  await frame.locator('input').first().fill(DatasetName);
  await frame.getByText('Next').click();
  await page.waitForTimeout(2000);
// wait until all entities load in the list
  await frame.locator("//input[@placeholder='Type to filter the entities']").pressSequentially(uniqueEntityName);
  // Wait for filter to work, then click the checkbox for our specific entity
  await page.waitForTimeout(2000);
  
  // Find checkbox associated with our entity name
  await frame.locator(`text=${uniqueEntityName}`).locator('..').locator('.enitity-checkbox').click();

  await frame.getByText('Next').click();

  await frame.getByText('Finish').click();
  
  // Wait for dataset creation to complete
  await page.waitForTimeout(3000);
  
  // Switch to All Calculations view
  await frame.locator("//i[@class='bento-combobox-dropdown-button-icon bento-icon-caret-down-filled']").click();
  await frame.locator("//div[contains(text(),' All Calculations ')]").first().click();
  
  // Wait for grid to fully load after filter change
  await page.waitForTimeout(2000);
  
  // Find and click the dataset column header button to open filter
  // Try multiple strategies to find the header button
  const headerButton = frame.locator("//div[@class='wj-cell wj-header wj-filter-off']//button//span").first();
  await headerButton.waitFor({ state: 'visible', timeout: 10000 });
  await headerButton.click();
  await page.waitForTimeout(2000);
  // Type dataset name in the filter input
  await frame.locator('.wj-form-control').pressSequentially(DatasetName);
  await frame.getByText('Apply').click();
  await page.waitForTimeout(2000);
  // Verify filtered dataset appears
  const datasetEntry = frame.locator("//div[@id='athena-grid-cell-82-2:1']");
  console.log(datasetEntry);
  console.log(DatasetName);
  await expect(datasetEntry).toHaveText(DatasetName);
  await frame.locator("//button[@ng-reflect-ngb-tooltip='Show/Hide Columns']").click();
  
  await frame.locator("//label[contains(., 'Tax Year')]/bento-checkbox/input[@type='checkbox']").click();
    await frame.locator("//button[@ng-reflect-ngb-tooltip='Show/Hide Columns']").click();
    page.pause();
  // taxYear= await frame.locator("//div[@id='athena-grid-cell-82-2:10']").textContent();
  // console.log(taxYear);
  // await page.close();
});

test('Create COA', async () => {
  let page = await webContext.newPage();
  COAName = `PWCOA_${Date.now()}`;
  await page.goto('https://emea1.onesourcetax.com/platform/apps/modern/oct/Coa');
  await page.locator('#SubClient-Search-Box').fill('SYS_FIRM');
  await page.getByText('SYS_FIRM').click();
  const frame = await page.frameLocator('iframe[title="Corporate Tax"]');//iframe locator for COA page

  await frame.locator("//i[@class='bento-icon-add']").click();// Click Add button to create new COA
  await page.waitForTimeout(2000);
  await frame.locator('.col-sm-6').fill(COAName);
  console.log(COAName);
  const COAyear =await frame.locator('#bui-combobox-0-input').inputValue();
  console.log(COAyear);
  //expect(COAyear).toEqual(taxYear);
  await frame.getByRole('button',{name:' Ok '}).click();
  await frame.locator("//div[@id='athena-grid-cell-[object Object]-0:1']/button/span").click();
  await page.waitForTimeout(2000);
  await frame.locator('.wj-form-control').pressSequentially(COAName);
  await page.waitForTimeout(2000);
  await frame.getByText('Apply').click();
  await page.waitForTimeout(2000);
await frame.locator(`a:has-text("${COAName}")`).click();// Click the created COA to open details page
await page.waitForTimeout(2000);
await frame.locator("//input[@type='file']").setInputFiles("C:/Playwright self/Test Data/BVT_UK_ImportCoA.xlsx");
 await frame.getByText('Save').click();
await page.pause();
})

test('Create new Map', async () => {
  let page = await webContext.newPage();
  MapName = `PWMap_${Date.now()}`;
 let  DatasetName="PWDataset_1771608293307";
 let  COAName="PWCOA_1771608293307";


  await page.goto('https://emea1.onesourcetax.com/platform/apps/modern/oct/mappingOCT');
  await page.locator('#SubClient-Search-Box').fill('SYS_FIRM');
  await page.getByText('SYS_FIRM').click();
  const frame = await page.frameLocator('iframe[title="Corporate Tax"]');//iframe locator for mapping page
 
  await frame.locator("//button[@id='addNewMap']").click();// Click Add button to create new Map
  await frame.locator('#mapping_add_mapName').fill(MapName);
  await page.pause();
  //await frame.locator("//input[@id='bui-combobox-0-input']").pressSequentially(DatasetName);
  await frame.locator("//input[@aria-controls='bui-combobox-0-box']").pressSequentially(DatasetName);
  await page.pause();
  await frame.getByText(DatasetName).click();
  await page.waitForTimeout(2000);
  await frame.locator("//input[@id='bui-combobox-4-input']").pressSequentially(COAName);
  await frame.getByText(COAName).click();
   await page.waitForTimeout(2000);
  await frame.locator("//input[@id='bui-combobox-6-input']").pressSequentially("United Kingdom Corporate Tax");
  await frame.getByText("United Kingdom Corporate Tax 2025 1.121").click();
   await page.waitForTimeout(2000);
  await frame.locator("//input[@id='bui-combobox-8-input']").pressSequentially("  Trial balance");
  await page.pause();
  await frame.locator('div.mb-1', { hasText: "Trial balance" }).click();
  await frame.getByRole('button',{name:'OK'}).click();// Save the new Map 
  await page.pause();
  await frame.locator("//div[@id='athena-grid-cell-44-0:2']//button").click();
  await frame.locator('.wj-form-control').pressSequentially(MapName);
  await page.waitForTimeout(2000);
  await frame.getByText("Apply").click();
  await page.waitForTimeout(2000);
  await frame.locator(`//a[text()="${MapName}"]`).click();// Click the created Map to open details page
  await page.pause();
  await frame.locator("#importFile").setInputFiles("C:/Playwright self/Test Data/BVT_UK_ImportMapping.xlsx");

  await page.pause();
});

test.only('Create Import', async () => {

  let page=await webContext.newPage();
  let ImportName = "PWImport_1771864201058";
  let DatasetName="PWDS_1771864201058";
  let uniqueEntityName="PWEntity_1771864201058";
  
  await page.goto('https://emea1.onesourcetax.com/platform/apps/modern/oct/genericImport');
  await page.locator('#SubClient-Search-Box').fill('SYS_FIRM');
  await page.getByText('SYS_FIRM').click();
  const frame = await page.frameLocator('iframe[title="Corporate Tax"]');
  await frame.getByText("Add").click();
  await page.waitForTimeout(2000);
  await frame.locator("//input[@name='importName']").fill(ImportName);
  await page.keyboard.press('Tab');
 await page.waitForTimeout(2000);
  await frame.locator("#bui-combobox-6-dropdown-aria").pressSequentially(DatasetName);
  await page.waitForTimeout(2000);
  await frame.locator('div.mb-1',{hasText:DatasetName}).click();
  await page.waitForTimeout(2000);
  await page.keyboard.press('Tab');
  await page.keyboard.press('Tab');
  await page.keyboard.press('Tab');
  await page.keyboard.press('Enter');
  await page.waitForTimeout(2000);
  //await frame.locator("//input[@id='bui-combobox-22-input']").pressSequentially("Trial balance");
  await frame.locator('div.mb-1', { hasText: "Trial balance" }).click();
  await page.keyboard.press('Tab');
  await page.keyboard.press('Tab');
  await page.keyboard.press('Tab');
  await page.keyboard.press('Tab');
  await page.pause();
    //await frame.getByRole('label', { name: 'Press enter key to browse file' }).click();
    await frame.locator('input[type="file"]').setInputFiles("C:/Playwright self/Test Data/BVT_UK_ImportTB.xlsx");
  await frame.locator("//input[@name='entity']").check();// Select entity in import setup
  await page.keyboard.press('Tab');
  await frame.locator("//input[@id='bui-combobox-14-input']").pressSequentially(uniqueEntityName);
  await frame.locator('div.mb-1', { hasText: uniqueEntityName }).click();
  await frame.getByText('Next').click();
  await frame.locator("//div[@class='col-md-4']//input[@name='rowAndHeader']").nth(1).check();// Select header row in preview
  await frame.locator('table input[type="checkbox"]').first().check();// Select first data row in preview
  await frame.locator("//label[contains(text(),'In the header row')]/preceding-sibling::input[@type='radio']").check();
  await frame.getByText('Next').click();
  await page.waitForTimeout(2000);
 await frame.locator("//button[@id='importDetails']").click();
  await page.pause();
  });
}); // End of sequential test block

