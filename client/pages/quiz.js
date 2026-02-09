// **********************
// *** MANAGING STATE ***
// **********************

let view = BASE_LANG.name;
let cardIdx = -1;
let showSettings = false;
let currentResults = [];

// ***

// ********************
// *** LOAD / START ***
// ********************

function load() {
    loadPage(null);
}

function loadPage(serverResponse) {
    updatePageDate(getCurrentDate());
    generateSettings();
    return;
}

function start() {
    return;
}

// ************
// *** DATE ***
// ************

function getCurrentDate(sysFormat=false) {
    let date = new Date();
    if (sysFormat) return "";
    else {
        let dateValues = date.toString().split(" ");
        return `${dateValues[1]}. ${dateValues[2]}, ${dateValues[3]}`;
    }
}

function updatePageDate(givenDate) {
    document.getElementById("todays-date").innerHTML = givenDate;
}

// *** *** ***


// *******************
// *** PREFERENCES ***
// *******************

function getPrefs() {
    let prefs = localStorage.getItem("prefs")
    if (prefs) { 
        prefsObj = JSON.parse(prefs);
        if (prefsObj.mode) mode = prefsObj.mode;
        if (prefsObj.view) view = prefsObj.view;
        if (prefsObj.darkMode) darkMode = prefsObj.darkMode;
    }
}

function savePrefs() {
    let prefsObj = { mode: mode, view: view, darkMode: darkMode };
    localStorage.setItem("prefs", JSON.stringify(prefsObj)); 
}

// ************************
// *** SETTINGS / MODES ***
// ************************

function toggleSettings() {
    let settings = document.querySelector("#settings");
    let settingsBtn = document.querySelector("#hide-settings");
    if (showSettings) { 
        settings.style.display = "none";
        settingsBtn.innerHTML = "Settings";
    }
    else { 
        settings.style.display = "block";
        settingsBtn.innerHTML = "Hide settings";
    }
    showSettings = !showSettings;
}

function generateSettings() {
    getPrefs();
    updateDarkModeView();
    generateLanguageButtons();
}

function generateLanguageButtons() {
    let baseActive = (view == BASE_LANG.name) ? "active" : "";
    let targetActive = (view == TARGET_LANG.name) ? "active" : "";
    document.getElementById("cardview").innerHTML += '<button id="base" class="'+baseActive+'" onclick="changeView(\'base\')">'+BASE_LANG.name+' first</button> ';
    document.getElementById("cardview").innerHTML += '<button id="target" class="'+targetActive+'" onclick="changeView(\'target\')">'+TARGET_LANG.name+' first</button>';
}

function changeView(option) {
    let newView = "";
    option == "base" ? newView = BASE_LANG.name : newView = TARGET_LANG.name;
    view = newView;
    updateActiveButton("cardview", option)
    savePrefs();
}

function changeDarkMode(enabled) {
    darkMode = enabled;
    updateDarkModeView();
    savePrefs();
}