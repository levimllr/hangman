let round;
let roundWords = [];
let wordObject;
let wordArray = [];
let wordScreen = [];
let guessArray = [];
let missArray= [];
let misses = 0;
let gameOver = true;
let wordId;
let definition;
const url = 'http://localhost:3000/random_words'

// on document load, start game!
document.onload = startGame();

// fetch words any time the "New Word" button is clicked
document.getElementById("newGame").addEventListener('click', startGame);
// assess an attempt with every keypress
window.addEventListener("keypress", attempt);

// GETs random set of words, appends one to DOM 
function startGame() {
    round = 1;
    document.getElementById("wordScore").innerHTML = '';
    getWords().then(() => injectWord(roundWords[round - 1]));
};


// fetches words from last-words-backend API and saves in roundWords
async function getWords() {
    await fetch(url)
        .then(response => response.json())
        .then(json => saveWords(json));
};

// saves an array of word objects in roundWords
function saveWords(json){
    roundWords = json;
};

// "injects" the contents of a word object into the DOM
function injectWord(word){
    wordObject = word;
    newWord(word.name);

    let definition = `${word.major_class} ${word.definition}`;
    document.getElementById("definitionField").innerHTML = definition;
};

// creates the word blank
function createWordScreen(wordArray) {
    wordScreen = [];
    for (let char = 0; char < wordArray.length; char++) {
        wordScreen.push('_')
    }
    return wordScreen;
};

// returns array of the word's characters, as well as its screen (i.e. _ _ _ _)
function newWord(fetchedWord) {
    if (misses === 6) {
        document.getElementById("wordScore").innerHTML = '';
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



function attempt(e) {
    let char = e.key;

    if (/[a-zA-Z]/.test(char) && gameOver === false) {
        if (wordArray.includes(char) ) {
            guess(char);
            reveal(char, wordArray, wordScreen);
        } else {
            miss(char);
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
            round += 1
            document.getElementById("titleStatus").textContent = 'Last Words!';
            score = scoreCalculator(wordObject);
            scoreStyle = scoreColor();
            document.getElementById("wordScore").innerHTML += `<li ${scoreStyle}>${wordScreen.join('')} (${score})</li>`;
        }, 0);
        setTimeout(function() {
            if (round < 5) {
                injectWord(roundWords[round - 1]);
            } else {
                getWords().then(() => injectWord(roundWords[round - 1]));
            };
        }, 3000);
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
