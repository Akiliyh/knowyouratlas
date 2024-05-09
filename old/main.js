/*document.addEventListener('DOMContentLoaded', initialise);*/
let playBtn = document.querySelector('.play');
playBtn.addEventListener('click', displayModes);
let gameDiv = document.querySelector('.game');
let zoom = 10;
let pointBar;
let pointsArray = [];
let secondsArray = [];
let minutesArray = [];
let hoursArray = [];
let distanceArray = [];
let preloader = document.querySelector('.preloader');

function displayModes(e) {
  let main = document.querySelector('.main');
  main.remove();
  const gameModes = document.createElement('div');
  const beginnerDiv = document.createElement('button');
  const beginnerContent = document.createTextNode('Beginner mode');
  const normalDiv = document.createElement('button');
  const normalContent = document.createTextNode('Normal mode');
  const difficultDiv = document.createElement('button');
  const difficultContent = document.createTextNode('Difficult mode');
  const extremeDiv = document.createElement('button');
  const extremeContent = document.createTextNode('Extreme mode');
  const impossibleDiv = document.createElement('button');
  const impossibleContent = document.createTextNode('Impossible mode');
  beginnerDiv.appendChild(beginnerContent);
  normalDiv.appendChild(normalContent);
  difficultDiv.appendChild(difficultContent);
  extremeDiv.appendChild(extremeContent);
  impossibleDiv.appendChild(impossibleContent);
  gameModes.appendChild(beginnerDiv); 
  gameModes.appendChild(normalDiv); 
  gameModes.appendChild(difficultDiv); 
  gameModes.appendChild(extremeDiv); 
  gameModes.appendChild(impossibleDiv); 
  gameModes.classList.add('game-modes');
  for (const child of gameModes.children) {
    child.addEventListener('click', play);
  }
  document.body.insertBefore(gameModes, gameDiv);
}

