const express = require('express');
const bodyParser = require('body-parser');
const supabaseClient = require('@supabase/supabase-js');
const dotenv = require('dotenv');

const app = express();
const port = 3000;
dotenv.config();

app.use(bodyParser.json());
app.use(express.static(__dirname + '/public'));

// initialize supabase client
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;
const supabase = supabaseClient.createClient(supabaseUrl, supabaseKey);

app.get('/rareBirdAlert', (req, res) => {
    res.sendFile('public/rareBirdAlert.html', {root: __dirname});
});

app.post('/rareBirdAlert', async (req, res) => {
    console.log('Add alert request');
    console.log('Request:', req.body);

    const userEmail = req.body.userEmail;
    const userLocation = req.body.userLocation;
    const userInterval = req.body.userInterval;

    const {data, error} = await supabase.from('alerts').insert({
        email: userEmail,
        location: userLocation,
        interval: userInterval
    })
    .select();

    if (error) {
        console.log(`Error ${error}`);
        res.statusCode = 500;
        res.send(error);
        return;
    } else {
        res.send(data);
    }
    res.send(req.body);
});


app.get('/rareBirdData', (req, res) => {
    res.sendFile('public/rareBirdData.html', {root: __dirname});
});

app.get('/manageAlerts', (req, res) => {
    res.sendFile('public/manageAlerts.html', {root: __dirname});
});

app.get('/help', (req, res) => {
    res.sendFile('public/help.html', {root: __dirname});
});

app.get('/aboutProject', (req, res) => {
    res.sendFile('public/aboutProject.html', {root: __dirname});
});


app.listen(port, () => {
    console.log('listening on', port);
});