<?php

    // ************************
    // *** SHARED FUNCTIONS ***
    // ************************

    // Read current file into assoc array
    function getJsonDataFromFile($fileLocation) {
        $savedData = file_get_contents($fileLocation);
        return json_decode($savedData, true);
    }

    function addNewDataToJsonFile($newId, $newData, $fileLocation) {
        $jsonData = getJsonDataFromFile($fileLocation);
        // Try to locate in the file -- if not there, create
        if (!array_key_exists($newId, $jsonData)) {
            $jsonData[$newId] = $newData;
            encodeAndSaveJsonToFile($jsonData, $fileLocation);
            echo '{ "status": 200, "message": "successfully created for '.$newId.'." }';
        }
        else {
            echo '{ "status": 200, "message": "no record created. record for id '.$newId.' already exists." }';
        }
    }

    // Re-encode and save
    function encodeAndSaveJsonToFile($data, $fileLocation) {
        $encoded = json_encode($data);
        file_put_contents($fileLocation, $encoded);
    }

    function getHttpInputs() {
        $inputs = file_get_contents('php://input');
        return json_decode($inputs, true);
    }

?>