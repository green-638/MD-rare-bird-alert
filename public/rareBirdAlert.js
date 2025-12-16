document.getElementById('countyCheckboxes').style.visibility = 'hidden';
document.getElementById('hotspotCheckboxes').style.visibility = 'hidden';

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

// prevent form submission from refreshing page
const form = document.querySelector('form');
form.addEventListener('submit', (event) => {
    event.preventDefault();
});

// create alert using form information
async function createAlert() {
    // remove unchecked boxes
    removeUnchecked('county');
    removeUnchecked('hotspot');
    // get checked boxes and append them to array
    const countyCheckboxes = document.getElementById('countyCheckboxes');
    const hotspotCheckboxes = document.getElementById('hotspotCheckboxes');
    const checkboxes = [countyCheckboxes.children, hotspotCheckboxes.children];

    // iterate through all locations
    for (let locType in checkboxes) {
        // get locations in current location type
        const locations = checkboxes[locType];
        // iterate through locations
        for (let loc in locations) {
            if (locations[loc].nodeName == 'INPUT') {
                // matches location ID, ignores hotspots' county IDs
                const locId = locations[loc].id.match(/[\w-]+/)[0];
                let locType;
                // determine location type- hotspot IDs begin with 'L', counties begin with 'US'
                if (locId.slice(0,1) == 'L') {
                    locType = 'hotspot';
                }
                else {
                    locType = 'county';
                }

                const timeInput = document.getElementById('alertTime').value;
                const interval = document.getElementById('interval').value;
                let date = new Date();

                // set next alert date
                date.setDate(date.getDate() + Number(interval)); 
                date.setHours(Number(timeInput.slice(0, 2)));
                date.setMinutes(Number(timeInput.slice(3, 5)));
                date.setSeconds(0,0);

                // get alerts from DB
                // email validation and duplicate alert prevention
                let abort = false;
                await fetch('/alert', {
                    headers: {
                        email: document.getElementById('email').value,
                    },
                })
                .then((response) => response.json())
                .then((responseJson) => {
                    // email validation
                    if (responseJson['validate'] == 'fail') {
                        alert('Email has invalid format or does not exist');
                        abort = true;
                        return;
                    };
                    // iterate through rows and find alerts matching form input
                    responseJson.forEach((row) => {
                        if (row['location_id'] == locId &
                            row['interval'] == interval &
                            row['alert_date'] == date) {
                                alert('A matching alert was found in the database. Please change your selections.');
                                abort = true;
                                return false;
                        }
                    })
                });

                if (abort) {
                    return false;
                }
     
                // post form input to DB
                await fetch(`/alert`, {
                    method: 'POST',
                    body: JSON.stringify({
                        email: `${document.getElementById('email').value}`,
                        locId: `${locId}`,
                        locType: `${locType}`,
                        interval: `${interval}`,
                        date: `${date}`,
                    }),
                    headers: {
                        'Content-type': 'application/json',
                    },
                });
                alert('Alert creation successful');
            }
        }
    }
}