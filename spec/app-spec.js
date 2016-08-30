var app = require('../app')
//check the openweathermap api is work
app.getCityWeather('Hong Kong', function(data) {
	console.log("check openweathermap download")
	console.log(data)
	console.log("check openweathermap download finish")
	
})
//check the mongodb connect is work
app.dbconnect(function(data){
	console.log("database connect check")
	console.log(data);
})