function play(e) {
  preloader.style.display = 'block';
  gameDiv.style.display = 'block';
  switch (e.srcElement.innerText) {
    case "Beginner mode":
      zoom = 6;
      break;
      case "Normal mode":
        zoom = 8;
      break;
      case "Difficult mode":
        zoom = 10;
      break;
    case "Extreme mode":
      zoom = 12;
      break;
      case "Impossible mode":
        zoom = 13;
      break;
  
    default:
  }
  let modes = document.querySelector('.game-modes');
modes.remove();
function randomIntFromInterval(min, max) { // min and max included 
  return Math.floor(Math.random() * (max - min + 1) + min);
}

let hour = 0;
let minute = 0;
let second = 0;
let millisecond = 0;
let stopwatch = document.querySelector('.timer');
let guessMapDiv = document.querySelector('.guessMap');
let guessPointCoord = 0;
let originalPointCoord = 0;
let number = 1; /* number of rounds */
let guessBtn = document.querySelector('.guessBtn');
guessBtn.addEventListener('click', getPointCoordinates);
let guessSection = document.querySelector('.guessSection');
let distanceDiv = document.querySelector('.distance');
let numberOfRound = document.querySelector('.numberOfRound');
let resetButton = document.querySelector('.reset');
let newLocationButton = document.querySelector('.new');
let nextLocationButton = document.querySelector('.next');
resetButton.addEventListener('click', centerMap);
newLocationButton.addEventListener('click', newMap);
nextLocationButton.addEventListener('click', nextRound);
nextLocationButton.addEventListener('click', newMap);
document.addEventListener('keydown', getShortcut);
let overDiv = document.querySelector('.over');
let mapDiv = document.querySelector('.map');
let restartBtn = document.querySelector('.restart');
restartBtn.addEventListener('click', restart);
let control;


let cron;

function startTimer() {
  clearInterval(cron);
  cron = setInterval(() => {
    timer();
  }, 10);
  console.log(cron);
}

// régler problème timer qui ne s'update pas quand tu quitte la page, faire en sorte garder time dans local storage when initialisation and compare with time when going back
// mauvaises secondes ?? pour 10 ms on augmente les milli de 15 mais ça semble ok à l'oeil jsp

function resetTimer() {
  hour = 0;
  minute = 0;
  second = 0;
  millisecond = 0;
  document.querySelector('.hour').innerText = '00';
  document.querySelector('.minute').innerText = '00';
  document.querySelector('.second').innerText = '00';
  document.querySelector('.millisecond').innerText = '000';
}

function timer() {
  if ((millisecond += 15) > 1000) {
    millisecond = 0;
    second++;
  }
  if (second == 60) {
    second = 0;
    minute++;
  }
  if (minute == 60) {
    minute = 0;
    hour++;
  }
  document.querySelector('.hour').innerText = returnData(hour);
  document.querySelector('.minute').innerText = returnData(minute);
  document.querySelector('.second').innerText = returnData(second);
  document.querySelector('.millisecond').innerText = returnDataMilli(millisecond);
}

function returnData(input) {
  return input > 9 ? input : `0${input}`
}

function returnDataMilli(input) {
  if (input < 100) {
    input = '0' + input;
  }
  return input > 9 ? input : `0${input}`
}

function getShortcut(e) {
  if (e.key == "r" || e.key == "R") {
    centerMap();
  }
  if (e.key == "n" || e.key == "N") {
    newMap();
  }
}

let lat = randomIntFromInterval(-5500, 8000) / 100;
let lon = randomIntFromInterval(-18000, 18000) / 100;
console.log(lat);
console.log(lon);
let coordPoint = ol.proj.transform([lon, lat], 'EPSG:3857', 'EPSG:4326');
const features = [];
const featuresGuess = [];
let featureLine = [];
features.push(new ol.Feature({
  geometry: new ol.geom.Point(ol.proj.fromLonLat([
    coordPoint[0], coordPoint[1]
  ]))
}));


function scaleControl() {
    control = new ol.control.ScaleLine({
      units: 'metric',
    });
  return control;
}

const vectorSource = new ol.source.Vector({
  features
});

let vectorSourceMap = new ol.source.OSM;

let vectorLayerMap = new ol.layer.Tile({
  useInterimTilesOnError: false,
  /*preload: Infinity,*/
  source: vectorSourceMap,
});

const vectorSourceGuess = new ol.source.Vector({
  featuresGuess
});

const vectorLayer = new ol.layer.Vector({
  source: vectorSource,
  useInterimTilesOnError: false,
  style: new ol.style.Style({
    image: new ol.style.Circle({
      radius: 5,
      fill: new ol.style.Fill({
        color: 'rgba(255, 255, 0, 1)'
      })
    })
  })
});

const vectorLayerGuess = new ol.layer.Vector({
  source: vectorSourceGuess,
  style: new ol.style.Style({
    image: new ol.style.Circle({
      radius: 5,
      fill: new ol.style.Fill({
        color: 'rgba(255, 255, 0, 1)'
      }),
      stroke: new ol.style.Stroke({
        color: 'black',
        width: 2,
      }),
    })
  })
});

const view = new ol.View({
  center: ol.proj.fromLonLat([lon, lat]),
  zoom: zoom,
  minZoom: zoom-1
  /* extent: [0, 0, 2000000, 2000000],*/
  /*maxZoom: 13*/
  /* extent */
});

var map;

map = new ol.Map({
  controls: ol.control.defaults().extend([scaleControl()]),
  target: 'map',
  layers: [
    vectorLayerMap,
    vectorLayer
  ],
  view: view
});


var styleJson = 'https://api.maptiler.com/maps/097a1fd6-9d0f-469a-b6e1-9c916a16e935/style.json?key=Xtd3QlhUPVHeaefJ3nGP';
/*var testMap = new ol.Map({
  target: 'testMap',
  view: new ol.View({
    constrainResolution: true,
    center: ol.proj.fromLonLat([-1.64372, 55.20774]),
    zoom: 3
  })
});
olms.apply(testMap, styleJson);*/

let mouseCoord = 0;
const mousePositionControl = new ol.control.MousePosition({

  coordinateFormat: ol.coordinate.createStringXY(4),
  projection: 'EPSG:4326',
  function () {
    mouseCoord = ol.coordinate,
      console.log(mouseCoord);
  },
  // comment the following two lines to have the mouse position
  // be placed within the map.
  className: 'custom-mouse-position',
  target: document.getElementById('mouse-position'),
});

window.onresize = function()
{
  guessMapDiv.style.height = '200px';
  guessMapDiv.style.width = '30%';
  guessMapDiv.style.transition = '';
  setTimeout(() => {
    guessMapDiv.style.height = '100px';
    guessMapDiv.style.width = '20%';
    guessMapDiv.style.transition = '.5s ease';
  }, 200);


  setInterval( function() { map.updateSize();}, 1);
}

/*ol.control.defaults.defaults().extend([mousePositionControl]), c'est pour avoir la localisation de la souris sur la deuxieme map*/

var guessMap = new ol.Map({
  controls: ol.control.defaults().extend([scaleControl()]),
  target: 'guessMap',
  layers: [
    new ol.layer.Tile({
      source: new ol.source.OSM
    }),
    vectorLayerGuess
  ],
  view: new ol.View({
    center: ol.proj.fromLonLat([0, 0]),
    zoom: 2,
    /*minZoom: 9,*/
    /* extent: [0, 0, 2000000, 2000000],*/
    /*maxZoom: 13*/
    /* extent */
  })
});

var layersToRemove = [];

function centerMap(e) {
  console.log("Long: " + lon + " Lat: " + lat);
  map.getView().setCenter(ol.proj.transform([lon, lat], 'EPSG:4326', 'EPSG:3857'));
}

function nextRound(e) {
  number++;
  if (number < 6) {
  numberOfRound.innerText = number;
  }
  }

function newMap(e) {
  if (pointBar != undefined) {
    pointBar.remove();
  }
  let points = document.querySelector('.points');
  if (points != undefined) {
    points.remove();
  }
  /*view.once("change:resolution", function(e) {
    if (Number.isInteger(e.target.getZoom())) {
      vectorSourceMap.refresh();
      vectorSourceMap = new ol.source.Stamen({
        layer: 'terrain'
      })
      vectorLayer.setSource(vectorSourceMap);
    }
  });*/
  distanceDiv.style.display = 'none';
  nextLocationButton.style.visibility='hidden';
  if (number > 5) {
    mapDiv.style.visibility= 'hidden';
    overDiv.innerHTML = "It's over!";
    let pointsDiv = document.createElement('div');
    pointsDiv.classList.add('points');
    let sum =0;
    let hourSum = 0;
    let minuteSum = 0;
    let secondSum = 0;
    let distanceSum = 0;
    for (const pointValue of pointsArray) {
      sum += pointValue;
    }
    for (let i = 0; i < 5; i++) {
      hourSum += hoursArray[i];
      secondSum += secondsArray[i];
      minuteSum += minutesArray[i];
      distanceSum += distanceArray[i];
    }
    console.log(hourSum);
    console.log(secondSum);
    console.log(distanceSum);
    console.log(distanceArray);
    let distanceSumDiv = document.createElement('div');
    distanceSumDiv.classList.add('distanceResults');
    let distanceSumContent;
    if (distanceSum > 1000) {
      distanceSumContent = document.createTextNode(distanceSum/1000 + " km");
    } else {
      distanceSumContent = document.createTextNode(distanceSum + " m");
    }

    const pointsText = document.createTextNode(sum + " pts");
    distanceSumDiv.appendChild(distanceSumContent);
    gameDiv.insertBefore(distanceSumDiv, overDiv);
    pointsDiv.appendChild(pointsText);
    gameDiv.insertBefore(pointsDiv, overDiv);
  } else {
  map.getLayers().forEach(function (layer) {
    if (layer.get('name') != undefined && layer.get('name') === 'line-vector') {
        layersToRemove.push(layer);
    }
});

var len = layersToRemove.length;
for(var i = 0; i < len; i++) {
    map.removeLayer(layersToRemove[i]);
}
  vectorSource.un('addfeature', addFeatureOriginal);
  guessBtn.style.visibility = 'hidden';
  vectorSourceGuess.clear();
  guessMapDiv.style.visibility = 'hidden';
  guessMapDiv.style.transition = 'none';
  stopwatch.style.visibility = 'hidden';
  mapDiv.style.visibility = 'hidden';
  preloader.style.display = 'block';
  lat = randomIntFromInterval(-5500, 8000) / 100;
  lon = randomIntFromInterval(-18000, 18000) / 100;
  console.log("Long: " + lon + " Lat: " + lat);
  map.getView().setCenter(ol.proj.transform([lon, lat], 'EPSG:4326', 'EPSG:3857'));
  map.on('rendercomplete', renderComplete);
}

const element = document.querySelector('.popup');


function formatCoordinate(coordinate) {
  coordinate = ol.proj.transform(coordinate, 'EPSG:3857', 'EPSG:4326');
  return `
      <table>
        <tbody>
          <tr><th>lon</th><td>${coordinate[0].toFixed(2)}</td></tr>
          <tr><th>lat</th><td>${coordinate[1].toFixed(2)}</td></tr>
        </tbody>
      </table>`;
}

const info = document.querySelector('.info');
map.on('moveend', function () {
  const view = map.getView();
  const center = view.getCenter();
  info.innerHTML = formatCoordinate(center);
});
}
/*map.on('click', function (event) {
});*/

function renderComplete(e) {
  var olLayer = document.querySelector('.ol-layer');
  var olCanvas = olLayer.querySelector('canvas');
  console.log(olCanvas);
  var ctx = olCanvas.getContext('2d');
  const data = ctx.getImageData(olCanvas.width / 2, olCanvas.height / 2, 1, 1).data;
  console.log(data);
  var hex = "#" + ("000000" + rgbToHex(data[0], data[1], data[2])).slice(-6);
  console.log(hex);
  if (hex == '#99b3cc' || hex == '#2e2115' || hex == '#1d2731' || hex == '#aad3df') { // water color, text color or background or not loaded
    newMap();
  } else {
    guessMapDiv.style.visibility = 'visible';
    guessMapDiv.style.height = '100px';
    guessMapDiv.style.width = '20%';
      setTimeout(() => {
        guessMapDiv.style.transition = '.5s ease';
      }, 200);
    view.setZoom(zoom);
    view.setMinZoom(zoom-1);
    vectorSource.on('addfeature', addFeatureOriginal);
    guessSection.style.display = 'block';
    guessMap.getView().setCenter(ol.proj.transform([0, 0], 'EPSG:4326', 'EPSG:3857'));
    guessMap.getView().setZoom(2);
    const features = [];
    features.push(new ol.Feature({
      geometry: new ol.geom.Point(ol.proj.fromLonLat([
        lon, lat
      ]))
    }));
    console.log(features);
    vectorSource.clear();
    vectorSource.addFeatures(features);
    /*map.removeLayer(vectorLayer);*/
    const vectorLayer = new ol.layer.Vector({
      source: vectorSource,
      style: new ol.style.Style({
        image: new ol.style.Circle({
          radius: 5,
          fill: new ol.style.Fill({
            color: 'rgba(67, 164, 72, 1)'
          }),
          stroke: new ol.style.Stroke({
            color: 'black',
            width: 2,
          }),
        })
      })
    });
    map.addLayer(vectorLayer);
    resetTimer();
    map.un('rendercomplete', renderComplete);
    preloader.style.display = 'none';
    mapDiv.style.visibility = 'visible';
    stopwatch.style.visibility = 'visible';
    startTimer();
  }
}

map.on('rendercomplete', renderComplete);

guessMap.on('click', guessPoint);

guessMap.on("pointermove", function (evt) {
  if (evt.dragging) return;
      this.getTargetElement().style.cursor = 'crosshair';
});

map.on('pointerdrag', function(evt) {
  this.getTargetElement().style.cursor = "move";
});

map.on('pointerup', function(evt) {
  this.getTargetElement().style.cursor = "";
});

guessMap.on('pointerdrag', function(evt) {
  this.getTargetElement().style.cursor = "move";
});

guessMap.on('pointerup', function(evt) {
  this.getTargetElement().style.cursor = "";
});

function guessPoint(e) {

  vectorSource.un('addfeature', addFeatureOriginal);
  guessBtn.style.visibility = 'visible';
  console.log(ol.proj.transform([e.coordinate[0], e.coordinate[1]], 'EPSG:3857', 'EPSG:4326'));
  let coordGuess = ol.proj.transform([e.coordinate[0], e.coordinate[1]], 'EPSG:3857', 'EPSG:4326');
  const featuresGuess = [];
  featuresGuess.push(new ol.Feature({
    geometry: new ol.geom.Point(ol.proj.fromLonLat([
      coordGuess[0], coordGuess[1]
    ]))
  }));
  console.log(featuresGuess)
  vectorSourceGuess.clear();
  vectorSourceGuess.addFeatures(featuresGuess);
  console.log(vectorSourceGuess);
  /* Remove the guessed point that appears on the map after round 1 */
  map.getLayers().forEach(function (layer) {
    if (layer.get('name') != undefined && layer.get('name') === 'guessed-point') {
      map.removeLayer(layer);
    }
});
}

function addFeatureOriginal(e) {
  var feature = e.feature;
  var coords = feature.getGeometry().getCoordinates();
  console.log(coords);
  console.log(ol.proj.transform([coords[0], coords[1]], 'EPSG:3857', 'EPSG:4326'));
  originalPointCoord = ol.proj.transform([coords[0], coords[1]], 'EPSG:3857', 'EPSG:4326');
}

vectorSourceGuess.on('addfeature', function (e) {
  var feature = e.feature;
  var coords = feature.getGeometry().getCoordinates();
  console.log(coords);
  console.log(ol.proj.transform([coords[0], coords[1]], 'EPSG:3857', 'EPSG:4326'));
  guessPointCoord = ol.proj.transform([coords[0], coords[1]], 'EPSG:3857', 'EPSG:4326');
});

function getPointCoordinates(e) {
  pointBar = document.createElement('progress');
  const points = document.createElement('div');
  points.classList.add('points');
  gameDiv.insertBefore(pointBar, nextLocationButton);
  gameDiv.insertBefore(points, pointBar);
  pointBar.max = 1000;
  nextLocationButton.style.visibility='visible';
  view.setMinZoom(1);
  clearInterval(cron);
  guessSection.style.display = 'none';
  console.log(guessPointCoord);
  console.log(originalPointCoord);

  let featuresGuessAnswer = [];
  featuresGuessAnswer.push(new ol.Feature({
    geometry: new ol.geom.Point(ol.proj.fromLonLat([
      guessPointCoord[0], guessPointCoord[1]
    ]))
  }));
  const vectorLayerOriginal = new ol.layer.Vector({
    source: vectorSource,
    style: new ol.style.Style({
      image: new ol.style.Circle({
        radius: 5,
        fill: new ol.style.Fill({
          color: 'rgba(67, 164, 72, 1)'
        }),
        stroke: new ol.style.Stroke({
          color: 'black',
          width: 2,
        }),
      })
    })
  });
  vectorLayerOriginal.setZIndex(2);
  map.addLayer(vectorLayerOriginal);
  vectorSource.addFeatures(featuresGuessAnswer);
  console.log(featuresGuessAnswer);
  const vectorLayerGuessed = new ol.layer.Vector({
    source: vectorSourceGuess,
    style: new ol.style.Style({
      image: new ol.style.Circle({
        radius: 5,
        fill: new ol.style.Fill({
          color: 'rgba(255,255, 0, 1)'
        }),
        stroke: new ol.style.Stroke({
          color: 'black',
          width: 2,
        }),
      })
    })
  });
  vectorLayerGuessed.setZIndex(2);
  vectorLayerGuessed.set('name', 'guessed-point');
  map.addLayer(vectorLayerGuessed);

  var coords = [originalPointCoord, guessPointCoord];
  var lineString = new ol.geom.LineString(coords);
  // transform to EPSG:3857
  lineString.transform('EPSG:4326', 'EPSG:3857');
  // create the feature
  featureLine = new ol.Feature({
      geometry: lineString,
      name: 'Line'
  });

  var lineStyle = new ol.style.Style({
      stroke: new ol.style.Stroke({
          color: '#0D3C5D',
          width: 4
      })
  });

  var lineSource = new ol.source.Vector({
      features: [featureLine]
  });
  var lineVector = new ol.layer.Vector({
      source: lineSource,
      style: [lineStyle]
  });
  lineVector.setZIndex(1);
  lineVector.set('name', 'line-vector');
  map.addLayer(lineVector);
  setTimeout(() => {
    var lineExtent = lineVector.getSource().getExtent();
    console.log(lineExtent);
    map.getView().fit(lineExtent, {
      duration: 1500,
      padding: [60,60, 60, 60],
      size: map.getSize(),
    });
  }, 10);
  console.log(originalPointCoord);
  console.log(guessPointCoord);

  /* Calculate distance between the two points */

  var distance = ol.sphere.getDistance(originalPointCoord,guessPointCoord); 
  var distancePoints = Math.trunc(distance);
  distanceArray.push(distancePoints);
  if (distancePoints < 100) {
    pointBar.classList.add('perfect');
  }
  if (distance >= 1000) {
    distance = (Math.round(distance / 1000 * 100) / 100) +
    ' ' + 'km';
    distancePoints = (Math.round(distancePoints / 1000 * 100) / 100);
    console.log((Math.exp(-distancePoints/2000)));
    distancePoints = Math.round(distancePoints);
    pointBar.value = 1000 * Math.exp(-(distancePoints/2000));
} else {
  distance = Math.round(distance) +
    ' ' + 'm';
  pointBar.value = 1000;
}
  /*const line = new ol.geom.LineString([originalPointCoord, guessPointCoord]);
  const distance2 = ol.sphere.getLength(line); */
  distanceDiv.style.display = 'block';
  distanceDiv.innerHTML = distance;
  let timeTaken = hour*1000 +  minute*100 + second + millisecond/1000;
  pointBar.value = pointBar.value - timeTaken/2;
  console.log(pointsArray);
  pointsArray.push(Math.round(pointBar.value));
  minutesArray.push(minute);
  secondsArray.push(second);
  hoursArray.push(hour);
  console.log(pointsArray);
  console.log(second);
  console.log(minute);
  console.log(timeTaken);
  points.innerHTML = Math.round(pointBar.value) + ' pts';
}

function rgbToHex(r, g, b) {
  if (r > 255 || g > 255 || b > 255)
    throw "Invalid color component";
  return ((r << 16) | (g << 8) | b).toString(16);
}
function restart(e) {
  distanceArray = [];
  pointsArray = [];
  minutesArray = [];
  secondsArray = [];
  mapDiv.style.visibility= 'visible';
  overDiv.innerHTML = "";
  let distanceResults = document.querySelector('.distanceResults');
  if (distanceResults != null) {
    distanceResults.remove();
  }
  number = 1;
  newMap();
  numberOfRound.innerText = number;
}
}