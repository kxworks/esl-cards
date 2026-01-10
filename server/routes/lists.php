<?php

    // *********************
    // *** I/O FUNCTIONS ***
    // *********************
    
    $FILE_LOCATION = "../data/lists.json";

    // Read current file
    function getSavedData() {
        global $FILE_LOCATION;
        $savedData = file_get_contents($FILE_LOCATION);
        //$savedData = substr($savedData, 23, -32);
        return json_decode($savedData, true);
    }

    // Re-encode and save
    function encodeAndSaveData($data) {
        global $FILE_LOCATION;
        $encoded = json_encode($data);
        file_put_contents($FILE_LOCATION, $encoded);
    }

    function getHttpInputs() {
        $inputs = file_get_contents('php://input');
        return $inputs;
        // Not necessary bc already encoded?
        //$pattern = '/(\<|\>|\\|\;|\'|\"|\=|\@|\#|\$|\%|\^|\*)+/u';
        //return preg_replace($pattern, '', $inputs);
    }

    // **************
    // *** ROUTER ***
    // **************

    $reqMethod = $_SERVER['REQUEST_METHOD'];
    switch ($reqMethod) {
        case "GET": echo getAllRecords(); break;
        case "POST": echo createNewRecord(); break;
        case "PUT": echo updateRecord(); break;
        case "DELETE": echo deleteRecord(); break;
        default: break;
    }

    // *********************
    // *** CREATE (POST) ***
    // *********************

    function createNewRecord() {
        // Get new data
        try {
            $newData = json_decode(getHttpInputs(), true);
            $newId = $newData["id"];
            $newTitle = $newData["title"];
            $newVocab = $newData["vocab"];
            $vocabJsonArray = getSavedData();

            // Try to locate in the file -- if not there, create
            if (!array_key_exists($newId, $vocabJsonArray)) {
                $newDataArray = [
                    "title" => $newTitle,
                    "vocab" => $newVocab,
                ];
                $vocabJsonArray[$newId] = $newDataArray;
                encodeAndSaveData($vocabJsonArray);
                echo '{ "status": 200, "message": "successfully created." }';
            }
            else {
                echo '{ "status": 200, "message": "no record created. id already exists." }';
            }
        }
        catch (Exception $e) {
            echo '{ "status": 500, "message": "' . $e->getMessage() . '" }';
        }
    }

    // ******************
    // *** READ (GET) ***
    // ******************

    function getAllRecords() {
        try {
            global $FILE_LOCATION;
            $vocabLists = file_get_contents($FILE_LOCATION);
            return json_encode($vocabLists);
        }
        catch (Exception $e) {
            return "{}";
        }
    }

    // ********************
    // *** UPDATE (PUT) ***
    // ********************

    function updateRecord() {
        try {
            $newData = json_decode(getHttpInputs(), true);
            $newId = $newData["id"];
            $newTitle = $newData["title"];
            $newVocab = $newData["vocab"];
            $vocabJsonArray = getSavedData();

            // Try to locate in the file and update
            if (array_key_exists($newId, $vocabJsonArray)) {
                $existingData = $vocabJsonArray[$newId];
                $existingData["title"] = $newTitle;
                $existingData["vocab"] = $newVocab;
                $vocabJsonArray[$newId] = $existingData;
                encodeAndSaveData($vocabJsonArray);
                echo '{ "status": 200, "message": "successfully updated." }';
            }
            else {
                echo '{ "status": 200, "message": "id not found. no records updated." }';
            }
        }
        catch (Exception $e) {
            echo '{ "status": 500, "message": "' . $e->getMessage() . '" }';
        }
    }

    // ***********************
    // *** DELETE (DELETE) ***
    // ************************

    function deleteRecord() {
        try {
            $data = json_decode(getHttpInputs(), true);
            if (isset($data['id'])) {
                $id = $data['id'];
                $vocabJsonArray = getSavedData();
                if (array_key_exists($id, $vocabJsonArray)) {
                    unset($vocabJsonArray[$id]);
                    encodeAndSaveData($vocabJsonArray);
                    echo '{ "status": 200, "message": "successfully deleted." }';
                }
                else {
                    echo '{ "status": 200, "message": "id not found. no records deleted." }';
                }
            }
            else {
                echo '{ "status": 200, "message": "no id present. no records deleted." }';
            }
        }
        catch (Exception $e) {
            echo '{ "status": 500, "message": "' . $e->getMessage() . '" }';
        }
    }
?>