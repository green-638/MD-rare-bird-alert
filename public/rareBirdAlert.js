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