const testWord = 'execution';
const wordList = 'a'
let wordArray = [];
let wordScreen = [];
let guessArray = [];
let missArray= [];
let misses = 0;
let gameOver = true;
const appId = '1eb6bbf3';
const appKey = '3b58ecb64ecd8432f41aa1142f8125e9';
const language = 'en-us';
let wordId;
const proxy = 'https://cors-anywhere.herokuapp.com/';
const url = 'https://od-api.oxforddictionaries.com/api/v2/'
let fetchUrl;

let allText = readTextFile("./resources/words_alpha.txt")
dictArray = createDictArray(allText);

function readTextFile(file)
{
    var rawFile = new XMLHttpRequest();
    let allText;
    rawFile.open("GET", file, false);
    rawFile.onreadystatechange = function ()
    {
        if(rawFile.readyState === 4)
        {
            if(rawFile.status === 200 || rawFile.status == 0)
            {
                allText = rawFile.responseText;
            }
        }
    }
    rawFile.send(null);
    return allText;
}

function createDictArray(delimitedText) {
    dictArray = delimitedText.split('\n');
    return dictArray;
}

function getDefinition(word) {
    fetchUrl = url + 'entries/' + language + '/' + word.toLowerCase() + '?fields=definitions';
    console.log(fetchUrl);
    fetch((proxy + fetchUrl), {
        method: 'GET',
        headers: {"app_id": appId, "app_key": appKey}
    }).then(response => response.json()).then(response => console.log('Success: ', JSON.stringify(response)));
}

document.getElementById("newWord").addEventListener('click', newWord);

function pickRandomWord(dictArray) {
    let index = Math.floor(Math.random() * Math.floor(dictArray.length));
    return dictArray[index]
}

function createWordBlank(wordArray) {
    wordScreen = [];
    for (let char = 0; char < wordArray.length; char++) {
        wordScreen.push('_')
    }
    return wordScreen;
}

function newWord() {
    let word = pickRandomWord(dictArray)
    wordArray = word.split('');
    wordArray.pop();
    console.log(wordArray);
    wordScreen = createWordBlank(wordArray);
    guessArray = [];
    missArray = [];
    misses = 0;
    gameOver = false;

    getDefinition(word);

    document.getElementById("scaffoldImg").src = './resources/img/Hangman-0.png'; 
    document.getElementById("wordField").innerHTML = wordScreen.join(' ');
    document.getElementById("guessChars").innerHTML = ``;
    document.getElementById("missChars").innerHTML = ``;

    return wordArray, wordScreen;
}

window.addEventListener("keypress", attempt);

function attempt(e) {
    let char = e.key;

    if (!wordArray || gameOver === true) {
        alert("Get a New Word!")
        showAll();
    }

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
            alert("You win :)")
        }, 1000)
    }
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
    }

    if (misses == 6) {
        gameOver = true;
        setTimeout(function() {
            alert("GAME OVER :'(")
            showAll();
        }, 1000)
    }
}
