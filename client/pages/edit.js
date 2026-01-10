// **********************
// *** MANAGING STATE ***
// **********************

const BASE_LANG = { name: "English", dialect: "en-US" };
const TARGET_LANG = { name: "Spanish", dialect: "es-MX" };
let list = "";
let currentList = [];
let showAll = false;
let editMode = "table";
let createMode = false;
let selectedRow;
let vocabLists;

// ******************
// *** WORD LISTS ***
// ******************

function generateListsHTML() {
    document.getElementById("lists").innerHTML = "";
    document.getElementById("lists").innerHTML += '<button id="create" onclick="startNewList()">+ Create List</button> ';
    document.getElementById("lists").innerHTML += "|&nbsp;";
    for (let list in vocabLists) {
        document.getElementById("lists").innerHTML += '<button id="'+list+'" onclick="changeList(event.target.id)">'+vocabLists[list].title+'</button> ';
    }
}

function getList(id) {
    if (id) return vocabLists[id].vocab;
}

function changeList(option) {
    if (createMode) createMode = false;
    list = option;
    start();
}

function updateActiveButton(buttonListDivId, buttonId) {
    let buttons = document.getElementById(buttonListDivId).children;
    for (let i = 0; i < buttons.length; i++) {
        buttons[i].className = "";
        if (buttons[i].id == buttonId) buttons[i].className = "active";
    }
}

function toggleShowAllLists() {
    let lists = document.getElementById("lists");
    let button = document.getElementById("showall-button");
    showAll = !showAll;
    if (showAll) {
        button.innerHTML = "Collapse";
        lists.style.overflow = "visible";
        lists.style.whiteSpace = "wrap";
    }
    else {
        button.innerHTML = "Show all";
        lists.style.overflow = "scroll";
        lists.style.whiteSpace = "nowrap";
    }
}

function updateEditTitle(name) {
    let text = "";
    if (name) {
        document.getElementById("editlist").style.display = "block";
        if (createMode) { text = "Create list: "; name = ""; }
        else text = "Edit list: ";
        let input = '<input id="editlistname" type="text" placeholder="Enter list name" value="'+name+'"/>';
        document.getElementById("editlist").innerHTML = text + "&nbsp;" + input;
    }
}

// This method is based on the method found here:
// https://medium.com/@python-javascript-php-html-css/how-to-effectively-generate-guids-in-javascript-53d56095ad3b
function generateGUID() {
  function s4() {
    return Math.floor((1 + Math.random()) * 0x10000)
               .toString(16)
               .substring(1);
  }
  return s4() + '-' + s4() + '-' + s4() + '-' + s4();
}

// *****************
// *** EDIT MODE ***
// *****************

function changeEditMode(option) {
    tempSaveChanges();
    editMode = option;
    updateActiveButton("editmode", "edit"+option);
    showEditMode();
}

function showEditMode() {
    document.getElementById("editpane").innerHTML = "";
    if (editMode == "table") generateTable();
    else generateText();
}

// ***********************
// *** INLINE SEQUENCE ***
// ***********************

function startInlineSeq(event) {
    document.querySelectorAll(".seq-row-button").forEach((button) => button.style.cursor = "grabbing");
    selectedRow = event.target.parentNode.parentNode;
    const img = new Image();
    img.src = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7';
    event.dataTransfer.setDragImage(img, 0, 0);
}

function dragInlineSeq(event) {
    event.preventDefault();   
    event.dataTransfer.dropEffect = "none";
    let targetRow = getRowRecursive(event.target);
    let rows = Array.from(targetRow.parentNode.children);
    let targetIndex = rows.indexOf(targetRow);
    let selectedIndex = rows.indexOf(selectedRow);
    if (targetRow.tagName !== "TR") return;
    if (targetIndex > selectedIndex) targetRow.after(selectedRow);
    else if (targetIndex < selectedIndex) targetRow.before(selectedRow);
}

function endInlineSeq(event) {
    document.querySelectorAll(".seq-row-button").forEach((button) => button.style.cursor = "grab");
    event.dataTransfer.dropEffect = "none";
}

function getRowRecursive(element) {
    if (element.tagName == "TR") return element;
    return getRowRecursive(element.parentNode);
}

// **********************
// *** GENERATE VIEWS ***
// **********************

