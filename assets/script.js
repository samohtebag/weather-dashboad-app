// variables
// api key from openweather
var apiKey = "f5134fd76606cba7978d5f2d96351255";
var listCities = [];
var citySearch = $("#enter-city");
var searchButton = $("#enter-city-btn");
var historicalData = $("#clear-data");
var clearButton = $("#clear-data-btn");
var currentWeather = $("#current-weather");
var currentCity = $("#current-city");
var tempCheck = $("#temperature");
var humidityCheck = $("#humidity");
var windSpeedCheck = $("#wind-speed");
var weatherIcon = $('#icon')
var uvIndex = $('#uv-index');
var cities = JSON.parse(localStorage.getItem("cities")) || [];

$(document).ready(function () {

    // checks search history when loading web app
    getHistoricalData();

    // fetching weather API
    function todaysWeather(city) {
    var weatherLink = "https://api.openweathermap.org/data/2.5/weather?q=" + city + "&appid=" + apiKey + "&units=imperial"
    
    //fetches url from above, reruns if response is bad
    fetch(weatherLink)
        .then(function (response){
            if (!response.ok) {
                throw response.json();
            }
            return response.json();
        })
        // pulls in lat and lon data and sends to the 5 day forecast function below. data functions pulled from oneweather api docs
        .then(function(data){
            weekForecast(data.coord.lat, data.coord.lon);
            currentCity.text(data.name + " ");
            var cityTemp = Math.round(data.main.temp)
            tempCheck.text(cityTemp);
            humidityCheck.text(data.main.humidity + "%");
            windSpeedCheck.text(data.wind.speed + " MPH");
            //grabs image and puts to the icon from openweather
            weatherIcon.attr("src", "http://openweathermap.org/img/wn/" + data.weather[0].icon + ".png");
        })
    };

    // 5 day forecast API function. pulled Lat and lon functions from onecall API
    function weekForecast (lat, lon) {
        var oneCallLink = "https://api.openweathermap.org/data/2.5/onecall?lat=" + lat + "&lon=" + lon + "&units=imperial&appid=" + apiKey;
        // fetch url within function, same as earlier, reruns if response is bad
        fetch(oneCallLink)
            .then(function (response){
                if (!response.ok) {
                    throw response.json();
                }
                return response.json();
            })
            
            .then(function(data){

                uvIndex.text(data.current.uvi)
            // })

                //Changes UV badge color based on UV Index number
                if (data.current.uvi <= 4) {
                    uvIndex.addClass('badge badge-success');
                }
                else if (data.current.uvi > 4 && data.current.uvi <= 7) {
                    uvIndex.removeClass('badge badge-success');
                    uvIndex.addClass('badge badge-warning');
                }
                else {
                    uvIndex.removeClass('badge badge-success');
                    uvIndex.removeClass('badge badge-warning');
                    uvIndex.addClass('badge badge-danger');
                }
            
                $('#5day-forecast').empty();
                
                // creating the cards displaying weekly forecast
                for (let i = 1; i <= 5; i++) {
            
                //adds a date to each card displayed
                var date = new Date(data.daily[i].dt * 1000);
                var formatDate = moment(date).format('L');
                var forecastDateString = formatDate
            
                //weekly forecast variables, declared within scope
                var weekForecast = $('#5day-forecast');
                var forecastCard1 = $("<div class='col-12 col-md-6 col-lg forecast-day mb-3'>");
                var forecastCard2 = $("<div class='card text-white bg-primary'>");
                var cardBody = $("<div class='card-body'>");
                var weatherDate = $("<h5 class='card-title'>");
                var weatherIcon = $("<img>");
                var weatherTemp = $("<p class='card-text mb-0'>");
                var weatherHumidity = $("<p class='card-text mb-0'>");
            
                //adds info to each card from api
                weatherDate.text(forecastDateString);
                weatherIcon.attr("src", "http://openweathermap.org/img/wn/" + data.daily[i].weather[0].icon + ".png");
                weatherTemp.text("Temp: " + data.daily[i].temp.day + String.fromCharCode(8457));
                weatherHumidity.text("Humidity: " + data.daily[i].humidity + "%");

                //create each card --> Adding Each Cards Content to the DOM
                weekForecast.append(forecastCard1);
                forecastCard1.append(forecastCard2);
                forecastCard2.append(cardBody);
                cardBody.append(weatherDate);
                cardBody.append(weatherIcon);
                cardBody.append(weatherTemp);
                cardBody.append(weatherHumidity);
            
            
                // // displays no more than 5 cards
                // if (i === 5)
                // break;       
            }

       });
    }
        //click search button, grabs value and sends text to currentWeather variable, historicalData variable, then clears search bar
        searchButton.on('click', function () {
            var input = citySearch.val().trim();
            todaysWeather(input);
            getHistoricalData(input);
            citySearch.val("");
        });

        $('#form-search').on('submit', function () {        
            var input = citySearch.val().trim()
            todaysWeather(input);
            getHistoricalData(input);
            citySearch.val("");
        });

        //Search history 
        function searchHistory(input) {

            // Check to see what we have in local storage
            var history = localStorage.getItem("cities");
            console.log(history);
            // If nothing is in local storage --> Create our dataset
            if(history) {
                localStorage.setItem("cities", "[]");
            } else {
                var parsedData = JSON.parse(history);

                // If we have data (ARRAY) then loop through and create element, add data or classes, add/append to the DOM

                // If we have new data --> push that new data on to the ARRAY

                // Convert the ARRAY (dataset to JSON) JSON.stringify()

                // Then we can save the JSON dataset into Local Storage
            }
    
        if(input){
            if(listCities.indexOf(input) === -1){
                listCities.push(input)
                cityArray();
            }
            else {
                var removeIndex = listCities.indexOf(input);
                listCities.splice(removeIndex, 1);
                listCities.push(input);
                cityArray();
            }
        }
    }

    function cityArray() {

        historicalData.empty();

        listCities.forEach(function(city){
            var searchHistoryItem = $('<li type="button" class="list-group-item btn btn-warning btn-sm" id="city-btn">');
            searchHistoryItem.attr("data-value", city);
            searchHistoryItem.text(city);
            historicalData.prepend(searchHistoryItem);
            searchHistoryItem.on('click', function () {
                var input = searchHistoryItem.text()
        
                todaysWeather(input);
                getHistoricalData(input);
            });
        });

        //saves whatever is input to local storage
        localStorage.setItem("cities", JSON.stringify(listCities));
    }

    function getHistoricalData() {
        if (localStorage.getItem("cities")) {
            listCities = JSON.parse(localStorage.getItem("cities"));
            var lastIndex = listCities.length - 1;
        
            cityArray();

            if (listCities.length !== 0) {
                todaysWeather(listCities[lastIndex]);
            }
        }
    }

    $("#clear-data-btn").on("click", function () {
        localStorage.clear();
        listCities = [];
        cityArray();
    });
});



