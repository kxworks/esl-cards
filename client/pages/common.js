// **********************
// *** MANAGING STATE ***
// **********************

const BASE_LANG = { name: "English", dialect: "en-US" };
const TARGET_LANG = { name: "Spanish", dialect: "es-MX" };
let list = "";
let currentList = [];
let vocabLists = {};
let darkMode = false;
const INDEX_PAGE = "index";
const EDIT_PAGE = "edit";

// ******************
// *** WORD LISTS ***
// ******************

function sortListIdsByTitle() {
    let result = [];
    let titles = [];
    let titlesToIdsMap = {};
    for (let list in vocabLists) {
        let title = vocabLists[list].title;
        titles.push(title);
        titlesToIdsMap[title] = list;
    }
    let sortedTitles = titles.sort();
    sortedTitles.forEach((title) => {
        let id = titlesToIdsMap[title];
        result.push(id);
    });
    return result;
}

function isListIdValid(listId) {
    return Object.keys(vocabLists).includes(listId);
}

// ********************
// *** UPDATE VIEWS ***
// ********************

function updateActiveButton(buttonListDivId, buttonId) {
    let buttonsList = document.getElementById(buttonListDivId);
    if (buttonsList) {
        let buttons = buttonsList.children;
        for (let i = 0; i < buttons.length; i++) {
            buttons[i].className = "";
            if (buttons[i].id == buttonId) buttons[i].className = "active";
        }
    }
}

function updateDarkModeView() {
    if (darkMode) {
        let style = document.createElement("link");
        style.setAttribute("rel", "stylesheet");
        style.setAttribute("href", "./client/etc/darkmode.css");
        style.setAttribute("id", "darkmodeStyles");
        document.head.appendChild(style);
    }
    else {
        let darkModeTag = document.getElementById("darkmodeStyles");
        if (darkModeTag) document.head.removeChild(darkModeTag);
    }
    let activeButtonId = darkMode ? "darkbutton" : "lightbutton";
    updateActiveButton("darkmode", activeButtonId);
}

// ***********
// *** URL ***
// ***********

function addCurrentListToURL() {
    const PAGE_TITLE = "Flashcards!";
    window.history.pushState({}, PAGE_TITLE, "?list=" + list);
}

function readListFromURL() {
    const params = new URLSearchParams(window.location.search);
    let urlList = params.get('list');
    if (urlList == "saved" || urlList == "create") return null;
    return urlList;
}

function generateListsDropdown(pageType, dropdownSelectCallback, actionButtonCallback) {
    // lists dropdown 
    document.getElementById("lists").innerHTML = "";
    let select = document.createElement("select");
    select.setAttribute("id", "list-dropdown");
    select.addEventListener("change", function(event) { dropdownSelectCallback(event)});
    if (pageType == INDEX_PAGE) select.innerHTML += '<option value="all">All Words</option>';
    let sortedVocabListIds = sortListIdsByTitle();
    sortedVocabListIds.forEach(id => {
        select.innerHTML += '<option value="'+id+'">'+vocabLists[id].title+'</option>';
    });
    if (pageType == INDEX_PAGE) select.innerHTML += '<option value="saved" disabled></option>';
    else if (pageType == EDIT_PAGE) select.innerHTML += '<option value="create" disabled></option>';
    // spacer + action (saved/create)
    let spacer = document.createElement("span");
    spacer.innerHTML = "&nbsp;&nbsp;|&nbsp;&nbsp;";
    let actionButton = document.createElement("button");
    if (pageType == INDEX_PAGE) {
        actionButton.id = "saved";
        actionButton.innerHTML = "Saved";
    }
    else if (pageType == EDIT_PAGE) {
        actionButton.id = "create";
        actionButton.innerHTML = "+ Create List";
    }
    actionButton.addEventListener("click", function(event) { actionButtonCallback(event) });
    // add to page
    document.getElementById("lists").appendChild(actionButton);
    document.getElementById("lists").appendChild(spacer);
    document.getElementById("lists").appendChild(select);
    // Add down arrow (custom styling)
    let downArrow = document.createElement("span");
    downArrow.id = "dropdown-chevron";
    downArrow.innerHTML = "&#8964;";
    document.getElementById("lists").appendChild(downArrow);
}