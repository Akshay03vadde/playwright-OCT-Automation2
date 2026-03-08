import { test, expect } from "@playwright/test";
import { environments } from "../OCT_PO/Env";
import { POManager } from "../OCT_PO/POManager.js";

let webContext;
let uniqueEntityName;
let uniqueShortName;
let Jurisdiction;
let DatasetName;
let taxYear;
let COAName;
let MapName;
let ImportName;
const env = "SAT";
const testURL = environments[env].url;

test.beforeAll("Login Test", async ({ browser }) => {
  const context = await browser.newContext();
  const page = await context.newPage();

  if (env === "EMEA" || env === "APAC") {
    await page.goto(testURL);
    const login = new POManager(page);
    await login.loginToApplication("AkshayVadde.fim", "$Admin#135", "SYS_FIRM");
  } else if (env === "QA" || env === "SAT") {
    await page.goto(testURL);
     const login = new POManager(page);
    await login.loginToLApp(
      "akshay.vadde+test@tr.com",
      "$Admin#1",
      "SYS_FIRM",
    );
  }

  await context.storageState({ path: "state.json" });
  webContext = await browser.newContext({ storageState: "state.json" });
  await page.close();
});

// Sequential test execution - Entity Creation must run before Dataset Creation
test.describe.serial("OCT BVT flow", () => {
  test("Entity Creation", async () => {
    let page = await webContext.newPage();
    await page.goto(`${testURL}/platform/apps/modern/oct/entitymanager`);
    await page.locator("#SubClient-Search-Box").fill("SYS_FIRM");
    await page.getByText("SYS_FIRM").click();
    // Generate unique entity name with timestamp
    
    uniqueEntityName = `PWEntity_${Date.now()}`;
    uniqueShortName = `PW_${Date.now()}`;
    Jurisdiction = "United Kingdom";
    const createEntity = new POManager(page);
    await createEntity.createEntity(
      uniqueEntityName,
      uniqueShortName,
      Jurisdiction,
    );
  });

  test("Verify Dataset Creation", async () => {
    let page = await webContext.newPage();
    DatasetName = `PWDataset_${Date.now()}`;
    await page.goto(`${testURL}/platform/apps/modern/oct/calculations`);
    await page.locator("#SubClient-Search-Box").fill("SYS_FIRM");
    await page.getByText("SYS_FIRM").click();

    const createDS = new POManager(page);
    taxYear=await createDS.createDataset(DatasetName, uniqueEntityName);
    
  });

  test("Create COA", async () => {
    let page = await webContext.newPage();
    COAName = `PWCOA_${Date.now()}`;
    await page.goto(`${testURL}/platform/apps/modern/oct/Coa`);
    await page.locator("#SubClient-Search-Box").fill("SYS_FIRM");
    await page.getByText("SYS_FIRM").click();

    const coaCreation = new POManager(page);
    await coaCreation.createCOA(COAName, taxYear);
  });

  test("Create new Map", async () => {
    let page = await webContext.newPage();
    MapName = `PWMap_${Date.now()}`;
    await page.goto(`${testURL}/platform/apps/modern/oct/mappingOCT`);
    await page.locator("#SubClient-Search-Box").fill("SYS_FIRM");
    await page.getByText("SYS_FIRM").click();

   const createMap = new POManager(page);
   await createMap.createNewMap(MapName, DatasetName, COAName, "United Kingdom Corporate Tax 2025 1.121", "Trial balance");
   
  });

  test.only("Create Import", async () => {
    let page = await webContext.newPage();
    ImportName = `PWImport_${Date.now()}`;
    DatasetName=


    await page.goto(`${testURL}/platform/apps/modern/oct/genericImport`);
    await page.locator("#SubClient-Search-Box").fill("SYS_FIRM");
    await page.getByText("SYS_FIRM").click();
    const frame = await page.frameLocator('iframe[title="Corporate Tax"]');
    const createImport = new POManager(page);
    await createImport.createNewImport(ImportName, DatasetName, "Trial balance", uniqueEntityName);
    
    
  });
}); // End of sequential test block
