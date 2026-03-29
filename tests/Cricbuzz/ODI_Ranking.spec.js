import { test, expect } from '@playwright/test';


async function getProductPrice(page, productName) {
    const allProducts = page.locator('//tbody/tr');
    const count = await allProducts.count();
    for (let i = 0; i < count; i++) {
        const name = (await allProducts.nth(i).locator('td').nth(0).textContent()).trim();
        if (name.toLowerCase() === productName.toLowerCase()) {
            const price = (await allProducts.nth(i).locator('td').nth(1).textContent()).trim();
            return price;
        }
    }
    return null; // product not found on this page
}

test('Get price of a product by name', async ({ page }) => {
    await page.goto("https://rahulshettyacademy.com/seleniumPractise/#/offers");

    const searchProduct = 'Wheat';
    const price = await getProductPrice(page, searchProduct);

    if (price) {
        console.log(`Price of ${searchProduct}: ${price}`);
    } else {
        console.log(`${searchProduct} not found on the current page`);
    }
    expect(price).not.toBeNull();
});




