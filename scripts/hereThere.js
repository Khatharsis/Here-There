// Set up the Canvas
function arrangeCanvas() {
	// Using jQuery with Canvas isn't too straightfoward...
	// http://stackoverflow.com/questions/3305167/simple-html5-canvas-and-jquery-question
	var canvas = $('#app')[0];
	if (canvas.getContext) {
		var ctx = canvas.getContext('2d');
	    
        var backgroundImage = new Image();
        backgroundImage.onload = function() {
            ctx.drawImage(backgroundImage, 0, 0);
            getWeather(ctx);
        };
        backgroundImage.src = 'images/tempWallpaper.jpg';
	}
}

// Query Yahoo! Weather
// Guide: http://weblogs.asp.net/sreejukg/archive/2012/04/17/
// 			display-weather-information-in-your-site-using-jquery-using-yahoo-services.aspx
// In-browser YQL console: http://developer.yahoo.com/yql/console/
function getWeather(ctx) {
	var weatherObj = {};
	// LA: 2442047
	// BKK: 1225448
	var query = "http://query.yahooapis.com/v1/public/yql?q=select * from weather.forecast where woeid in (1225448, 2442047)&format=json&callback=?";
	$.getJSON(query, function (data) {
		weatherObj.there_temp = data.query.results.channel[0].item.condition.temp;
		
		weatherObj.here_temp = data.query.results.channel[1].item.condition.temp;
	
        // Canvas isn't happy with multiple ajax calls, so chain
        // the function calls...
        getTime(ctx, weatherObj);
	});
}

// Call custom PHP script to obtain time values
function getTime(ctx, weatherObj) {
    var timeObj = {};

    var query = "dateTimeJsonFormatter.php";
    $.getJSON(query, function (data) {
        timeObj.here = data.currentTime.here;
        timeObj.there = data.currentTime.there;
        timeObj.days_left = data.daysLeft.remaining;
        printObjects(ctx, weatherObj, timeObj);
    });
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
    ctx.fillText(timeObj.here, 450, 390);
	ctx.fillText(weatherObj.there_temp+String.fromCharCode(degSign)+"F", 50,
    430);
    
	// Here block
	ctx.fillText("LA", 450, 350);
    ctx.fillText(timeObj.there, 50, 390);
	ctx.fillText(weatherObj.here_temp+String.fromCharCode(degSign)+"F", 450,
    430);
}
