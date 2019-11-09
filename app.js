let round = 1;
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

// on document load, get words!
document.onload = getWords();

// fetches words from last-words-backend API and saves in roundWords
function getWords() {
    fetch(url)
        .then(response => response.json())
        .then(json => saveWords(json));
};

function saveWords(json){
    roundWords = json;
};

function injectWord(word){
    wordObject = word;
    newWord(word.name);

    let definition = `${word.major_class} ${word.definition}`;
    document.getElementById("definitionField").innerHTML = definition;

};

document.getElementById("newWord").addEventListener('click', getWords);

function createWordBlank(wordArray) {
    wordScreen = [];
    for (let char = 0; char < wordArray.length; char++) {
        wordScreen.push('_')
    }
    return wordScreen;
}

function newWord(fetchedWord) {
    if (misses === 6) {
        document.getElementById("wordScore").innerHTML = '';
    }

    word = fetchedWord;
    wordArray = word.split('');
    wordScreen = createWordBlank(wordArray);
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
}

window.addEventListener("keypress", attempt);

function attempt(e) {
    let char = e.key;

    if (/[a-zA-Z]/.test(char) && gameOver === false) {
        if (wordArray.includes(char) ) {
            guess(char);
            reveal(char, wordArray, wordScreen);
        } else {
            miss(char);
        }
    }
}

function guess(character) {
    if (!guessArray.includes(character)) {
        guessArray.push(character);
        document.getElementById("guessChars").innerHTML += `${character} `;
    }
}

function reveal(character, wordArray, wordScreen) {
    for (let i = 0; i < wordArray.length; i++) {
        if (character === wordArray[i]) {
            wordScreen[i] = wordArray[i];
        }
    }

    document.getElementById("wordField").innerHTML = wordScreen.join(' ');
    
    if (wordScreen.join('') === wordArray.join('')) {
        gameOver = true;
        setTimeout(function() {
            // alert("You win :)")
            document.getElementById("titleStatus").textContent = 'Last Words!';
            score = scoreCalculator(wordObject);
            scoreStyle = scoreColor();
            document.getElementById("wordScore").innerHTML += `<li ${scoreStyle}>${wordScreen.join('')} (${score})</li>`;
            
        }, 0)
    }
}

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

function missAccent() {

}

function removeTransition(event) {
    if (event.propertyName !== 'transform') return;
    this.classList.remove('missing');
}

document.getElementById("scaffoldImg").addEventListener('transitionend', removeTransition);
