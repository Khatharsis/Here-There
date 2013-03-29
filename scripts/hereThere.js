// Set up the Canvas
function arrangeCanvas() {
    var weatherObj = {},
        timeObj = {};

    var intervalId = 0;
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
	    
        backgroundImage.onload = function() {
            // Loading...
            ctx.drawImage(backgroundImage, 0, 0);
            printLoadingMessage(ctx2);

            // After fetching data
            $.when(getWeather(weatherObj), getTime(timeObj))
            .done(function() {
                ctx2.clearRect(0, 0, canvasText.width, canvasText.height);
                printObjects(ctx2, weatherObj, timeObj);

                // Refresh text canvas every second
                intervalId = setInterval(function() {
                    updateTimeObj(timeObj, null);
                    ctx2.clearRect(0, 0, canvasText.width, canvasText.height);
                    printObjects(ctx2, weatherObj, timeObj);
                }, 1000);
            });
        };
        backgroundImage.src = 'images/tempWallpaper.jpg';
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

// Print loading message
function printLoadingMessage(ctx) {
    ctx.font = "100px Arial";
    ctx.fillStyle = "rgba(137, 215, 255, 0.5)";
    ctx.fillText("Loading...", 100, 350);
}

// Print all of the objects and their data to the canvas
function printObjects(ctx, weatherObj, timeObj) {
    var degSign = 0xB0;
    
    // Time remaining until next meet
    ctx.font = "100px Arial";
    ctx.fillStyle = "rgba(137, 215, 255, 0.2)";
    ctx.fillText(timeObj.days_left, 175, 250);

	ctx.font="40px Arial";
	ctx.fillStyle="#89d7ff";
	
    // There block
	ctx.fillText("BKK", 50, 350);
    ctx.fillText(timeFormatter(timeObj, false), 50, 390);
	ctx.fillText(weatherObj.there_temp+String.fromCharCode(degSign)+"F", 50,
    430);
    
	// Here block
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

// Increase the time by one second or set seconds
function updateTimeObj(timeObj, seconds) {
    // Manual set the seconds
    if (seconds) {
        timeObj.here_s = seconds;
        timeObj.there_s = seconds;
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