function generateTable() {
    let table = document.createElement("table");
    table.setAttribute("id", "editpanetable");
    document.getElementById("editpane").appendChild(table);
    let headerRow = document.createElement("tr");
    headerRow.innerHTML = "<th>"+BASE_LANG.name+"</th><th>"+TARGET_LANG.name+"</th><th style='border: none;'></th>";
    table.appendChild(headerRow);
    if (currentList.length == 0) addRowToTable(false);
    currentList.forEach((item) => {
        table.appendChild(createNewTableRow(item.base, BASE_LANG.name, item.target, TARGET_LANG.name));
    });
    document.getElementById("editpane").innerHTML += "<button id='addnewrowbutton' onclick='addRowToTable(true)'>+ Add New Row</button>";
    addInputListeners("input");
}

function addRowToTable(useTbody) {
    let tbody = useTbody ? " tbody" : "";
    let table = document.querySelector("#editpanetable" + tbody);
    table.appendChild(createNewTableRow("", BASE_LANG.name, "", TARGET_LANG.name));
    toggleResetChangesButton(false);
}

function createNewTableRow(base, baseLang, target, targetLang) {
    let row = document.createElement("tr");
    row.setAttribute("ondragenter", "dragInlineSeq(event)")
    row.innerHTML = "<td><input type='text' value='"+base+"' placeholder='Add "+baseLang+"...'/></td><td><input type='text' value='"+target+"' placeholder='Add "+targetLang+"...'/></td><td style='border: none;'><button class='row-button seq-row-button' draggable='true' ondragstart='startInlineSeq(event)' ondragend='endInlineSeq(event)' >&udarr;</button>&nbsp;<button class='row-button' onclick='deleteRow(event)'>&#10005;</button></td>";
    return row;
}

function deleteRow(event) {
    let row = event.target.parentElement.parentElement;
    row.remove();
}

function generateText() {
    let textArea = document.createElement("textarea");
    textArea.innerHTML = convertVocabListToCSV(currentList);
    textArea.style.height = (16 * (currentList.length+3)) + "px";
    document.getElementById("editpane").appendChild(textArea);
    textArea.focus();
    textArea.setSelectionRange(textArea.value.length, textArea.value.length);
    addInputListeners("textarea");
}

function convertVocabListToCSV(list) {
    let result = BASE_LANG.name+","+TARGET_LANG.name+"\n";
    list.forEach((item) => {
        result += item.base+","+item.target+"\n";
    });
    if (list.length > 0) return result.substring(0,result.length-1);
    else return result;
}

function addInputListeners(type) {
    document.querySelectorAll("#editpane input, #editpane textarea").forEach((input) => {
        input.removeEventListener("input", enableResetButtonWrapper);
    });
    document.querySelectorAll("#editpane input, #editpane textarea").forEach((input) => {
        input.addEventListener("input", enableResetButtonWrapper);
    });
}

function enableResetButtonWrapper() {
    // Get list title
    let title = (document.getElementById("editlistname")) ? document.getElementById("editlistname").value : vocabLists[list].title;
    let result = (editMode == "table") ? getTableTempList() : getTextTempList();
    let obj = { title: title, vocab: result };
    if (!createMode) {
        if (!areObjectsEqual(obj, vocabLists[list])) toggleResetChangesButton(false);
        else toggleResetChangesButton(true);
    }
    else {
        let blankObj = { title: "", vocab: [] };
        if (!areObjectsEqual(obj, blankObj)) toggleResetChangesButton(false);
        else toggleResetChangesButton(true);
    }
}

// *********************
// *** MOFIFICATIONS ***
// *********************

function startNewList() {
    createMode = true;
    list = "create";
    currentList = [];
    start();
}

function tempSaveChanges() {
    let result = [];
    if (editMode == "table") result = getTableTempList();
    else result = getTextTempList();
    currentList = result;
}

function getTableTempList() {
    let result = [];
    let table = document.querySelector("#editpane table");
    if (table) {
        let rows = table.children[0].children;
        for (let i=1; i < rows.length; i++) {
            let row = rows[i];
            let baseInput = row.children[0].children[0].value;
            let targetInput = row.children[1].children[0].value;
            if (baseInput !== "" || targetInput != "") {
                let data = formatDataRow(baseInput, targetInput);
                result.push(data);
            }
        }
    }
    return result;
}

function getTextTempList() {
    let result = [];
    let textArea = document.querySelector("#editpane textarea");
    if (textArea) {
        let rows = textArea.value.split("\n");
        for (let i=1; i < rows.length; i++) {
            let row = rows[i];
            row = row.replace("\t", ",");
            let rowData = row.split(",");
            if (rowData[1] == undefined) rowData[1] = "";
            if (rowData[0] !== "" || rowData[1] != "") {
                let data = formatDataRow(rowData[0], rowData[1]);
                result.push(data);
            }
        }
    }
    return result;
}

