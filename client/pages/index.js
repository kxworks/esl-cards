// **********************
// *** MANAGING STATE ***
// **********************

let view = BASE_LANG.name;
let mode = "quiz";
let cardIdx = -1;
let showSettings = false;
let currentResults = [];
let correctSoFar = 0;
let allCards = [];
let savedCards = [];

// **************
// *** EVENTS ***
// **************

addEventListener("keydown", (event) => {
    switch (event.key) {
        case "Meta": showCardAnswer(); break;
        case "s": speakTextOnCard(event); break;
        // Controls for review mode
        case "ArrowLeft": if (mode == "review") changeCard(-1); break;
        case "ArrowRight": if (mode == "review") changeCard(1); break;
        case "r": if (mode == "review") changeCard(2); break;
        // Controls for quiz mode
        case "o": if (mode == "quiz") recordResult(false); break;
        case "p": if (mode == "quiz") recordResult(true); break;
    }
});

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

// ******************
// *** WORD LISTS ***
// ******************

function createAllList() {
    let result = [];
    for (let list in vocabLists) {
        if (list !== "all" && list !== "saved") {
            result.push(...vocabLists[list].vocab);
        }
    }
    if (result.length == 0) result.push({ base: 'N/A', target: 'N/A' });
    allCards = result;
}

function getListIndexPage(id) {
    if (id == "all") return allCards;
    else if (id == "saved") return savedCards;
    return vocabLists[id].vocab;
}

function changeListIndexPage(option) {
    list = option;
    start();
}

function dropdownSelectCallbackIndexPage(event) {
    changeListIndexPage(event.target.value);
}

function actionButtonCallbackIndexPage(event) {
    changeListIndexPage(event.target.id); 
}

// ******************
// *** SAVE CARDS ***
// ******************

function getSaved() {
    let saved = localStorage.getItem("savedCards")
    if (saved) savedCards = JSON.parse(saved);
}

function updateSaved() {
    let savedButton = document.getElementById("saved");
    if (savedCards.length > 0) savedButton.removeAttribute("disabled");
    else savedButton.setAttribute("disabled", "true");
}

function saveCard(event) {
    event.stopPropagation();
    let hintText = document.getElementById("hint").innerText;
    let answerText = document.getElementById("answer").innerText;
    let baseHint = "";
    let baseAnswer = "";
    if (view == BASE_LANG.name) { baseHint = hintText; baseAnswer = answerText;} 
    else if (view == TARGET_LANG.name) { baseHint = answerText; baseAnswer = hintText; } 
    if (savedCards) {
        let saved = false;
        if (cardAlreadySaved(baseHint, baseAnswer)) removeSavedCard(baseHint, baseAnswer);
        else {
            savedCards.push({ "base": baseHint, "target": baseAnswer });
            localStorage.setItem("savedCards", JSON.stringify(savedCards));
            saved = true;
        }
        updateSaved();
        toggleSavedButton(saved);
    }
}

function cardAlreadySaved(baseHint, baseAnswer) {
    let result = false;
    savedCards.forEach((card) => {
        if (card.base == baseHint && card.target == baseAnswer) result = true;
    })
    return result;
}

function removeSavedCard(baseHint, baseAnswer) {
    let result = [];
    let result2 = savedCards.filter(card => (card.base !== baseHint && card.target !== baseAnswer));
    savedCards.forEach((card) => {
        if (card.base == baseHint && card.target == baseAnswer) return;
        else result.push({ "base": card.base, "target": card.target });
    });
    savedCards = result2;
    localStorage.setItem("savedCards", JSON.stringify(savedCards));
}

function toggleSavedButton(saved) {
    let saveCardButton = document.getElementById("savecard");
    if (saved) { 
        saveCardButton.innerHTML = "Saved";
        saveCardButton.className = "active";
    }
    else {
        saveCardButton.innerHTML = "Save";
        saveCardButton.className = "";
    }
}

// *************
// *** CARDS ***
// *************

function getRandomIndex(current, listLength) {
    if (listLength <= 1) return 0;
    let newIdx = Math.floor(Math.random() * listLength);
    if (newIdx !== current) return newIdx;
    else return getRandomIndex(current, listLength);
}

function changeCard(option) {
    if (option == 2) {
        let newIdx = getRandomIndex(cardIdx, currentList.length);
        cardIdx = newIdx;
    }
    else if ((option == 1 && cardIdx < currentList.length-1) || (option == -1 && cardIdx > 0)) {
        cardIdx += option;
    }
    else if (option == 1 && cardIdx == currentList.length-1) cardIdx = 0;
    else if (option == -1 && cardIdx == 0) cardIdx = currentList.length-1;
    showCard();
}

function showCard() {
    // reset card visuals
    let hint = document.getElementById("hint");
    let answer = document.getElementById("answer");
    let flashcard = document.getElementById("flashcard");
    let tap = document.getElementById("tap");
    let saveButton = document.getElementById("savecard");
    flashcard.classList = "";
    hint.style.display = "block";
    answer.style.display = "none";
    tap.style.visibility = "visible";
    saveButton.style.visibility = "visible";

    document.getElementById("status").innerHTML = "Card: "+(cardIdx+1)+"/"+currentList.length;
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
    
    document.getElementById("answer").style.display = "none";

    let cardStatus = document.getElementById("cardstatus")
    if (currentResults[cardIdx] == true) cardStatus.innerHTML = "&check;";
    else if (currentResults[cardIdx] == false) cardStatus.innerHTML = "&#10005;";
    else cardStatus.innerHTML = "";
    document.getElementById("quizstatus").innerHTML = (cardIdx+1)+"/"+currentList.length+" ("+(currentList.length - correctSoFar)+" left)";

    if (cardAlreadySaved(base, target)) toggleSavedButton(true);
    else toggleSavedButton(false);
}

