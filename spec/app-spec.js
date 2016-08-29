var app = require('../app')

app.getCityWeather('Hong Kong', function(data) {
	console.log("check openweathermap download")
	console.log(data)
	console.log("check openweathermap download finish")
	
})
app.dbconnect(function(data){
	console.log("database connect check")
	console.log(data);
})