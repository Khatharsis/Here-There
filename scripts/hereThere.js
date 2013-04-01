// Set up the Canvas
function arrangeCanvas() {
    var weatherObj = {},
        timeObj = {};

    var intervalClock = 0,
        intervalCheck = 0,
        clock1 = new Date().getTime(),
        clock2 = new Date().getTime();

    var dst = true,
        hereOffset = (dst) ? -7 : -8,
        thereOffset = 7;

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
	    
        imgpreload(["images/tempWallpaper.jpg", "images/tempWallpaper2.jpg"],
        function(images) {
            ctx.drawImage(images[0], 0, 0);
            //ctx.drawImage(backgroundImage, 321, 0, 321, 1136, 321, 0, 321, 1136);
            printLoadingMessage(ctx2);

            // After fetching data
            $.when(getWeather(weatherObj), getTime(timeObj))
            .done(function() {
                ctx.clearRect(0, 0, canvas.width, canvas.height);
                drawWallpaper(ctx, images, timeObj);

                ctx2.clearRect(0, 0, canvasText.width, canvasText.height);
                printObjects(ctx2, weatherObj, timeObj);

                // Refresh text canvas every second
                intervalClock = setInterval(function() {
                    updateTimeObj(timeObj, false);
                    ctx2.clearRect(0, 0, canvasText.width, canvasText.height);
                    printObjects(ctx2, weatherObj, timeObj);
                }, 1000);
                // Compare clock since last update,
                // force an update if >30s have passed without an update
                intervalCheck = setInterval(function() {
                    clock1 += 30000
                    clock2 = new Date().getTime();
                    if ((clock2 - clock1) > 30000) {
                        updateTimeObj(timeObj, true,
                        createUpdatedTimeObj(clock2, hereOffset, thereOffset));
                    }
                    clock1 = new Date().getTime();
                }, 30000);
            });
        });
	}
}

// Query Yahoo! Weather
// Guide: http://weblogs.asp.net/sreejukg/archive/2012/04/17/
// 			display-weather-information-in-your-site-using-jquery-using-yahoo-services.aspx
// In-browser YQL console: http://developer.yahoo.com/yql/console/
function getWeather(obj) {
    var deferred = $.Deferred();
	// LA: 2442047
	// BKK: 1225448
	var query = "http://query.yahooapis.com/v1/public/yql?q=select * from weather.forecast where woeid in (1225448, 2442047)&format=json&callback=?";
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

    var query = "dateTimeJsonFormatter.php";
    $.getJSON(query, function (data) {
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
function drawWallpaper(ctx, images, timeObj) {
    var halfWidth = 320,
        height = 1136;

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
function printLoadingMessage(ctx) {
    ctx.font = "100px Arial";
    ctx.fillStyle = "rgba(137, 215, 255, 0.5)";
    ctx.fillText("Loading...", 100, 350);
}

// Print all of the objects and their data to the canvas
function printObjects(ctx, weatherObj, timeObj) {
    var degSign = 0xB0,
        fillStyleHere = "#89d7ff",
        fillStyleThere = "#89d7ff";

    if (isDay(timeObj, true)) {
        fillStyleHere = "#0D0F36";
    }
    if (isDay(timeObj, false)) {
        fillStyleThere = "#0D0F36";
    }

    
    // Time remaining until next meet
    ctx.font = "100px Arial";
    ctx.fillStyle = "rgba(137, 215, 255, 0.2)";
    ctx.fillText(timeObj.days_left, 175, 250);

	ctx.font="40px Arial";
	
    // There block
	ctx.fillStyle = fillStyleThere;
	ctx.fillText("BKK", 50, 350);
    ctx.fillText(timeFormatter(timeObj, false), 50, 390);
	ctx.fillText(weatherObj.there_temp+String.fromCharCode(degSign)+"F", 50,
    430);
    
	// Here block
    ctx.fillStyle = fillStyleHere;
	ctx.fillText("LA", 450, 350);
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
function updateTimeObj(timeObj, reset, newTimeObj) {
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
                hrHere++;
                hrThere++;

                if (hrHere >= 24 || hrThere >= 24) {
                    hr = 0;
                }
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
        return (timeObj.here_h >= 6 && timeObj.here_h <= 20);
    }
    else {
        return (timeObj.there_h >= 6 && timeObj.there_h <= 20);
    }
}
