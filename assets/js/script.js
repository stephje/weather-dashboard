const openWeatherKey = "d8b9c9f29acf75b9bc89cdc565bacf19"

//event listener for the location search button
var searchButton = document.querySelector("#search-button");
searchButton.addEventListener("click", getWeatherData);

function getWeatherData(event) {
    //prevent default behaviour of form submission
    event.preventDefault();
    
    //function getCityName retrieves the user input and sanitises it
    cityName = getCityName();
    
    //this URL will be used to get the latitude and longitude of the relevant location
    var locationQueryURL = ("https://api.openweathermap.org/data/2.5/weather?q=" + cityName + "&appid=" + openWeatherKey)

    // fetch(queryURL)
    // .then(response => response.json())
    // .then (data => console.log(data))
    
    //fetch the data
    fetch(locationQueryURL)
    .then(
        function getResponse(response){
            if (response.status === 404) {
                window.alert("Location not found. Please ensure you are entering a valid location with correct spelling, and try again.");
            } else {
                return response.json();
            } 
        })
    .then(
        function getLocationData(locationData){
            //TEST DELETE LATER
            console.log(locationData);
            var lat = locationData.coord.lat;
            var lon = locationData.coord.lon;
            
            //TEST DELETE LATER
            console.log(lat, lon)
            
            //this URL will be used to get the weather forecast data for the relevant location
            var forecastQueryURL = ("https://api.openweathermap.org/data/2.5/onecall?lat=" + lat + "&lon=" + lon + "&exclude=minutely,hourly,alerts&appid=" + openWeatherKey);

            fetch(forecastQueryURL)
            .then(response => response.json())
            .then(forecastData =>  console.log(forecastData))

            //DO SOMETHING WITH THE OUTPUT HERE

        })

}

//get user input from city search
function getCityName(){
    var cityInput = document.querySelector("#city-input").value;
    //sanitise input (make it lowercase as per API requirement, and get rid of any leading/trailing whitespace)
    cityInput = (cityInput.toLowerCase()).trim();
    return cityInput;
}