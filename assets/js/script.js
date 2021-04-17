//API key for OpenWeatherMap
const openWeatherKey = "d8b9c9f29acf75b9bc89cdc565bacf19";

//array to store user search values
var recentSearchesArray = [];

const recentSearchDropdown = document.querySelector("#recent-dropdown");

//invoke so that recent searches are populated after page loads
populateRecentSearchesDropdown();

//populate the dropdown menu with the user's recent search values
function populateRecentSearchesDropdown() {
  recentSearchDropdown.innerHTML = "<option>--Select a City--</option>";

  //get the recent searches out of local storage
  var recentSearchArray = getRecentSearches();

  // this loop works backwards from the end of the array to ensure that the most recent search is at the top of the dropdown menu
  for (let i = recentSearchArray.length - 1; i >= 0; i--) {
    const search = recentSearchArray[i];
    const newDropdownOption = document.createElement("option");
    newDropdownOption.setAttribute("id", search);
    recentSearchDropdown.appendChild(newDropdownOption);
    newDropdownOption.textContent = search;
  }
}

//if there is already an array in local storage then parse it and assign to variable "recentSearchesArray"
function getRecentSearches() {
  storedSearches = localStorage.getItem("recentSearches");
  if (storedSearches) {
    recentSearchesArray = JSON.parse(storedSearches);
  }
  return recentSearchesArray;
}

//If the city name does not already exist in the array AND the length of the array reaches 10 items, remove the first (aka the oldest) item in the array and append the new item
function storeRecentSearches(cityName) {
  if (
    recentSearchesArray.includes(cityName) === false &&
    recentSearchesArray.length < 10
  ) {
    recentSearchesArray.push(cityName);
    localStorage.setItem("recentSearches", JSON.stringify(recentSearchesArray));
  } else if (
    recentSearchesArray.includes(cityName) === false &&
    (recentSearchesArray.length = 10)
  ) {
    recentSearchesArray.shift();
    recentSearchesArray.push(cityName);
    localStorage.setItem("recentSearches", JSON.stringify(recentSearchesArray));
  }
}

//invoke displayWeatherReport function when the search button is clicked
const searchButton = document.querySelector("#search-button");
searchButton.addEventListener("click", displayWeatherReport);

//invoke displayWeatherReport function when the recent searches search button is clicked
const recentSearchesButton = document.querySelector("#recent-searches-button");
recentSearchesButton.addEventListener("click", displayWeatherReport);

//This function is invoked when either of the search buttons are clicked
async function displayWeatherReport(event) {
  event.preventDefault();

  var cityName = undefined;

  if (
    //if the search button is clicked on but there is no user input value, return (to prevent further execution of function)
    //otherwise assign the value to cityInput and invoke sanitizeUserInput
    event.target === searchButton ||
    event.target === searchButton.firstElementChild
  ) {
    var cityInput = document.querySelector("#city-input").value;
    if (!cityInput) {
      return;
    }
    cityName = sanitizeUserInput(cityInput);
  } else if (
    //if the recent searches search button is clicked on but no option is selected, return (to prevent further execution of function)
    //otherwise assign the value to cityInput and invoke sanitizeUserInput
    event.target === recentSearchesButton ||
    event.target === recentSearchesButton.firstElementChild
  ) {
    var dropdownMenu = document.getElementById("recent-dropdown");
    if (dropdownMenu.length <= 1) {
      return;
    }
    var selectedIndex = dropdownMenu.selectedIndex;
    cityInput = document.getElementsByTagName("option")[selectedIndex].value;
    cityName = sanitizeUserInput(cityInput);
  }

  //gets the city coordinates
  var locationData = await getCityLocation(cityName);
  var lat = locationData.coord.lat;
  var lon = locationData.coord.lon;

  //gets the current weather and forecast data
  var weatherForecast = await getWeatherForecast(lat, lon);

  //Display city name on page
  document.querySelector("#city-name").textContent = cityName.toUpperCase();

  //get current weather out of the weatherForecast object and pass to "colourUVIndex" function
  var currentWeatherData = weatherForecast.current;
  colourUVIndex(currentWeatherData);

  //get date from unix value
  var currentDate = getDate(currentWeatherData);

  //these are the values that are required for the current weather card
  weatherDataItems = [
    currentDate,
    currentWeatherData.temp,
    currentWeatherData.humidity,
    currentWeatherData.wind_speed,
    currentWeatherData.uvi,
  ];

  //make a collection containing each of the spans inside the list items that need to be populated with the weather data
  currentWeatherTextSpans = document.querySelector("#current-weather-list")
    .children;

  //populate current weather data
  for (let i = 0; i < currentWeatherTextSpans.length; i++) {
    const currentWeatherListItem = currentWeatherTextSpans[i].firstElementChild;
    currentWeatherListItem.textContent = weatherDataItems[i];
  }

  //Display 5 day forecast
  const weeklyForecast = weatherForecast.daily;

  //populate icons
  getIcons(weeklyForecast);

  for (let i = 1; i < 6; i++) {
    const forecastData = weeklyForecast[i];

    //get daily forecast date from unix value
    var dailyForecastDate = getDate(forecastData);

    weatherDataItems = [
      dailyForecastDate,
      forecastData.temp.day,
      forecastData.humidity,
      forecastData.wind_speed,
    ];

    const dailyWeatherTextSpans = document.querySelector(`#day-${i}`).children;
    for (let i = 0; i < dailyWeatherTextSpans.length; i++) {
      const dailyWeatherListItem = dailyWeatherTextSpans[i].firstElementChild;
      dailyWeatherListItem.textContent = weatherDataItems[i];
    }
  }
}

