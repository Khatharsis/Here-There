var APP = {
    // LA
    ht_hereLoc: 'LA',
    ht_hereWeatherCode: 2442047,
    ht_hereTimeOffset: -8,
    // BKK
    ht_thereLoc: 'BKK',
    ht_thereWeatherCode: 1225448,
    ht_thereTimeOffset: 7,

    ht_countdownDate: "05/10/2013",

    ht_appObj: {}
};

// Initialization function - sync globals with localStorage if applicable
function init() {
    // Event handlers
    $('#settingsSubmitButton').on('click', processSettingsForm);
    
    // Set up global vars
    // here/thereWeatherCode: must have a value
    // countdownDate: can be an empty string
    if (localStorage.ht_hereLoc) {
        APP.ht_hereLoc = localStorage.ht_hereLoc;
    }
    if (localStorage.ht_hereWeatherCode) {
        APP.ht_hereWeatherCode = localStorage.ht_hereWeatherCode;
    }
    if (localStorage.ht_hereTimeOffset) {
        APP.ht_hereTimeOffset = localStorage.ht_hereTimeOffset;
    }
    else if (localStorage.ht_hereTimeOffset && 
        localStorage.ht_hereTimeOffset == 0) {
        APP.ht_hereTimeOffset = localStorage.ht_hereTimeOffset;
    }

    if (localStorage.ht_thereLoc) {
        APP.ht_thereLoc = localStorage.ht_thereLoc;
    }
    if (localStorage.ht_thereWeatherCode) {
        APP.ht_thereWeatherCode = localStorage.ht_thereWeatherCode;
    }
    if (localStorage.ht_thereTimeOffset) {
        APP.ht_thereTimeOffset = localStorage.ht_thereTimeOffset;
    }
    else if (localStorage.ht_thereTimeOffset &&
        localStorage.ht_thereTimeOffset == 0) {
        APP.ht_thereTimeOffset = localStorage.ht_thereTimeOffset;
    }

    if (localStorage.ht_countdownDate != null &&
        localStorage.ht_countdownDate != undefined) {
        APP.ht_countdownDate = localStorage.ht_countdownDate;
    }

    // Prepopulate the Settings form
    $('input#hereLoc').val(APP.ht_hereLoc);
    $('input#hereWeather').val(APP.ht_hereWeatherCode);
    $('input#hereTimeOffset').val(APP.ht_hereTimeOffset);
    $('input#thereLoc').val(APP.ht_thereLoc);
    $('input#thereWeather').val(APP.ht_thereWeatherCode);
    $('input#thereTimeOffset').val(APP.ht_thereTimeOffset);
    $('input#countdownDate').val(APP.ht_countdownDate);
}

// Set up the Canvas
function arrangeCanvas() {
    // Separate canvases to reduce amount of drawing
    // Background image canvas 
    var canvas = $('#app')[0],
        ctx = null,
        backgroundImage = new Image();

    // Text canvas 
    var canvasText = $('#app-text')[0],
        ctx2 = null;
	
    // Using jQuery with Canvas isn't too straightfoward...
	// http://stackoverflow.com/questions/3305167/simple-html5-canvas-and-jquery-question
	if (canvas.getContext) {
		ctx = canvas.getContext('2d');
        ctx2 = canvasText.getContext('2d');

        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx2.clearRect(0, 0, canvasText.width, canvasText.height);
	    
        imgpreload(["images/tempWallpaper.jpg", "images/tempWallpaper2.jpg"],
        function(images) {
            // Hide spinner
            $('#loader').css("display", "none");

            // Loading
            ctx.drawImage(images[0], 0, 0);
            printLoadingMessage(ctx2);

            // Retrieve time/weather values and display the actual app
            displayApp(canvas, ctx, canvasText, ctx2, images);
        });
	}
}

