window.addEventListener('mouseover', function(click) {
    if (document.getElementsByClassName('button').contains(click.target) == true) {
        const button = click.target;
        const granimInstance = new Granim({
            element: button,
            name: 'granim',
            opacity: [1, 1],
            states : {
                "default-state": {
                    gradients: [
                        ['#834D9B', '#D04ED6'],
                        ['#1CD8D2', '#93EDC7']
                    ]
                }
            }
            });
    }
});

// create headers & request options for eBird API
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

    // attempt to fetch using key
    try {
        const testFetch = await loadCounties();
    } catch (error) {
        alert('Please enter a valid key');
        document.getElementById('keyValidationStatus').innerHTML = 'Key rejected';
        document.getElementById('keyValidationStatus').style.color = 'rgba(211, 0, 0, 1)';
        return;
    }
    document.getElementById('apiKey').style.color = 'rgba(0, 134, 20, 1)';
    document.getElementById('keyValidationStatus').innerHTML = 'Key accepted';
    document.getElementById('keyValidationStatus').style.color = 'rgba(0, 211, 32, 1)';
}

// load counties
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

// add currently selected counties to array 
let selectCounties = [];
function getSelectedCounties() {
    const tempArray = [];
    // get previous search results
    countySearchResults = countyCheckboxes.children;
    // loop through checkboxes
    for (let countyNum = 0; countyNum < countySearchResults.length; countyNum++) {
        const county = countySearchResults[countyNum];
        // if checkbox is ticked
        if (county.nodeName == 'INPUT' &
            county.checked == true &
            !selectCounties.includes(county.id)) {
                // add county ID to counties array
                selectCounties.push(county.id);
        }
        // if no longer selected
        else if (county.checked == false &
            selectCounties.includes(county.id)) {
                // push to tempArray for removal
                tempArray.push(county.id)
            }
    }
    // remove unselected counties
    selectCounties = selectCounties.filter((e) => !tempArray.includes(e));
}

// grab divs for checkboxes
const countyCheckboxes = document.getElementById('countyCheckboxes');
const hotspotCheckboxes = document.getElementById('hotspotCheckboxes');

// remove unchecked checkboxes and hotspots whose county is selected
function removeUnchecked(locType) {
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

    // update selectedCounties array 
    getSelectedCounties();
    // array to hold unchecked boxes 
    const removeCheckbox = [];

    // loop through search results 
    for (let result = 0; result < searchResults.length; result++) {
        const checkbox = searchResults[result];
        if (checkbox.nodeName == 'INPUT') { 
            const regex = /[\w-]+$/;
            const countyId = checkbox.id.match(regex);
            // add to array if box not checked or if hotspot is in a selected county
            if (checkbox.checked == false || (locType == 'hotspot' & selectCounties.includes(countyId[0]))) {
                // add boxes and labels to array 
                removeCheckbox.push(checkbox);
                removeCheckbox.push(searchResults[result+1])
            }
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

// populate location search results
async function populateSearch(locType) { 
    let locInput = '';
    // get search input
    if (locType == 'county') {
        locInput = document.getElementById('filterCounty').value;
    }
    else if (locType == 'hotspot') {
        locInput = document.getElementById('filterHotspot').value;
        // verify that input is >=5 characters
        inputChar = locInput.replace(' ', '');
        if (inputChar.length < 5) {
            alert('Please enter at least 5 characters');
            return false;
        }
    }
    
    // validate user input
    var validation_regex = /[^\d\w\-'\.\s]+/;
    if (validation_regex.test(locInput)) {
        alert("Please enter allowed characters");
        return;
    }

    // load data by location type
    if (locType == 'county') {
        // load counties if user hasn't searched yet
        if (countyCheckboxes.hasChildNodes() == false) {
            counties = await loadCounties();
        }
    }
    else if (locType == 'hotspot') {
        // load hotspots if user hasn't searched yet
        if (hotspotCheckboxes.hasChildNodes() == false) {
            hotspots = await loadHotspots();
        }
    }
    
    // remove unticked boxes before next search
    if (countyCheckboxes.hasChildNodes() == true) {
            removeUnchecked('county');
        }
    if (hotspotCheckboxes.hasChildNodes() == true) {
            removeUnchecked('hotspot');
        }
    
    // create search result checkboxes
    if (locType == 'county') {
        counties.forEach(county => {
            createCheckbox(county, locInput, 'county');
        })
        if (countyCheckboxes.hasChildNodes()) {
            countyCheckboxes.style.visibility = 'visible';
        }
        else {
            alert(`"${locInput}" returned no results`);
        }
    }
    else {
        hotspots.forEach(hotspot => {
            createCheckbox(hotspot, locInput, 'hotspot');
        })  
        if (hotspotCheckboxes.hasChildNodes()) {
            hotspotCheckboxes.style.visibility = 'visible';
        }
        else {
            alert(`"${locInput}" returned no results, or they were included in the selected counties`);
        }
    }
}

// create checkbox for a location if it matches user input
function createCheckbox(loc, locInput, locType) {
    let name = '';
    let id = '';
    // assign attribute names
    if (locType == 'county') {
        name = 'name';
        id = 'code';
    }
    else {
        name = 'locName';
        id = 'locId';
    }

    // update selectedCounties array
    getSelectedCounties();
    // don't create checkboxes for hotspots whose counties are selected
    if (locType == 'hotspot' & selectCounties.includes(loc['subnational2Code'])) {
        return;
    }

    // create checkbox 
    const newCheckbox = document.createElement('input');
    newCheckbox.type = 'checkbox';
    newCheckbox.value = loc[name]; 
    // combine hotspot id and its county's id- used to check if hotspot is in a selected county
    if (locType == 'hotspot') {
        newCheckbox.id = `${loc[id]},${loc['subnational2Code']}`;   
    }
    else {
        newCheckbox.id = loc[id]; 
    }
    
    // convert search results and user input to lowercase
    const locInputLower = locInput.toLowerCase();
    const locLowercase = loc[name].toLowerCase();
    // if location matches user input and doesn't already exist
    if (locLowercase.includes(locInputLower) &
        document.getElementById(newCheckbox.id) == null) { 
        
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