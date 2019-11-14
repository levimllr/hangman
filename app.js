let round = 0;
let roundWordIndex = 1;
let roundLength = 3;
let roundWords = [];
let totalScore = 0;
let wordObject;
let wordArray = [];
let wordScreen = [];
let guessArray = [];
let missArray= [];
let misses = 0;
let gameName = ["_", "_", "_"];
let gameOver = true;
let newGame = true;
let wordId;
let definition;
const domain = 'http://localhost:3000'
let game = {
    id: null,
    username: null,
    total_score: 0
};
let gameWord = {
    game_id: null,
    word_id: null,
    misses: null,
    win: null,
    score: null
};
let highScores = [];

const gameInfoDiv = document.getElementById("gameInfo");

const gameModal = document.getElementById("gameModal");
const gameModalHeader = document.getElementById("gameModalHeader");
const scoreModal = document.getElementById("scoreModal");
const scoreModalList = document.getElementById("scoreList");

// on document load, open new game modal and fetch high scores!
document.onload = toggleGameModal();
document.onload = fetchHighScores();

// fetch high scores and store them in highScores
function fetchHighScores() {
    let resource = "/games/high_scores"
    let url = domain + resource;
    fetch(url).then(response => response.json()).then(json => populateScores(json))
};

// create and append high score list items to DOM
function populateScores(json) {
    let rankMap = ["0TH", "1ST", "2ND", "3RD", "4TH", "5TH", "6TH", "7TH", "8TH", "9TH", "10TH"];
    scoreModalList.innerHTML = "";
    let rank = 1;
    json.forEach( (score) => {
        let scoreString = formatScore(score.total_score);
        let scoreItem = document.createElement("li");
        scoreItem.setAttribute("class", "modal-list-item");
        scoreItem.setAttribute("style", scoreColor(rank - 1));
        scoreItem.innerHTML = `${rankMap[rank]}...${scoreString}...${score.username}`;
        scoreModalList.appendChild(scoreItem);
        rank += 1;
    });
};

// format score string  for high scores
function formatScore(score) {
    let scoreString = `${score}`;
    scoreStringArray = scoreString.split("");
    if (scoreString.length < 4) {
        while (scoreStringArray.length < 4) {
            scoreStringArray.unshift("0");
        };
    };
    scoreString = scoreStringArray.join("");
    return scoreString;
};

// toggle the show-modal CSS class, which determines visibility of modal
function toggleGameModal() {
    gameModal.classList.toggle("show-modal");
};
function toggleScoreModal() {
    scoreModal.classList.toggle("show-modal");
};

// toggle the score modal if clicking outside the score modal
function windowOnClick(event) {
    if (event.target === scoreModal) {
        toggleScoreModal();
    }
}

// the high score modal "X" button
const closeButton = document.querySelector(".close-button");

// event listeners for toggling the score modal (new game modal auto closes)
closeButton.addEventListener("click", toggleScoreModal);
window.addEventListener("click", windowOnClick);

// reset the game any time the "New Word" button is clicked
document.getElementById("newGameButton").addEventListener('click', reset);
// show scores any time the "High Scores" button is clicked
document.getElementById("highScoreButton").addEventListener('click', toggleScoreModal);

// assess an answer attempt with every keypress
window.addEventListener("keypress", attempt);

// reset the game by resting game-tracking booleans, altering DOM,
// clearing objects, and toggling new game modal
function reset() {
    gameOver = true;
    newGame = true;
    gameName = ["_", "_", "_"];
    gameModalHeader.innerHTML = 'Any last words, _ _ _?';
    game = {
        id: null,
        username: null,
        total_score: 0
    };
    gameWord = {
        game_id: null,
        word_id: null,
        misses: null,
        win: null,
        score: null
    };
    toggleGameModal();
};

// GETs random set of words from API, appends one to DOM 
function startGame() {
    game.username = gameName.join("");
    round = 0;
    game.totalScore = 0;
    postGame();
    startRound();
    document.getElementById(`wordScore-${round}`).innerHTML = '';
    document.getElementById("totalScore").innerHTML = "Total Score: 0";
};

// POSTs new game to API and updates local object
function postGame() {
    let url = domain + "/games"
    let data = {
        username: game.username,
        total_score: game.total_score
    };
    fetch(url, {
        method: 'POST',
        mode: 'cors',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    }).then(
        response => response.json()
    ).then(
        json => game.id = json.id
    );
};

