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
let wordId;
let definition;
const domain = 'http://localhost:3000'

const modal = document.getElementById("modal");
const modalHeader = document.getElementById("modal-header");

// on document load, open modal!
document.onload = toggleModal();

function toggleModal() {
    modal.classList.toggle("show-modal");
};

// fetch words any time the "New Word" button is clicked
document.getElementById("newGame").addEventListener('click', reset);

// assess an attempt with every keypress
window.addEventListener("keypress", attempt);

function reset() {
    gameName = ["_", "_", "_"];
    modalHeader.innerHTML = 'Any last words, _ _ _?';
    toggleModal();
};

// GETs random set of words, appends one to DOM 
function startGame() {
    document.getElementById("gameInfo").innerHTML = '';
    round = 0;
    totalScore = 0;
    postGame();
    startRound();
    document.getElementById(`wordScore-${round}`).innerHTML = '';
    document.getElementById("totalScore").innerHTML = "Total Score: 0";
};

function postGame() {
    let url = domain + "/games"
    let data = {
        username: gameName.join(""),
        total_score: totalScore
    };
    fetch(url, {
        method: 'POST',
        mode: 'cors',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    });
};

// starts a round by incrementing the round counter, 
// appending a round header to the gameInfo div,
// and fetching and setting up a word
function startRound() {
    round += 1;
    roundWordIndex = 1;
    appendRoundHeaderScore(round);
    getWords(roundLength).then(() => spinTheWheel(injectWord));
};

function appendRoundHeaderScore(round){
    let roundHeader = document.createElement("h3");
    roundHeader.setAttribute("id", `round${round}header`);
    let roundScores = document.createElement("ul");
    roundScores.setAttribute("id", `wordScore-${round}`)
    roundHeader.innerHTML = `Round ${round}`
    document.getElementById("gameInfo").append(roundHeader);
    document.getElementById(`round${round}header`).append(roundScores);
};

// fetches words from last-words-backend API and saves in roundWords
async function getWords() {
    let url = domain + '/words/random'
    await fetch(url)
        .then(response => response.json())
        .then(json => saveWords(json));
};

// saves an array of word objects in roundWords
function saveWords(json) {
    roundWords = json;
};

// "injects" the contents of a word object into the DOM
function injectWord() {
    roundWordsIndex = Math.floor(Math.random() * roundWords.length);
    wordObject = roundWords[roundWordsIndex];
    console.log(roundWordsIndex);
    console.log(wordObject.name);

    newWord(wordObject.name);

    let definition = `${wordObject.major_class} ${wordObject.definition}`;
    document.getElementById("definitionField").innerHTML = definition;
};

// pause the execution of a function for ms time
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
};

// repeatedly execute a fn between 5 and 10 times 
async function spinTheWheel(fn) {
    console.log("Injecting!");
    let nTimes = Math.floor(Math.random() * 5) + 5;
    for (let n = 0; n < nTimes; n++) {
        await sleep(250).then(() => fn());
    };
};

// creates the word blank
function createWordScreen(wordArray) {
    wordScreen = [];
    wordArray.forEach((character) => {
        if (isLetter(character)) {
            wordScreen.push('_')
        } else {
            wordScreen.push(character)
        }
    });
    return wordScreen;
};

// returns true if character is a letter (numbers are unchanged by case methods)
function isLetter(c) {
    return c.toLowerCase() != c.toUpperCase();
}

// returns array of the word's characters, as well as its screen (i.e. _ _ _ _)
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

    document.getElementById("titleStatus").textContent = 'Last Words';
    document.getElementById("scaffoldImg").src = './resources/img/Hangman-0.png'; 
    document.getElementById("wordField").innerHTML = wordScreen.join(' ');
    document.getElementById("guessChars").innerHTML = ``;
    document.getElementById("missChars").innerHTML = ``;

    return wordArray, wordScreen;
};


async function attempt(e) {
    let char = e.key;

    if (/[a-zA-Z]/.test(char) && gameOver === false) {
        char = char.toLowerCase();
        if (wordArray.includes(char) ) {
            guess(char);
            reveal(char, wordArray, wordScreen);
        } else {
            miss(char);
        };
    } else if (/[a-zA-Z]/.test(char) && gameOver === true)  {
        char = char.toUpperCase();
        let index = gameName.indexOf("_");
        gameName[index] = char;
        gameNameString = gameName.join(" ");
        modalHeader.innerHTML = `Any last words, ${gameNameString}?`
        if (index == 2 || index == -1) {
            await sleep(500);
            toggleModal();
            startGame();
        };
    };
};

function guess(character) {
    if (!guessArray.includes(character)) {
        guessArray.push(character);
        document.getElementById("guessChars").innerHTML += `${character} `;
    };
};

function reveal(character, wordArray, wordScreen) {
    for (let i = 0; i < wordArray.length; i++) {
        if (character === wordArray[i]) {
            wordScreen[i] = wordArray[i];
        };
    };

    document.getElementById("wordField").innerHTML = wordScreen.join(' ');
    
    if (wordScreen.join('') === wordArray.join('')) {
        gameOver = true;
        setTimeout(function() {
            document.getElementById("titleStatus").textContent = 'Last Words!';
            score = scoreCalculator(wordObject);
            totalScore += score;
            scoreStyle = scoreColor();
            document.getElementById(`wordScore-${round}`).innerHTML += `<li ${scoreStyle}>${wordScreen.join('')} (${score})</li>`;
            document.getElementById("totalScore").innerHTML = `Total Score: ${totalScore}`
        }, 0);
        setTimeout(function() {
            roundWordIndex += 1;
            if (roundWordIndex <= roundLength) {
                spinTheWheel(injectWord);
            } else {
                startRound();
            };
        }, 2000);
    };
};

function scoreCalculator(word) {
    let score = word.points + word.name.length - (2 * misses);
    return score;
};

function scoreColor() {
    let score = 'style=\"color:';
    if (misses === 0) {
        score += 'purple;\"';
    } else if (misses === 1) {
        score += 'blue;\"';
    } else if (misses === 2) {
        score += 'green;\"';
    } else if (misses === 3) {
        score += 'gold;\"';
    } else if (misses === 4) {
        score += 'orange;\"';
    } else if (misses === 5) {
        score += 'red;\"';
    }
    return score;
}

function showAll() {
    document.getElementById("wordField").innerHTML = wordArray.join(' ');
}

function miss(character) {
    if (!missArray.includes(character)) {
        missArray.push(character);
        document.getElementById("missChars").innerHTML += `${character} `;
        misses += 1;
        document.getElementById("scaffoldImg").src = './resources/img/Hangman-' + misses + '.png'; 
        document.getElementById("scaffoldImg").classList.add('missing');
    }

    if (misses == 6) {
        gameOver = true;
        setTimeout(function() {
            // alert("GAME OVER :'(")
            document.getElementById("titleStatus").textContent = 'Last Words...';
            showAll();
        }, 0)
    }
}

function removeTransition(event) {
    if (event.propertyName !== 'transform') return;
    this.classList.remove('missing');
}

document.getElementById("scaffoldImg").addEventListener('transitionend', removeTransition);