function showCardAnswer() {
    let hint = document.getElementById("hint");
    let answer = document.getElementById("answer");
    let flashcard = document.getElementById("flashcard");
    let tap = document.getElementById("tap");
    let saveButton = document.getElementById("savecard");

    if (answer.style.display == "none") {
        flashcard.classList = "answer";
        hint.style.display = "none";
        answer.style.display = "block";
        tap.style.visibility = "hidden";
        saveButton.style.visibility = "hidden";
    }
    else {
        flashcard.classList = "";
        hint.style.display = "block";
        answer.style.display = "none";
        tap.style.visibility = "visible";
        saveButton.style.visibility = "visible";
    }
}

// *****************
// *** QUIZ MODE ***
// *****************

function createResultList() {
    currentResults = [];
    let listLength = currentList.length;
    for (let i = 0; i < listLength; i++) {
        currentResults.push(null);
    }
}

function recordResult(gotItRight) {
    if (gotItRight) { 
        if (currentResults[cardIdx] !== true) {
            currentResults[cardIdx] = true; 
            correctSoFar++;
        }
        else return;
    }
    else currentResults[cardIdx] = false;
    jumpToNextCard();
}

function jumpToNextCard() {
    let nextCard = -1;
    let tempIdx = cardIdx;
    let counter = 0;
    while (nextCard == -1) {
        tempIdx = (tempIdx + 1) % currentList.length;
        if (currentResults[tempIdx] == false || currentResults[tempIdx] == null) nextCard = tempIdx;
        counter++;
        if (counter > currentList.length) { 
            nextCard = 0;
            alert("You completed this deck! Nice work.")
            document.getElementById("didntknow").setAttribute("disabled", true);
            document.getElementById("knewit").setAttribute("disabled", true);
        }
    }
    cardIdx = nextCard;
    showCard();
}

// ********************
// *** LOAD / START ***
// ********************

function load() {
    getAllLists(loadPage);
}

function loadPage(serverResponse) {
    vocabLists = serverResponse;
    list = "all";
    getPrefs();
    updateDarkModeView();
    generateLanguageButtons();
    generateModeButtons();
    generateListsDropdown(INDEX_PAGE, dropdownSelectCallbackIndexPage, actionButtonCallbackIndexPage);
    createAllList();
    getSaved();
    updateSaved();
    updateModeView();
    if (readListFromURL()) { 
        list = readListFromURL();
        if (!isListIdValid(list)) getInitialList();
    }    
    start();
}

function start() {
    updateActiveButton("lists", list);
    addCurrentListToURL();
    document.getElementById("list-dropdown").value = list;
    currentList = getListIndexPage(list);
    createResultList();
    correctSoFar = 0;
    cardIdx = 0;
    showCard();
    let title = (list == "all" ? "All" : (list == "saved") ? "Saved" : vocabLists[list].title);
    document.getElementById("flashtype").innerHTML = title;
    document.getElementById("didntknow").removeAttribute("disabled");
    document.getElementById("knewit").removeAttribute("disabled");
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

function generateLanguageButtons() {
    let baseActive = (view == BASE_LANG.name) ? "active" : "";
    let targetActive = (view == TARGET_LANG.name) ? "active" : "";
    document.getElementById("cardview").innerHTML += '<button id="base" class="'+baseActive+'" onclick="changeView(\'base\')">'+BASE_LANG.name+' first</button> ';
    document.getElementById("cardview").innerHTML += '<button id="target" class="'+targetActive+'" onclick="changeView(\'target\')">'+TARGET_LANG.name+' first</button>';
}

function generateModeButtons() {
    let quizActive = (mode == "quiz") ? "active" : "";
    let reviewActive = (mode == "review") ? "active" : "";
    document.getElementById("flashcardmode").innerHTML += '<button id="quiz" class="'+quizActive+'" onclick="changeMode(event.target.id)">Quiz mode</button> ';
    document.getElementById("flashcardmode").innerHTML += '<button id="review" class="'+reviewActive+'" onclick="changeMode(event.target.id)">Review mode</button>';
}

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

function changeView(option) {
    let newView = "";
    option == "base" ? newView = BASE_LANG.name : newView = TARGET_LANG.name;
    view = newView;
    updateActiveButton("cardview", option)
    showCard();
    savePrefs();
}

function changeMode(option) {
    mode = option;
    updateModeView();
    updateActiveButton("flashcardmode", option)
    start();
    savePrefs();
}

function updateModeView() {
    if (mode == "review") {
        document.getElementById("reviewmode").style.display = "block";
        document.getElementById("quizmode").style.display = "none";
    };
    if (mode == "quiz") {
        document.getElementById("reviewmode").style.display = "none";
        document.getElementById("quizmode").style.display = "block";
    };
}

function changeDarkMode(enabled) {
    darkMode = enabled;
    updateDarkModeView();
    savePrefs();
}