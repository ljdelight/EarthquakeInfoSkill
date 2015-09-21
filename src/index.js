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
var g = require('./GoogleAPIKey');
var GOOGLE_API_KEY = g.googleAPIKey;

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
    console.log("onSessionStarted requestId: " + sessionStartedRequest.requestId +
        ", sessionId: " + session.sessionId);

    // Any session init logic would go here.
};

/**
 * Override to teardown session state.
 */
EarthquakeInfo.prototype.eventHandlers.onSessionEnded = function (sessionEndedRequest, session) {
    console.log("onSessionEnded requestId: " + sessionEndedRequest.requestId +
        ", sessionId: " + session.sessionId);

    //Any session cleanup logic would go here.
};

EarthquakeInfo.prototype.intentHandlers = {
    GetEarthquakeGivenCityEventIntent: function (intent, session, response) {
        handleEarthquakesByLocationIntent(intent, session, response);
    },
    GetEarthquakeGivenTwoIntent: function (intent, session, response) {
        handleEarthquakesByLocationIntent(intent, session, response);
    },
    GetEarthquakeGivenThreeIntent: function (intent, session, response) {
        handleEarthquakesByLocationIntent(intent, session, response);
    },
    GetEarthquakeGivenFourIntent: function (intent, session, response) {
        handleEarthquakesByLocationIntent(intent, session, response);
    },
    GetEarthquakeGivenFiveIntent: function (intent, session, response) {
        handleEarthquakesByLocationIntent(intent, session, response);
    }
};

/**
 * Launching without specifying an intent, route to the default.
 */
EarthquakeInfo.prototype.eventHandlers.onLaunch = function (launchRequest, session, response) {
    console.log("EarthquakeInfo onLaunch requestId: " + launchRequest.requestId + ", sessionId: " + session.sessionId);

    var speechOutput = "Near what city do you want to search for earthquakes?";
    response.ask(speechOutput, speechOutput);
};

function handleEarthquakesByLocationIntent(intent, session, alexa) {
    var requestedLocation = Object.keys(intent.slots).map(function(k){return intent.slots[k].value;}).join("+");

    console.log("Location is " + requestedLocation);
    var geocodeOptions = {
        hostname: "maps.google.com",
        path: "/maps/api/geocode/json?key=" + GOOGLE_API_KEY + "&address=" + requestedLocation,
        method: "GET",
        headers: { "Content-Type": "application/json" }
    };
    var geocodeCallback = function (json) {
        var lat = json.results[0].geometry.location.lat;
        var lng = json.results[0].geometry.location.lng;
        var loc = json.results[0].address_components[0].long_name;
        var date = new Date();
        date.setDate(date.getDate() - 14);
        date = date.toISOString();

        var usgsOptions = {
            hostname: "earthquake.usgs.gov",
            path: "/fdsnws/event/1/query?format=geojson" +
                "&latitude=" + lat +
                "&longitude=" + lng +
                "&maxradiuskm=100" +
                "&minmagnitude=3" +
                "&starttime=" + date,
            method: "GET",
            headers: {
                "Content-Type": "application/json"
            }
        };

        httpGetJSON(false, usgsOptions, getUsgsCallback(alexa, loc));
    };
    httpGetJSON(true, geocodeOptions, geocodeCallback);
}

function getUsgsCallback(alexa, loc) {
    return function (resp) {
        var MAX_LOCATIONS_TO_SAY = 3;
        var res = '';
        if (resp.metadata.count > 0) {
            res += resp.metadata.count + " earthquakes near " + loc + ". ";
            if (resp.metadata.count > MAX_LOCATIONS_TO_SAY) {
                res += "Here are the latest " + MAX_LOCATIONS_TO_SAY + ".";
            }
            // build a string for each location
            for (var i = 0; i < MAX_LOCATIONS_TO_SAY && i < resp.metadata.count; i++) {
                var mag = resp.features[i].properties.mag;

                // The place looks like '93km WSW of Coquimbo, Chile'
                var location = resp.features[i].properties.place.replace(/.+ of (.+), .+/, "$1");

                res += ' A magnitude ' + mag + ' near ' + location + '.';
            }
        } else {
            res = "No earthquakes near " + loc + " in the last 14 days.";
        }
        console.log(res);
        alexa.tell(res);
    };
}

function httpGetJSON(ssl, options, callback) {
    var http = ((ssl === true) ? require('https') : require('http'));
    var getCallback = function(response) {
        var body = '';

        response.on('data', function(chunk) {
            body += chunk;
        });

        response.on('end', function() {
            var json = JSON.parse(body);
            callback(json);
        });
    };
    var request = http.get(options, getCallback).end();
}

// Create the handler that responds to the Alexa Request.
exports.handler = function (event, context) {
    var skill = new EarthquakeInfo();
    skill.execute(event, context);
};
