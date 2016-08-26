//import lib
var MongoClient = require('mongodb').MongoClient;
var assert = require('assert');
var request = require('request');
var express = require('express');
var later = require('later');
//url
var mongoWeatherCityUrl = 'mongodb://oreo3:oreo3@ds013486.mlab.com:13486/weather_city';
var mongoWeatherUrl = 'mongodb://oreo2:oreo2@ds013456.mlab.com:13456/weather';

//create api server
//var app = restify.createServer();
//app.use(restify.fullResponse()).use(restify.bodyParser());
var app = express();


var timerTask = {schedules : [{m:[10,20,30,40,50] }]};

var post = process.env.PORT || 4000;
app.listen(post,function(err){
    if(err){
        console.error(err)
    }else{
        console.log('App is ready at :'+post)
        later.setInterval(sphinxWeather,timerTask);
        //later.date.localTime();
    }
});

app.get("/",function (req, res) {
    res.sendfile('index.html');
});
//output city weather json list
app.get("/weather",function (req, res) {
    MongoClient.connect(mongoWeatherUrl, function(err, db) {
        assert.equal(null, err);
        db.collection('weather').find().toArray(function(err,items){
          if(err){
            console.log("error");
            //req(err);
            res.send("{result:none,message:error}");
          }else{
            console.log(items);
            res.send(items);
          }
        });
    });
});
//output city json list 
app.get("/city",function (req, res) {
    MongoClient.connect(mongoWeatherCityUrl, function(err, db) {
        assert.equal(null, err);
        db.collection('city').find().toArray(function(err,items){
          if(err){
            console.log("error");
            //req(err);
            res.send("{ result:none,message:error }");
          }else{
            console.log(items);
            res.send(items);
          }
        });
    });
});

app.get("/inscity/:city",function (req, res) {
    var cityname = req.params.city;
    var currentdate = new Date();
    var date = currentdate.getDate() + "/"+ (currentdate.getMonth()+1)  + "/" + currentdate.getFullYear();
    var time = currentdate.getHours() + ":"  + currentdate.getMinutes() + ":" + currentdate.getSeconds();
    MongoClient.connect(mongoWeatherCityUrl, function(err, db) {
        assert.equal(null, err);
        db.collection('city').insertOne({
            "city" :{
                "name":cityname,
                "current data":date,
                "current time":time
            }},
        function(err, result) {
            assert.equal(err, null);
            console.log("Insert City "+ cityname +" into  city database");
            db.close();
            res.json({ result:"insert city" +cityname+"finish"});
        });
    });
})



function sphinxWeather(){
  MongoClient.connect(mongoWeatherCityUrl, function(err, db) {
        assert.equal(null, err);
        db.collection('city').find().toArray(function(err,items){
          if(err){
            console.log("error");
          }else{
            for (var i=0; i<items.length; i++){
              console.log(items[i].city.name);
              getCityWeather(items[i].city.name);
            }
          }
        });
    });
  
}

function getCityWeather(city){
        request({
            url: "http://api.openweathermap.org/data/2.5/weather?q="+city+"&appid=31538fe27dd36887159b09eb67838b37",
            json: true
            }, function (error, response, res) {

            if (!error && response.statusCode === 200) {
                var currentdate = new Date(); 
                res['CurrentDateTime'] = currentdate.getDate() + "/"
                    + (currentdate.getMonth()+1)  + "/" 
                    + currentdate.getFullYear() +" "
                    + currentdate.getHours() + ":"  
                    + currentdate.getMinutes() + ":" 
                    + currentdate.getSeconds();
                res['CurrentDate'] = currentdate.getDate() + "/"
                    + (currentdate.getMonth()+1)  + "/" 
                    + currentdate.getFullYear();
                res['CurrentTime'] = currentdate.getHours() + ":"  
                    + currentdate.getMinutes() + ":" 
                    + currentdate.getSeconds();
                console.log(res) // Print the json response
                console.log(city+ ' data get ----------------------------------------')
                MongoClient.connect(mongoWeatherUrl, function(err, db) {
                    assert.equal(null, err);
                    
                    db.collection('weather').insertOne({
                        res},
                        function(err, result) {
                            assert.equal(err, null);
                            console.log("Insert City "+city+" database");
                            db.close();
                    });
                });
            }
    });
}


/*
var findRestaurants = function(db, callback) {
   var cursor =db.collection('weather').find();
   cursor.each(function(err, doc) {
      assert.equal(err, null);
      if (doc != null) {
         console.dir(doc);
      } else {
        callback();
      }
   });
   
};*/