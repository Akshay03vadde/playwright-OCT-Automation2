class Prod_Login{
    constructor(page){
   this.page=page;     
   this.username=page.locator('#txtLogin')
   this.password=page.locator('#txtPassword')
   this.signInButton=page.locator('#btnSignIn')
   this.corporateTaxTile=page.locator('#HomeProduct-CorporateTax')
   this.subClientSearchBox=page.locator('#SubClient-Search-Box')
   
}

async loginToApplication(username,password,clientName){
    await this.username.fill(username);
    await this.password.fill(password);
    await this.signInButton.click();
    await this.corporateTaxTile.click();
    await this.subClientSearchBox.fill(clientName);
    await this.page.getByText(clientName).click();
}
}

export { Prod_Login };