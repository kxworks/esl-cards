<?php

    // ************************
    // *** SHARED FUNCTIONS ***
    // ************************

    // Read current file
    function getJsonDataFromFile($fileLocation) {
        $savedData = file_get_contents($fileLocation);
        return json_decode($savedData, true);
    }

    // Re-encode and save
    function encodeAndSaveJsonToFile($fileLocation) {
        $encoded = json_encode($data);
        file_put_contents($fileLocation, $encoded);
    }

    function getHttpInputs() {
        $inputs = file_get_contents('php://input');
        return json_decode($inputs, true);
    }

?>