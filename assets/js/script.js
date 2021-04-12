const openWeatherKey = "d8b9c9f29acf75b9bc89cdc565bacf19"

var searchButton = document.querySelector("#search-button");

searchButton.addEventListener("click", getCityName);

function getCityName(event) {
    event.preventDefault();
    var cityName = document.querySelector("#city-input").value;
    return cityName;
}

// var requestUrl = ("https://api.openweathermap.org/data/2.5/weather?q=" + cityName + "&appid=" + openWeatherKey)

// function getLocationData(requestUrl) {
//     fetch(requestUrl)
//       .then(function (response) {
//         console.log(response);
//         // if (response.status === 200) {
//         //   responseText.textContent = response.status;
//         // }
//         return response.json();
//     })
//     .then(function (data) {
//         console.log(data)
//         var location = {
//             lon: data.coord.lon,
//             lat: data.coord.lat
//         }
//         return location;
//       });
//   }
  
// getLocationData(requestUrl);
// console.log(location);