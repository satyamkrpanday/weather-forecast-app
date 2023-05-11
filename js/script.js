$(document).ready(function() {

	//Variables for working with Location, Temprature and Times
	var lat;
	var lon;
	var tempInF;
	var tempInC;
	var timeFormatted;

	//Quotes depending on the weather
	var weatherQuotes ={
		rain: "\"The best thing one can do when it's raining is to let it rain.\" -Henry Wadsworth Longfellow",
		clearDay: "\"Wherever you go, no matter what the weather, always bring your own sunshine.\" -Anthony J. D'Angelo",
		clearNight: "\"The sky grew darker, painted blue on blue, one stroke at a time, into deeper and deeper shades of night.\" -Haruki Murakami",
		snow: "\"So comes snow after fire, and even dragons have their ending!\" -J. R. R. Tolkien",
		sleet: "\"Then come the wild weather, come sleet or come snow, we will stand by each other, however it blow.\" -Simon Dach",
		wind: "\"Kites rise highest against the wind - not with it.\" -Winston Churchill",
		fog: "\"It is not the clear-sighted who rule the world. Great achievements are accomplished in a blessed, warm fog.\" -Joseph Conrad",
		cloudy: "\"Happiness is like a cloud, if you stare at it long enough, it evaporates.\" -Sarah McLachlan",
		partlyCloudy: "\"Try to be a rainbow in someone's cloud.\" -Maya Angelou",
		default: "\"The storm starts, when the drops start dropping When the drops stop dropping then the storm starts stopping.\"― Dr. Seuss "
	};

	function locateYou() {
		//Try to get users location using their IP adress automattically.
		//It's not very precise but It's a way to get users location even if
		//their browser doesn't support Geolocation

		// https://ip-api.com/docs/api:json
		var ipApiCall = "http://ip-api.com/json";
		
		$.getJSON(ipApiCall, function(ipData){
			lat = ipData.lat;
			lon = ipData.lon;
			yourAddress(ipData);
			getWeather();
		});

		// Try to get location from users browser (device).
		if (navigator.geolocation) {
			console.log("Inside geo");
			navigator.geolocation.getCurrentPosition(function (position) {
				lat = position.coords.latitude;
				lon = position.coords.longitude;
				console.log(lat+" "+lon+"geo"); 
				// yourAddress(ipData);
				getWeather();
			});
		}
	}

	//After collecting the Latiture and Longitute, Getting their formatted address from Google Maps.
	function yourAddress(ipData) {
		console.log("IP data for yourAddress: ", ipData);
		var formattedAddress = "City: " + ipData.city + ", Region: " + ipData.regionName + ", Country: " + ipData.country;
		$(".locName").html(formattedAddress);
	}

	function getWeather() {
		//Looking up the weather from Darkskies using users latitude and longitude.
		var weatherApiCall = "https://api.open-meteo.com/v1/forecast?latitude=" + lat + "&longitude="+ lon + 
		"&daily=weathercode,temperature_2m_max,temperature_2m_min,apparent_temperature_max,apparent_temperature_min,sunrise,sunset,windspeed_10m_max" + 
		"&current_weather=true&timeformat=unixtime&timezone=Asia%2FKolkata";
		console.log("Weather app: ", weatherApiCall);
		$.ajax({
			url: weatherApiCall,
			type: "GET",
			dataType: "json",
			success: function(weatherData) {
				console.log("Weather API response: ", weatherData);
				//Fetching all the infor from the JSON file and plugging it into UI 
				$(".currentTemp").html(weatherData.current_weather.temperature);
				//$(".weatherCondition").html(new Date(weatherData.current_weather.time * 1000));
				$(".feelsLike").html(weatherData.current_weather.temperature + " °C");
				$(".humidity").html((weatherData.current_weather.weathercode * 100).toFixed(0));
				$(".windSpeed").html((weatherData.current_weather.windspeed/0.6213).toFixed(2));
				
				$(".todaySummary").html(weatherData.current_weather.temperature);
				$(".tempMin").html(weatherData.daily.temperature_2m_min[0]+" °C");
				$(".tempMax").html(weatherData.daily.temperature_2m_max[0]+" °C");
				$(".dewPoint").text(weatherData.current_weather.temperature + " °F");
  			
  			//Converting UNIX time
  			unixToTime(weatherData.daily.sunrise[0]);
  			var sunriseTimeFormatted = timeFormatted+" AM";
  			$(".sunriseTime").text(sunriseTimeFormatted);

  			unixToTime(weatherData.daily.sunset[0]);
  			var sunsetTimeFormatted = timeFormatted+" PM";
  			$(".sunsetTime").text(sunsetTimeFormatted);

  			//Loading weekly Data in UI
  			// $(".weekDaysSummary").text(weatherData.daily.summary);
  			var skycons = new Skycons({"color": "white"});

  			for (i=1; i<7; i++) {
  				$(".weekDayTempMax"+i).text(weatherData.daily.temperature_2m_max[i]);
  				$(".weekDayTempMin"+i).text(weatherData.daily.temperature_2m_min[i]);
  				$(".weekDaySunrise"+i).text(unixToTime(weatherData.daily.sunrise[i]));
  				$(".weekDaySunset"+i).text(unixToTime(weatherData.daily.sunset[i]));
  				$(".weekDayName"+i).text(unixToWeekday(weatherData.daily.sunrise[i]));

				var weekDaySummary = new Date(weatherData.daily.time[i] * 1000);
  				$(".weekDaySummary"+i).text(weekDaySummary);
  				$(".weekDayWind"+i).text((weatherData.daily.windspeed_10m_max[i]/0.6213).toFixed(2));
  			}

  			//Skycon Icons
  			// skycons.set("weatherIcon", weatherData.currently.icon);
  			// skycons.set("expectIcon", weatherData.hourly.icon);
  			skycons.play();

  			//Coverting data between Celcius and Farenheight
  			tempInF = ((weatherData.current_weather.temperature*9/5) + 32).toFixed(2);
  			tempInC = weatherData.current_weather.temperature;
  			feelsLikeInC = 	weatherData.current_weather.temperature;
  			feelsLikeInF = ((feelsLikeInC*9/5) + 32).toFixed(2);

  			//Load Quotes

  			switch (weatherData.current_weather.weathercode) {
  				case "clear-day":
  					$(".quote").text(weatherQuotes.clearDay);
  					break;
  				case "clear-night":
  					$(".quote").text(weatherQuotes.clearNight);
  					break;
  				case "rain":
  					$(".quote").text(weatherQuotes.rain);
  					break;
  				case 3:
  					$(".quote").text(weatherQuotes.snow);
  					break;
  				case "sleet":
  					$(".quote").text(weatherQuotes.sleet);
  					break;
  				case "clear-night":
  					$(".quote").text(weatherQuotes.clearNight);
  					break;
  				case "wind":
  					$(".quote").text(weatherQuotes.wind);
  					break;
  				case "fog":
  					$(".quote").text(weatherQuotes.fog);
  					break;
  				case "cloudy":
  					$(".quote").text(weatherQuotes.cloudy);
  					break;
  				case "partlyCloudy":
  					$(".quote").text(weatherQuotes.partlyCloudy);
  					break;
  				default:
  					$(".quote").text(weatherQuotes.default);
  			}
			}
		});
	}

	//Calling the function to locate user and fetch the data
	locateYou();

	//Function for converting UNIX time to Local Time
	function unixToTime(unix) {
		unix *= 1000;
		var toTime = new Date(unix);
		var hour = ((toTime.getHours() % 12 || 12 ) < 10 ? '0' : '') + (toTime.getHours() % 12 || 12);
  	var minute = (toTime.getMinutes() < 10 ? '0' : '') + toTime.getMinutes();
  	timeFormatted = hour+":"+minute;
  	return timeFormatted;
	}

	function unixToWeekday(unix) {
		unix *= 1000;
		var toWeekday = new Date(unix);
		var days = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
		var weekday = days[toWeekday.getDay()];
		return weekday;
	}

	//UI Tweaks
	$(".convertToggle").on("click", function() {
		$(".toggleIcon").toggleClass("ion-toggle-filled");
		var tmpNow = $(".currentTemp");
		var unit = $(".unit");
		var feelsLike = $(".feelsLike");

		if (tmpNow.text() == tempInC) {
			tmpNow.text(tempInF);
			unit.text("°F");
			feelsLike.text(feelsLikeInF + " °F")
		} else {
			tmpNow.text(tempInC);
			unit.text("°C");
			feelsLike.text(feelsLikeInC + " °C")
		}
	});


	//Smooth Scrool to Weekly Forecast section
	$(".goToWeek").on("click", function() {
		$('html, body').animate({
	    scrollTop: $("#weeklyForecast").offset().top
		}, 1000);
	});
	 
	console.log("Input for the search box", input);

	// https://geocoding-api.open-meteo.com/v1/search?name=Varanas
    // var autocomplete = new google.maps.places.Autocomplete(input);

	// console.log("Autocomplete search box: ", autocomplete);
    // autocomplete.addEventListener('place_changed', function () {
    //   var place = autocomplete.getPlace();
    //   lat = place.geometry.location.lat();
    //   lon = place.geometry.location.lng();
    //   $(".locName").html(place.formatted_address);
    //   //Calling the getWeather function to fetch data for Searched location
    //   getWeather();
    // 	});
	
	var input = document.getElementById('locSearchBox');
	input.addEventListener('input', function(inputData) {
		console.log("vwevwe", inputData.target.value);

		var locationSearch = "https://geocoding-api.open-meteo.com/v1/search?name=" + inputData.target.value;
			
		$.getJSON(locationSearch, function(locationData){
			console.log("location data", locationSearch);
			lat = locationData.results[0].latitude;
			lon = locationData.results[0].longitude;
			yourAddress({
				city: locationData.results[0].name,
				regionName: locationData.results[0].admin1,
				country: locationData.results[0].country
			});
			getWeather();
		});
	});
	
});
