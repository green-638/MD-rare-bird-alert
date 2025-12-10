document.getElementById('countyCheckboxes').style.visibility = 'hidden';
document.getElementById('hotspotCheckboxes').style.visibility = 'hidden';

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

const form = document.querySelector('form');
form.addEventListener('submit', (event) => {
    event.preventDefault();
});

async function createAlert() {
    removeUnchecked('county');
    removeUnchecked('hotspot');
    const countyCheckboxes = document.getElementById('countyCheckboxes');
    const hotspotCheckboxes = document.getElementById('hotspotCheckboxes');
    const checkboxes = [countyCheckboxes.children, hotspotCheckboxes.children];

    // iterate through locations
    for (locType in checkboxes) {
        const locations = checkboxes[locType];
        for (loc in locations) {
            if (locations[loc].nodeName == 'INPUT') {
                const locId = locations[loc].id.match(/[\w-]+/)[0];
                let locType;
                // hotspot IDs begin with L, counties begin with US
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

                // prevent duplicate alerts
                let abort = false;
                await fetch('/alert', {
                    headers: {
                        email: document.getElementById('email').value,
                    },
                })
                .then((response) => response.json())
                .then((responseJson) => {
                    // validate email
                    if (responseJson['validate'] == 'fail') {
                        alert('Email has invalid format or does not exist');
                        abort = true;
                        return;
                    };

                    responseJson.forEach((row) => {
                        if (row['location_id'] == locId) {
                            alert('You already have an alert for one of the selected locations. Please select a different location.');
                            abort = true;
                            return false;
                        }
                    })
                });

                if (abort) {
                    return false;
                }
     
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