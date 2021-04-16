//API key for OpenWeatherMap
const openWeatherKey = "d8b9c9f29acf75b9bc89cdc565bacf19";

//Event listener for the location search button
const searchButton = document.querySelector("#search-button");
searchButton.addEventListener("click", displayWeatherReport);

//Array to store recent searches in
var recentSearchArray = [];
const recentSearchDropdown = document.querySelector("#recent-dropdown");

function getRecentSearches() {
  //if there is an array in local storage then parse it
  storedSearches = localStorage.getItem("recentSearches");

  if (storedSearches) {
    recentSearchArray = JSON.parse(storedSearches);
    return recentSearchArray;
  }
}

function populateRecentSearches() {
  recentSearchDropdown.innerHTML = "<option>--Select a City--</option>";
  var recentSearchArray = getRecentSearches();

  //list most recent search at the top
  for (let i = recentSearchArray.length - 1; i >= 0; i--) {
    const search = recentSearchArray[i];
    const newDropdownOption = document.createElement("option");
    newDropdownOption.setAttribute("id", search);
    recentSearchDropdown.appendChild(newDropdownOption);
    newDropdownOption.textContent = search;
  }
}

populateRecentSearches();

async function getCityLocation(cityName) {
  //this URL will be used to get the latitude and longitude of the relevant location
  var locationQueryURL =
    "https://api.openweathermap.org/data/2.5/weather?q=" +
    cityName +
    "&appid=" +
    openWeatherKey;

  //add city name to array of recent searches, stringify and add to local storage

  var recentSearchArray = getRecentSearches();
  recentSearchArray.push(cityName);
  localStorage.setItem("recentSearches", JSON.stringify(recentSearchArray));
  populateRecentSearches();

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
