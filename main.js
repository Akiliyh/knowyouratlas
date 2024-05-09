"use strict"

window.addEventListener('DOMContentLoaded', (event) => {

    console.log('%c Hey! 🌎🌍🌏', 'font-size: 16px; color: #91FD9F; font-weight: bold;');
    console.log('%c Pshhht! You can find the coords here:', 'font-size: 16px; color: #91FD9F; font-weight: bold;');
    console.log('%c https://ko-fi.com/gboucher 👁️👁️', 'font-size: 16px; color: #91FD9F; font-weight: bold;');

    // Prevent the player from zooming out the map and cheat

    function preventZoom() {
        document.addEventListener("keydown", e => {
            if (e.ctrlKey && ["61", "107", "173", "109", "187", "189"].includes(e.keyCode)) {
                e.preventDefault();
            }
        });

        document.addEventListener("wheel", e => {
            if (e.ctrlKey) {
                e.preventDefault();
            }
        }, { passive: false });
    }


    preventZoom();

    let inputs;
    let completeTrigger;

    // Fit to the width and align to the top of the canvas
    let layout = new rive.Layout({
        fit: rive.Fit.Contain,
        alignment: rive.Alignment.Center,
    });

    let r = new rive.Rive({
        src: './img/loading_kya.riv',
        canvas: document.getElementById('preloader'),
        autoplay: true,
        layout: layout,
        stateMachines: 'State machine',
        onLoad: () => {
            r.resizeDrawingSurfaceToCanvas();
            inputs = r.stateMachineInputs('State machine');
            completeTrigger = inputs.find(i => i.name === 'isComplete');
            console.log(completeTrigger);
        }
    })

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
    let preloader = document.querySelector('.preloader');
    let container = document.querySelector('.container');
    let hour = 0;
    let minute = 0;
    let second = 0;
    let millisecond = 0;
    let game = 1;
    let stopwatch = document.querySelector('.timer');
    let gameNbEl = document.querySelector('.nbOfRound');
    let cron;
    let playBtn = document.querySelector('.play-btn');
    let guessBtn = document.querySelector('.guess');
    let distanceDiv = document.querySelector('.distance');
    let countryFlag = document.querySelector('.countryFlag');
    let countryName = document.querySelector('.countryName');
    let distanceSection = document.querySelector('.distanceSection');
    let pointDiv = document.querySelector('.points');
    let pointBar = document.querySelector('.pointBar');
    let nextBtn = document.querySelector('.next');
    let resultsBtn = document.querySelector('.resultsBtn');
    let resultsDiv = document.querySelector('.results');
    let gameModes = document.querySelector('.game-modes');
    let gameDiv = document.querySelector('.game');
    let transition = document.querySelector('.transition');
    let burgerMenu = document.querySelector('.menu-burger');
    let closeMenuBtn = document.querySelector('.fa-xmark');
    let currentModeDiv = document.querySelector('.current-mode');
    let guessDivPoints = document.querySelector('.guessDivPoints');
    let currentPointsDiv = document.querySelector('.guessDivPoints .total-points');
    let totalPointsDiv = document.querySelector('.guessDivPoints .max-points');
    let totalPoints = 0;
    let maxPoints = 0;
    let currentMode = 'Normal';
    let menu = document.querySelector('.social-media-burger');
    let pbNormal = document.querySelector('.pb-normal');
    let pbEasy = document.querySelector('.pb-easy');
    let pbNMTZ = document.querySelector('.pb-nmtz');
    let resultsArray = [];
    let resultsTimeString = '';
    let currentCountryData = null;
    let currentCountry = null;
    let currentCountryPoly = null;
    playBtn.addEventListener('click', displayGameModes);
    resultsBtn.addEventListener('click', displayResults);
    burgerMenu.addEventListener('click', displayMenu);
    closeMenuBtn.addEventListener('click', closeMenu);
    /*localStorage.clear();*/

    function displayMenu(e) {
        menu.classList.add('opened');
    }

    function closeMenu(e) {
        menu.classList.remove('opened');
    }

    // Function to store game data in localStorage for a specific game mode
    function storeGameData(score, gameMode, time) {
        // Retrieve existing game data or initialize an empty object if none exists
        let gameData = JSON.parse(localStorage.getItem('gameData')) || {};

        const newData = {
            score: score,
            time: time
        };

        gameData[gameMode] = newData;

        // Store the updated best scores back in localStorage
        localStorage.setItem('gameData', JSON.stringify(gameData));
    }

    // Function to retrieve best score from localStorage for a specific game mode
    function retrieveGameData(gameMode) {
        // Retrieve game data from localStorage
        const gameData = JSON.parse(localStorage.getItem('gameData'));

        // Check if gameData exists and if the gameMode exists within it
        if (gameData && gameData[gameMode]) {
            return gameData[gameMode];
        } else {
            return null; // Return an object with null values if no data found for the specified game mode
        }
    }

    function displayResults(e) {
        let totalSeconds = 0;
        let totalMinutes = 0;
        let totalHours = 0;
        console.log(resultsArray[5].mathTime);

        for (let i = 0; i < 5; i++) {
            totalSeconds += resultsArray[5].mathTime.seconds[i];
            totalMinutes += resultsArray[5].mathTime.minutes[i];
            totalHours += resultsArray[5].mathTime.hours[i];
        }

        // Convert seconds to minutes
        totalMinutes += Math.floor(totalSeconds / 60);
        totalSeconds %= 60;

        // Convert minutes to hours
        totalHours += Math.floor(totalMinutes / 60);
        totalMinutes %= 60;

        let totalPoints = 0;

        for (let i = 0; i < resultsArray[0].points.length; i++) {
            totalPoints += resultsArray[0].points[i];
        }
        const existingData = retrieveGameData(currentMode);
        const existingScore = existingData ? existingData.score : null;
        let isNewPb = false;
        if (existingScore) {
            if (totalPoints > existingScore) {
                // Call storeGameData only if the score is a new personal best
                isNewPb = true;
                storeGameData(totalPoints, currentMode, `${returnData(totalHours)}:${returnData(totalMinutes)}:${returnData(totalSeconds)}`);
            }
        } else {
            isNewPb = true;
            storeGameData(totalPoints, currentMode, `${returnData(totalHours)}:${returnData(totalMinutes)}:${returnData(totalSeconds)}`);
        }

        const currentPB = retrieveGameData(currentMode);
        console.log('Your current PB on ' + currentMode + ' is: ');
        console.log(currentPB);

        document.body.style.overflow = "visible";
        transition.classList.remove('activated');
        container.classList.remove('activated');
        container.style.height = "fit-content";
        document.body.style.height = "unset";
        setTimeout(() => {
            transition.classList.add('activated');
            container.classList.add('activated');
        }, 10);
        gameDiv.remove();
        distanceSection.remove();
        resultsBtn.remove();

        const resultsBox = document.createElement('div');
        resultsBox.classList.add('results-box');
        resultsDiv.appendChild(resultsBox);

        const resultsTitle = document.createElement('h1');
        resultsTitle.classList.add('results-title');

        resultsTitle.innerHTML = 'Results:';
        resultsBox.appendChild(resultsTitle);

        const pb = document.createElement('div');
        pb.classList.add('pb')
        isNewPb ? pb.classList.add('new-record') : pb.classList.add('pb');

        pb.innerHTML = `${isNewPb ? '<i class="fa-solid fa-crown"></i> New PB!' : '<i class="fa-solid fa-crown"></i> Your PB is ' + retrieveGameData(currentMode).score + ' points' }`;
        if (isNewPb) {
            resultsBox.appendChild(pb);
        }

        const resultsTime = document.createElement('div');
        resultsTime.classList.add('resultsTime');

        resultsTime.innerHTML = `Total Time: ${returnData(totalHours)}:${returnData(totalMinutes)}:${returnData(totalSeconds)}`;
        resultsBox.appendChild(resultsTime);

        for (let i = 0; i <= 4; i++) {
            const roundDiv = document.createElement('div');
            roundDiv.classList.add('result-round', `round-${i}`);

            const isCountryCorrectDiv = document.createElement('div');
            isCountryCorrectDiv.classList.add('is-country-correct');
            isCountryCorrectDiv.innerHTML = isCountryCorrectEmoji(resultsArray[3].isCountryCorrect[i]);
            roundDiv.appendChild(isCountryCorrectDiv);

            const timeDiv = document.createElement('div');
            timeDiv.classList.add('time');
            timeDiv.innerHTML = resultsArray[4].time[i];
            roundDiv.appendChild(timeDiv);

            const flagDiv = document.createElement('div');
            flagDiv.classList.add('flag');
            fetchCountryFlags(resultsArray[2].country[i]).then(cca2Code => {
                resultsArray[2].country[i] = cca2Code;
                flagDiv.classList.add('flag-icon-' + cca2Code, 'flag-icon', 'countryFlag');
            });
            roundDiv.appendChild(flagDiv);

            const pointsDiv = document.createElement('div');
            pointsDiv.classList.add('points');
            pointsDiv.innerHTML = resultsArray[0].points[i] + ' Points';
            roundDiv.appendChild(pointsDiv);

            const distanceDiv = document.createElement('div');
            distanceDiv.classList.add('distance');
            distanceDiv.innerHTML = resultsArray[1].distance[i];
            roundDiv.appendChild(distanceDiv);

            resultsBox.appendChild(roundDiv);
        }

        const resultsPoints = document.createElement('div');
        resultsPoints.classList.add('resultsPoints');

        resultsPoints.innerHTML = `Total Points: ${totalPoints}/5000`;
        resultsBox.appendChild(resultsPoints);

        const resultsMode = document.createElement('div');
        resultsMode.classList.add('resultsMode');

        resultsMode.innerHTML = `${currentMode} Mode`;
        resultsBox.appendChild(resultsMode);

        if (!isNewPb) {
            resultsBox.appendChild(pb);
        }

        const anchorElement = document.createElement('a');
        anchorElement.href = './';
        anchorElement.classList.add('btn-container');

        // Create the button element
        const buttonElement = document.createElement('button');
        buttonElement.classList.add('try-again-btn');

        const copyBtnElement = document.createElement('button');

        const iconElement = document.createElement('i');
        iconElement.classList.add('fa-solid', 'fa-clipboard');

        copyBtnElement.classList.add('copy-btn');
        const spanElement = document.createElement('span');
        spanElement.textContent = 'Copy to Clipboard';
        copyBtnElement.appendChild(iconElement);
        copyBtnElement.appendChild(spanElement);

        // Create the h3 element
        const h3Element = document.createElement('h3');
        h3Element.textContent = 'Try again!';

        // Append the h3 element to the button
        buttonElement.appendChild(h3Element);

        // Append the button to the anchor
        anchorElement.appendChild(buttonElement);

        // Create the div with class "buttons"
        const buttonsDiv = document.createElement('div');
        buttonsDiv.classList.add('buttons');

        // Append the anchor to the div
        buttonsDiv.appendChild(copyBtnElement);
        buttonsDiv.appendChild(anchorElement);

        // Append the div to the document body or any other desired parent element
        resultsDiv.appendChild(buttonsDiv);

        function isCountryCorrectEmoji(value) {
            return value ? '✅' : '❌'
        }

        // Copy results

        copyBtnElement.addEventListener('click', async () => {
            const resultText = `🌍 Know Your Atlas (@KnowYourAtlasGame)
        ${currentMode} Mode - ${totalPoints}/5000 - ${new Date().toDateString()}

        ⏱️ Total Time: ${returnData(totalHours)}:${returnData(totalMinutes)}:${returnData(totalSeconds)} ⏱️

        ${isNewPb ? 'New PB!' : 'Your PB is ' + retrieveGameData(currentMode).score}
        
        ${isCountryCorrectEmoji(resultsArray[3].isCountryCorrect[0])} ${cca2ToFlagEmoji(resultsArray[2].country[0])}  ${resultsArray[4].time[0]} | ${resultsArray[1].distance[0]} | ${resultsArray[0].points[0]} Points
        ${isCountryCorrectEmoji(resultsArray[3].isCountryCorrect[1])} ${cca2ToFlagEmoji(resultsArray[2].country[1])}  ${resultsArray[4].time[1]} | ${resultsArray[1].distance[1]} | ${resultsArray[0].points[1]} Points
        ${isCountryCorrectEmoji(resultsArray[3].isCountryCorrect[2])} ${cca2ToFlagEmoji(resultsArray[2].country[2])}  ${resultsArray[4].time[2]} | ${resultsArray[1].distance[2]} | ${resultsArray[0].points[2]} Points
        ${isCountryCorrectEmoji(resultsArray[3].isCountryCorrect[3])} ${cca2ToFlagEmoji(resultsArray[2].country[3])}  ${resultsArray[4].time[3]} | ${resultsArray[1].distance[3]} | ${resultsArray[0].points[3]} Points
        ${isCountryCorrectEmoji(resultsArray[3].isCountryCorrect[4])} ${cca2ToFlagEmoji(resultsArray[2].country[4])}  ${resultsArray[4].time[4]} | ${resultsArray[1].distance[4]} | ${resultsArray[0].points[4]} Points
        
        https://knowyouratlas.com`;

            try {
                // Create a temporary textarea to hold the text to be copied
                const tempTextArea = document.createElement('textarea');
                tempTextArea.value = resultText;
                document.body.appendChild(tempTextArea);

                // Select the text in the textarea
                tempTextArea.select();
                tempTextArea.setSelectionRange(0, 99999); // for mobile devices

                // Copy the selected text to the clipboard
                document.execCommand('copy');

                // Remove the temporary textarea
                document.body.removeChild(tempTextArea);

                // Notify the user that the text has been copied
                spanElement.innerHTML = 'Copied!';
            } catch (error) {
                console.error('Error copying to clipboard:', error.message);
            }
        });
    }

    // Translate cca2 data to emoji name

    function cca2ToFlagEmoji(cca2) {
        return cca2.toUpperCase().replace(/./g, char =>
            String.fromCodePoint(127397 + char.charCodeAt())
        );
    }

    // Get Flag icons

    const fetchCountryFlags = async (code) => {
        const apiUrl = `https://restcountries.com/v3.1/alpha?codes=${code}`;

        try {
            const response = await fetch(apiUrl);

            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }

            const data = await response.json();
            return data[0].cca2.toLowerCase();

            // Process the data as needed
        } catch (error) {
            console.error('Error fetching countries:', error.message);
        }
    };

    function displayGameModes(e) {
        const easyData = retrieveGameData('Easy');
        pbEasy.innerHTML = easyData ? `<i class="fa-solid fa-crown fa-xs"></i><span> ${easyData.score} points in ${easyData.time}</span>` : '';
        easyData ? pbEasy.classList.add('record') : pbEasy.remove();
        const normalData = retrieveGameData('Normal');
        pbNormal.innerHTML = normalData ? `<i class="fa-solid fa-crown fa-xs"></i><span> ${normalData.score} points in ${normalData.time}</span>` : '';

        normalData ? pbNormal.classList.add('record') : pbNormal.remove();
        const nmtzData = retrieveGameData('NMTZ');
        pbNMTZ.innerHTML = nmtzData ? `<i class="fa-solid fa-crown fa-xs"></i><span> ${nmtzData.score} points in ${nmtzData.time}</span>` : '';
        nmtzData ? pbNMTZ.classList.add('record') : pbNMTZ.remove();
        let home = document.querySelector('.home');
        home.remove();
        window.scrollTo(0, 0);
        document.body.style.overflow = "hidden";

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
        container.style.margin = 0;
        NMTZMode ? currentMode = "NMTZ" : easyMode ? currentMode = "Easy" : currentMode = "Normal";
        currentModeDiv.innerHTML = `${currentMode} Mode`
        resultsArray = [{ "points": [] }, { "distance": [] }, { "country": [] }, { "isCountryCorrect": [] }, { "time": [] }, { "mathTime": { "hours": [], "minutes": [], "seconds": [] } }];
        preloader.style.opacity = '1';
        mapboxgl.accessToken = 'pk.eyJ1IjoiYWtpbGl5aCIsImEiOiJja2RzdHgyaTAwdXl3MnBsaXJreXVvOXUwIn0.6TuTIZ-EC67QJO-s6saNeA';

        gameModes.remove();
        gameDiv.style.display = "block";
        gameDiv.style.visibility = "hidden";

        const map = new mapboxgl.Map({
            container: 'map', // container ID
            style: 'mapbox://styles/akiliyh/cl9oektre002814vqobxlbexz', // style URL
            center: [lon, lat], // starting position [lng, lat]
            zoom: zoom, // starting zoom
            projection: 'mercator', // display the map as a 3D globe
            pitch: 0,
            bearing: 0
        });

        if (easyMode === true || NMTZMode === true) {
            map.setStyle('mapbox://styles/akiliyh/cl9pdy42q00ns15l3f0kz8o46');
        }

        const guessMap = new mapboxgl.Map({
            container: 'guessMap', // container ID
            style: 'mapbox://styles/akiliyh/cl95rzm2v002j14qtctkjkslt', // style URL
            center: [0, 0], // starting position [lng, lat]
            zoom: 2, // starting zoom
            projection: 'mercator' // display the map as a 3D globe
        });

        if (!NMTZMode) {
            map.addControl(new mapboxgl.NavigationControl());
        }
        guessMap.dragRotate.disable(); // disable roation on guess map

        changeLoc();

        guessMap.on('click', (e) => {
            console.log(e.lngLat);
            console.log(e.point);

            function guessPointLoc() {
                return {
                    'type': 'Point',
                    'coordinates': [e.lngLat.lng, e.lngLat.lat]
                };
            }

            // Guess points

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
        changeLocBtn?.addEventListener('click', changeLoc);
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

        /* Dev debbug */

        /*document.onkeydown = function (e) {
            if (e.altKey && e.which == 81) {
                map.setMinZoom([1]);
            }
        };*/

        guessBtn.addEventListener('click', (e) => {
            guessDivPoints.classList.add('guessed');
            stopTimer();
            map.setMinZoom([1]);
            distanceSection.style.display = 'block';
            if (game === 5) {
                nextBtn.style.display = 'none';
                resultsBtn.style.display = 'block';
            } else {
                nextBtn.style.display = 'block';
            }
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
            map.addSource('countries', {
                type: 'vector',
                url: 'mapbox://mapbox.country-boundaries-v1'
            });
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
            let featureRoute = map.getSource('route')._options.data;
            console.log(featureRoute);
            console.log(currentCountryData);
            console.log(currentCountry);
            console.log(currentCountryPoly);
            let line = turf.lineString([
                [guessLon, guessLat],
                [lon, lat]
            ]);
            let guessPt = turf.point([guessLon, guessLat]);
            let isInCountry = turf.booleanPointInPolygon(guessPt, currentCountryPoly);
            console.log(isInCountry);
            let distance = turf.length(line);
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
            if (pointBar.value > 999) {
                pointBar.classList.add('perfect');
            } else {
                pointBar.classList.remove('perfect');
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
            maxPoints += 1000;
            totalPointsDiv.innerHTML = maxPoints;
            totalPoints += Math.round(pointBar.value);
            currentPointsDiv.innerHTML = totalPoints;
            resultsArray[0].points.push(Math.round(pointBar.value));
            resultsArray[1].distance.push(distance);
            resultsArray[2].country.push(countryCode);
            resultsArray[3].isCountryCorrect.push(isInCountry);
            resultsArray[4].time.push(returnData(hour) + ':' + returnData(minute) + ':' + returnData(second));
            resultsArray[5].mathTime.hours.push(hour);
            resultsArray[5].mathTime.minutes.push(minute);
            resultsArray[5].mathTime.seconds.push(second);

        });

        nextBtn.addEventListener('click', (e) => {
            resultsDiv.style.display = "block";
            guessDivPoints.classList.remove('guessed');
            guessDiv.style.visibility = "hidden";
            guessDivPoints.style.overflow = "hidden";
            updateGameCount();
            resetTimer();
            completeTrigger.fire();
            gameDiv.style.visibility = "hidden";
            preloader.style.display = 'block';
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
            /*console.clear();*/

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
                    currentCountryData = data.features[i].geometry.coordinates;
                    currentCountry = data.features[i].properties.A3;
                    console.log(data.features.length);
                    console.log(data.features[i].geometry.coordinates);
                    console.log(data.features[i].geometry.coordinates[0]);
                    console.log(data.features[i].geometry.coordinates.length);
                    console.log(data.features[i].geometry.type);
                    for (let a = 0; a < data.features[i].geometry.coordinates.length; a++) {
                        let pt = turf.point([lon, lat]);
                        let poly;
                        if (data.features[i].geometry.type == 'MultiPolygon') {
                            poly = turf.multiPolygon([
                                data.features[i].geometry.coordinates[a]
                            ]);
                        } else {
                            poly = turf.polygon([
                                data.features[i].geometry.coordinates[a]
                            ]);
                        }
                        currentCountryPoly = poly;
                        let isInCountry = turf.booleanPointInPolygon(pt, poly);
                        if (i == data.features.length - 1 && a == data.features[i].geometry.coordinates.length - 1 && isInCountry == false) {
                            changeLoc();
                            // recharge la local à chaque fois que le programme détecte que le point est à l'extérieur de chaque pays
                        }
                        countryCode = data.features[i].properties.A3;
                        /*console.log(countryCode + ' ' + isInCountry);*/
                        if (isInCountry == true) { // if location valid
                            fetchCountries(countryCode);
                            if (map.getSource('point') == undefined && map.getLayer('point') == undefined) {
                                map.on('load', function () {
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
                                });
                            }
                            return
                        }

                    }


                }
            }
            fetch('./geojson/map.geojson')
                .then(function (response) {
                    return response.json();
                })
                .then(function (data) {
                    isInsideCountry(data);
                })

            const fetchCountries = async (countryCode) => {
                const apiUrl = `https://restcountries.com/v3.1/alpha?codes=${countryCode}`;

                try {
                    const response = await fetch(apiUrl);

                    if (!response.ok) {
                        throw new Error(`HTTP error! Status: ${response.status}`);
                    }

                    const data = await response.json();

                    if (data && data.length > 0) {
                        countryName.innerHTML = data[0].name.common;
                        countryFlag.removeAttribute('class');
                        countryFlag.setAttribute('class', 'flag-icon-' + data[0].cca2.toLowerCase() + ' flag-icon countryFlag');
                    } else {
                        console.error('No country data found.');
                    }

                    // Process the data as needed
                } catch (error) {
                    console.error('Error fetching countries:', error.message);
                }
            };



            guessMap.setCenter([0, 0]);
            guessMap.setZoom([2]);
            lon = (Math.random() - 0.5) * 360;
            lat = (Math.random() - 0.5) * 100;
            /*console.log(lat + ' ' + lon);*/ /* Location of the map */
            pitch = 0;
            bearing = 0;
            if (easyMode != true) {
                bearing = randomIntFromInterval(0, 360);
            }

            pitch = randomIntFromInterval(0, 75);
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
            map.setMinZoom(zoom - 1);

            if (map.getSource('point') != undefined) {
                console.log(map.getSource('point').setData(pointLoc()));
            }
            if (guessMap.getSource('point') != undefined && guessMap.getLayer('point') != undefined) {
                guessMap.removeLayer('point');
                guessMap.removeSource('point');
            }
            map.once('idle', (e) => {
                var el = document.createElement('div');
                el.innerHTML = "Guess this location";
                var chevron = document.createElementNS("http://www.w3.org/2000/svg", "svg");
                var svgNS = chevron.namespaceURI;
                var path = document.createElementNS(svgNS, 'path');
                chevron.setAttribute('xmlns', "http://www.w3.org/2000/svg");
                chevron.setAttribute('viewBox', "0 0 448 512");
                chevron.setAttribute('class', "chevron");
                path.setAttribute('d', "M201.4 374.6c12.5 12.5 32.8 12.5 45.3 0l160-160c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0L224 306.7 86.6 169.4c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3l160 160z");
                path.setAttribute('fill', "white");

                chevron.appendChild(path);
                // let chevron = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512"><!--! Font Awesome Pro 6.2.1 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license (Commercial License) Copyright 2022 Fonticons, Inc. --><path d="M201.4 374.6c12.5 12.5 32.8 12.5 45.3 0l160-160c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0L224 306.7 86.6 169.4c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3l160 160z"/></svg>';
                el.append(chevron);
                el.className = 'marker';
                new mapboxgl.Marker(el)
                    .setLngLat([lon, lat])
                    .addTo(map);
                const elevation = map.queryTerrainElevation([lon, lat]);
                console.log(elevation);
                if (elevation <= 0) {
                    changeLoc();
                } else {
                    completeTrigger.fire();
                    setTimeout(() => {
                        preloader.style.display = 'none';
                        gameDiv.style.visibility = "visible";
                        guessDiv.style.visibility = "visible";
                        guessDivPoints.style.overflow = "visible";
                        startTimer();
                    }, 1000);
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

    function updateGameCount() {
        game++;
        gameNbEl.innerHTML = game;
        if (game === 5) {
            console.log(game);
            nextBtn.style.display = "none";
        }
    }

    function startTimer() {
        stopwatch.style.display = 'block';
        clearInterval(cron);
        cron = setInterval(() => {
            timer();
        }, 10);
    }

    function stopTimer() {
        clearInterval(cron);
    }

    // TODO change the timer method to include time spent outside the tab opened

    function resetTimer() {
        stopwatch.style.display = 'none';
        hour = 0;
        minute = 0;
        second = 0;
        millisecond = 0;
        document.querySelector('.hour').innerText = '00';
        document.querySelector('.minute').innerText = '00';
        document.querySelector('.second').innerText = '00';
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
    }

    function returnData(input) {
        return input > 9 ? input : `0${input}`
    }

});
