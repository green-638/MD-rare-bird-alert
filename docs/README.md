# MD-rare-bird-alert

This website allows rare bird alerts to be created and customized by location
and alert frequency. Alerts support only Maryland locations and are sent by email.
Users may also search for rare bird reports.

This website is intended to be viewed on desktop browsers.

## Developer Manual

### Installation

To install MD-rare-bird-alert, clone the repository onto your device. The following
dependencies are required:

- @supabase/supabase-js
- body-parser
- dotenv
- email-validator
- express
- nodemailer
- nodemon

<!-- end of list -->

Install each with the following command
```
npm install <dependency>
```

### Running the application

A Supabase, Google, and eBird account are necessary to run the application. Once
these accounts are created, an .env file must be created and contain a
SUPABASE_URL and SUPABASE_KEY, GOOGLE_APP_PASSWORD, and EBIRD_KEY. Lastly, the
nodemailer transporter in index.js must contain the correct email address.

Once these are configured, the application can be run by typing the command

```
npm run
```

### API

- GET /api/task

<!-- end of list -->

Retrieves alerts from the database and sends emails for alerts whose dates match
  the current date. A cron job makes this request daily at 12:00 AM.

- GET /alert

<!-- end of list -->

Retrieves alerts from the database using the email in the request header.

- DELETE /alert

<!-- end of list -->

Deletes alerts from the database using the row ID in the request body.

- POST /alert

<!-- end of list -->

Posts alerts to the database. The request body contains an email, location ID,
location type (county or hotspot), interval (alert frequency), and date (next
date that alert should be sent).

#### Routing

- GET /

<!-- end of list -->

Sends home.html

- GET /rareBirdAlert

<!-- end of list -->

Sends rareBirdAlert.html

- GET /manageAlerts

<!-- end of list -->
  
Sends manageAlerts.html

- GET /help

<!-- end of list -->
  
Sends help.html

- GET /aboutProject

<!-- end of list -->
  
Sends aboutProject.html

### Bugs and Future Development

There are currently no known bugs. The website is intended to be viewed on desktop
browsers and is not optimized for other devices, such as phones and tablets.
Using these devices may reveal unstyled content.

Currently, only locations in Maryland are supported. If supporting other states
becomes beneficial, they will be added.

The cron job responsible for sending emails is currently performed by Supabase.
However, the current tier being used only supports 2 cron jobs, with each being
permitted 1 task daily. As a result, alerts cannot be customized to be sent at
any time, so all alerts must be sent at midnight. cron-job.org or another service
may be used in the future to allow further customization and flexibility in
creating and sending alerts.