// The brains of the app - set up/clear intervals, grab data, display and
// update the necessary images and text
function displayApp(canvas, ctx, canvasText, ctx2, images) {
    var weatherObj = {},
        timeObj = {};

    var flags = {};
    flags.updateWallpaper = false;

    var intervalClock = 0,
        intervalCheck = 0,
        clock1 = new Date().getTime(),
        clock2 = new Date().getTime();

    var dst = true,
        hereOffset = (dst) ? APP.ht_hereTimeOffset+1 : APP.ht_hereTimeOffset,
        thereOffset = APP.ht_thereTimeOffset;

    // Only when the weather and time objects have been set can we continue
    $.when(getWeather(weatherObj), getTime(timeObj))
    .done(function() {
        drawWallpaper(ctx, canvas, images, timeObj);
        printObjects(ctx2, canvasText, weatherObj, timeObj);
        arrangeUICanvas(isDay(timeObj, true));
        registerUICanvasEventHandler();

        // Refresh text canvas every second
        APP.ht_appObj.intervalClock = setInterval(function() {
            updateTimeObj(timeObj, false, null, flags);
            printObjects(ctx2, canvasText, weatherObj, timeObj);
            if (flags.updateWallpaper) {
                drawWallpaper(ctx, canvas, images, timeObj);
                flags.updateWallpaper = false;
                arrangeUICanvas(isDay(timeObj, true));
            }
        }, 1000);
        // Compare clock since last update,
        // force an update if >30s have passed without an update
        APP.ht_appObj.intervalCheck = setInterval(function() {
            clock1 += 30000
            clock2 = new Date().getTime();
            if ((clock2 - clock1) > 30000) {
                updateTimeObj(timeObj, true,
                createUpdatedTimeObj(clock2, hereOffset, thereOffset));
                drawWallpaper(ctx, canvas, images, timeObj);
                arrangeUICanvas(isDay(timeObj, true));
            }
            clock1 = new Date().getTime();
        }, 30000);
    });
}

// Query Yahoo! Weather
// Guide: http://weblogs.asp.net/sreejukg/archive/2012/04/17/
// 			display-weather-information-in-your-site-using-jquery-using-yahoo-services.aspx
// In-browser YQL console: http://developer.yahoo.com/yql/console/
function getWeather(obj) {
    var deferred = $.Deferred();
	// LA: 2442047
	// BKK: 1225448
	var query = "http://query.yahooapis.com/v1/public/yql?q=select * from " +
        "weather.forecast where woeid in (" + APP.ht_thereWeatherCode +
        ", " + APP.ht_hereWeatherCode +
        ")&format=json&callback=?";
	$.getJSON(query, function (data) {
		obj.there_temp = data.query.results.channel[0].item.condition.temp;
		obj.here_temp = data.query.results.channel[1].item.condition.temp;

        deferred.resolve();
	});
    return deferred.promise();
}

// Call custom PHP script to obtain time values
function getTime(obj) {
    var deferred = $.Deferred();

    var query = "dateTimeJsonFormatter.php",
        args = "?here=" + APP.ht_hereTimeOffset +
                "&there=" + APP.ht_thereTimeOffset +
                "&date=" + APP.ht_countdownDate;
    $.getJSON(query+args, function (data) {
        obj.here = data.currentTime.here;
        obj.here_h = parseInt(data.currentTime.here_h, 10);
        obj.here_m = parseInt(data.currentTime.here_m, 10);
        obj.there = data.currentTime.there;
        obj.there_h = parseInt(data.currentTime.there_h, 10);
        obj.there_m = parseInt(data.currentTime.there_m, 10);
        obj.days_left = data.daysLeft.remaining;
        
        var date = new Date();
        var sec = date.getSeconds();
        obj.here_s = sec;
        obj.there_s = sec;

        deferred.resolve();
    });
    return deferred.promise();
}

