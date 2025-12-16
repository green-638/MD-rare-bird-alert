document.getElementById('countyCheckboxes').style.visibility = 'hidden';
document.getElementById('hotspotCheckboxes').style.visibility = 'hidden';
document.getElementById('dataTable').style.visibility = 'hidden';

const dataSearch = document.getElementById('dataSearchSection');
const dataCredit = document.getElementById('dataCredit');
document.addEventListener('DOMContentLoaded', (event) => {
    anime({
        targets: [dataSearch, dataCredit],
        opacity: [0, 1],
        duration: 800, 
        easing: 'easeInOutQuad', 
        delay: 100,
    });
});

// hide county checkboxes when click elsewhere
window.addEventListener('click', function(click){
    if (document.getElementById('countyCheckboxes').contains(click.target) == false &
    document.getElementById('filterCounty').contains(click.target) == false &
    document.getElementById('filterCountyButton').contains(click.target) == false){
  	    countyCheckboxes.style.visibility = 'hidden';
    }
});

// hide hotspot checkboxes when click elsewhere
window.addEventListener('click', function(click){
    if (document.getElementById('hotspotCheckboxes').contains(click.target) == false &
    document.getElementById('filterHotspot').contains(click.target) == false &
    document.getElementById('filterHotspotButton').contains(click.target) == false) {
        hotspotCheckboxes.style.visibility = 'hidden';
    }
});

// load recent rare bird reports w/ location ID
function loadReports(locationId) {
    return fetch(`https://api.ebird.org/v2/data/obs/${locationId}/recent/notable?detail=full`,
        requestOptions)
    .then((response) => response.json());
}

/* validate start & end date/time
dates must be within last 30 days and end date must be after start date */
function validateSearchDate() {
    const currentDate = new Date();
    let oldDate = new Date();
    // set old date to 30 days ago 
    oldDate.setDate(currentDate.getDate() - 30);

    // get start date and time, create start date object
    let startDate = document.getElementById('startDate').value;
    let startTime = document.getElementById('startTime').value;
    const startDateObj = new Date(`${startDate} ${startTime}`);
    
    // get end date and time, create end date object
    let endDate = document.getElementById('endDate').value;
    let endTime = document.getElementById('endTime').value;
    const endDateObj = new Date(`${endDate} ${endTime}`);

    // date and time validation 
    if (startDateObj.getTime() < oldDate.getTime() |
    startDateObj.getTime() > currentDate.getTime() |
    endDateObj.getTime() < oldDate.getTime() |
    endDateObj.getTime() > currentDate.getTime() |
    startDateObj.getTime() > endDateObj.getTime()) {
        alert(`Please select a date between ${oldDate} and ${currentDate}`);
        return 'alert';
    }
}

