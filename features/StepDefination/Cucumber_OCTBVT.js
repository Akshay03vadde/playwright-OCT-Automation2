import { Given, When, Then, After } from '@cucumber/cucumber';
import { POManager } from '../../OCT_PO/POManager.js';
import { expect } from '@playwright/test';
import playwright from 'playwright';
import { environments } from '../../OCT_PO/Env.js';

const testDataForBVT_UK = {
    EntityName: `PWEntity_${Date.now()}`,
    ShortName: `PW_${Date.now()}`,
    Jurisdiction: "United Kingdom",
    DatasetName: `PWDS_${Date.now()}`,
    CalculationName: undefined,
    taxYear: undefined,
    COAName: `PWCOA_${Date.now()}`,
    MapName: `PWMap_${Date.now()}`,
    ImportType: "Trial balance",
    ImportName: `PWImport_${Date.now()}`,
    env: "EMEA"
};


Given('Login to OCT Application in selected Environment',{timeout:100*1000}, async function () {
    this.browser = await playwright.chromium.launch({ 
        headless: true,
       // args: ['--disable-blink-features=AutomationControlled']
    });
    this.context = await this.browser.newContext();
    this.page = await this.context.newPage();
    const testURL = environments[testDataForBVT_UK.env].url;

    this.poManager = new POManager(this.page);
    if (testDataForBVT_UK.env === "EMEA" || testDataForBVT_UK.env === "APAC") {
        await this.page.goto(testURL);
        await this.poManager.loginToApplication("AkshayVadde.fim", "$Admin#136", "SYS_FIRM");
    } else if (testDataForBVT_UK.env === "QA" || testDataForBVT_UK.env === "SAT") {
        await this.page.goto(testURL);
        await this.poManager.loginToLApp("akshay.vadde+test@tr.com", "$Admin#1", "SYS_FIRM");
    }

    this.frame = this.page.frameLocator('iframe[title="Corporate Tax"]');

    await this.page.waitForTimeout(3000);
});



When('Create a new Entity in Entity Manager screen', async function () {
    await this.frame.getByRole('button', { name: 'Configuration' }).click();
    await this.frame.getByText('Entity Manager').click();
    await this.poManager.createEntity(testDataForBVT_UK.EntityName, testDataForBVT_UK.ShortName, testDataForBVT_UK.Jurisdiction);

});


When('Create a new Dataset in CMS screen', {timeout: 120*1000}, async function () {
     await this.frame.getByRole('button', { name: 'Calculations' }).click();
    await this.frame.getByText('Calculations').nth(1).click();
   const result = await this.poManager.createDataset(testDataForBVT_UK.DatasetName, testDataForBVT_UK.EntityName);
   testDataForBVT_UK.taxYear = result.taxYear;
   testDataForBVT_UK.CalculationName = result.CalculationName;
    
});

When('Create a new COA in COA screen', {timeout: 120*1000}, async function () {
    await this.frame.getByRole('button', { name: 'Configuration' }).click();
    await this.frame.getByText('Chart of Accounts').click();
    await this.page.waitForTimeout(2000);
    await this.poManager.createCOA(testDataForBVT_UK.COAName, testDataForBVT_UK.taxYear);
    
});


When('Create a new Map in Mapping screen', {timeout: 120*1000}, async function () {
      await this.frame.getByRole('button', { name: 'Configuration' }).click();
    await this.frame.getByText('Mapping').click();
    await this.poManager.createNewMap1(testDataForBVT_UK.MapName, testDataForBVT_UK.DatasetName, testDataForBVT_UK.COAName, "United Kingdom Corporate Tax 2025 1.121", "Trial balance");
    
    
});



When('Create a new Import in Import Detail screen', {timeout: 120*1000}, async function () {
    await this.frame.getByRole('button', { name: 'Imports' }).click();
    await this.page.waitForTimeout(2000);
    await this.frame.getByText('ImportDetails').click();
    await this.page.waitForTimeout(2000);
    await this.poManager.createNewImport1(testDataForBVT_UK.ImportName, testDataForBVT_UK.DatasetName, testDataForBVT_UK.ImportType, testDataForBVT_UK.EntityName);
    
});


Then('Validate values of Cost of sales and Turnover in above created calculation After Import', {timeout: 120*1000}, async function () {
    await this.frame.getByRole('button', { name: 'Calculations' }).click();
await this.frame.getByRole('link', { name: 'Calculations' }).click();   
await this.page.waitForTimeout(2000);

const expTurnoverValue = "58,032";
const expCostOfSalesValue = "(962,653)";

await this.frame.getByRole('gridcell', { name: testDataForBVT_UK.CalculationName }).click();
await this.page.waitForTimeout(2000);

await this.frame.getByRole('treeitem', { name: 'expand <span class="nav-ref "></span><span class="nav-description">Comprehensive income analysis</span> Comprehensive income analysis', exact: true }).getByLabel('expand').click();
await this.page.waitForTimeout(2000);
await this.frame.getByText('Income statement', { exact: true }).click();

const Turnover= await this.frame.locator('[id="athena-worksheet-Cell-6:2"] > div:nth-child(3)').innerText();
console.log("Turnover value in Calculation after import:" +Turnover);
expect(normalizeUiText(Turnover)).toBe(expTurnoverValue);

const costOfSales=await this.frame.locator("//div[@id='athena-worksheet-Cell-7:2']/div/span").innerText();
console.log("Cost of Sales value in Calculation after import:" +costOfSales);
expect(normalizeUiText(costOfSales)).toBe(expCostOfSalesValue);
   
});

After(async function () {
    if (this.browser) {
        await this.browser.close();
    }
});