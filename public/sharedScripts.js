// create headers & request options for eBird api fetch
let myHeaders = new Headers();
let ebirdapitoken;
let requestOptions = {};
requestOptions.method = 'GET';
requestOptions.redirect = 'follow';
myHeaders.append("X-eBirdApiToken", '');

// valid user key input
async function validateKey() {
    // get key input and place in header
    ebirdapitoken = document.getElementById('apiKey').value;
    myHeaders.set("X-eBirdApiToken", ebirdapitoken);
    requestOptions.headers = myHeaders;

    try {
        const testFetch = await loadCounties();
    } catch (error) {
        alert('Please enter a valid key');
        document.getElementById('keyValidationStatus').innerHTML = 'Key rejected';
        document.getElementById('keyValidationStatus').style.color = 'rgba(211, 0, 0, 1)';
        return false;
    }
    document.getElementById('apiKey').style.color = 'rgba(0, 134, 20, 1)';
    document.getElementById('keyValidationStatus').innerHTML = 'Key accepted';
    document.getElementById('keyValidationStatus').style.color = 'rgba(0, 211, 32, 1)';
}

function validateInput(userInput) {
    var validation_regex = /[\d!#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]+/;
    if (validation_regex.test(userInput)) {
        alert("Please enter characters A-Z");
        return true;
    };
}


// load county IDs and names
function loadCounties() {
    return fetch('https://api.ebird.org/v2/ref/region/list/subnational2/US-MD',
        requestOptions)
    .then((response) => response.json());
}

// load hotspots
function loadHotspots() {
    return fetch(`https://api.ebird.org/v2/ref/hotspot/US-MD?fmt=json`, requestOptions)
    .then((response) => response.json());
}

// grab div for county checkbox search results
const countyCheckboxes = document.getElementById('countyCheckboxes');
const hotspotCheckboxes = document.getElementById('hotspotCheckboxes');

// remove unticked checkboxes
function saveTicks(locType) {
    let searchResults;
    let checkboxes;
    // get search results 
    if (locType == 'county') {
        searchResults = countyCheckboxes.children;
        checkboxes = document.getElementById('countyCheckboxes');
    } 
    else if (locType == 'hotspot') {
        searchResults = hotspotCheckboxes.children;
        checkboxes = document.getElementById('hotspotCheckboxes');
    }

    // array to hold unchecked boxes 
    const removeCheckbox = [];

    // loop through search results 
    for (let result = 0; result < searchResults.length; result++) {
        const checkbox = searchResults[result];
        // if box not ticked 
        if (checkbox.nodeName == 'INPUT' & checkbox.checked == false) {
            // add boxes and labels to array 
            removeCheckbox.push(checkbox);
            removeCheckbox.push(searchResults[result+1])
        }
    }
    // remove boxes and labels in array from checkbox div 
    for (let box=0; box < removeCheckbox.length; box++) {
        checkboxes.removeChild(removeCheckbox[box]);
    }
}

// initialize variables to hold IDs and names for counties/hotspots
let counties;
let hotspots;

// populate county search results
async function populateSearch(locType) { // change loc to loctype
    let locInput = '';
    // get user search input
    if (locType == 'county') {
        locInput = document.getElementById('filterCounty').value;
    }
    else if (locType == 'hotspot') {
        locInput = document.getElementById('filterHotspot').value;
        if (locInput.length < 3) {
            alert('Please enter at least 3 characters');
            return false;
        }
    }
    
    // validate user input
    const validation = validateInput(locInput);
    if (validation) {
        return false;
    }

    // load data by location type
    if (locType == 'county') {
        // load counties if user hasn't searched yet
        if (countyCheckboxes.hasChildNodes() == false) {
            counties = await loadCounties();
        }
    }
    if (locType == 'hotspot') {
        // load hotspots if user hasn't searched yet
        if (hotspotCheckboxes.hasChildNodes() == false) {
            hotspots = await loadHotspots();
            console.log(hotspots.length)
        }
    }
    
    // remove unticked boxes before next search */
    if (countyCheckboxes.hasChildNodes() == true & locType == 'county') {
        saveTicks('county');
    }
    else if (hotspotCheckboxes.hasChildNodes() == true & locType == 'hotspot') {
        saveTicks('hotspot');
    }

    if (locType == 'county') {
        counties.forEach(county => {
            createCheckboxes(county, locInput, 'county');
        })
        countyCheckboxes.style.visibility = 'visible';
    }
    else {
        hotspots.forEach(hotspot => {
            createCheckboxes(hotspot, locInput, 'hotspot');
        })
        hotspotCheckboxes.style.visibility = 'visible';
    }
}

function createCheckboxes(loc, locInput, locType) {
    let name = '';
    let id = '';
    if (locType == 'county') {
        name = 'name';
        id = 'code';
    }
    else {
        name = 'locName';
        id = 'locId';
    }

    // convert search results and user input to lowercase
    const locInputLower = locInput.toLowerCase();
    const locLowercase = loc[name].toLowerCase();
    const locID = loc[id]; 

    // check if location matches user input and isn't already ticked 
    if (locLowercase.includes(locInputLower) &
        document.getElementById(locID) == null) {
        // create checkbox 
        const newCheckbox = document.createElement('input');
        newCheckbox.type = 'checkbox';
        newCheckbox.value = loc[name]; 
        newCheckbox.id = loc[id]; 
      
        // create label 
        const newLabel = document.createElement('label');
        newLabel.innerHTML = newCheckbox.value;
        newLabel.appendChild(newCheckbox);

        // add checkbox and label to search results 
        if (locType == 'county') {
            countyCheckboxes.appendChild(newCheckbox); 
            countyCheckboxes.appendChild(newLabel); 
        }
        else {
            hotspotCheckboxes.appendChild(newCheckbox); 
            hotspotCheckboxes.appendChild(newLabel); 
        }
    }
}