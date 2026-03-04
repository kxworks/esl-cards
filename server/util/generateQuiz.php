<?php

    require("./common.php");
    $FILE_LOCATION_LIST = "../data/lists.json";
    $FILE_LOCATION_QUIZ = "../data/quizzes.json";
    $NUMBER_OF_QUESTIONS = 10;
    $NUMBER_OF_DAYS_TO_EXCLUDE = 3;

    $jsonData = getJsonDataFromFile($FILE_LOCATION_LIST);
    $exclusionList = getPreviousQuizzesList($FILE_LOCATION_QUIZ, $NUMBER_OF_DAYS_TO_EXCLUDE);
    $randomList = getRandomList($jsonData, $NUMBER_OF_QUESTIONS, $exclusionList);
    addNewDataToJsonFile(getCurrentDate(), $randomList, $FILE_LOCATION_QUIZ);

    function getPreviousQuizzesList($filePath, $numDays) {
        $quizData = getJsonDataFromFile($filePath);
        $result = [];
        $daysFound = 0;
        $i = 0;
        while ($daysFound < $numDays) {
            $i++;
            $date = getNewDate(($i*-1));
            if (array_key_exists($date, $quizData) && $quizData[$date] != null) {
                $list = $quizData[$date];
                foreach ($list["vocab"] as $word) {
                    array_push($result, $word);
                }
                $daysFound++;
            }
        }
        return $result;
    }

    function getRandomList($vocabLists, $numQuestions, $exclusionList) {
        $result = [];
        $seenIds = [];
        $allWords = getListOfAllWords($vocabLists);
        for ($i = 0; $i < $numQuestions; $i++ ) {
            $newIndex = -1;
            $newWord = "";
            $randCounter = 0;
            while ($newIndex == -1) {
                $randomIndex = mt_rand(0, count($allWords)-1);
                $newWord = $allWords[$randomIndex];
                if (!in_array($randomIndex, $seenIds) && !exclusionListContainsWord($newWord, $exclusionList)) { 
                    $newIndex = $randomIndex;
                    array_push($result, $newWord);
                    array_push($seenIds, $newIndex); 
                }
                else {
                    $randCounter++;
                }
                if ($randCounter == count($allWords)*2) { break; }
                // Update this logic to instead search for valid item instead of relying on random
            }
        }
        return [ "vocab" => $result ];
    }

    // ***************
    // *** HELPERS ***
    // ***************

    function exclusionListContainsWord($word, $exclusionList) {
        foreach ($exclusionList as $exclusion) {
            if ($word["base"] == $exclusion["base"] && $word["target"] == $exclusion["target"]) { return true; }
        }
        return false;
    }

    function getListOfAllWords($vocabLists) {
        $result = [];
        foreach ($vocabLists as $id => $list) {
            foreach ($list["vocab"] as $word) {
                array_push($result, $word);
            }
        }
        return $result;
    }

    function getCurrentDate() {
        date_default_timezone_set("America/Chicago");
        return date("Ymd");
    }

    function getNewDate($numDays) {
        $date = new DateTime(getCurrentDate());
        $date->modify("".$numDays." days"); 
        return $date->format('Ymd'); 
    }

?>