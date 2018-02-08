// ==UserScript==

// @name         ACGN股票系統訊息傳送BOT

// @namespace    http://tampermonkey.net/

// @version      87.8787878787

// @description  message transmission

// @author       papago89

// @maintain     euphokumiko

// @match        http://acgn-stock.com/instantMessage

// @match        https://acgn-stock.com/instantMessage

// @grant        mumimumi!!

// ==/UserScript==

var logDatas, logDataCount, i, message, count, date, nowTime, styleBtn = new Array(), releaseStockMessages = new Array(), pushFlag = false, def;



var releaseStocksForHighPriceBegin, releaseStocksForNoDealBegin, recordListPriceBegin, releaseStocksForHighPriceEnd, releaseStocksForNoDealEnd, recordListPriceEnd;

var priceRegex = /公司以\$([0-9]{1,3}(,[0-9]{3,3})*)的價格/;

var discordHallHighPriceBotUrl = 'https://discordapp.com/api/webhooks/411022039613308929/n5pPWonlAmC57PC12kIqETBnIzGoIlL0xSuvV9vBRBKsTbXuK0cype6bC77RzY2eGESE';

var discordHallNoDealBotUrl = 'https://discordapp.com/api/webhooks/411022039613308929/n5pPWonlAmC57PC12kIqETBnIzGoIlL0xSuvV9vBRBKsTbXuK0cype6bC77RzY2eGESE';

var discordPriceListBotUrl = 'https://discordapp.com/api/webhooks/411022039613308929/n5pPWonlAmC57PC12kIqETBnIzGoIlL0xSuvV9vBRBKsTbXuK0cype6bC77RzY2eGESE';

var discordCompanyFoundedBotUrl = 'https://discordapp.com/api/webhooks/411022039613308929/n5pPWonlAmC57PC12kIqETBnIzGoIlL0xSuvV9vBRBKsTbXuK0cype6bC77RzY2eGESE';

var recieveInstantMessageBotUrl = 'https://discordapp.com/api/webhooks/411022761197043713/jTz12-lLjXaLSEuX4cMNhWhaHOEqFAksXA6_B7ykxVqHWmUscr6eJNnwLGJ_C_LjwliF';



//getMinutes() getHours()

function sleep(milliseconds) 

{

  var start = new Date().getTime();

  for (var i = 0; i < 1e7; i++) 

  {

    if ((new Date().getTime() - start) > milliseconds)

	{

      break;

    }

  }

}



function pushMessageToDiscord(jsonString, targetUrl)

{

	var request = new XMLHttpRequest(); // xhr() 會建立非同步物件

	request.open('POST', targetUrl, false); // 同步連線 POST到該連線位址

	request.setRequestHeader('Content-Type', 'application/json');

    console.log(jsonString);

	request.send(jsonString);

}



function getTimeString(date)

{

    // getMonth()	Returns the month (from 0-11) ....為了正常顯示1~12月 手動+1

    return ('0' + (date.getMonth() + 1)).slice(-2) + '/' + ('0' + date.getDate()).slice(-2) + ' ' + ('0' + date.getHours()).slice(-2) + ':' + ('0' + date.getMinutes()).slice(-2);

}



function checkSystemInfo()

{

    var i, highestPrice, lowestPrice, messagePrice, obj, timeA, timeB, message, botUrl;

    message = '<:stone:362522869022064641>下次';



    if(releaseStocksForNoDealBegin != Meteor.connection._mongo_livedata_collections.variables.findOne('releaseStocksForNoDealBegin').value)

	{ // 符合低量釋股特徵

        releaseStocksForNoDealBegin = Meteor.connection._mongo_livedata_collections.variables.findOne('releaseStocksForNoDealBegin').value;

        releaseStocksForNoDealEnd = Meteor.connection._mongo_livedata_collections.variables.findOne('releaseStocksForNoDealEnd').value;

        message += '低量釋股';

        message = '%%saveC \n' + message;

        timeA = new Date(releaseStocksForNoDealBegin);

        timeB = new Date(releaseStocksForNoDealEnd);

		botUrl = discordHallNoDealBotUrl;

    }

    else if(releaseStocksForHighPriceBegin != Meteor.connection._mongo_livedata_collections.variables.findOne('releaseStocksForHighPriceBegin').value)

	{ // 符合高價釋股特徵

        releaseStocksForHighPriceBegin = Meteor.connection._mongo_livedata_collections.variables.findOne('releaseStocksForHighPriceBegin').value;

        releaseStocksForHighPriceEnd = Meteor.connection._mongo_livedata_collections.variables.findOne('releaseStocksForHighPriceEnd').value;

        message += '高價釋股';

        message = '%%saveA \n' + message;

        timeA = new Date(releaseStocksForHighPriceBegin);

        timeB = new Date(releaseStocksForHighPriceEnd);

		botUrl = discordHallHighPriceBotUrl;


    }

	else if(recordListPriceBegin != Meteor.connection._mongo_livedata_collections.variables.findOne('recordListPriceBegin').value)
		
	{ // 符合價更特徵

        recordListPriceBegin = Meteor.connection._mongo_livedata_collections.variables.findOne('recordListPriceBegin').value;

        recordListPriceEnd = Meteor.connection._mongo_livedata_collections.variables.findOne('recordListPriceEnd').value;

        message += '股價更新';

        message = '%%saveD \n' + message;

        timeA = new Date(recordListPriceBegin);

        timeB = new Date(recordListPriceEnd);

		botUrl = discordPriceListBotUrl;


    }
    message += getTimeString(timeA) + ' ~ ' + getTimeString(timeB) + '  (UTC+8)<:stone:362522869022064641>\n';

	obj = 

	{

        content : message

    };

    releaseStockMessages = [];

    pushFlag = false;

    //pushInformationToDiscord(JSON.stringify(obj));

	pushMessageToDiscord(JSON.stringify(obj), botUrl);

}



