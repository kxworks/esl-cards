<?php

    require("./common.php");
    $FILE_LOCATION_LIST = "../data/lists.json";
    $FILE_LOCATION_QUIZ = "../data/quizzes.json";
    $NUMBER_OF_QUESTIONS = 10;

    $jsonData = getJsonDataFromFile($FILE_LOCATION_LIST);
    $allWords = getListOfAllWords($jsonData);
    $randomList = getRandomList($allWords, $NUMBER_OF_QUESTIONS);
    print_r($randomList);

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
        for ($i = 0; $i < $numQuestions; $i++ ) {
            $randomIndex = mt_rand(0, count($wordList)-1);
            array_push($result, $wordList[$randomIndex]);
        }
        return $result;
    }



?>