// Create a new time object using local time.
// time should be the result from JS Date.getTime() which is in ms
function createUpdatedTimeObj(time, hereOffset, thereOffset) {
    var newTimeObj = {};
    var timeSec = Math.floor(time/1000);
    
    // 60 seconds in a minute
    // 3600 = 60*60 seconds in an hour
    // 86400 = 60*60*24 seconds in a day
    newTimeObj.gmt_h = Math.floor((timeSec % 86400) / 3600);
    newTimeObj.gmt_m = Math.floor((timeSec % 3600) / 60);
    newTimeObj.gmt_s = Math.floor(timeSec % 60);

    newTimeObj.here_h = calculateHourOffset(newTimeObj.gmt_h, hereOffset);
    newTimeObj.here_m = newTimeObj.gmt_m;
    newTimeObj.here_s = newTimeObj.gmt_s;

    newTimeObj.there_h = calculateHourOffset(newTimeObj.gmt_h, thereOffset);
    newTimeObj.there_m = newTimeObj.gmt_m;
    newTimeObj.there_s = newTimeObj.gmt_s;

    return newTimeObj;
}

// hour is given in GMT time 
// offset should be negative if applicable
function calculateHourOffset(hour, offset) {
    var tmpHr = hour + offset;
    if (tmpHr >= 24) {
        tmpHr -= 24;
    }
    else if (tmpHr < 0) {
        tmpHr += 24;
    }
    return tmpHr;
}

// Draw wallpaper according to here/there time
function drawWallpaper(ctx, canvas, images, timeObj) {
    var halfWidth = canvas.width/2,
        height = canvas.height;

    ctx.clearRect(0, 0, canvas.width, canvas,height);
    // There half:
    if (isDay(timeObj, false)) {
        ctx.drawImage(images[1], 0, 0, halfWidth, height, 0, 0, halfWidth, height);
    }
    else {
        ctx.drawImage(images[0], 0, 0, halfWidth, height, 0, 0, halfWidth, height);
    }

    // Here half:
    if (isDay(timeObj, true)) {
        ctx.drawImage(images[1], halfWidth, 0, halfWidth, height,
        halfWidth, 0, halfWidth, height);
    }
    else {
        ctx.drawImage(images[0], halfWidth, 0, halfWidth, height,
        halfWidth, 0, halfWidth, height);
    }
}


// Print loading message
function printLoadingMessage(ctx, canvas) {
    ctx.font = "100px Arial";
    ctx.fillStyle = "rgba(137, 215, 255, 0.5)";
    ctx.fillText("Loading...", 100, 350);
}

// Print all of the objects and their data to the canvas
function printObjects(ctx, canvas, weatherObj, timeObj) {
    var degSign = 0xB0,
        fillStyleHere = "#89d7ff",
        fillStyleThere = "#89d7ff";

    if (isDay(timeObj, true)) {
        fillStyleHere = "#0D0F36";
    }
    if (isDay(timeObj, false)) {
        fillStyleThere = "#0D0F36";
    }

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    // Time remaining until next meet
    ctx.font = "100px Arial";
    ctx.fillStyle = "rgba(137, 215, 255, 0.2)";
    ctx.fillText(timeObj.days_left, 175, 250);

	ctx.font="40px Arial";
	
    // There block
	ctx.fillStyle = fillStyleThere;
	ctx.fillText(APP.ht_thereLoc, 50, 350);
    ctx.fillText(timeFormatter(timeObj, false), 50, 390);
	ctx.fillText(weatherObj.there_temp+String.fromCharCode(degSign)+"F", 50,
    430);
    
	// Here block
    ctx.fillStyle = fillStyleHere;
	ctx.fillText(APP.ht_hereLoc, 450, 350);
    ctx.fillText(timeFormatter(timeObj, true), 450, 390);
	ctx.fillText(weatherObj.here_temp+String.fromCharCode(degSign)+"F", 450,
    430);
}

// Add leading 0's to hour, minute, seconds
function intToDoubleDigit(i) {
    var s = '';
    if (i < 10) {
        s += '0' + i;
    }
    else {
        s += i;
    }
    return s;
}

// Format the time
function timeFormatter(timeObj, here) {
    var h, m, s;
    if (here) {
        h = intToDoubleDigit(timeObj.here_h);
        m = intToDoubleDigit(timeObj.here_m);
        s = intToDoubleDigit(timeObj.here_s);
 
    }
    else {
        h = intToDoubleDigit(timeObj.there_h);
        m = intToDoubleDigit(timeObj.there_m);
        s = intToDoubleDigit(timeObj.there_s);
    }

    return (h + ':' + m + ':' + s);
}