function isComplete(object){

    var i;

    for(i = 0; i < object.getElementsByTagName('span').length; ++i)

        if(object.getElementsByTagName('span')[i].innerText.length ===0)

            return false;

    return true;

}



function appendMessage(object){

    // 只有訊息中帶著 說道 釋股 創立(創立得股例外)

	if(object !== null && (object.innerText.indexOf('說道') != -1 || object.innerText.indexOf('釋股') != -1 || (object.innerText.indexOf('創立') != -1 && object.innerText.indexOf('創立得股') == -1))){ // 過濾訊息 & 避免創立得股消息被發出

		if(object.getElementsByTagName('span') === null) // 確認是否有元素存在避免錯誤

			return false;

        if(!isComplete(object)) // 確定資訊完整渲染

            return false;

        if(message.length !== 0)

            message += '\n';

        if(object.innerText.indexOf('【公司釋股】') != -1)

            message += '`';

        if(object.innerText.indexOf('創立成功') != -1)

		{

			var obj = 

			{

				content : object.innerText.match(/.+(【創立成功】 ).+等人投資的(.+)/)[1] + object.innerText.match(/(.+【創立成功】 ).+等人投資的(.+)/)[2]

			};

			pushMessageToDiscord(JSON.stringify(obj), discordCompanyFoundedBotUrl);

		}

		message += object.innerText;

        if(object.innerText.indexOf('【公司釋股】') != -1)

            message += '`';

		++count;

		if(count >= 5)

		{ //避免一段時間未開即時訊息 產生過多未讀訊息串接長度過長

			var obj = 

			{

				content : message

			};

			count = 0;

			message = '';

			logDataCount = logDatas.length - (i + 1); // 記錄已正確push完成之數量

			// pushDataToDiscord(message);

			pushMessageToDiscord(JSON.stringify(obj), recieveInstantMessageBotUrl);

		}

	}

	return true;

}



// 檢查是否有新訊息

function checkData()

{

	message = '';

	logDatas = document.getElementsByClassName('logData');

    if((logDatas.length - parseInt(logDataCount) - 1) < -1)

        logDataCount = i = count = 0;

	//if(logDataCount + 0 < logDatas.length){ // 檢查是否有新的logData 必須有5條以上新的logData才開始Push 降低Ajax渲染尚未完成即開始PUSH而導致訊息缺漏的機率

	for(i = logDatas.length - parseInt(logDataCount) - 1; i >= 0; --i) // 減1指向正確地尚未push之訊息位址

		if(!appendMessage(logDatas[i])) // 若串接失敗(元素渲染不完整)則先不繼續串接 待下次檢查時再重新嘗試串接

			break;

	if(count !== 0)

	{ //訊息存在

		//pushDataToDiscord(message);//push訊息

		var obj = 

		{

			content : message

		};

		count = 0;

		message = '';

		logDataCount = logDatas.length - (i + 1); // 記錄已正確push完成之數量

		pushMessageToDiscord(JSON.stringify(obj), recieveInstantMessageBotUrl);

	}

}



function searchStyleButton()

{

    var i;

    for(i = 0; i < $('.nav-link').length; ++i)

        if($('.nav-link')[i].innerText.search("亮色") != -1)

		{

            styleBtn[0] = $('.nav-link')[i];

            styleBtn[1] = $('.nav-link')[i + 1];

            break;

        }

}



function refresh()

{

	styleBtn[0].click(); // 亮色按鈕

	sleep(200);

	styleBtn[1].click(); // 暗色按鈕

}



function cleanMessage()

{

    checkData();

	$('.btn.btn-sm.btn-danger')[0].click(); // 點擊 清除舊訊息的按鈕

}



(function(){

    'use strict';

	logDatas = document.getElementsByClassName('logData');

	logDataCount = logDatas.length;

	nowTime = Number(Date.now());

    console.log('start');

    setTimeout(searchStyleButton, 1000); // 尋找主題配置 亮色暗色的按鈕到底是哪 並註冊為變數記錄下來(因為我的最愛數量不定 導致按鈕位置也不一定)

	setInterval(checkData, 10000); // 每十秒檢查一下是否有新的訊息

	setInterval(checkSystemInfo, 30000); // 每十秒檢查一下是否有系統資訊更新

	setInterval(refresh, 210000); // 快速案主題配置 亮色暗色各一下 避免系統自動關閉與你的連線(五分鐘IDLE)

	setInterval(cleanMessage, 1800000); // 半小時清空一次

    setTimeout(function(){

        releaseStocksForHighPriceBegin = Meteor.connection._mongo_livedata_collections.variables.findOne('releaseStocksForHighPriceBegin').value;

        releaseStocksForNoDealBegin = Meteor.connection._mongo_livedata_collections.variables.findOne('releaseStocksForNoDealBegin').value;

        recordListPriceBegin = Meteor.connection._mongo_livedata_collections.variables.findOne('recordListPriceBegin').value;

        releaseStocksForHighPriceEnd = Meteor.connection._mongo_livedata_collections.variables.findOne('releaseStocksForHighPriceEnd').value;

        releaseStocksForNoDealEnd = Meteor.connection._mongo_livedata_collections.variables.findOne('releaseStocksForNoDealEnd').value;

        recordListPriceEnd = Meteor.connection._mongo_livedata_collections.variables.findOne('recordListPriceEnd').value;

    }, 5000);



})();
