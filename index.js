require('chromedriver');
var fs = require('fs');
var webdriver = require('selenium-webdriver');
var data;
var driver = new webdriver.Builder().forBrowser('chrome').build(); 

driver.get("https://acgn-stock.com/instantMessage");
driver.sleep(5000)
fs.readFile('./webhooks.js',function(error, content){ //讀取file.txt檔案的內容
    if(error){ //如果有錯誤就列印訊息並離開程式
        console.log('檔案讀取錯誤。');
    }
    else {
	data = content.toString();
	driver.executeScript(data);
    }
});
