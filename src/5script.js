//Global variables

import { WORDS } from "./5words.js";//Getting words from external file

const NUMBER_OF_GUESSES = 6;
let guessesRemaining = NUMBER_OF_GUESSES;
let currentGuess = [];//stack data structure
let nextLetter = 0;
let rightGuessString = WORDS[Math.floor(Math.random()/*random number from 0 to 1*/* WORDS.length)]//Selecting random word from list
console.log(rightGuessString)


//Board initialization
let board = document.getElementById("game-board");//getting game board element in html file
for (let i = 0; i < NUMBER_OF_GUESSES; i++) {
    let row = document.createElement("div")
    row.className = "letter-row"//creating a row element for each guess
        
    for (let j = 0; j < 5; j++) {
        let box = document.createElement("div")
        box.className = "letter-box"//creating a box element for each letter of guess(5)
        row.appendChild(box)//adding each box as a child of the row class
    }

    board.appendChild(row)//adding each row as a child of the board class
}


//css animation
const animateCSS = (element, animation, prefix = 'animate__') =>
  new Promise((resolve, reject) => {
    const animationName = `${prefix}${animation}`;
    const node = element
    node.style.setProperty('--animate-duration', '0.3s');
    node.classList.add(`${prefix}animated`, animationName);
    function handleAnimationEnd(event) {
      event.stopPropagation();
      node.classList.remove(`${prefix}animated`, animationName);
      resolve('Animation ended');
    }

    node.addEventListener('animationend', handleAnimationEnd, {once: true});
});


//Inserting user input
function insertLetter (pressedKey) {
    if (nextLetter === 5) {//first checking if last letter has been entered
        return
    }
    pressedKey = pressedKey.toLowerCase()

    let row = document.getElementsByClassName("letter-row")[6 - guessesRemaining]//getting the row of the place where letter should be placed
    let box = row.children[nextLetter]//getting box number of inputted letter
    box.textContent = pressedKey//Displaying text content
    animateCSS(box, "pulse")//animating letter input
    box.classList.add("filled-box")//calling the inputted box as a filled box to change border color
    currentGuess.push(pressedKey)//adding the letter to the current guess of player
    nextLetter += 1//incrementing lettercount
}


//Letter deleting function called when backspace is clicked
function deleteLetter () {
    let row = document.getElementsByClassName("letter-row")[6 - guessesRemaining]//Getting row of deleted letter
    let box = row.children[nextLetter - 1]
    box.textContent = ""//reseting the content in that box
    box.classList.remove("filled-box")//removing filled status of the box
    currentGuess.pop()//popping the top element of the current guess stack
    nextLetter -= 1//decrementing the letter count
}


//Function to decide shade of each box after entering one valid row
function shadeKeyBoard(letter, color) {
    for (const elem of document.getElementsByClassName("keyboard-button")) {//looping through each keyboard button
        if (elem.textContent === letter) {//checking if letter in button is what has been passed through
            let oldColor = elem.style.backgroundColor//taking the original colour of the keyboard button
            if (oldColor === 'green') {//returning if the colour of keyboard tile is already green
                return
            } 

            if (oldColor === 'yellow' && color !== 'green') {//if the old color is yellow and the inputted color is not green
                return
            }

            elem.style.backgroundColor = color//switching colors around
            break
        }
    }
}



function checkGuess () {
    let row = document.getElementsByClassName("letter-row")[6 - guessesRemaining]
    let guessString = ''
    let rightGuess = Array.from(rightGuessString)//Converting the right answer into an array of letters

    for (const val of currentGuess) {
        guessString += val
    }//shifting the value of current guess to a temporary variable guessstring

    if (guessString.length != 5) {
        toastr.error("Not enough letters!")//Give error message for not enough letters
        return
    }

    if (!WORDS.includes(guessString)) {
        toastr.error("Word not in list!")//Error message for insufficient letters
        return
    }

    for (let i = 0; i < 5; i++) {//looping through each letter
        let letterColor = ''//color value
        let box = row.children[i]//box's index
        let letter = currentGuess[i]//checking each letter of current guess
        
        let letterPosition = rightGuess.indexOf(currentGuess[i])//checking if the letter in given box is part of the right guess
        if (letterPosition === -1) {
            letterColor = 'grey'//giving grey as color if letter not in word
        } 
        else {
            if (currentGuess[i] === rightGuess[i]) {//checking if the inputted letter is in right position
                letterColor = 'green'
            } else {
                letterColor = 'yellow'
            }
            rightGuess[letterPosition] = "#"//Removing the checked letter from right guess string for next iteration
        }

        let delay = 250 * i
        setTimeout(()=> {
            box.style.backgroundColor = letterColor
            shadeKeyBoard(letter, letterColor)
        }, delay)//setting delay and executing the change of colour for the effect of color filling up one by one
    }

    if (guessString === rightGuessString) {
        toastr.success("You guessed right! Game over!")//checking if correct string has been guessed
        guessesRemaining = 0
        return
    } else {
        guessesRemaining -= 1;//resetting values for next row of guesses
        currentGuess = [];
        nextLetter = 0;

        if (guessesRemaining === 0) {//checking if user ran our of guesses and showing the right answer
            toastr.error("You've run out of guesses! Game over!")
            toastr.info(`The right word was: "${rightGuessString}"`)
        }
    }
}


//User input analyzer
document.addEventListener("keyup", (e) => {

    if (guessesRemaining === 0) {
        return
    }

    let pressedKey = String(e.key)
    if (pressedKey === "Backspace" && nextLetter !== 0) {
        deleteLetter()
        return
    }

    if (pressedKey === "Enter") {
        checkGuess()
        return
    }

    let found = pressedKey.match(/[a-z]/gi)/*Searching case insensitive*/
    if (!found || found.length > 1) {
        return
    } else {
        insertLetter(pressedKey)
    }//Checking all the conditions that the pressed key must not be entered in the box
})


//Adding functionality to displayed keyboard
document.getElementById("keyboard-cont").addEventListener("click", (e) => {
    const target = e.target
    
    if (!target.classList.contains("keyboard-button")) {//ifthe clicked event is not on a keyboard button, return
        return
    }
    let key = target.textContent//storing the clicked value

    if (key === "Del") {
        key = "Backspace"
    } 

    document.dispatchEvent(new KeyboardEvent("keyup", {'key': key}))//Considering the keypress as a ney keyboard event and repeating the process for pressed key
})
