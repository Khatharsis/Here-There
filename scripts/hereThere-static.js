// UI
function arrangeUICanvas(isDay) {
    var canvas = $('#app-UI')[0],
        ctx = null;

    if (canvas.getContext) {
        ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        arrangeDefaultUIIcons(canvas, ctx, isDay);
    }
}

// UI event handler
function registerUICanvasEventHandler() {
    var canvas = $('#app-UI')[0],
        ctx = (canvas.getContext) ? canvas.getContext('2d') : null;

    // Event interaction handling
    // Call .off() to clear the event if already bound (necessary when doing a
    // forced refresh)
    $('#app-UI').off('mouseup')
        .mouseup(function(e) {
        // http://stackoverflow.com/questions/4249648/jquery-get-mouse-position-within-an-element
        var parentOffset = $(this).parent().offset();
        var x = e.pageX - parentOffset.left;
        var y = e.pageY - parentOffset.top;

        // Right: (close) and (about)
        if ((x > canvas.width - 50 && x < canvas.width) &&
            (y > 0 && y < 50)) {

            // Default view, toggle About
            if (!$('#app-about').is(':visible') &&
                !$('#settings').is(':visible')) {
                $('#app-overlay').show();
                $('#app-about').show();
            }
            // Else, About or Settings is visible and needs to be hidden
            else {
                $('#app-overlay').hide();
                if ($('#app-about').is(':visible')) {
                    $('#app-about').hide();
                }
                else {
                    $('#settings').hide();
                }
            }

            ctx.clearRect(0, 0, canvas.width, canvas.height);
            if ($('#app-about').is(':visible') || 
                $('#settings').is(':visible')) {
                arrangeCloseUIIcon(canvas, ctx, isDay);
            }
            else {
                arrangeDefaultUIIcons(canvas, ctx, isDay);
            }
        }

        // Middle: (settings)
        if ((x > canvas.width - 105 && x < canvas.width - 50) &&
            (y > 0 && y < 50)) {
            $('#app-overlay').toggle();
            $('#settings').toggle();

            ctx.clearRect(0, 0, canvas.width, canvas.height);
            if ($('#settings').is(':visible')) {
                arrangeCloseUIIcon(canvas, ctx, isDay);
            }
        }

        // Left: (refresh)
        if ((x > canvas.width - 160 && x < canvas.width - 105) &&
            (y > 0 && y < 50)) {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            forceRefresh();
        }
    });
}

// Helper function for UI canvas - print default UI view
function arrangeDefaultUIIcons(canvas, ctx, isDay) {
    // Codes from: http://fortawesome.github.com/Font-Awesome/design.html 
    var charCodeRefresh = '0xf021',
        charCodeCog = '0xf013',
        charCodeInfo = '0xf05a';
        
    var textColor = (isDay) ? '#0D0F36' : '#89d7ff';

    ctx.font = '40px FontAwesome';
    ctx.fillStyle = textColor;
    ctx.fillText(String.fromCharCode(charCodeRefresh), canvas.width-155, 45);
    ctx.fillText(String.fromCharCode(charCodeCog), canvas.width-100, 45);
    ctx.fillText(String.fromCharCode(charCodeInfo), canvas.width-45, 45);
}

// Helper function for UI canvas - print close icon
function arrangeCloseUIIcon(canvas, ctx, isDay) {
     ctx.textColor = '#0D0F36';
     ctx.fillText('X', canvas.width-45, 45);
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

// Overlay canvas: just a semi-transparent white canvas for helper views
// to be shown on top of ("hides" the main app)
function arrangeOverlayCanvas() {
    var canvas = $('#app-overlay')[0],
        ctx = null;

    $('#app-overlay').css('display', 'none');
    if (canvas.getContext) {
        // Background
        ctx = canvas.getContext('2d');
        ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
    }
}
