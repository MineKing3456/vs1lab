/* Dieses Skript wird ausgeführt, wenn der Browser index.html lädt. */

// Befehle werden sequenziell abgearbeitet ...



/**
 * "console.log" schreibt auf die Konsole des Browsers
 * Das Konsolenfenster muss im Browser explizit geöffnet werden.
 */
console.log("The script is going to start...");


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

// Es folgen einige Deklarationen, die aber noch nicht ausgeführt werden ...

// Hier wird die verwendete API für Geolocations gewählt
// Die folgende Deklaration ist ein 'Mockup', das immer funktioniert und eine fixe Position liefert.
GEOLOCATIONAPI = {
    getCurrentPosition: function(onsuccess) {
        onsuccess({
            "coords": {
                "latitude": 49.013790,
                "longitude": 8.390071,
                "altitude": null,
                "accuracy": 39,
                "altitudeAccuracy": null,
                "heading": null,
                "speed": null
            },
            "timestamp": 1540282332239
        });
    }
};

// Die echte API ist diese.
// Falls es damit Probleme gibt, kommentieren Sie die Zeile aus.
GEOLOCATIONAPI = navigator.geolocation;

/**
 * GeoTagApp Locator Modul
 */
var gtaLocator = (function GtaLocator(geoLocationApi) {

    // Private Member

    /**
     * Funktion spricht Geolocation API an.
     * Bei Erfolg Callback 'onsuccess' mit Position.
     * Bei Fehler Callback 'onerror' mit Meldung.
     * Callback Funktionen als Parameter übergeben.
     */
    var tryLocate = function(onsuccess, onerror) {
        if (geoLocationApi) {
            geoLocationApi.getCurrentPosition(onsuccess, function(error) {
                var msg;
                switch (error.code) {
                    case error.PERMISSION_DENIED:
                        msg = "User denied the request for Geolocation.";
                        break;
                    case error.POSITION_UNAVAILABLE:
                        msg = "Location information is unavailable.";
                        break;
                    case error.TIMEOUT:
                        msg = "The request to get user location timed out.";
                        break;
                    case error.UNKNOWN_ERROR:
                        msg = "An unknown error occurred.";
                        break;
                }
                onerror(msg);
            });
        } else {
            onerror("Geolocation is not supported by this browser.");
        }
    };

    // Auslesen Breitengrad aus der Position
    var getLatitude = function(position) {
        return position.coords.latitude;
    };

    // Auslesen Längengrad aus Position
    var getLongitude = function(position) {
        return position.coords.longitude;
    };

    // Hier Google Maps API Key eintragen
    var apiKey = "Bp5xwNqkP2phIv2s0aULAhBLndgbz68H";

    /**
     * Funktion erzeugt eine URL, die auf die Karte verweist.
     * Falls die Karte geladen werden soll, muss oben ein API Key angegeben
     * sein.
     *
     * lat, lon : aktuelle Koordinaten (hier zentriert die Karte)
     * tags : Array mit Geotag Objekten, das auch leer bleiben kann
     * zoom: Zoomfaktor der Karte
     */
    var getLocationMapSrc = function(lat, lon, tags, zoom) {
        zoom = typeof zoom !== 'undefined' ? zoom : 10;

        if (apiKey === "YOUR_API_KEY_HERE") {
            console.log("No API key provided.");
            return "images/mapview.jpg";
        }

        var tagList = "&pois=You," + lat + "," + lon;
        if (tags !== undefined) tags.forEach(function(tag) {
            tagList += "|" + tag.name + "," + tag.latitude + "," + tag.longitude;
        });

        var urlString = "https://www.mapquestapi.com/staticmap/v4/getmap?key=" +
            apiKey + "&size=600,400&zoom=" + zoom + "&center=" + lat + "," + lon + "&" + tagList;

        console.log("Generated Maps Url: " + urlString);
        return urlString;
    };

    return { // Start öffentlicher Teil des Moduls ...

        // Public Member

        readme: "Dieses Objekt enthält 'öffentliche' Teile des Moduls.",

        updateLocation: function() {

            var taglist_json = document.getElementById("result-img").getAttribute("data-tags");
            //alert(taglist_json);
            //alert("Lan:"+document.getElementById("LatitudeSearch").value+" lon:"+document.getElementById("LongitudeSearch").value);


            if (document.getElementById("LatitudeSearch").value != "" && document.getElementById("LongitudeSearch").value != "") {
                //alert("in first if");
                document.getElementById("result-img").src = getLocationMapSrc((document.getElementById("i_Latitude").value
                    ), document.getElementById("i_Longitude").value,
                    JSON.parse(taglist_json), undefined);
            } else {

                //alert("in second else (trylocate)");
                tryLocate(
                    function (position) {
                        document.getElementById("i_Latitude").value = getLatitude(position);
                        document.getElementById("i_Longitude").value = getLongitude(position);
                        document.getElementById("LatitudeSearch").value = getLatitude(position);
                        document.getElementById("LongitudeSearch").value = getLongitude(position);
                        document.getElementById("result-img").src = getLocationMapSrc(
                            getLatitude(position), getLongitude(position), JSON.parse(taglist_json), undefined);
                    },
                    function (msg) {
                        alert(msg);
                    }
                );
            }
        },


            updateTags : function(taglist_json) {
            alert(taglist_json + " in der Funktion update Tags");
            var geotags = JSON.parse(taglist_json);
                document.getElementById("result-img").src = getLocationMapSrc(document.getElementById("i_Latitude").value,
                    document.getElementById("i_Longitude").value, geotags, undefined);

                var results = document.getElementById("results");
                while (results.hasChildNodes()) {
                    results.removeChild(results.firstChild);
                }
                for (var key in geotags) {
                    var li = document.createElement("li");
                    //TODO innerhtml richtig machen;
                    li.innerHTML = geotags[key].name+" ("+geotags[key].latitude+" , "+geotags[key].longitude+") "+geotags[key].hashtag;
                    results.appendChild(li);
                }




        }





    }; // ... Ende öffentlicher Teil
})(GEOLOCATIONAPI);






/**
 * $(function(){...}) wartet, bis die Seite komplett geladen wurde. Dann wird die
 * angegebene Funktion aufgerufen. An dieser Stelle beginnt die eigentliche Arbeit
 * des Skripts.
 */
$(function() {

    document.getElementById("taggingbutton").addEventListener("click",function(event){
        alert("Eventlistener FEUERT at Tagging");
        event.preventDefault();
        var ajax = new XMLHttpRequest();
        ajax.onreadystatechange = function(){
            if(ajax.readyState==4){

                alert(ajax.responseText);

                gtaLocator.updateTags(ajax.responseText);
            }
        }
        ajax.open("POST",'/geotags'
            ,true);
        ajax.setRequestHeader("Content-Type", "application/json");
        ajax.send(JSON.stringify(new GeoTag(document.getElementById("i_Latitude").value,
            document.getElementById("i_Longitude").value,
            document.getElementById("i_Name").value,
            document.getElementById("i_Hashtag").value)))



    });

    document.getElementById("discoverybutton").addEventListener("click",function(event){
        alert("Eventlistener FEUERT at Discovery");
        event.preventDefault();
        var ajax = new XMLHttpRequest();
        ajax.onreadystatechange = function(){
            if(ajax.readyState == 4){

                alert(ajax.responseText);
                gtaLocator.updateTags(ajax.responseText);
            }
        }
        ajax.open("GET", "/geotags?Suche="+document.getElementById("Suche").value, true);

        ajax.send(null);

    })
    //alert("Please change the script 'geotagging.js'");
    gtaLocator.updateLocation();
});