
// openweathermap.org 
var API_KEY = "736c9547301d6a525f07442ebd95c662";
var weather;
var display = {};

// START OF COORDINATE-GET CHUNK
var options = {
	enableHighAccuracy: true,
	timeout: 10000,
	maximumAge: 0,
}
document.addEventListener("DOMContentLoaded", function(event) {
	navigator.geolocation.getCurrentPosition(success, error, options);
});
function error(err) {
	document.getElementById("city"       ).innerHTML = 'Geolocation Failed';
	document.getElementById("temperature").innerHTML = 'N/A';
	document.getElementById("sky"        ).innerHTML = 'N/A';
	document.getElementById("wind"       ).innerHTML = 'N/A';
	document.getElementById("bottom-text").innerHTML = err.message + "<br>Please check if your browser has geolocation enabled";
	return;
}
function success(pos) {
	var latitud = pos.coords.latitude;
	var longitud = pos.coords.longitude;
	
	var requestUrl = "http://api.openweathermap.org/data/2.5/weather?lat=" + latitud + "&lon=" + longitud +"&appid=" + API_KEY;
	
	var weatherRequest = new XMLHttpRequest();
	weatherRequest.open('GET' , requestUrl, false /*syncronous*/);
	//NOTE: THIS IS CURRENTLY SYNCRONOUS!!
	weatherRequest.send(null);
	weather = JSON.parse(weatherRequest.responseText);
	var weatherData = JSON.parse(weatherRequest.responseText);
	weatherIconURL = 'http://openweathermap.org/img/w/' + weatherData.weather[0].icon + '.png';
	document.getElementById("weather-icon").src = weatherIconURL;
	
	display.city = weatherData.name + ", " + weatherData.sys.country
	document.getElementById("city").innerHTML = display.city;
	
	display.temperature = {};
	display.temperature.kelvin = weatherData.main.temp;
	display.temperature.celsius = kConvert(weatherData.main.temp, 'C'); //Kelvin to Celsius
	display.temperature.fahrenheit = kConvert(weatherData.main.temp, 'F'); //Kelvin to Fahrenheit 
	document.getElementById("temperature").innerHTML = display.temperature.celsius;
	
	//weather description text
	display.sky = weatherData.weather[0].description;
	document.getElementById("sky").innerHTML = display.sky;
	
	
	display.wind = {};
	var windDirection = degreesToCardinal(weatherData.wind.deg);
	display.wind.ms  = windDirection + " " +  msConvert(weatherData.wind.speed, 'm/s' );
	display.wind.kmh = windDirection + " " +  msConvert(weatherData.wind.speed, 'km/h');
	display.wind.mph = windDirection + " " +  msConvert(weatherData.wind.speed, 'mph' );
	document.getElementById("wind").innerHTML = display.wind.kmh;
	
	if (usesImperialSystem(weatherData.sys.country)) {
		switchTempUnit();
		switchSpeedUnit();
	}
	document.getElementById("main-stats").onclick = function() {
		switchTempUnit();
		switchSpeedUnit();
	}
	document.getElementById("bottom-text").innerHTML = '(click data to change measurements)';
}

function switchTempUnit() {
	var currentTemp = document.getElementById("temperature");
	if (currentTemp.innerHTML.indexOf('C') >= 0) {
		currentTemp.innerHTML = display.temperature.fahrenheit;
	} else {
		currentTemp.innerHTML = display.temperature.celsius;
	}
	return;
}

function switchSpeedUnit() {
	var currentTemp = document.getElementById("wind");
	if (currentTemp.innerHTML == display.wind.kmh) {
		currentTemp.innerHTML = display.wind.mph;
	} else {
		currentTemp.innerHTML = display.wind.kmh;
	}
	return;
}

function degreesToCardinal(deg) {
	var absDeg = deg % 360;
	if (absDeg < 0) { absDeg += 360; }
	var octant = Math.floor((absDeg + 45/2)/(45)) % 8;
	var abbreviations = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
	return abbreviations[octant] || '';
}

//convert Kelvin to Celsius/Fahrenheit with specific text formatting
function kConvert(kTemp, newUnit) {
	var newTemp;
	var newUnitChar = newUnit.charAt().toUpperCase();
	if (newUnitChar === 'C') {
		//Celsius
		newTemp = kTemp - 273.15;
	} else if (newUnitChar === 'F') {
		//Fahrenheit
		newTemp = kTemp * (9/5) - 459.67;
	} else {
		throw newUnit + " is not a valid temperature unit"
	}
	var newTemp = (Math.round(newTemp * 10)/10).toFixed(1);
	return newTemp + " " + newUnitChar + "&deg";
}

// convert m/s to other units, with specific text formatting
function msConvert(msSpeed, newUnit) {
	var newSpeed;
	if (newUnit === 'm/s') {
		newSpeed = msSpeed;
	} else if (newUnit === 'km/h') {
		newSpeed = msSpeed * (60*60) / (1000);
	} else if (newUnit === 'mph') {
		newSpeed = msSpeed * 2.23694;
	} else {
		throw newUnit + " is not a valid speed unit";
	}
	var newSpeed = (Math.round(newSpeed * 10) / 10).toFixed(1);
	return newSpeed + ' ' + newUnit;
}

function usesImperialSystem(userCountryCode) {
	var imperialCountries = [
		'LIBERIA', 'LR', 'LBR', 
		'MYANMAR', 'MM', 'MMR', 
		'UNITED STATES', 'US', 'USA'
	];
	if (imperialCountries.indexOf(userCountryCode.toUpperCase()) >= 0) {
		return true;
	} 
	return false;
}

