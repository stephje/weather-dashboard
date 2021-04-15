const openWeatherKey = "d8b9c9f29acf75b9bc89cdc565bacf19";

//event listener for the location search button
var searchButton = document.querySelector("#search-button");
searchButton.addEventListener("click", displayWeatherReport);

async function getCityLocation(cityName) {
  //this URL will be used to get the latitude and longitude of the relevant location
  var locationQueryURL =
    "https://api.openweathermap.org/data/2.5/weather?q=" +
    cityName +
    "&appid=" +
    openWeatherKey;

  //fetch the data
  const cityLocationResponse = await fetch(locationQueryURL);
  if (cityLocationResponse.status === 404) {
    window.alert(
      "Location not found. Please ensure you are entering a valid location with correct spelling, and try again."
    );
  } else {
    return await cityLocationResponse.json();
  }
}

async function getWeatherForecast(lat, lon) {
  //this URL will be used to get the weather forecast data for the relevant location
  var forecastQueryURL =
    "https://api.openweathermap.org/data/2.5/onecall?lat=" +
    lat +
    "&lon=" +
    lon +
    "&exclude=minutely,hourly,alerts&appid=" +
    openWeatherKey;

  const weatherForecastResponse = await fetch(forecastQueryURL);
  return await weatherForecastResponse.json();
}

async function displayWeatherReport(event) {
  //prevent default behaviour of form submission
  event.preventDefault();

  //function getCityName retrieves the user input and sanitises it
  var cityName = getCityName();

  var locationData = await getCityLocation(cityName);

  var lat = locationData.coord.lat;
  var lon = locationData.coord.lon;

  var weatherForecast = await getWeatherForecast(lat, lon);

  console.log("This is the weather forecast:", weatherForecast);
}

//get user input from city search
function getCityName() {
  var cityInput = document.querySelector("#city-input").value;
  //sanitise input (make it lowercase as per API requirement, and get rid of any leading/trailing whitespace)
  cityInput = cityInput.toLowerCase().trim();
  return cityInput;
}
