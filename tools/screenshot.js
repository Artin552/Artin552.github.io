const puppeteer = require('puppeteer');
const fs = require('fs');
(async ()=>{
  const url = process.env.URL || 'http://127.0.0.1:4000';
  const browser = await puppeteer.launch({args: ['--no-sandbox','--disable-setuid-sandbox']});
  try{
    // Desktop
    const page = await browser.newPage();
    await page.setViewport({width:1024, height:768});
    await page.goto(url, {waitUntil:'networkidle2'});
    await page.screenshot({path:'screenshot-desktop.png', fullPage:true});
    console.log('desktop saved');

    // Mobile
    const page2 = await browser.newPage();
    await page2.setViewport({width:375, height:812, isMobile:true});
    await page2.goto(url, {waitUntil:'networkidle2'});
    await page2.screenshot({path:'screenshot-mobile.png', fullPage:true});
    console.log('mobile saved');
  }catch(e){
    console.error(e);
    process.exit(1);
  }finally{
    await browser.close();
  }
})();