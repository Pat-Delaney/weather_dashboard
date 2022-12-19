var dashboard = $("#dashboard");
var search_history = $("#search_history");
var search_form = $("#search_form");
var forecast_day = 0;
let history = [];
var search_term = "";
console.log()

window.onload = () => {
if (localStorage.getItem("search_history")){
    history = JSON.parse(localStorage.getItem("search_history"));
    console.log(history);
    for (let i = 0; i < history.length; i++) {
        const element = history[i];
        console.log(element);
        $("#search_history").append('<a role="button" id="'+element+'">'+element.toUpperCase()+'</a><br>');
    }
}
}
$(document).ready(function(){
$("#clear_history").click(function(){
    localStorage.clear();
    $("#search_history").empty();
})
$("#search_history a").click(function(event) {
    console.log(event);
    search_term = $(event.target).attr("id");
    handleEvent();
})

search_form.on("submit", function(event){
    event.preventDefault();
    search_term = $('input[id="searchbar"]').val();
    handleEvent();
})

function handleEvent(){
    //Empty containers
    $("#current_weather").empty();
    $("#future_weather").empty();
    //check if search term exists in history
    if ($('#'+search_term).length === 0) {
        history.push(search_term);
        localStorage.setItem("search_history", JSON.stringify(history));
        $("#search_history").append('<a role="button" id="'+search_term+'">'+search_term.toUpperCase()+'</a><br>');
      }
    if(localStorage.getItem("search_history").includes(search_term)){
        console.log("this in is storage")
      window.localStorage.removeItem(search_term);
    }
    fetch("https://api.openweathermap.org/data/2.5/weather?q="+search_term+"&appid=84e8f1f1e36a7b886ad0a87e4a322b88&units=imperial", {
        method: "GET",
        credentials:"same-origin",
        cache: "reload"
    })
    .then(function (response){
        if (response.status !== 200) {
            $("#current_weather").append('<div id="error" class="col-12 card">Whoops! Looks like something went wrong. Please try searching by city name.</div>');
            window.localStorage.removeItem(search_term);
            return;
          }
        return response.json();
    })
    .then(function (data) {
        console.log(data);
        var iconcode = data.weather[0].icon;
        var iconurl = "http://openweathermap.org/img/w/" + iconcode + ".png";
        $("#current_weather").append('<div id="weather" class="col-12 card weatherinfo"><div class="card-header"><h3 id="date"></h3></div><div class="card-body"><div id="icon"><img class="wicon" src="" alt="Weather icon"></div><p class="card-text weather_desc"></p><p class="card-text temp">Temperature: </p><p class="card-text wind">Wind: </p><p class="card-text humidity">Humidity: </p></div></div>')
        $("#weather .wicon").attr('src', iconurl);
        $("#date").append(dayjs().format("dddd DD MMMM"));
        $("#weather .weather_desc").append(data.weather[0].description.toUpperCase());
        $("#weather .temp").append(data.main.temp);
        $("#weather .wind").append(data.wind.speed + " mph");
        $("#weather .humidity").append(data.main.humidity + "%");

    })

    fetch("https://api.openweathermap.org/data/2.5/forecast?q="+search_term+"&appid=84e8f1f1e36a7b886ad0a87e4a322b88&units=imperial", {
        method: "GET",
        credentials:"same-origin",
        cache: "reload"
    })
    .then(function (response){
        return response.json();
    })
    .then(function (data) {
        console.log(data);
        forecast_day = 0;
        for (let i = 0; i < data.list.length; i++) {
            const hourly_weather = data.list[i];
            var iconcode = hourly_weather.weather[0].icon;
            var iconurl = "http://openweathermap.org/img/w/" + iconcode + ".png";
            if((i + 4) % 8 === 0){
                forecast_day++;
                $("#future_weather").append('<div id="forecast_'+forecast_day+'" class="col-3 card weatherinfo"><div class="card-header"><h3 id="date_'+forecast_day+'"></h3></div><div class="card-body"><div id="icon"><img class="wicon" src="" alt="Weather icon"></div><p class="card-text weather_desc"></p><p class="card-text temp">Temperature: </p><p class="card-text wind">Wind: </p><p class="card-text humidity">Humidity: </p></div></div>')
                $("#forecast_"+forecast_day+" .wicon").attr('src', iconurl);
                $("#date_"+forecast_day).append(dayjs(hourly_weather.dt_txt).format("dddd DD MMMM"));
                $("#forecast_"+forecast_day+" .weather_desc").append(hourly_weather.weather[0].description.toUpperCase());
                $("#forecast_"+forecast_day+" .temp").append(hourly_weather.main.temp);
                $("#forecast_"+forecast_day+" .wind").append(hourly_weather.wind.speed + "mph");
                $("#forecast_"+forecast_day+" .humidity").append(hourly_weather.main.humidity + "%");
            }
        }
      });
}
});