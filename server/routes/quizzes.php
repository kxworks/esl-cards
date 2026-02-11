<?php

    require("../util/common.php");
    $FILE_LOCATION = "../data/quizzes.json";

    // **************
    // *** ROUTER ***
    // **************

    $reqMethod = $_SERVER['REQUEST_METHOD'];
    switch ($reqMethod) {
        case "GET": echo getRecord(); break;
        default: break;
    }

    // ******************
    // *** READ (GET) ***
    // ******************

    function getRecord() {
        try {
            global $FILE_LOCATION;
            $jsonData = getJsonDataFromFile($FILE_LOCATION);
            $date = null; 
            if (isset($_GET["date"])) { $date = $_GET["date"]; }
            if (isset($date) && array_key_exists($date, $jsonData)) {
                return json_encode($jsonData[$date]);
            }
            else {
                return '{}';
            }
        }
        catch (Exception $e) {
            return '{ "status": 500, "message": "' . $e->getMessage() . '" }';
        }
    }


?>