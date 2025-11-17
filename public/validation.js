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