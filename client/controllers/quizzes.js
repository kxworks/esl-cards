// *************
// *** LISTS ***
// *************

let FILE_LOCATION = "server/routes/quizzes.php";

function getQuiz(date, callback) {
    let url = FILE_LOCATION + "?date="+date;
    genericFetch(url, "GET", null, callback);
}

// *********************
// *** GENERIC FETCH ***
// *********************

function genericFetch(url, method, body, callback) {
    function handleFetchError(message) {
        console.error(message);
        return {};
    }
    if (body) body = JSON.stringify(body);
    fetch(url, {
        method: method,
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        },
        body: body
    })
    .then(response => { 
        if (response.status == 200) {
            try { return response.json(); }
            catch (error) { handleFetchError("response.json() failed: " + error); }
        }
        else returnError("Error: response status is "+response.status+".");
    })
    .then(response => { 
        let json;
        try {
            if (typeof(response) == "object") json = response;
            else if (typeof(response) == "string") json = JSON.parse(response); 
        }
        catch (error) { json = handleFetchError(" JSON.parse() failed:" + error); }
        if (json.message) alert(json.message);
        callback(json);
    })
}
