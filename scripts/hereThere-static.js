// UI
function arrangeUICanvas(isDay) {
    var canvas = $('#app-UI')[0],
        ctx = null;
    
    var textColor = (isDay) ? '#0D0F36' : '#89d7ff';
    
    if (canvas.getContext) {
        ctx = canvas.getContext('2d');

        ctx.font = '40px Arial';
        ctx.fillStyle = textColor;
        ctx.fillText('?', canvas.width-45, 45);
    }

    // Event interaction handling
    $('#app-UI').mouseup(function(e) {
        // http://stackoverflow.com/questions/4249648/jquery-get-mouse-position-within-an-element
        var parentOffset = $(this).parent().offset();
        var x = e.pageX - parentOffset.left;
        var y = e.pageY - parentOffset.top;
        if ((x > canvas.width - 50 && x < canvas.width) &&
            (y > 0 && y < 50)) {
            $('#app-about').toggle();

            ctx.clearRect(canvas.width-50, 0, canvas.width, 50);
            if ($('#app-about').is(':visible')) {
                ctx.textColor = '#0D0F36';
                ctx.fillText('X', canvas.width-45, 45);
            }
            else {
                ctx.textColor = (isDay) ? '#0D0F36' : '#89d7ff';
                ctx.fillText('?', canvas.width-45, 45);
            }
        }
    });
}

// About
function arrangeAboutCanvas() {
    var canvas = $('#app-about')[0],
        ctx = null;

    var x = 10,
        y = 60,
        d = 25;

    // Hide the app-about canvas
    $('#app-about').css('display', 'none');
    if (canvas.getContext) {
        // Background
        ctx = canvas.getContext('2d');
        ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Text
        ctx.fillStyle = '#000000';
        ctx.font = d + 'px Arial';
        ctx.fillText('>> About', x, y);
        ctx.fillText('This app shows the current time and weather ' +
            'in two', x, y += d);
        ctx.fillText('different locations. It also displays the time ' +
            'remaining', x, y += d);
        ctx.fillText('until a reunion of people from their respective ' +
            'locations.', x, y += d);

        ctx.fillText('This is an exercise in HTML 5, Yahoo!Weather/YQL,', x,
        y += (2*d));
        ctx.fillText('jQuery, and PHP with potential real-world usage.' +
            ' This', x, y += d);
        ctx.fillText('app is currently optimized for iPhone 5 ' +
            '(portrait)', x, y += d);
        ctx.fillText('dimensions. A future update will include cross-' +
            'device', x, y += d);
        ctx.fillText('support and customization options.', x, y += d);
    }
}
