"use strict"

mapboxgl.accessToken = 'pk.eyJ1IjoiYWtpbGl5aCIsImEiOiJja2RzdHgyaTAwdXl3MnBsaXJreXVvOXUwIn0.6TuTIZ-EC67QJO-s6saNeA';

let lon = 0;
let lat = 0;
let pitch = 0;
let bearing = 0;
let zoom = 9;
let originalPointCoords = [];
let guessLon = 0;
let guessLat = 0;
let guessBtn = document.querySelector('.guess');
let distanceDiv = document.querySelector('.distance');
let distanceSection = document.querySelector('.distanceSection');
let pointDiv = document.querySelector('.points');
let pointBar = document.querySelector('.pointBar');
let nextBtn = document.querySelector('.next');

const map = new mapboxgl.Map({
    container: 'map', // container ID
    style: 'mapbox://styles/akiliyh/cl9pdy42q00ns15l3f0kz8o46', // style URL
    center: [lon, lat], // starting position [lng, lat]
    zoom: zoom, // starting zoom
    projection: 'mercator', // display the map as a 3D globe
    pitch: 60,
    bearing: 60
});

const guessMap = new mapboxgl.Map({
    container: 'guessMap', // container ID
    style: 'mapbox://styles/akiliyh/cl95rzm2v002j14qtctkjkslt', // style URL
    center: [0, 0], // starting position [lng, lat]
    zoom: 2, // starting zoom
    projection: 'mercator' // display the map as a 3D globe
});

map.on('style.load', () => {
    map.setFog({}); // Set the default atmosphere style
});
guessMap.on('style.load', () => {
    guessMap.setFog({}); // Set the default atmosphere style
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
                'circle-color': '#007cbf',
                'circle-stroke-color': 'black',
                'circle-stroke-width': 1,
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

guessBtn.addEventListener('click', (e) => {
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
            'circle-color': '#007cbf',
            'circle-stroke-color': 'black',
            'circle-stroke-width': 1,
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
    pointDiv.innerHTML = Math.round(pointBar.value) + ' pts';
    const bounds = new mapboxgl.LngLatBounds(
        [guessLon, guessLat],
        [lon, lat]
    );

    // Extend the 'LngLatBounds' to include every coordinate in the bounds result.
    bounds.extend([guessLon, guessLat]);
    bounds.extend([lon, lat]);

    map.fitBounds(bounds, {
        padding: 200,
        bearing: 0,
        pitch: 0,
        duration: 4000
    });
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

map.on('load', () => {
    map.addSource('countries', {
        type: 'geojson',
        // Use a URL for the value for the `data` property.
        data: '/mb/geojson/map.geojson'
    });

    map.addLayer({
        'id': 'countries-layer',
        'type': 'line',
        'source': 'countries',

    });
});

function changeLoc(e) {
    function isInsideCountry(data) {
        if (map.getSource('countriesIn') != undefined && map.getLayer('countriesIn') != undefined) {
            map.removeLayer('countriesIn');
            map.removeSource('countriesIn');
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
                        /* problème multipolygone seulement du premier array, faire boucle pour chaque truc -_- */
                    ]);
                } else {
                    var poly = turf.polygon([
                        data.features[i].geometry.coordinates[a]
                        /* problème multipolygone seulement du premier array, faire boucle pour chaque truc -_- */
                    ]);
                }

                console.log(data.features[i].properties.A3 + ' ' + turf.booleanPointInPolygon(pt, poly));
                if (turf.booleanPointInPolygon(pt, poly) == true) {
                    map.addSource('countriesIn', {
                        'type': 'geojson',
                        'data': {
                            'type': 'Feature',
                            'geometry': {
                                'type': 'Polygon',
                                'coordinates': 
                                data.features[i].geometry.coordinates[a]
    
                            }
                        }
                    });
                
                map.addLayer({
                'id': 'countriesIn',
                'type': 'line',
                'source': 'countriesIn',
                'paint': {
                    'line-color': 'white',
                    'line-width': 7,
                }
                });
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
pitch = randomIntFromInterval(0, 85);
bearing = randomIntFromInterval(0, 360);

function pointLoc() {
    return {
        'type': 'Point',
        'coordinates': [lon, lat]
    };
}

map.setCenter([lon, lat]);
map.setPitch([pitch]);
map.setBearing([bearing]);
map.setZoom([zoom]);

map.once('load', () => {
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
            'circle-color': 'green',
            'circle-stroke-color': 'black',
            'circle-stroke-width': 1,
        }
    });
});
if (map.getSource('point') != undefined) {
    console.log(map.getSource('point').setData(pointLoc()));
}
if (guessMap.getSource('point') != undefined && guessMap.getLayer('point') != undefined) {
    guessMap.removeLayer('point');
    guessMap.removeSource('point');
}
map.once('idle', (e) => {
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