//
// This is a simple example for the Amazon Echo which informs the user of the number
// of significant earthquakes and notes a few of the most recent locations.
//

/**
 * App ID for the skill
 */
var APP_ID = undefined;//replace with 'amzn1.echo-sdk-ams.app.[your-unique-value-here]';


/**
 * The AlexaSkill prototype and helper functions
 */
var AlexaSkill = require('./AlexaSkill');

/**
 * This is a child of AlexaSkill.
 * To read more about inheritance in JavaScript, see the link below.
 *
 * @see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Introduction_to_Object-Oriented_JavaScript#Inheritance
 */
var EarthquakeInfo = function () {
    AlexaSkill.call(this, APP_ID);
};

// Extend AlexaSkill
EarthquakeInfo.prototype = Object.create(AlexaSkill.prototype);
EarthquakeInfo.prototype.constructor = EarthquakeInfo;

/**
 * Override to initialize session state.
 */
EarthquakeInfo.prototype.eventHandlers.onSessionStarted = function (sessionStartedRequest, session) {
    console.log("onSessionStarted requestId: " + sessionStartedRequest.requestId
        + ", sessionId: " + session.sessionId);

    // Any session init logic would go here.
};

/**
 * Override to teardown session state.
 */
EarthquakeInfo.prototype.eventHandlers.onSessionEnded = function (sessionEndedRequest, session) {
    console.log("onSessionEnded requestId: " + sessionEndedRequest.requestId
        + ", sessionId: " + session.sessionId);

    //Any session cleanup logic would go here.
};

EarthquakeInfo.prototype.intentHandlers = {
    HelpIntent: function (intent, session, response) {
        var speechOutput = "I report recent signficant earthquakes";
        response.tell(speechOutput);
    }
};

/**
 * Launching without specifying an intent, route to the default.
 */
EarthquakeInfo.prototype.eventHandlers.onLaunch = function (launchRequest, session, response) {
    console.log("EarthquakeInfo onLaunch requestId: " + launchRequest.requestId + ", sessionId: " + session.sessionId);
    handleStartIntent(session, response);
};

function handleStartIntent(session, response) {
    var MAX_LOCATIONS_TO_SAY = 3;
    var http = require('http');
    var options = {
        hostname: "earthquake.usgs.gov",
        path: "/earthquakes/feed/v1.0/summary/4.5_day.geojson",
        method: "GET",
        headers: {
            "Content-Type": "application/json"
        }
    };

    var request = http.get(options, function(usgsResponse) {
        usgsResponse.setEncoding('utf8');
        var body = '';

        usgsResponse.on('data', function(chunk) {
            body += chunk;
        });

        usgsResponse.on('end', function() {
            var resp = JSON.parse(body);
            var res = '';
            if (resp.metadata.count > 0) {
                res += resp.metadata.count + " significant earthquakes in the world today. ";
                if (resp.metadata.count > MAX_LOCATIONS_TO_SAY) {
                    res += "Here are the latest " + MAX_LOCATIONS_TO_SAY + ".";
                }
                // build a string for each location
                for (var i = 0; i < MAX_LOCATIONS_TO_SAY && i < resp.metadata.count; i++) {
                    var mag = resp.features[i].properties.mag;
                    var placeParts = resp.features[i].properties.place.split(' of ');
                    var location = placeParts[placeParts.length - 1].replace(',', '');

                    res += ' A magnitude ' + mag + ' near ' + location + '.';
                }
            } else {
                res = "No significant earthquakes today.";
            }
            console.log(res);
            response.tell(res);
        });
    });
};


// Create the handler that responds to the Alexa Request.
exports.handler = function (event, context) {
    var skill = new EarthquakeInfo();
    skill.execute(event, context);
};