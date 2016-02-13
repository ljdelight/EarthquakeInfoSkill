# Earthquake Info Skill

Earthquake Info reports the magnitude and location of several recent earthquakes near a particular city.


# Features

This is an Amazon Echo skill using the Alexa Skills Kit (ASK) SDK, and can be easily deployed to AWS Lambda. The service does not report earthquakes with a magnitude less than 3.0, or earthquakes over X days.


## Example Calls Using the Echo
Here are some sample conversations that you can have with Alexa.

### Example 1
Alexa, start Earthquake Info.  
*Near what city do you want to search for earthquakes?*  
Wichita, Kansas  
*Two earthquakes near Wichita. A magnitude 3.1 near Anthony. A magnitude 3.7 near Medford.*

### Example 2
Alexa, ask Earthquake Info about Palm Springs.  
*One earthquake near Palm Springs.  A magnitude 4.01 near Big Bear Lake.*

### Example 3
Alexa, ask Earthquake Info about San Francisco, California.  
*No earthquakes near San Francisco in the last 14 days.*

# Technologies Used

* [AWS Lambda](https://aws.amazon.com/lambda/). I deploy the source on Lambda because it's very low cost (1M calls per month free), scales easily, and configuration is simple.
* [Google Maps Geocoding API](https://developers.google.com/maps/documentation/geocoding/intro). This is used to convert a city location into coordinates.
  * NOTE: An API Key is required to use this service.
* [USGS Earthquake Catalog API](http://earthquake.usgs.gov/fdsnws/event/1/). The USGS API tells us the earthquakes in a certain location and we can filter the results by using optional arguments in the API call.
