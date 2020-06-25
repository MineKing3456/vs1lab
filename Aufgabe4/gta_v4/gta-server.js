/**
 * Template für Übungsaufgabe VS1lab/Aufgabe3
 * Das Skript soll die Serverseite der gegebenen Client Komponenten im
 * Verzeichnisbaum implementieren. Dazu müssen die TODOs erledigt werden.
 */

/**
 * Definiere Modul Abhängigkeiten und erzeuge Express app.
 */

var http = require('http');
//var path = require('path');
var logger = require('morgan');
var bodyParser = require('body-parser');
var express = require('express');
var url = require("url")


var app;
app = express();

app.use(logger('dev'));
app.use(bodyParser.urlencoded({
    extended: false
}));
app.use(bodyParser.json());


// Setze ejs als View Engine
app.set('view engine', 'ejs');

/**
 * Konfiguriere den Pfad für statische Dateien.
 * Teste das Ergebnis im Browser unter 'http://localhost:3000/'.
 */

   app.set('views', __dirname + '/public/views');
   app.use(express.static(__dirname +"/public"));

/**
 * Konstruktor für GeoTag Objekte.
 * GeoTag Objekte sollen min. alle Felder des 'tag-form' Formulars aufnehmen.
 */

   function GeoTag(latitude,longitude,name,hashtag){
       this.latitude=latitude;
       this.longitude=longitude;
       this.name=name;
       this.hashtag=hashtag;
       console.log('Neues Geo Tag mit den werten' +this.latitude + ' ' + this.longitude + ' ' + this.name + ' '  + this.hashtag + '  erstellt');

       this.toString=function () {
            return this.name+" ("+this.latitude+","+this.longitude+") "+this.hashtag;
       }
}


/**
 * Modul für 'In-Memory'-Speicherung von GeoTags mit folgenden Komponenten:
 * - Array als Speicher für Geo Tags.
 * - Funktion zur Suche von Geo Tags in einem Radius um eine Koordinate.
 * - Funktion zur Suche von Geo Tags nach Suchbegriff.
 * - Funktion zum hinzufügen eines Geo Tags.
 * - Funktion zum Löschen eines Geo Tags.
 */

     var GeoTagModule = (

         function ( ) {
        var GeoTagArray= [];
             function distance(lat1,lon1,lat2,lon2) {
                 var R = 6371; // Radius of the earth in km
                 var dLat = deg2rad(lat2-lat1);  // deg2rad below
                 var dLon = deg2rad(lon2-lon1);
                 var a =
                     Math.sin(dLat/2) * Math.sin(dLat/2) +
                     Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
                     Math.sin(dLon/2) * Math.sin(dLon/2)
                 ;
                 var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
                 var d = R * c; // Distance in km
                 return d;
             }

             function deg2rad(deg) {
                 return deg * (Math.PI/180);
             }

    return {
        overwriteTag:function(latitude,longitude, name, hashtag, id){
            GeoTagArray[id] = new GeoTag(latitude,longitude,name,hashtag);
        }   ,
        addNewTag: function(latitude, longitude, name, hashtag)
             {
                 GeoTagArray.push(new GeoTag(latitude, longitude, name, hashtag));
             },


        searchRadius: function(latitude, longitude, radius) {
                 var resultArray = [];
                 for (var i = 0; i < GeoTagArray.length; i++) {
                     if (distance(latitude, longitude, GeoTagArray[i].latitude, GeoTagArray[i].longitude) <= radius) {
                         resultArray.push(GeoTagArray[i]);
                     }
                 }
                 return resultArray;
             },

             searchName : function(searchterm) {
                 var resultArray = [];

                 for (var i = 0; i < GeoTagArray.length; i++) {
                     if (GeoTagArray[i].name.indexOf(searchterm)!=-1) {
                         resultArray.push(GeoTagArray[i]);
                     } else if (GeoTagArray[i].hashtag.indexOf(searchterm)!=-1) {
                         resultArray.push(GeoTagArray[i]);
                     }
                 }
                 return resultArray;
             },

             remove: function(id) {
                 //resultArray = [];
                 GeoTagArray.splice(id,1);
             },

             getGeoTagArray: function() {
                 return GeoTagArray;
             }


         }





        //GeoTagArray = GeoTagArray + new GeoTag(latitude, longitude, name, hashtag)
})();
/**
 * Route mit Pfad   '/geotags' für HTTP 'Post' Requests
 * enthält im body die Parameter als json string
 * Der JSON String im Body vom REST CLIENT muss folgendermaßen aufgebaut sein:
 * {"latitude":"ZAHL","longitude":"ZAHL","name":"NAME","hashtag":"#HASHTAG"}
  */
app.post('/geotags',function (req,res) {
    console.log("Dies ist der /geotags pfad");
    console.log(req.body);
    GeoTagModule.addNewTag(req.body.latitude, req.body.longitude, req.body.name, req.body.hashtag);
    console.log(GeoTagModule.getGeoTagArray());
    res.status(201);

    res.send(JSON.stringify(GeoTagModule.getGeoTagArray())) ;

})
/**
 * Route mit Pfad geotags und ID für HTTP 'Get' methoden
 */
app.get('/geotags/:id', function(req,res){
    var gesuchtesTag = GeoTagModule.getGeoTagArray()[req.params.id];
    if(gesuchtesTag!== undefined){
    console.log("dies soll der Pfad mit ID sein");

    console.log(gesuchtesTag);
    res.send(JSON.stringify(gesuchtesTag));
    }else{
        res.status(410);
        res.send("This Geotag does not exist");
    }
})
/**
 * Route mit Pfad geotags und ID für HTTP 'PUT' methoden
 * Der JSON String im Body vom REST CLIENT muss folgendermaßen aufgebaut sein:
 * {"latitude":"ZAHL","longitude":"ZAHL","name":"NAME","hashtag":"#HASHTAG"}
 */
