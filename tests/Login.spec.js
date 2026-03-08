import { test, expect } from '@playwright/test';
let webContext;



test.beforeAll('Login Test', async ({ browser }) => {
  const context = await browser.newContext();
  const page = await context.newPage();
  // Navigate to the login page
  await page.goto('https://sat.onesourcetax.com/');
  await page.locator('#lnkBtnToCiamUl').click();
  // Add a simple assertion to verify the page loaded

  await page.locator('#username').fill('akshay.vadde+test@tr.com');
  await page.getByRole('button', { name: 'Sign in' }) .click();
  await page.locator('#password').fill('$Admin#1');
  await page.getByRole('button', { name: 'Sign in' }) .click();
  await page.locator('#HomeProduct-CorporateTax').click();
  await page.getByText('SYS_FIRM').click();

  await context.storageState({ path: 'state.json' });
 webContext= await browser.newContext({ storageState: 'state.json' });
 await page.close();
  
});


test('Entity Creation', async () => {

  let page = await webContext.newPage();
  await page.goto('https://sat.onesourcetax.com/platform/apps/modern/oct/entitymanager');
  await page.getByText('SYS_FIRM').click();
  const frame = await page.frameLocator('iframe[title="Corporate Tax"]');
  
  // Generate unique entity name with timestamp
  const timestamp = Date.now();
  const uniqueEntityName = `PWEntity_${timestamp}`;
  const uniqueShortName = `PW_${timestamp}`;
  
  await frame.locator('[id="athena-grid-cell-1-1:0"]').click();// Entity Name cell
  await page.keyboard.type(uniqueEntityName);// Type the unique entity name
  await page.keyboard.press('Tab');// Confirm with Tab key


   await frame.locator('[id="athena-grid-cell-1-1:1"]').click(); // Short Name cell 
  await page.keyboard.type(uniqueShortName);// Type the unique short name
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



  await frame.getByText('Name', { exact: true }).click();// Click Name header to sort
  
 
  await page.pause();

});