// add reports to search results table
async function populateTable() {
    // reset table
    const tableBody = document.getElementById('tableBody');
    if (tableBody.hasChildNodes() == true) {
        while (tableBody.firstChild) {
            tableBody.removeChild(tableBody.firstChild);
        }
    }
    // reset data summary
    const dataSummary = document.getElementById('dataSummary');
    if (dataSummary.hasChildNodes() == true) {
        while (dataSummary.firstChild) {
            dataSummary.removeChild(dataSummary.firstChild);
        }
    }

    // validate date and time 
    const dateValidate = validateSearchDate();
    if (dateValidate == 'alert') {
        document.getElementById('dataTable').style.visibility = 'hidden';
        return false;
    }

    // update selectedCounties array in sharedScripts.js
    getSelectedCounties();

    // store selected hotspots
    const selectHotspots = [];
    // get search results from previous searches
    const hotspotSearchResults = hotspotCheckboxes.children;
    // save search results from previous searches
    for (let result = 0; result < hotspotSearchResults.length; result++) {
        const checkbox = hotspotSearchResults[result];
        // check if checkbox is ticked
        if (checkbox.nodeName == 'INPUT' & checkbox.checked == true) {
            // select hotspot ID & ignore its county ID, 
            hotspotId = checkbox.id.match(/^\w+/)[0];
            selectHotspots.push(hotspotId);
        }
    }

    // verify >=1 location of any type selected 
    if (selectCounties.length == 0 & selectHotspots.length == 0) {
        alert('Please select at least location');
        return false;
    }

    // select date and time 
    const startDate = `${document.getElementById('startDate').value} ${document.getElementById('startTime').value}`;
    const endDate = `${document.getElementById('endDate').value} ${document.getElementById('endTime').value}`;
    
    // variables for data summary
    let checklistCount = 0;
    const speciesCount = {};

    // assign locations to variable for iteration
    let locations;
    if (selectCounties.length > 0) {
        // if selected counties and hotspots
        if (selectHotspots.length > 0) {
            locations = selectCounties.concat(selectHotspots);
        } 
        // if selected only counties
        else {
            locations = selectCounties;
        }
    } 
    // if selected only hotspots
    else {
        locations = selectHotspots;
    }

    // get reports for each location and display results in table
    //iterate through locations         
    for (let loc in locations) {
        // load reports using location
        const reports = await loadReports(locations[loc]);
        reports.forEach(report => {
            // if report date/time meet search criteria
            if (report['obsDt'] >= startDate & report['obsDt'] <= endDate) {
                // new row
                const newRow = document.createElement('tr');
                // species 
                const speciesCol = document.createElement('td');
                speciesCol.innerHTML = report['comName'];
                // species quantity
                const quantityCol = document.createElement('td');
                if (report['howMany'] == undefined) {
                    quantityCol.innerHTML = 'X';
                }
                else {
                    quantityCol.innerHTML = report['howMany'];
                }
                // county 
                const countyCol = document.createElement('td');
                countyCol.innerHTML = report['subnational2Name'];
                // hotspot
                const hotspotCol = document.createElement('td');
                hotspotCol.innerHTML = report['locName'];
                // date
                const dateCol = document.createElement('td');
                dateCol.innerHTML = report['obsDt'].match(/^[\d-]+/);
                // time 
                const timeCol = document.createElement('td');
                timeCol.innerHTML = report['obsDt'].match(/[\d:]+$/);
                // checklist link 
                const linkCol = document.createElement('td');
                const link = document.createElement('a');
                link.innerHTML = 'Link';
                link.href = `https://ebird.org/checklist/${report['subId']}`;
                link.target = '_blank';
                linkCol.appendChild(link);
                
                // loop through rows to find matching rows
                const columns = [speciesCol, quantityCol, countyCol, hotspotCol, dateCol, timeCol, linkCol];
                let match = false;
                for (let rowNum=0; rowNum<tableBody.rows.length; rowNum++) {
                    const row = tableBody.rows[rowNum];
                    // if matching row exists- same species, hotspot, date
                    if (speciesCol.innerHTML == row.cells[0].innerHTML &
                        hotspotCol.innerHTML == row.cells[3].innerHTML &
                        dateCol.innerHTML == row.cells[4].innerHTML) {
                        match = true;
                        // replace matching row with new row
                        if (dateCol.innerHTML > row.cells[4].innerHTML &
                            timeCol.innerHTML > row.cells[5].innerHTML) {
                            row.cells[4].innerHTML = dateCol;
                            row.cells[5].innerHTML = timeCol;
                            row.cells[6].innerHTML = linkCol;
                        }
                    break;
                    }
                }
                // add new row if no match
                if (match == false) {
                    // append columns to new row
                    for (let col=0; col<7; col++) {
                        newRow.appendChild(columns[col]);
                    }
                    tableBody.appendChild(newRow);
                }

                // data summary calculation
                checklistCount += 1;
                // get name of current species
                const species = speciesCol.innerHTML;
                // count number of occurences
                if (speciesCount[species] != null) {
                    speciesCount[species] += 1;
                }
                else {
                    speciesCount[species] = 1;
                }
            }
        });
    }
    if (tableBody.hasChildNodes()) {
        // unhide data table
        document.getElementById('dataTable').style.visibility = 'visible';
        anime({
            targets: document.getElementById('dataTable'),
            opacity: [0, 1],
            duration: 600, 
            easing: 'easeInOutQuad', 
            translateY: '-100px'
        });
    }
    else {
        alert('No checklists met the search criteria');
        return false;
    }
    
    
    // add data summary to page
    const summaryTitle = document.createElement('h2');
    summaryTitle.innerHTML = 'Data summary';
    dataSummary.appendChild(summaryTitle);
    const desc = document.createElement('h3');
    desc.innerHTML = '# of checklists w/ species';
    dataSummary.appendChild(desc);
    const numOfChecklists = document.createElement('p');
    numOfChecklists.innerHTML = `Checklist count: ${checklistCount}`;
    dataSummary.appendChild(numOfChecklists);

    for (species in speciesCount) {
        const numOfSpecies = document.createElement('p');
        numOfSpecies.innerHTML = `${species}: ${speciesCount[species]}`;
        dataSummary.appendChild(numOfSpecies);
    }
    anime({
            targets: dataSummary,
            opacity: [0, 1],
            duration: 600, 
            easing: 'easeInOutQuad', 
            delay: 100,
        });
}