app.put('/geotags/:id',function(req,res) {

    var gesuchtesTag = GeoTagModule.getGeoTagArray()[req.params.id];
    if(gesuchtesTag!== undefined) {
        console.log(req.latitude);
        console.log(req.body.latitude + " " +req.body.longitude +" " + req.body.name + " " + req.body.hashtag);
        GeoTagModule.overwriteTag(req.body.latitude, req.body.longitude, req.body.name, req.body.hashtag, req.params.id);

        res.send('updated' + JSON.stringify(gesuchtesTag) + " to " + JSON.stringify(GeoTagModule.getGeoTagArray()[req.params.id]));
    }else{
        res.status(410);
        res.send("This Geotag doesn't exist anymore, try POST without ID instead");
    }
})

/**
 * Route mit Pfad geotags und ID für http 'Delete' methoden
 */
app.delete('/geotags/:id', function(req,res){
    var gesuchtesTag = GeoTagModule.getGeoTagArray()[req.params.id];
    if(gesuchtesTag!== undefined){
    GeoTagModule.remove(req.params.id);
    res.send("deleted");
    }else{
        res.status(410);
        res.send("This Geotag doesn't exist anymore");
    }
})

/**
 * Route mit Pfad '/geotags' für HTTP 'GET' netohoden mit query- parametern
 */
app.get('/geotags', function (req,res) {
    console.log('dies soll der Pfad mit query parametern sein')
    var query = url.parse(req.url, true).query;
    if(query["Suche"] !== undefined){
        console.log(JSON.stringify(GeoTagModule.searchName(query["Suche"])));
        console.log("in if")

        res.send(JSON.stringify(GeoTagModule.searchName(query["Suche"])));


    }else{
        console.log(JSON.stringify(GeoTagModule.getGeoTagArray()));
        console.log("in else")
        res.send(JSON.stringify(GeoTagModule.getGeoTagArray()));
    }
    //res.send( )
}

)

/**
 * Route mit Pfad '/' für HTTP 'GET' Requests.
 * (http://expressjs.com/de/4x/api.html#app.get.method)
 *
 * Requests enthalten keine Parameter
 *
 * Als Response wird das ejs-Template ohne Geo Tag Objekte gerendert.
 */

app.get('/', function(req, res) {
    res.render('gta', {
        taglist: [], latitude:undefined, longitude: undefined, //jsonstring: JSON.stringify([])
    });
});

/**
 * Route mit Pfad '/tagging' für HTTP 'POST' Requests.
 * (http://expressjs.com/de/4x/api.html#app.post.method)
 *
 * Requests enthalten im Body die Felder des 'tag-form' Formulars.
 * (http://expressjs.com/de/4x/api.html#req.body)
 *
 * Mit den Formulardaten wird ein neuer Geo Tag erstellt und gespeichert.
 *
 * Als Response wird das ejs-Template mit Geo Tag Objekten gerendert.
 * Die Objekte liegen in einem Standard Radius um die Koordinate (lat, lon).
 */

   app.post('/tagging', function(req,res){

       //GeoTagModule.addNewTag(89.99,69,"Nord_Pol","#Winter");
       GeoTagModule.addNewTag(req.body.i_Latitude,req.body.i_Longitude,req.body.i_Name,req.body.i_Hashtag);
        console.log(GeoTagModule.getGeoTagArray());
       res.render('gta', {taglist: GeoTagModule.searchRadius(req.body.i_Latitude,req.body.i_Longitude,10),
           latitude:req.body.i_Latitude,longitude:req.body.i_Longitude,// jsonstring : JSON.stringify(
            //   GeoTagModule.searchRadius(req.body.i_Latitude,req.body.i_Longitude,10))
       });
   });



/**
 * Route mit Pfad '/discovery' für HTTP 'POST' Requests.
 * (http://expressjs.com/de/4x/api.html#app.post.method)
 *
 * Requests enthalten im Body die Felder des 'filter-form' Formulars.
 * (http://expressjs.com/de/4x/api.html#req.body)
 *
 * Als Response wird das ejs-Template mit Geo Tag Objekten gerendert.
 * Die Objekte liegen in einem Standard Radius um die Koordinate (lat, lon).
 * Falls 'term' vorhanden ist, wird nach Suchwort gefiltert.
 */

   app.post ('/discovery', function(req,res){
       console.log(GeoTagModule.getGeoTagArray());
       if(req.body.Suche == "") {
           res.render('gta', {taglist: GeoTagModule.searchRadius(req.body.LatitudeSearch,req.body.LongitudeSearch,10),
               latitude:req.body.LatitudeSearch,longitude:req.body.LongitudeSearch, //jsonstring: JSON.stringify(
                  // GeoTagModule.searchRadius(req.body.latitude,req.body.longitude,10))
           });
       }else{
           res.render('gta', {taglist : GeoTagModule.searchName(req.body.Suche),
               latitude: req.body.LatitudeSearch,
               longitude: req.body.LongitudeSearch
               //jsonstring: JSON.stringify(GeoTagModule.searchName(req.body.Suche))

               });

       }

   });
//searchName(filter, searchRadius(latitude, longtitude, radius));

/**{}
 * Setze Port und speichere in Express.
 */

var port = 3000;
app.set('port', port);

/**
 * Erstelle HTTP Server
 */

var server = http.createServer(app);

/**
 * Horche auf dem Port an allen Netzwerk-Interfaces
 */

server.listen(port);
