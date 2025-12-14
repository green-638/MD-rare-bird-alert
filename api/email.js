//const functions = require('../index');

export function GET(request) {
    return new Response('Hello from Vercel!');
    /*
    functions.getRows()
    .then((response) => {
        allRows = response;
        // iterate through rows
        for (let row in allRows) {
            // get current date
            const date = new Date();
            // get alert date
            const alertDate = new Date(allRows[row]['alert_date']);
            // add row to matches array if alert date is today
            if (date.getMonth() == alertDate.getMonth() &
            date.getDate() == alertDate.getDate() &
            date.getFullYear() == alertDate.getFullYear()) {
        
                functions.sendEmail(allRows[row]['email'], allRows[row]['location_id'], allRows[row]['interval']);
  
                // set next alert date
                alertDate.setDate(alertDate.getDate() + Number(allRows[row]['interval']));
                // push change to DB
                functions.updateDate(allRows[row]['id'], alertDate);
            }
        }
    });
    */
}