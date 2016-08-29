//import lib
var MongoClient = require('mongodb').MongoClient;//connect db
var assert = require('assert');
var request = require('request');//download data
var express = require('express');//build api
var later = require('later');//set timer
var cookieParser = require('cookie-parser');//cookies
var bodyParser = require('body-parser');

//url
var mongoWeatherCityUrl = 'mongodb://oreo3:oreo3@ds013486.mlab.com:13486/weather_city';
var mongoWeatherUrl = 'mongodb://oreo2:oreo2@ds013456.mlab.com:13456/weather';
var mongoUser = 'mongodb://oreo4:oreo4@ds017736.mlab.com:17736/user';

var app = express();
//http://jonathanmh.com/how-to-enable-cors-in-express-js-node-js/
app.use(function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});
//check cookies (http://code.runnable.com/UTlPPF-f2W1TAAET/how-to-use-cookies-in-express-for-node-js)
app.use(cookieParser());
//use jqwidgget
app.use('/jqwidgets', express.static(__dirname + '/node_modules/jqwidgets-framework/'));
//parse application/x-www-form-urlencoded(http://stackoverflow.com/questions/27485735/nodejs-req-body-undefined-in-post-with-express-4-9-0)
app.use(bodyParser.urlencoded({ extended: true }));
// parse application/json
app.use(bodyParser.json());

var timerTask = {schedules : [{m:[10,30,50] }]};

var post = process.env.PORT || 3000;
app.listen(post,function(err){
    if(err){
        console.error(err)
    }else{
        console.log('App is ready at :'+post)
        //later.setInterval(sphinxWeather,timerTask);
        //later.date.localTime();
    }
});

app.get("/",function (req, res) {
    if (req.cookies.remember) {
        console.log(req.cookies.remember);
        console.log("permission:"+req.cookies.remember.per);
        if(req.cookies.remember.per=="A"){
        console.log("permission:"+req.cookies.remember.per);
            res.sendfile('index.html');
        }else if(req.cookies.remember.per=="C"){
        console.log("permission:"+req.cookies.remember.per);
            res.sendfile('clientPage.html');
        }
    }
    else{
        res.sendfile('login.html');
    }
});
app.get("/index",function (req, res) {
    res.redirect('/');
});
//output city weather json list

app.get("/weather/:city/:sort",function (req, res) {
    MongoClient.connect(mongoWeatherUrl, function(err, db) {
        assert.equal(null, err);
        var city = req.params.city;
        var dtsort = -1;
        if(req.params.sort=="asc"){
            dtsort = 1;
        }
        //var count = "a";
        //var result ;
        if(!isEmpty(city)){
            console.log("city search:"+city);
            db.collection('weather').find({"res.name":city}).sort({"res.dt":dtsort}).toArray(function(err,items){
              if(err){
                console.log("error");
                res.send("{result:none,message:error}");
              }else{
                //console.log(items);
                res.send(items);
              }
            });
            return;
        }
    });
});

app.get("/weather",function (req, res) {
    MongoClient.connect(mongoWeatherUrl, function(err, db) {
        assert.equal(null, err);
        db.collection('weather').find().sort({"res.dt":-1}).toArray(function(err,items){
              if(err){
                console.log("error");
                res.send("{result:none,message:error}");
              }else{
                //console.log(items);
                res.send(items);
              }
            });
            return;
    });
});
// get one data
app.get("/currentWeather/:city",function(req, res) {
    var cityname = req.params.city;
    MongoClient.connect(mongoWeatherUrl, function(err, db) {
        assert.equal(null, err);
        db.collection('weather').find({"res.name":cityname}).sort({"res.dt":-1}).limit(1).toArray(function(err,items){
            if(err){
                console.log("error");
                res.josn({ result:"error",message:"error" });
            }else if(items==null){
                res.send({result:"none",message:"user not find"});
            }else{
                items["result"]="success";//add into json
                
                res.send(items);
                //res.redirect("/");
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

app.get("/login/:email/:password",function (req, res) {
    var email = req.params.email;
    var pwd = req.params.password;
    MongoClient.connect(mongoUser, function(err, db) {
        assert.equal(null, err);
        db.collection('user').findOne({"user.email":email,"user.pwd":pwd},{"user.pwd":0},function(err,items){
            if(err){
                console.log("error");
                //req(err);
                res.josn({ result:"error",message:"error" });
            }else if(items==null){
                res.send({result:"none",message:"user not find"});
            }else{
                items["result"]="success";//add into json
                //console.log(items);
                var minute = 60 * 1000 * 10;//10min
                res.cookie('remember', {"email":email,"per":items["user"].per}, { maxAge: minute });
                
                res.send(items);
                //res.redirect("/");
            }
        });
    });
    
});
app.get("/register",function (req, res) {
    res.sendfile('Register.html');
});
app.post("/register",function (req, res) {
    var user = req.body.txtfirstname+" "+ req.body.txtlastname;
    var pwd = req.body.password;
    var email = req.body.usermail;
    
    var currentdate = new Date();
    var date = currentdate.getDate() + "/"+ (currentdate.getMonth()+1)  + "/" + currentdate.getFullYear();
    var time = currentdate.getHours() + ":"  + currentdate.getMinutes() + ":" + currentdate.getSeconds();
    MongoClient.connect(mongoUser, function(err, db) {
        assert.equal(null, err);
        db.collection('user').insertOne({
            "user" :{
                "name":user,
                "pwd" : pwd,
                "email" :email,
                "per" :"C",
                "reg_current_data":date,
                "reg_current_time":time
            }},
        function(err, result) {
            assert.equal(err, null);
            console.log("Insert User: "+ user +" into user database");
            db.close();
            //res.json({ result:"insert user: " +user+" finish"});
            
            res.send('your account is created,check <a href="/index"> here </a> go to login');
        });
        
    });
    //res.send("Register :"+user+","+pwd+","+email);
    
    
});
app.get('/logout',function(req, res) {
   res.clearCookie('remember');
   res.redirect('/');
});
//method
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
            //url: "http://api.openweathermap.org/data/2.5/weather?q="+city+"&appid=31538fe27dd36887159b09eb67838b37",
            
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
                    db.collection('weather').insertOne({res},
                        function(err, result) {
                            assert.equal(err, null);
                            console.log("Insert City "+city+" database");
                            db.close();
                    });
                });
            }
    });
}


//for testing the function
exports.dbconnect = function(callback){
    MongoClient.connect(mongoWeatherCityUrl, function(err, db) {
        assert.equal(null, err);
        db.collection('city').find().toArray(function(err,items){
          if(err){
            callback("connect error");
          }else{
            callback("connected");
          }
        });
    });
    
}
exports.getCityWeather = function(city,callback){
    request({
            //url: "http://api.openweathermap.org/data/2.5/weather?q="+city+"&appid=31538fe27dd36887159b09eb67838b37&units=metric",
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
                //console.log(res) // Print the json response
        console.log(city+ ' data get ----------------------------------------')
        callback(res);
    }
});
}

//checking tool
function isInt(value) {
    return !isNaN(value) && 
         parseInt(Number(value)) == value && 
         !isNaN(parseInt(value, 10));
}
function isEmpty(str){
    return !str.replace(/^\s+/g, '').length; // boolean (`true` if field is empty)
}
