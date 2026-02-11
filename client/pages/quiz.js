// **********************
// *** MANAGING STATE ***
// **********************

let view = BASE_LANG.name;
let cardIdx = -1;
let showSettings = false;
let currentResults = [];
const NUMBER_OF_QUESTIONS = 10;
let completed = false;

// ********************
// *** LOAD / START ***
// ********************

function initialLoad() {
    if (readListFromURL()) { // Add valid check
        list = readListFromURL();
    }
    else {
        let currentDate = getCurrentDate(true);
        list = currentDate;
    }
    getQuiz(list, loadPageWithData);
}

function loadPageWithData(serverResponse) {
    addCurrentListToURL();
    updatePageDate(getCurrentDate());
    generateSettings();
    if (serverResponse.vocab) { 
        currentList = serverResponse.vocab;
        start();
    }
    else {
        console.log("no data");
        // Add logic to get most recent
        document.querySelectorAll("#answer-box, #flashcards button").forEach(element => element.setAttribute("disabled", "true"));
        return;
    }
}

function start() {
    createResultList();
    cardIdx = 0;
    showCard();
}

// *************
// *** EVENT ***
// *************

addEventListener("keydown", (event) => {
    switch (event.key) {
        case "Enter": { if (document.activeElement == document.getElementById("answer-box")) submitGuess(); break; }
        default: break;
    }
});

// ***************
// *** HELPERS ***
// ***************

function formatMonth(date, sysFormat) {
    if (sysFormat) {
        let month = (date.getMonth()+1);
        if (month < 10) month = "0" + month;
        return month;
    }
    else {
        let month = date.toString().split(" ")[1];
        if (month !== "May") month = month + ".";
        return month;
    }
}

function getCurrentDate(sysFormat=false) {
    let date = new Date();
    let dateValues = date.toString().split(" ");
    if (sysFormat) { 
        //return `${dateValues[3]}${formatMonth(date, true)}${dateValues[2]}`
        return "20260209";
    }
    else {
        return `${formatMonth(date, false)} ${dateValues[2]}, ${dateValues[3]}`;
    }
}

function updatePageDate(givenDate) {
    document.getElementById("todays-date").innerHTML = givenDate;
}

function generateNavStatus() {
    let result = "";
    for (let i = 0; i < currentList.length; i++) {
        let char = "";
        if (currentResults[i] == true) char = "&check;";
        else if (currentResults[i] == false) char = "X"; //"&#10005;";
        else if (currentResults[i] == null) {
            if (i == getCompletedSoFar()) char = "?";
            else char = "&nbsp;&nbsp;";
        }
        let charClass = "";
        if (currentResults[i] != null || i == getCompletedSoFar()) charClass = "char-completed";
        if (i == cardIdx) char = "<b>"+char+"</b>";
        result += "<span class='navstatus-char "+charClass+"' onclick='jumpToCard("+i+")'>"+char+"</span>";
    }
    return result;
}

function getCompletedSoFar() {
    let count = 0;
    currentResults.forEach(result => { if (result != null) count++ });
    return count;
}

function getNumCorrect() {
    let count = 0;
    currentResults.forEach(result => { if (result == true) count++ });
    return count;
}

function jumpToCard(index) {
    if (currentResults[index] != null || index == getCompletedSoFar()) {
        cardIdx = index;
        showCard();
    }
}

function submitGuess() {
    let userAnswer = document.getElementById("answer-box").value;
    let realAnswer = currentList[cardIdx].target;
    let gotItRight = false;
    if (userAnswer.toLowerCase() == realAnswer.toLowerCase()) gotItRight = true;
    if (gotItRight) { alert("Nice one! \"" + realAnswer + "\" is correct."); recordResult(true); }
    else { alert("Oops, that's not right. The correct answer is \"" + realAnswer + "\"."); recordResult(false); }
    changeCard(1, false);
}

function showCompleteMessage() {
    let numCorrect = getNumCorrect();
    let message = "You've finished this quiz! You got "+ numCorrect + " out of " + NUMBER_OF_QUESTIONS + " correct. ";
    if (numCorrect == NUMBER_OF_QUESTIONS) message += "Keep up the good work!";
    else if (numCorrect >= (NUMBER_OF_QUESTIONS * .8)) message += "Keep practicing.";
    else if (numCorrect <= (NUMBER_OF_QUESTIONS * .5)) message += "You might want to practice more...";
    alert(message);
    document.getElementById("submit-button").setAttribute("disabled", "true");
}