// update GameWord object which tracks a game's word performance
function setGameWord(winBoolean) {
    gameWord.game_id = game.id;
    gameWord.word_id = wordObject.id;
    gameWord.misses = missArray.join("");
    gameWord.win = winBoolean;
};

// POST gameWord, update local gameWord
async function postGameWord(gameWord) {
    let url = domain + `/games/${game.id}/game_words`;
    let data = {
        game_word: gameWord
    };
    await fetch(url, {
        method: 'POST',
        mode: 'cors',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    }).then(
        response => response.json()
    ).then(
        json => gameWord.score = json.score
    );
    appendGameWord();
};

// append new (winning) gameWord to DOM
function appendGameWord() {
    game.total_score += gameWord.score;
    scoreStyle = scoreColor(misses);
    let wordScore = document.getElementById(`wordScore-${round}`);
    let wordScoreItem = document.createElement("li");
    wordScoreItem.setAttribute("id", `wordScoreItem-${roundWordIndex}`)
    wordScoreItem.innerHTML = `${wordScreen.join('')} (${gameWord.score})`;
    wordScoreItem.setAttribute("style", scoreStyle); 
    wordScore.appendChild(wordScoreItem);
    document.getElementById("totalScore").innerHTML = `Total Score: ${game.total_score}`;
};

// PATCH game in API with new winnings
async function updateGame() {
    let url = domain + `/games/${game.id}`;
    let data = {
        game: game
    };
    await fetch(url, {
        method: 'PATCH',
        mode: 'cors',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    });
};

// start a round by incrementing the round counter, 
// appending a round header to the gameInfo div,
// and fetching and setting up a word
function startRound() {
    gameInfoDiv.innerHTML = '';
    round += 1;
    roundWordIndex = 1;
    appendRoundHeaderScore(round);
    getWords(roundLength)
        .then(() => spinTheWheel(injectWord))
        .then(() => {
            wordObjectIndex = roundWords.indexOf(wordObject);
            roundWords.splice(wordObjectIndex, 1);
        });
};

// create and append round header and round word list container to DOM
function appendRoundHeaderScore(round){
    let roundHeader = document.createElement("h3");
    roundHeader.setAttribute("id", `round${round}header`);
    let roundScores = document.createElement("ul");
    roundScores.setAttribute("id", `wordScore-${round}`)
    roundHeader.innerHTML = `Round ${round}`
    gameInfoDiv.append(roundHeader);
    document.getElementById(`round${round}header`).append(roundScores);
};

// fetche words from last-words-backend API and saves in roundWords
async function getWords() {
    let url = domain + '/words/random'
    await fetch(url)
        .then(response => response.json())
        .then(json => saveWords(json));
};

// save an array of word objects in roundWords
function saveWords(json) {
    roundWords = json;
};

// "inject" the contents of a word object into the DOM
function injectWord() {
    roundWordsIndex = Math.floor(Math.random() * roundWords.length);
    wordObject = roundWords[roundWordsIndex];
    newWord(wordObject.name);
    let definition = `${wordObject.major_class} ${wordObject.definition}`;
    document.getElementById("definitionField").innerHTML = definition;
};

// pause the execution of a function for ms time
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
};

// repeatedly execute a fn between 5 and 10 times, for surprise!
async function spinTheWheel(fn) {
    let nTimes = Math.floor(Math.random() * 5) + 5;
    for (let n = 0; n < nTimes; n++) {
        await sleep(250).then(() => fn());
    };
};

// create the word blank
function createWordScreen(wordArray) {
    wordScreen = [];
    wordArray.forEach((character) => {
        if (isLetter(character)) {
            wordScreen.push('_');
        } else {
            wordScreen.push(character);
        }
    });
    return wordScreen;
};

// return true if character is a letter (numbers are unchanged by case methods)
function isLetter(c) {
    return c.toLowerCase() != c.toUpperCase();
}

// return array of the word's characters, as well as its screen (i.e. _ _ _ _)
function newWord(fetchedWord) {
    if (misses === 6) {
        document.getElementById(`wordScore-${round}`).innerHTML = '';
    }

    word = fetchedWord;
    wordArray = word.split('');
    wordScreen = createWordScreen(wordArray);
    guessArray = [];
    missArray = [];
    misses = 0;
    gameOver = false;

    resetHangmanWork();

    return wordArray, wordScreen;
};