// Increase the time by one second or manually set the active
// timeObj to a new time (e.g., sync)
function updateTimeObj(timeObj, reset, newTimeObj, flags) {
    // Manual reset of timeObj
    if (reset) {
        timeObj.here_h = newTimeObj.here_h;
        timeObj.here_m = newTimeObj.here_m;
        timeObj.here_s = newTimeObj.here_s;
        timeObj.there_h = newTimeObj.there_h;
        timeObj.there_m = newTimeObj.there_m;
        timeObj.there_s = newTimeObj.there_s;
    }
    // Increment by 1 second
    else {
        var hrHere = timeObj.here_h;
        var hrThere = timeObj.there_h;
        var min = timeObj.here_m;
        var sec = timeObj.here_s;
        sec++;
        
        if (sec >= 60) {
            sec = 0;
            min++;

            if (min >= 60) {
                min = 0;

                hrHere = (++hrHere >= 24) ? 0 : hrHere;
                hrThere = (++hrThere >= 24) ? 0 : hrThere;

                flags.updateWallpaper = true;
            }
        }
        timeObj.here_h = hrHere;
        timeObj.here_m = min;
        timeObj.here_s = sec;

        timeObj.there_h = hrThere;
        timeObj.there_m = min;
        timeObj.there_s = sec;
    }

   return timeObj;
}

// Determine if day or night,
// here parameter is a boolean
function isDay(timeObj, here) {
    if (here) {
        return (timeObj.here_h >= 6 && timeObj.here_h < 20);
    }
    else {
        return (timeObj.there_h >= 6 && timeObj.there_h < 20);
    }
}

// Force refresh - hit refresh button or submit Settings form
function forceRefresh() {
    clearInterval(APP.ht_appObj.intervalClock);
    clearInterval(APP.ht_appObj.intervalCheck);
    arrangeCanvas();
}

// Settings form processing
function processSettingsForm() {
    var hereLoc = $('input[id=hereLoc]').val(),
        hereWeather = $('input[id=hereWeather]').val(),
        hereTimeOffset = $('input[id=hereTimeOffset]').val(),
        thereLoc = $('input[id=thereLoc]').val(),
        thereWeather = $('input[id=thereWeather]').val(),
        thereTimeOffset = $('input[id=thereTimeOffset]').val(),
        countdownDate = $('input[id=countdownDate]').val();

    // Simple validation
    // countdownDate regex: http://www.mkyong.com/regular-expressions/how-to-validate-date-with-regular-expression/ 
    var dateRegex =
        /(0?[1-9]|1[012])\/(0?[1-9]|[12][0-9]|3[01])\/((20)[1-9]\d)/;

    // Update localStorage values if necessary
    if (hereLoc) {
        APP.ht_hereLoc = hereLoc;
        localStorage.ht_hereLoc = hereLoc;
    }
    if (hereWeather) {
        APP.ht_hereWeatherCode = hereWeather;
        localStorage.ht_hereWeatherCode = hereWeather;
    }
    if (hereTimeOffset >= -12 && hereTimeOffset <= 14) {
        APP.ht_hereTimeOffset = hereTimeOffset;
        localStorage.ht_hereTimeOffset = hereTimeOffset;
    }

    if (thereLoc) {
        APP.ht_thereWeatherCode = thereWeather;
        localStorage.ht_thereWeatherCode = thereWeather;
    }
    if (thereWeather) {
        APP.ht_thereWeatherCode = thereWeather;
        localStorage.ht_thereWeatherCode = thereWeather;
    }
    if (thereTimeOffset >= -12 && thereTimeOffset <= 14) {
        APP.ht_thereTimeOffset = thereTimeOffset;
        localStorage.ht_thereTimeOffset = thereTimeOffset;
    }

    if (dateRegex.test(countdownDate) || dateRegex == "") {
        APP.countdownDate = countdownDate;
        localStorage.ht_countdownDate = countdownDate;
    }

    $('#app-overlay').hide();
    $('#settings').hide();
    forceRefresh();
}
