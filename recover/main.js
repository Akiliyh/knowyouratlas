"use strict"

window.addEventListener('DOMContentLoaded', (event) => {

    /* Rive animations */

    /*let riveInfoAnims = document.querySelectorAll(".canvas");
    for (let riveInfoAnim of riveInfoAnims){
        console.log('lmao')
        riveInfoAnim.classList.add('info')
        new rive.Rive({
            src: "/mb/img/loading_kya.riv",
            canvas: document.querySelector(".info"),
            autoplay: true,
            fit: rive.Fit.cover,
            antialiasing: true,
        });
        riveInfoAnim.classList.remove('info')
    }*/

    



let countryCode = 'OOO';
let lon = 0;
let lat = 0;
let pitch = 0;
let bearing = 0;
let zoom = 9;
let originalPointCoords = [];
let guessLon = 0;
let guessLat = 0;
let NMTZMode = false;
let easyMode = false;
let game = document.querySelector('.game');


let playBtn = document.querySelector('.play-btn');
playBtn.addEventListener('click', displayGameModes);

function displayGameModes(e) {
    let home = document.querySelector('.home');
    home.remove();
    let gameModes = document.querySelector('.game-modes');
    gameModes.style.display = "block";
    let normalBtn = document.querySelector('.normal-btn');
    let nmtzBtn = document.querySelector('.nmtz-btn');
    let easyBtn = document.querySelector('.easy-btn');
    normalBtn.addEventListener('click', e => {
        zoom = 10;
    })
    nmtzBtn.addEventListener('click', e => {
        zoom = 13;
        NMTZMode = true;
    })
    easyBtn.addEventListener('click', e => {
        zoom = 9;
        easyMode = true;
    })
    normalBtn.addEventListener('click', playGame);
    easyBtn.addEventListener('click', playGame);
    nmtzBtn.addEventListener('click', playGame);
}

function playGame(e) {
    let preloader = document.querySelector('.preloader');
    preloader.style.visibility = 'visible';
    let gameModes = document.querySelector('.game-modes');
    gameModes.remove();

mapboxgl.accessToken = 'pk.eyJ1IjoiYWtpbGl5aCIsImEiOiJja2RzdHgyaTAwdXl3MnBsaXJreXVvOXUwIn0.6TuTIZ-EC67QJO-s6saNeA';

let guessBtn = document.querySelector('.guess');
let distanceDiv = document.querySelector('.distance');
let distanceSection = document.querySelector('.distanceSection');
let pointDiv = document.querySelector('.points');
let pointBar = document.querySelector('.pointBar');
let nextBtn = document.querySelector('.next');

const map = new mapboxgl.Map({
    container: 'map', // container ID
    style: 'mapbox://styles/akiliyh/cl9oektre002814vqobxlbexz', // style URL
    center: [lon, lat], // starting position [lng, lat]
    zoom: zoom, // starting zoom
    projection: 'mercator', // display the map as a 3D globe
    pitch: 0,
    bearing: 0
});

if (easyMode == true) {
    map.setStyle('mapbox://styles/akiliyh/cl9pdy42q00ns15l3f0kz8o46');
}

const guessMap = new mapboxgl.Map({
    container: 'guessMap', // container ID
    style: 'mapbox://styles/akiliyh/cl95rzm2v002j14qtctkjkslt', // style URL
    center: [0, 0], // starting position [lng, lat]
    zoom: 2, // starting zoom
    projection: 'mercator' // display the map as a 3D globe
});


map.addControl(new mapboxgl.NavigationControl());
guessMap.dragRotate.disable();


changeLoc();


/*setInterval(function () {
    guessMap.resize();
}, 10);*/



guessMap.on('click', (e) => {
    console.log(e.lngLat);
    console.log(e.point);

    function guessPointLoc() {
        return {
            'type': 'Point',
            'coordinates': [e.lngLat.lng, e.lngLat.lat]
        };
    }

    if (guessMap.getSource('point') != undefined) {
        console.log(guessMap.getSource('point').setData(guessPointLoc()));
    } else {
        console.log(e.lngLat);
        console.log(e.lngLat.lng);
        guessMap.addSource('point', {
            'type': 'geojson',
            'data': {
                'type': 'Point',
                'coordinates': [e.lngLat.lng, e.lngLat.lat]
            }
        });
        guessMap.addLayer({
            'id': 'point',
            'source': 'point',
            'type': 'circle',
            'paint': {
                'circle-radius': 10,
                'circle-color': '#0D3C5D',
                'circle-opacity': 0.65,
                'circle-stroke-color': '#000023',
                'circle-stroke-width': 2,
            }
        });
    }
    guessLon = e.lngLat.lng;
    guessLat = e.lngLat.lat;
    guessBtn.style.display = 'block';
})

let changeLocBtn = document.querySelector('.change');
changeLocBtn.addEventListener('click', changeLoc);
let resetLocBtn = document.querySelector('.reset');
resetLocBtn.addEventListener('click', resetLoc);
let guessDiv = document.querySelector('.guessDiv');
let guessMapContainer = document.querySelector('.guessDiv .mapboxgl-canvas-container.mapboxgl-interactive');
guessMapContainer.style.cursor = 'crosshair';

guessMap.on('mousedown', (e) => {
    guessMapContainer.style.cursor = 'grabbing';
})

guessMap.on('mouseup', (e) => {
    guessMapContainer.style.cursor = 'crosshair';
})

document.onkeyup = function(e) {
if (e.ctrlKey && e.which == 81) {
    map.setMinZoom([1]);
}
  };

guessBtn.addEventListener('click', (e) => {

    /*map.setStyle('mapbox://styles/akiliyh/cl9pdy42q00ns15l3f0kz8o46');*/ // Style load poses problème, coupure + réafficher point de départ 
    /*map.on('style.load', e =>{*/
        map.setMinZoom([1]);
    distanceSection.style.display = 'block';
    nextBtn.style.display = 'block';
    guessDiv.style.display = 'none';
    guessBtn.style.display = 'none';
    map.addSource('guessPoint', {
        'type': 'geojson',
        'data': {
            'type': 'Point',
            'coordinates': [guessLon, guessLat]
        }
    });
    map.addLayer({
        'id': 'guessPoint',
        'source': 'guessPoint',
        'type': 'circle',
        'paint': {
            'circle-radius': 10,
            'circle-color': '#0D3C5D',
            'circle-stroke-color': '#000023',
            'circle-stroke-width': 2,
        }
    });
    map.addSource('route', {
        'type': 'geojson',
        'data': {
            'type': 'Feature',
            'properties': {},
            'geometry': {
                'type': 'LineString',
                'coordinates': [
                    [guessLon, guessLat],
                    [lon, lat]
                ]
            }
        }
    });
    map.addLayer({
        'id': 'route',
        'type': 'line',
        'source': 'route',
        'layout': {
            'line-join': 'round',
            'line-cap': 'round'
        },
        'paint': {
            'line-color': 'white',
            'line-width': 7,
        }
    });
    map.addSource('countries', { // problème fait apparaitre les frontières sur la mer. Faire apparaitre labels + enlever frontières sur zoom low
        type: 'vector',
        url: 'mapbox://mapbox.country-boundaries-v1'
        });

        /*map.addLayer(
            {
            'id': 'countries-join',
            'type': 'line',
            'source': 'countries',
            'source-layer': 'country_boundaries',
            'layout': {
                'line-join': 'round',
                'line-cap': 'round'
            },
            'paint': {
                'line-color': 'rgb(187, 187, 187)',
                'line-width': 1,
            }
        }, 'route'
            );*/
            map.addLayer(
                {
                'id': 'correct-country',
                'type': 'fill',
                'source': 'countries',
                'source-layer': 'country_boundaries',
                'paint': {
                    'fill-color': '#28FF43',
                    'fill-opacity': 0.4,
                  },
            }, 'route'
            );
            map.setFilter('correct-country', [
                "in",
                "iso_3166_1_alpha_3",
                countryCode
              ]);
    var featureRoute = map.getSource('route')._options.data;
    console.log(featureRoute);
    var line = turf.lineString([
        [guessLon, guessLat],
        [lon, lat]
    ]);
    let distance = turf.length(line);
    if (distancePoints < 100) {
        pointBar.classList.add('perfect');
    }
    distance = distance * 1000;
    var distancePoints = Math.trunc(distance);
    if (distance >= 1000) {
        distance = (Math.round(distance / 1000 * 100) / 100) +
            ' ' + 'km';
        distancePoints = (Math.round(distancePoints / 1000 * 100) / 100);
        console.log((Math.exp(-distancePoints / 2000)));
        distancePoints = Math.round(distancePoints);
        pointBar.value = 1000 * Math.exp(-(distancePoints / 2000));
        console.log(distance);
        console.log(distancePoints);
    } else {
        distance = Math.round(distance) +
            ' ' + 'm';
        console.log(distance);
        console.log(distancePoints);
        pointBar.value = 1000;
    }
    distanceDiv.innerHTML = distance;
    if (Math.round(pointBar.value) == 1) {
        pointDiv.innerHTML = Math.round(pointBar.value) + ' pt';
    } else {
        pointDiv.innerHTML = Math.round(pointBar.value) + ' pts';
    }
    const bounds = new mapboxgl.LngLatBounds(
        [guessLon, guessLat],
        [lon, lat]
    );
    if (NMTZMode == true) {
        map.scrollZoom.enable();
        map.dragRotate.enable();
        map.dragPan.enable();
        map.touchZoomRotate.enableRotation();
    }

    // Extend the 'LngLatBounds' to include every coordinate in the bounds result.
    bounds.extend([guessLon, guessLat]);
    bounds.extend([lon, lat]);
    map.fitBounds(bounds, {
        padding: 200,
        bearing: 0,
        pitch: 0,
        duration: 4000
    });
    /*})*/
    
});

nextBtn.addEventListener('click', (e) => {
    map.removeLayer('guessPoint');
    map.removeSource('guessPoint');
    map.removeLayer('route');
    map.removeSource('route');
    distanceSection.style.display = 'none';
    nextBtn.style.display = 'none';
    guessDiv.style.display = 'block';
    changeLoc();
});


function randomIntFromInterval(min, max) { // min and max included 
    return Math.floor(Math.random() * (max - min + 1) + min);
}

function changeLoc(e) {
    console.clear();
    function isInsideCountry(data) {
        if (map.getSource('countriesIn') != undefined && map.getLayer('countriesIn') != undefined) {
            map.removeLayer('countriesIn');
            map.removeSource('countriesIn');
        }
        if (map.getSource('countries') != undefined && map.getLayer('correct-country') != undefined) {
            map.removeLayer('correct-country');
            map.removeSource('countries');
        }
        for (let i = 0; i < data.features.length; i++) {
            console.log(data.features.length);
            console.log(data.features[i].geometry.coordinates);
            console.log(data.features[i].geometry.coordinates[0]);
            console.log(data.features[i].geometry.coordinates.length);
            console.log(data.features[i].geometry.type);
            for (let a = 0; a < data.features[i].geometry.coordinates.length; a++) {
                var pt = turf.point([lon, lat]);
                if (data.features[i].geometry.type == 'MultiPolygon') {
                    var poly = turf.multiPolygon([
                        data.features[i].geometry.coordinates[a]
                    ]);
                } else {
                    var poly = turf.polygon([
                        data.features[i].geometry.coordinates[a]
                    ]);
                }
                countryCode = data.features[i].properties.A3; 
                console.log(countryCode + ' ' + turf.booleanPointInPolygon(pt, poly));
                if (turf.booleanPointInPolygon(pt, poly) == true) { // if location valid
                    const options = {
                        method: 'GET',
                        headers: {
                            'X-RapidAPI-Key': 'f507eef2f3msh3819d09ed0f7144p146249jsndccd8323abac',
                            'X-RapidAPI-Host': 'wft-geo-db.p.rapidapi.com'
                        }
                    };
                    let latAPI = lat;
                    let lonAPI = lon;
                    if (latAPI > 0) {
                        latAPI = '%2B' + latAPI
                    }
                    if (lonAPI > 0) {
                        lonAPI = '%2B' + lonAPI
                    }

                    fetch('https://wft-geo-db.p.rapidapi.com/v1/geo/cities?location='+ latAPI + lonAPI + '&minPopulation=5000', options)
                        .then(response => response.json())
                        .then(response => console.log(response.data[0]))
                        .catch(err => console.error(err));
                
                    
                    map.addSource('point', {
                        'type': 'geojson',
                        'data': pointLoc(0)
                    });
                    map.addLayer({
                        'id': 'point',
                        'source': 'point',
                        'type': 'circle',
                        'paint': {
                            'circle-radius': 10,
                            'circle-color': '#28FF43',
                            'circle-stroke-color': '#000023',
                            'circle-stroke-width': 2,
                        }
                    });
                    var el = document.createElement('div');
                    el.innerHTML = "Guess this location";
                    var chevron = document.createElementNS("http://www.w3.org/2000/svg", "svg");
                    var svgNS = chevron.namespaceURI;
                    var path = document.createElementNS(svgNS,'path');
                    chevron.setAttribute('xmlns', "http://www.w3.org/2000/svg");
                    chevron.setAttribute('viewBox', "0 0 448 512");
                    chevron.setAttribute('class', "chevron");
                    path.setAttribute('d',"M201.4 374.6c12.5 12.5 32.8 12.5 45.3 0l160-160c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0L224 306.7 86.6 169.4c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3l160 160z");
                    path.setAttribute('fill',"white");

                    chevron.appendChild(path);
                    // let chevron = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512"><!--! Font Awesome Pro 6.2.1 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license (Commercial License) Copyright 2022 Fonticons, Inc. --><path d="M201.4 374.6c12.5 12.5 32.8 12.5 45.3 0l160-160c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0L224 306.7 86.6 169.4c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3l160 160z"/></svg>';
                    el.append(chevron);
                el.className = 'marker';
                new mapboxgl.Marker(el)
                .setLngLat([lon, lat])
                .addTo(map);
                    return
                } if (i == data.features.length-1 && a == data.features[i].geometry.coordinates.length-1 && turf.booleanPointInPolygon(pt, poly) == false) {
                    changeLoc();
                    // recharge la local à chaque fois que le programme détecte que le point est à l'extérieur de chaque pays
                }
                
            }


}
}
fetch('/mb/geojson/map.geojson')
    .then(function (response) {
        return response.json();
    })
    .then(function (data) {
        isInsideCountry(data);
    })



guessMap.setCenter([0, 0]);
guessMap.setZoom([2]);
lon = (Math.random() - 0.5) * 360;
lat = (Math.random() - 0.5) * 100;
console.log(lat + ' ' + lon);
pitch = 0;
bearing = 0;
if (easyMode != true) {
    bearing = randomIntFromInterval(0, 360);
}

pitch = randomIntFromInterval(0, 85);
if (NMTZMode == true) {
    map.scrollZoom.disable();
    map.dragRotate.disable();
    map.dragPan.disable();
    map.touchZoomRotate.disableRotation();
}
function pointLoc() {
    return {
        'type': 'Point',
        'coordinates': [lon, lat]
    };
}

map.setCenter([lon, lat]);
map.setPitch(pitch);
map.setBearing(bearing);
map.setZoom(zoom);
map.setMinZoom(zoom-1);

if (map.getSource('point') != undefined) {
    console.log(map.getSource('point').setData(pointLoc()));
}
if (guessMap.getSource('point') != undefined && guessMap.getLayer('point') != undefined) {
    guessMap.removeLayer('point');
    guessMap.removeSource('point');
}
map.once('idle', (e) => {
    game.style.visibility = 'visible';
    preloader.style.visibility = 'hidden';
    const elevation = map.queryTerrainElevation([lon, lat]);
    console.log(elevation);
    if (elevation <= 0) {
        changeLoc();
    }
});
}

function resetLoc(e) {
    map.easeTo({
        center: [lon, lat],
        zoom: zoom,
        pitch: pitch,
        bearing: bearing,
        duration: 4000
    });
}
}

});