// reset DOM elements pertaining to hangman, word, hits, and misses
function resetHangmanWork() {
    document.getElementById("titleStatus").textContent = 'Last Words';
    document.getElementById("scaffoldImg").src = './resources/img/Hangman-0.png'; 
    document.getElementById("wordField").innerHTML = wordScreen.join(" ");
    document.getElementById("guessChars").innerHTML = ``;
    document.getElementById("missChars").innerHTML = ``;
};

// check an answer attempt: input game name or guess and hit or miss if playing
function attempt(e) {
    let char = e.key;

    if (/[a-zA-Z]/.test(char) && gameOver === false) {
        char = char.toLowerCase();
        if (wordArray.includes(char) ) {
            guess(char);
            reveal(char, wordArray, wordScreen);
        } else {
            miss(char);
        };
    } else if (/[a-zA-Z]/.test(char) && newGame === true)  {
        inputGameName(char);
    };
};

// fill out gameName and trigger game start when game name complete
async function inputGameName(character) {
    let char = character.toUpperCase();
    let index = gameName.indexOf("_");
    gameName[index] = char;
    gameNameString = gameName.join(" ");
    gameModalHeader.innerHTML = `Any last words, ${gameNameString} ?`
    if (index == 2 || index == -1) {
        newGame = false;
        await sleep(500);
        toggleGameModal();
        startGame();
    };
};

// "guess" char by pushing it onto guessArray if not present (only if correct)
function guess(character) {
    if (!guessArray.includes(character)) {
        guessArray.push(character);
        document.getElementById("guessChars").innerHTML += `${character} `;
    };
};

// reveal a character in wordScreen if it's in wordAray and check for win
function reveal(character, wordArray, wordScreen) {
    for (let i = 0; i < wordArray.length; i++) {
        if (character === wordArray[i]) {
            wordScreen[i] = wordArray[i];
        };
    };

    document.getElementById("wordField").innerHTML = wordScreen.join(' ');
    
    checkWin();
};

// check to see if the word is won!
function checkWin() {
    if (wordScreen.join('') === wordArray.join('')) {
        gameOver = true;
        setTimeout(function() {
            document.getElementById("titleStatus").textContent = 'Last Words!';
            setGameWord(true);
            postGameWord(gameWord).then(() => updateGame());
        }, 0);
        setTimeout(function() {
            roundWordIndex += 1;
            if (roundWordIndex <= roundLength) {
                spinTheWheel(injectWord).then(() => {
                    wordObjectIndex = roundWords.indexOf(wordObject);
                    roundWords.splice(wordObjectIndex, 1);
                });
            } else {
                startRound();
            };
        }, 2000);
    };
};

// return calculated score based on word points, length, and number of misses
function scoreCalculator(word) {
    let score = word.points + word.name.length - (2 * misses);
    return score;
};

// return score style string in accordance with number of misses
function scoreColor(index) {
    let score = 'color:';
    if (index === 0) {
        score += 'purple';
    } else if (index === 1) {
        score += 'blue';
    } else if (index === 2) {
        score += 'green';
    } else if (index === 3) {
        score += 'gold';
    } else if (index === 4) {
        score += 'orange';
    } else if (index === 5) {
        score += 'red';
    }
    return score;
};

// show the word in the word field
function showAll() {
    document.getElementById("wordField").innerHTML = wordArray.join(' ');
};

// handle a miss and a loss
function miss(character) {
    if (!missArray.includes(character)) {
        missArray.push(character);
        document.getElementById("missChars").innerHTML += `${character} `;
        misses += 1;
        document.getElementById("scaffoldImg").src = './resources/img/Hangman-' + misses + '.png'; 
        document.getElementById("scaffoldImg").classList.add('missing');
    };

    if (misses == 6) {
        gameOver = true;
        setTimeout(function() {
            // alert("GAME OVER :'(")
            document.getElementById("titleStatus").textContent = 'Last Words...';
            showAll();
            fetchHighScores();
        }, 0);
    };
};

// remove the CSS class giving the expansion animation of the hangman
function removeTransition(event) {
    if (event.propertyName !== 'transform') return;
    this.classList.remove('missing');
};

// trigger the removal of the CSS class transition when the transition finishes 
document.getElementById("scaffoldImg").addEventListener('transitionend', removeTransition);