//retrieves the city name entered by the user and sanitises it (make it lowercase as per API requirement, and get rid of any leading/trailing whitespace)
function sanitizeUserInput(cityInput) {
  cityInput = cityInput.toLowerCase().trim();
  return cityInput;
}

//retrieve the geographical coordinates of the city (lat/lon)
async function getCityLocation(cityName) {
  var locationQueryURL =
    "https://api.openweathermap.org/data/2.5/weather?q=" +
    cityName +
    "&appid=" +
    openWeatherKey;

  const cityLocationResponse = await fetch(locationQueryURL);

  //update recent search dropdown IF valid results are fetched
  updateRecentSearches(cityLocationResponse, cityName);

  //parse the city location data that's returned
  return await cityLocationResponse.json();
}

//get the weather forecast based on city latitude & longitude
async function getWeatherForecast(lat, lon) {
  var forecastQueryURL =
    "https://api.openweathermap.org/data/2.5/onecall?lat=" +
    lat +
    "&lon=" +
    lon +
    "&exclude=minutely,hourly,alerts&units=metric&appid=" +
    openWeatherKey;

  const weatherForecastResponse = await fetch(forecastQueryURL);
  return await weatherForecastResponse.json();
}

//updates recent search dropdown IF valid results are fetched
function updateRecentSearches(cityLocationResponse, cityName) {
  if (
    cityLocationResponse.status === 404 ||
    cityLocationResponse.status === 400
  ) {
    window.alert(
      "Location not found. Please ensure you are entering a valid location with correct spelling, and try again."
    );
  } else {
    //if user inputs valid data, then add to recent searches and repopulate dropdown
    recentSearchesArray = getRecentSearches();
    storeRecentSearches(cityName);
    populateRecentSearchesDropdown();
  }
}

//set the background colour of the uv index span based on risk level
function colourUVIndex(currentWeatherData) {
  var uvi = document.querySelector("#uv-index");
  if (currentWeatherData.uvi <= 2) {
    uvi.style.backgroundColor = "#ABF6B0";
  } else if (currentWeatherData.uvi <= 5) {
    uvi.style.backgroundColor = "#FFEC5C";
  } else if (currentWeatherData.uvi <= 7) {
    uvi.style.backgroundColor = "#FFB133";
  } else if (currentWeatherData.uvi <= 10) {
    uvi.style.backgroundColor = "#FF5C5C";
  } else if (currentWeatherData.uvi >= 11) {
    uvi.style.backgroundColor = "#DABBF2";
  }
}

//array to use for date conversion
const monthsArray = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

//convert the date from unix format to a readable format
function getDate(weatherData) {
  const rawDate = new Date(weatherData.dt * 1000);
  const currentDateValue = rawDate.getDate();
  const currentMonthAsIndex = rawDate.getMonth();
  const currentMonthValue = monthsArray[currentMonthAsIndex];
  const currentYear = rawDate.getFullYear();
  const convertedDate =
    `${currentDateValue} ` + `${currentMonthValue} ` + `${currentYear}`;
  return convertedDate;
}

//display the weather icons on the page
function getIcons(weatherData) {
  for (let i = 0; i < 6; i++) {
    weatherIcon = weatherData[i].weather[0].icon;
    iconElement = document.querySelector(`#icon-${i}`);
    iconElement.src =
      "http://openweathermap.org/img/wn/" + weatherIcon + "@2x.png";
  }
}
