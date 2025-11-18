document.getElementById('countyCheckboxes').style.visibility = 'hidden';
document.getElementById('hotspotCheckboxes').style.visibility = 'hidden';
document.getElementById('dataTable').style.visibility = 'hidden';

// hide data page's county checkboxes when click off 
window.addEventListener('click', function(click){
    if (document.getElementById('countyCheckboxes').contains(click.target) == false &
    document.getElementById('filterCounty').contains(click.target) == false &
    document.getElementById('filterCountyButton').contains(click.target) == false){
  	    countyCheckboxes.style.visibility = 'hidden';
    }
});

window.addEventListener('click', function(click){
    if (document.getElementById('hotspotCheckboxes').contains(click.target) == false &
    document.getElementById('filterHotspot').contains(click.target) == false &
    document.getElementById('filterHotspotButton').contains(click.target) == false) {
        hotspotCheckboxes.style.visibility = 'hidden';
    }
});

// load reports for specified county
// make work with hotspots
function loadReports(county) {
    return fetch(`https://api.ebird.org/v2/data/obs/${county}/recent/notable?detail=full`,
        requestOptions)
    .then((response) => response.json());
}


/* validate input start & end date/time
must be within last 30 days and end date after start date */
function validateSearchDate() {
    // get current date 
    let currentDate = new Date();
    // create new date obj 
    const oldDate = new Date(currentDate);
    // set old date to 30 days ago 
    oldDate.setDate(oldDate.getDate() - 30);

    // get user input start date and time, create start date object
    let inputStartDate = document.getElementById('startDate').value;
    let inputStartTime = document.getElementById('startTime').value;
    const inputStartDateObj = new Date(`${inputStartDate} ${inputStartTime}`);
    
    // get user input end date and time, create end date object
    let inputEndDate = document.getElementById('endDate').value;
    let inputEndTime = document.getElementById('endTime').value;
    const inputEndDateObj = new Date(`${inputEndDate} ${inputEndTime}`);

    // date and time validation 
    if (inputStartDateObj.getTime() < oldDate.getTime() |
    inputStartDateObj.getTime() > currentDate.getTime() |
    inputEndDateObj.getTime() < oldDate.getTime() |
    inputEndDateObj.getTime() > currentDate.getTime() |
    inputStartDateObj.getTime() > inputEndDateObj.getTime()) {
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

    // validate date and time 
    const dateValidate = validateSearchDate();
    if (dateValidate == 'alert') {
        return false;
    }

    // select counties 
    const selectCounties = [];
    const searchResults = countyCheckboxes.children;
    // loop through checkboxes
    for (let result = 0; result < searchResults.length; result++) {
        const checkbox = searchResults[result];
        // check if checkbox is ticked
        if (checkbox.nodeName == 'INPUT' & checkbox.checked == true) {
            // add county ID to counties array
            selectCounties.push(checkbox.id);
        }
    }
    // verify >=1 county selected 
    if (selectCounties.length == 0) {
        alert('Please select at least 1 county');
        return false;
    }

    // select date and time 
    const startDate = `${document.getElementById('startDate').value} ${document.getElementById('startTime').value}`;
    const endDate = `${document.getElementById('endDate').value} ${document.getElementById('endTime').value}`;
    
    // variables for data summary
    let checklistCount = 0;
    const speciesCount = {};

    // get reports for each county
    for (let county=0; county<selectCounties.length; county++) {
        // load reports for current county
        const reports = await loadReports(selectCounties[county]);
        reports.forEach(report => {
            // if report date/time meet criteria
            if (report['obsDt'] >= startDate & report['obsDt'] <= endDate) {
                // create new row
                const newRow = document.createElement('tr');
                // create species column
                const speciesCol = document.createElement('td');
                speciesCol.innerHTML = report['comName'];
                // create species quantity column
                const quantityCol = document.createElement('td');
                quantityCol.innerHTML = report['howMany'];
                // create county name column
                const countyCol = document.createElement('td');
                countyCol.innerHTML = report['subnational2Name'];
                // create hotspot name column
                const hotspotCol = document.createElement('td');
                hotspotCol.innerHTML = report['locName'];
                // create date column
                const dateCol = document.createElement('td');
                dateCol.innerHTML = report['obsDt'].match(/^[\d-]+/);
                // create time column
                const timeCol = document.createElement('td');
                timeCol.innerHTML = report['obsDt'].match(/[\d:]+$/);
                // create checklist link column
                const linkCol = document.createElement('td');
                const link = document.createElement('a');
                link.innerHTML = 'Link';
                link.href = `https://ebird.org/checklist/${report['subId']}`;
                link.target = '_blank'
                linkCol.appendChild(link);
                
                // loop through rows to find matching records
                const columns = [speciesCol, quantityCol, countyCol, hotspotCol, dateCol, timeCol, linkCol];
                let match = false;
                for (let i=0; i<tableBody.rows.length; i++) {
                    const row = tableBody.rows[i]
                    // if matching record exists- same species, hotspot, date
                    if (speciesCol.innerHTML == row.cells[0].innerHTML &
                        hotspotCol.innerHTML == row.cells[3].innerHTML &
                        dateCol.innerHTML == row.cells[4].innerHTML) {
                        match = true;
                        // then replace with newer matching record
                        if (dateCol.innerHTML > row.cells[4].innerHTML &
                            timeCol.innerHTML > row.cells[5].innerHTML) {
                            row.cells[4].innerHTML = dateCol;
                            row.cells[5].innerHTML = timeCol;
                            row.cells[6].innerHTML = linkCol;
                        }
                    }
                }
                // add new record if no match
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
    // unhide data table
    document.getElementById('dataTable').style.visibility = 'visible';
    
    // add data summary to page
    const dataSummary = document.getElementById('dataSummary');
    const summaryTitle = document.createElement('h2');
    summaryTitle.innerHTML = 'Data summary';
    dataSummary.appendChild(summaryTitle);
    const numOfChecklists = document.createElement('p');
    numOfChecklists.innerHTML = `Checklist count: ${checklistCount}`;
    dataSummary.appendChild(numOfChecklists);

    for (species in speciesCount) {
        const numOfSpecies = document.createElement('p');
        numOfSpecies.innerHTML = `${species}: ${speciesCount[species]}`;
        dataSummary.appendChild(numOfSpecies);
    }
}