// *** *** ***

// **************
// *** SPEECH ***
// **************

const speechSynthesis = window.SpeechSynthesis || window.webkitSpeechSynthesis;
function speakText(event, text, lang) {
    event.stopPropagation();
    if (speechSynthesis) {
        const message = new SpeechSynthesisUtterance();
        const voicesList = window.speechSynthesis.getVoices();
        message.voice = voicesList.find((voice) => voice.lang === lang);
        message.text = text;
        message.lang = lang;
        // Constant values
        message.volume = 1;
        message.rate = 1;
        message.pitch = 1;
        window.speechSynthesis.speak(message);
    }
}

function speakTextOnCard(event) {
    let hint = document.getElementById("hint"); 
    let answer = document.getElementById("answer");
    let text = "";
    let lang = "";
    if (hint.style.display == "block") {
        text = hint.innerText;
        view == BASE_LANG.name ? lang = BASE_LANG.dialect : lang = TARGET_LANG.dialect;
    }
    else {
        text = answer.innerText;
        view == BASE_LANG.name ? lang = TARGET_LANG.dialect : lang = BASE_LANG.dialect;
    }
    speakText(event, text, lang);
}

// *************
// *** CARDS ***
// *************

function createResultList() {
    currentResults = [];
    let listLength = currentList.length;
    for (let i = 0; i < listLength; i++) {
        currentResults.push(null);
    }
}

function showCard() {
    // reset card visuals
    let hint = document.getElementById("hint");
    let answer = document.getElementById("answer");
    let flashcard = document.getElementById("flashcard");
    let saveButton = document.getElementById("savecard");
    flashcard.classList = "";
    hint.style.display = "block";
    answer.style.display = "none";
    saveButton.style.visibility = "visible";
    document.getElementById("answer").style.display = "none";
    document.getElementById("navstatus").innerHTML = generateNavStatus();
    if ((cardIdx + 1) > getCompletedSoFar() || cardIdx == (NUMBER_OF_QUESTIONS-1)) document.getElementById("next").setAttribute("disabled", "true");
    else document.getElementById("next").removeAttribute("disabled", "true");
    if (cardIdx == 0) document.getElementById("prev").setAttribute("disabled", "true");
    else document.getElementById("prev").removeAttribute("disabled", "true");
    document.getElementById("answer-box").value = "";

    // Display data
    let data = currentList[cardIdx];
    let base = data["base"];
    let target = data["target"];
    let baseHTML = "<span class='card-text'>"+base+"</span>";
    let targetHTML = "<span class='card-text'>"+target+"</span>";;
    if (view == BASE_LANG.name) {
        document.getElementById("hint").innerHTML = baseHTML;
        document.getElementById("answer").innerHTML = targetHTML;
    }
    else if (view == TARGET_LANG.name) {
        document.getElementById("hint").innerHTML = targetHTML;
        document.getElementById("answer").innerHTML = baseHTML;
    }
    
    // Get status
    let cardStatus = document.getElementById("cardstatus")
    if (currentResults[cardIdx] == true) cardStatus.innerHTML = "&check;";
    else if (currentResults[cardIdx] == false) cardStatus.innerHTML = "&#10005;";
    else cardStatus.innerHTML = "";

    //Save cards
    //if (cardAlreadySaved(base, target)) toggleSavedButton(true);
    //else toggleSavedButton(false);
}

function recordResult(gotItRight) {
    if (gotItRight) { 
        if (currentResults[cardIdx] !== true) {
            currentResults[cardIdx] = true; 
        }
        else return;
    }
    else currentResults[cardIdx] = false;
}

function changeCard(option, restrictNext) {
    if ((option == 1 && cardIdx < currentList.length-1) || (option == -1 && cardIdx > 0)) {
        if (option == 1 & restrictNext && (cardIdx + option) > getCompletedSoFar()) return;
        cardIdx += option;
    }
    else if (option == 1 && cardIdx == currentList.length-1) {
        cardIdx = currentList.length-1;
        if (!completed) {
            completed = true;
            showCompleteMessage();
        }
    }
    else if (option == -1 && cardIdx == 0) cardIdx = 0;
    showCard();
}

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