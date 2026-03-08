import { test as base } from '@playwright/test';

export const testDataForBVT_UK = base.extend({
    testDataForBVT_UK: async ({}, use) => {
        await use({
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
            env: "SAT"
        });
    }
});
