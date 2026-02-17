<?php

    require("./common.php");
    $FILE_LOCATION_LIST = "../data/lists.json";
    $FILE_LOCATION_QUIZ = "../data/quizzes.json";
    $NUMBER_OF_QUESTIONS = 10;

    $jsonData = getJsonDataFromFile($FILE_LOCATION_LIST);
    $allWords = getListOfAllWords($jsonData);
    $randomList = getRandomList($allWords, $NUMBER_OF_QUESTIONS);
    addNewDataToJsonFile(getCurrentDate(), $randomList, $FILE_LOCATION_QUIZ);

    function getListOfAllWords($vocabLists) {
        $result = [];
        foreach ($vocabLists as $id => $list) {
            foreach ($list["vocab"] as $word) {
                array_push($result, $word);
            }
        }
        return $result;
    }

    function getRandomList($wordList, $numQuestions) {
        $result = [];
        $seenIds = [];
        for ($i = 0; $i < $numQuestions; $i++ ) {
            $randomIndex = -1;
            while ($randomIndex == -1) {
                $newIndex = mt_rand(0, count($wordList)-1);
                if (!in_array($newIndex, $seenIds)) { 
                    $randomIndex = $newIndex;
                }
            }
            array_push($result, $wordList[$randomIndex]);
            array_push($seenIds, $newIndex); 
        }
        return [ "vocab" => $result ];
    }

    function getCurrentDate() {
        date_default_timezone_set("America/Chicago");
        return date("Ymd");
    }

?>