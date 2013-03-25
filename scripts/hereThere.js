// Set up the Canvas
function arrangeCanvas() {
	// Using jQuery with Canvas isn't too straightfoward...
	// http://stackoverflow.com/questions/3305167/simple-html5-canvas-and-jquery-question
    var weatherObj = {},
        timeObj = {};

    var canvas = $('#app')[0],
        ctx = null,
        backgroundImage = new Image();

	if (canvas.getContext) {
		ctx = canvas.getContext('2d');
	    
        backgroundImage.onload = function() {
            // Loading...
            ctx.drawImage(backgroundImage, 0, 0);
            printLoadingMessage(ctx);

            // After fetching data
            $.when(getWeather(weatherObj), getTime(timeObj))
            .done(function() {
                ctx.clearRect(0, 0, canvas.width, canvas.height);
                ctx.drawImage(backgroundImage, 0, 0);
                printObjects(ctx, weatherObj, timeObj);
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
    //var timeObj = {};
    var deferred = $.Deferred();

    var query = "dateTimeJsonFormatter.php";
    $.getJSON(query, function (data) {
        obj.here = data.currentTime.here;
        obj.there = data.currentTime.there;
        obj.days_left = data.daysLeft.remaining;
        
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
    ctx.fillText(timeObj.here, 450, 390);
	ctx.fillText(weatherObj.there_temp+String.fromCharCode(degSign)+"F", 50,
    430);
    
	// Here block
	ctx.fillText("LA", 450, 350);
    ctx.fillText(timeObj.there, 50, 390);
	ctx.fillText(weatherObj.here_temp+String.fromCharCode(degSign)+"F", 450,
    430);
}