function areListsEqual(list1, list2) {
    // Initial checks
    if (list1 == list2) return true;
    if (!list1 || !list2 || (list1 == undefined || list2 == undefined)) return false;
    if (list1.length !== list2.length) return false;
    // Get array of keys for each list
    let listKeys1 = Object.keys(list1);
    let listKeys2 = Object.keys(list2);
    //Run through checks
    for (let key in listKeys1) {
        if (!listKeys2.includes(key)) return false;
        if (list1[key].base !== list2[key].base) return false;
        if (list1[key].target !== list2[key].target) return false;
    }
    return true;
}

function areObjectsEqual(obj1, obj2) {
    if (obj1.title !== obj2.title) return false;
    if (!areListsEqual(obj1.vocab, obj2.vocab)) return false;
    return true;
}

function formatDataRow(base, target) {
    return { "base": base, "target": target };
}

function submitChanges() {
    tempSaveChanges();
    let id = "";
    let title = "";
    // Get new vocab list
    let vocab = currentList;
    if (vocab.length == 0) { alert("This list is currently empty. Please add values before submitting."); return; }
    for (let idx in vocab) {
        let item = vocab[idx];
        if (item.base == "" || item.target == "") { alert("All rows need to be completed before submitting."); return; }
    }
    // Get list title
    if (document.getElementById("editlistname")) title = document.getElementById("editlistname").value;
    else title = vocabLists[list].title;
    if (title.length == 0) { alert("Please add a title before submitting."); return; }
    // Get list ID
    if (createMode) id = generateGUID();
    else id = list;
    if (id.length == 0) { alert("There was a problem generating an ID. Please try again."); return; }
    // Stringify and send
    let obj = { "id": id, "title": title, "vocab": vocab };
    if (!createMode && areObjectsEqual(obj, vocabLists[list])) { alert("Please make a change before submitting."); return; }
    // If create, POST - otherwise PUT
    if (createMode) submitCreateRequest(obj);
    else submitUpdateRequest(obj);
}

function resetChanges() {
    currentList = getList(list);
    showEditMode();
    toggleResetChangesButton(true);
}

function toggleResetChangesButton(disabled) {
    if (disabled) { 
        document.getElementById("submitbutton").setAttribute("disabled", disabled);
        document.getElementById("resetbutton").style.display = "none";
    }
    else { 
        document.getElementById("submitbutton").removeAttribute("disabled");
        if (!createMode) document.getElementById("resetbutton").style.display = "inline-block";
    }

}

// *******************
// *** CREATE LIST ***
// *******************

function submitCreateRequest(body) {
    createList(body, function() { createCallback(body.id); });
}

function createCallback(newId) {
    createMode = false;
    list = newId;
    load();
}

// *******************
// *** UPDATE LIST ***
// *******************

function submitUpdateRequest(body) {
    updateList(body, updateCallback);
}

function updateCallback() {
    load();
}

// *******************
// *** DELETE LIST ***
// *******************

function confirmDeleteList() {
    let result = confirm("Are you sure you'd like to delete this list? This action cannot be undone.");
    if (result) { 
        let body = { id: list };
        deleteList(body, deleteCallback);
    }
}

function deleteCallback() {
    if (vocabLists) {
        let keys = Object.keys(vocabLists);
        let lastListIdx = keys.indexOf(list);
        let newListIdx = lastListIdx-1;
        if (newListIdx < 0) newListIdx = 0;
        list = keys[newListIdx];
    }
    load();
}

// *******************
// *** EDIT ACCESS ***
// *******************

let password = "editadmin!";
function checkEditAccess() {
    let response = prompt("Please enter editing passcode:");
    if (response !== password) { 
        alert("Access denied.")
        window.location.assign("./index.html");
    }
    else load();
}

// ******************
// *** LOAD/START ***
// ******************

function load() {
    getAllLists(loadPage);
}

function loadPage(serverResponse) {
    vocabLists = serverResponse;
    generateListsHTML();
    getInitialList();
    start();
}

function getInitialList() {
    list = Object.keys(vocabLists)[0];
}

function start() {
    updateActiveButton("lists", list);
    if (createMode) {
        updateEditTitle(list);
        document.getElementById("resetbutton").style.display = "none";
        document.getElementById("deletelistbutton").style.display = "none";
    }
    else {
        document.getElementById("resetbutton").style.display = "initial";
        document.getElementById("deletelistbutton").style.display = "block";
        currentList = getList(list);
        let title = (list ? vocabLists[list].title : "");
        if (title) updateEditTitle(title);
    }
    showEditMode();
    toggleResetChangesButton(true);
}