const testWord = 'execution';
const wordList = 'a'
let wordArray = [];
let wordScreen = [];
let guessArray = [];
let missArray= [];
let misses = 0;
let gameOver = true;
const appKey = '87a85373-efd3-4950-b109-d1c0dfdb86e9';
let wordId;
let definition;
const proxy = 'https://mighty-scrubland-31527.herokuapp.com/';
const url = 'https://www.dictionaryapi.com/api/v3/references/collegiate/json/'
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
    fetchUrl = url + word.toLowerCase() + '?key=' + appKey;
    fetch((proxy + fetchUrl), {
        method: 'GET',
    })
    .then((response) => response.json())
    .then(function(data) {
        console.log(data);
        if (data.length === 20) {
            newWord();
        } else {
            try {
                definition = data[0].shortdef.join(', ');
            } catch {
                newWord();
            }
        }
        document.getElementById("definitionField").innerHTML = definition;
    });
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
            score = scoreColor();
            document.getElementById("wordScore").innerHTML += '<li ' + score + '>' + wordScreen.join('') + '</li>';
            
        }, 1000)
    }
}

function scoreColor() {
    let score = 'style=\"color:';
    if (misses === 0) {
        score += 'purple;\"';
    } else if (misses === 1) {
        score += 'blue;\"';
    } else if (misses === 2) {
        score += 'green;\"';
    } else if (misses === 3) {
        score += 'yellow;\"';
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
            alert("GAME OVER :'(")
            document.getElementById("wordScore").innerHTML = '';
            showAll();
        }, 1000)
    }
}

function missAccent() {

}

function removeTransition(event) {
    if (event.propertyName !== 'transform') return;
    this.classList.remove('missing');
}

document.getElementById("scaffoldImg").addEventListener('transitionend', removeTransition);
