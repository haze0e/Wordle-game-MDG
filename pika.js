import { words } from './words.js';
import { allow_words } from './words.js';


const board = document.getElementById("board");
const solveBtn = document.getElementById("solve-btn");
const rows = 6;
const cols = 5;
const restartBtn = document.getElementById("restart-btn");
const terminalContent = document.getElementById("terminal-content");



let stats = {
    total_wins: 0,
    total_losses: 0,
    current_streak: 0
};

let currentRow = 0;
let currentCol = 0;
let Random_word = "";
let isGameOver = false;
let isProcessing = false;
let isBotActive = false;


let code_his = [];

function is_word_valid(dictionaryWord, guessCode) {
    let guess = "";
    let actualColors = [];


    for (let i = 0; i < guessCode.length; i += 3) {
        actualColors.push(guessCode[i]); // 'g', 'y', or 'b'
        guess += guessCode[i + 1];       // the letter
    }


    let targetCounts = {};
    for (let char of dictionaryWord) {
        targetCounts[char] = (targetCounts[char] || 0) + 1;
    }

    let simColors = new Array(guess.length).fill('b');


    for (let i = 0; i < guess.length; i++) {
        if (guess[i] === dictionaryWord[i]) {
            simColors[i] = 'g';
            targetCounts[guess[i]]--;
        }
    }


    for (let i = 0; i < guess.length; i++) {
        if (simColors[i] === 'g') continue;

        if (targetCounts[guess[i]] > 0) {
            simColors[i] = 'y';
            targetCounts[guess[i]]--;
        }
    }


    for (let i = 0; i < guess.length; i++) {
        if (simColors[i] !== actualColors[i]) {
            return false;
        }
    }

    return true;
}

// green = 0, yellow = 1, black = 2

function getPatternIndex(colors) {
    return (colors[0] * 1) +
        (colors[1] * 3) +
        (colors[2] * 9) +
        (colors[3] * 27) +
        (colors[4] * 81);
}

function generateFeedbackCode(targetWord, guessWord) {
    let targetLetterCounts = {};
    for (let char of targetWord) {
        targetLetterCounts[char] = (targetLetterCounts[char] || 0) + 1;
    }

    let codeArray = new Array(5);
    let isGreen = new Array(5).fill(false);

    for (let i = 0; i < 5; i++) {
        let char = guessWord[i];
        if (char === targetWord[i]) {
            isGreen[i] = true;
            codeArray[i] = "g" + char + (i + 1);
            targetLetterCounts[char]--;
        }
    }


    for (let i = 0; i < 5; i++) {
        if (isGreen[i]) continue;

        let char = guessWord[i];
        if (targetLetterCounts[char] > 0) {
            codeArray[i] = "y" + char + (i + 1);
            targetLetterCounts[char]--;
        } else {
            codeArray[i] = "b" + char + (i + 1);
        }
    }
    return codeArray.join("");
}

function get_expected_value(guess, list) {
    let patternCounts = new Int32Array(243);
    let target_counts = new Int32Array(26);
    let colors = new Int32Array(5);

    for (let i = 0; i < list.length; i++) {
        let target = list[i];

        target_counts.fill(0);
        colors.fill(2);

        for (let j = 0; j < 5; j++) {
            target_counts[target.charCodeAt(j) - 97]++;
        }

        for (let j = 0; j < 5; j++) {
            if (guess.charCodeAt(j) === target.charCodeAt(j)) {
                colors[j] = 0;
                target_counts[guess.charCodeAt(j) - 97]--;
            }
        }

        for (let j = 0; j < 5; j++) {
            let charCode = guess.charCodeAt(j) - 97;

            if (colors[j] === 2 && target_counts[charCode] > 0) {
                colors[j] = 1;
                target_counts[charCode]--;
            }
        }

        let pattern_id = (colors[0] * 1) +
            (colors[1] * 3) +
            (colors[2] * 9) +
            (colors[3] * 27) +
            (colors[4] * 81);

        patternCounts[pattern_id]++;
    }

    let expected_value_of_word = 0;
    for (let k = 0; k < 243; k++) {
        let count = patternCounts[k];
        if (count > 0) {
            expected_value_of_word += count * count;
        }
    }

    return expected_value_of_word;
}

function typeWordByBot(word) {

    if (word.length !== 5 || isGameOver || currentRow >= rows) {
        return;
    }


    for (let i = 0; i < word.length; i++) {
        isProcessing = false;
        const keyEvent = new KeyboardEvent("keyup", { key: word[i] });
        document.dispatchEvent(keyEvent);
        isProcessing = true;
    }

    isProcessing = false;
    const enterEvent = new KeyboardEvent("keyup", { key: "Enter" });
    document.dispatchEvent(enterEvent);
    isProcessing = true;
}

const starting_words_dict = {
    "roate": 60.4246,
    "tiare": 60.9335,
    "raise": 61.0009,
    "raile": 61.3309,
    "soare": 62.3011,
    "arise": 63.7257,
    "irate": 63.7793,
    "orate": 63.8907,
    "ariel": 65.2877,
    "arose": 66.0212
};




let arra = words;

function solve_by_bot() {
    isProcessing = true;

    if (code_his.length === 0) {
        arra = [...words];

        const entries = Object.entries(starting_words_dict)
            .sort((a, b) => a[1] - b[1]);

        setTimeout(() => {
            logToTerminalWithout(" ");
            logToTerminalWithout("Found 10 statistically best words:");
            entries.forEach(([word, score], i) => {
                logToTerminal(`  ${i + 1}.  ${word.toUpperCase()}   (E = ${score.toFixed(4)})`);
            });
        }, 700);

        setTimeout(() => {
            typeWordByBot("roate");
        }, 1500);

        return;
    }

    let temp = [];
    for (let i = 0; i < words.length; i++) {
        let valid = true;
        for (let j = 0; j < code_his.length; j++) {
            if (!is_word_valid(words[i], code_his[j])) {
                valid = false;
                break;
            }
        }
        if (valid) temp.push(words[i]);
    }
    arra = temp;

    logToTerminalWithout(`Word space reduced  →  ${arra.length} candidate(s) remaining`);


    if (arra.length === 1) {

        logToTerminalWithout(`Only one possibility left  →  [ ${arra[0].toUpperCase()} ]`);
        setTimeout(() => typeWordByBot(arra[0]), 400);
        return;
    }

    if (arra.length === 2) {

        logToTerminalWithout(`Two candidates remain  →  [ ${arra[0].toUpperCase()} ]  vs  [ ${arra[1].toUpperCase()} ]`);
        logToTerminalWithout("Guessing first candidate");
        setTimeout(() => typeWordByBot(arra[0]), 400);
        return;
    }


    setTimeout(() => {
        let scored = [];

        for (let i = 0; i < allow_words.length; i++) {
            const score = get_expected_value(allow_words[i], arra);
            const isAnswer = arra.includes(allow_words[i]);
            scored.push({ word: allow_words[i], score, isAnswer });
        }

        scored.sort((a, b) => a.score - b.score || (b.isAnswer - a.isAnswer));

        const best = scored[0];
        const top10 = scored.slice(0, 10);


        logToTerminalWithout("Found 10 statistically best words:");
        top10.forEach((entry, i) => {
            const expectedLeft = (entry.score / arra.length).toFixed(4);
            const tag = entry.isAnswer ? " *" : "";
            logToTerminal(`  ${i + 1}.  ${entry.word.toUpperCase()}   (E = ${expectedLeft})${tag}`);
        });



        logToTerminalWithout("Selecting the best guess...");
        setTimeout(() => typeWordByBot(best.word), 400);
    }, 80);
}

function getStatsBox(stats) {
    const innerWidth = 17;

    const formatLine = (label, value) => {
        const text = `${label} ${value}`;
        return `| ${text.padEnd(innerWidth, ' ')} |`;
    };

    return `
+-------------------+
|   PLAYER STATS    |
+-------------------+
${formatLine("Wins:  ", stats.total_wins)}
${formatLine("Losses:", stats.total_losses)}
${formatLine("Streak:", stats.current_streak)}
+-------------------+`;
}

function save_data() {
    localStorage.setItem('userdata', JSON.stringify(stats));
}

function get_data() {
    const storedUserData = localStorage.getItem('userdata')
    if (storedUserData) {
        stats = JSON.parse(storedUserData);
    }
}

function isValidWord(targetWord) {
    let left = 0;
    let right = allow_words.length - 1;

    while (left <= right) {
        let mid = Math.floor((left + right) / 2);
        let midWord = allow_words[mid];

        if (midWord === targetWord) {
            return true;
        } else if (midWord < targetWord) {
            left = mid + 1;
        } else {
            right = mid - 1;
        }
    }
    return false;
}

function logToTerminal(message) {
    const newLog = document.createElement("div");
    newLog.innerText = `> ${message}`;
    terminalContent.appendChild(newLog);
    terminalContent.scrollTop = terminalContent.scrollHeight;
}

function logToTerminalWithout(message) {
    const newLog = document.createElement("pre");

    if (message === " ") {
        newLog.innerHTML = "&nbsp;";
    } else {
        newLog.innerText = message;
    }

    terminalContent.appendChild(newLog);
    terminalContent.scrollTop = terminalContent.scrollHeight;
}

function start_game() {
    save_data();
    terminalContent.innerHTML = "";
    currentRow = 0;
    currentCol = 0;
    isGameOver = false;
    isProcessing = false;
    isBotActive = false;
    code_his = [];
    arra = [...words];


    const randomIndex = Math.floor(Math.random() * words.length);
    Random_word = words[randomIndex];

    let stats_stri = getStatsBox(stats);

    logToTerminalWithout(stats_stri);
    logToTerminalWithout(" ");
    logToTerminal("A random word choosen :)")

    board.innerHTML = "";

    for (let i = 0; i < rows * cols; i++) {
        let tile = document.createElement("div");
        tile.classList.add("tile");
        tile.setAttribute("id", `tile-${i}`);
        board.appendChild(tile);
    }
    if (restartBtn) {
        restartBtn.blur();
    }
}

document.addEventListener("keyup", (e) => {
    if (isGameOver || isProcessing || currentRow >= rows) return;
    const pressedKey = e.key.toLowerCase();

    if (pressedKey >= "a" && pressedKey <= "z" && pressedKey.length === 1) {
        if (currentCol < cols) {
            const tileIndex = currentRow * cols + currentCol;
            const tile = document.getElementById(`tile-${tileIndex}`);
            tile.classList.add("animate-pop");
            tile.innerText = pressedKey;
            currentCol++;
            setTimeout(() => {
                tile.classList.remove("animate-pop");
            }, 100);
        }
    }
    else if (e.key === "Backspace") {
        if (currentCol > 0) {
            currentCol--;
            const tileIndex = currentRow * cols + currentCol;
            const tile = document.getElementById(`tile-${tileIndex}`);
            tile.innerText = "";
        }
    }
    else if (e.key === "Enter") {
        if (currentCol === cols) {
            isProcessing = true;
            let user_string = "";

            for (let i = 0; i < cols; i++) {
                const tileIndex = (currentRow * cols) + i;
                const tile = document.getElementById(`tile-${tileIndex}`);
                user_string += tile.innerText.toLowerCase();
            }

            if (!isValidWord(user_string)) {
                logToTerminal(`ERROR: ${user_string.toUpperCase()} is not in word list.`);
                while (currentCol > 0) {
                    currentCol--;
                    const tileIndex = currentRow * cols + currentCol;
                    const tile = document.getElementById(`tile-${tileIndex}`);
                    tile.innerText = "";
                }
                isProcessing = false;
                return;
            }

            let targetLetterCounts = {};
            for (let char of Random_word) {
                targetLetterCounts[char] = (targetLetterCounts[char] || 0) + 1;
            }

            let tileColors = new Array(cols).fill("grey");
            let codeArray = new Array(cols);

            for (let j = 0; j < cols; j++) {
                let charac = user_string[j];
                if (charac === Random_word[j]) {
                    tileColors[j] = "green";
                    codeArray[j] = "g" + charac + (j + 1);
                    targetLetterCounts[charac]--;
                }
            }

            for (let j = 0; j < cols; j++) {
                let charac = user_string[j];
                if (tileColors[j] === "green") {
                    continue;
                }
                if (targetLetterCounts[charac] > 0) {
                    tileColors[j] = "yellow";
                    codeArray[j] = "y" + charac + (j + 1);
                    targetLetterCounts[charac]--;
                } else {
                    codeArray[j] = "b" + charac + (j + 1);
                }
            }

            let code = codeArray.join("");

            for (let j = 0; j < cols; j++) {
                const tileIndex = (currentRow * cols) + j;
                const tile = document.getElementById(`tile-${tileIndex}`);
                const flipDelay = j * 250;

                setTimeout(() => {
                    tile.classList.add("flip");
                    setTimeout(() => {
                        tile.classList.add(tileColors[j]);
                    }, 250);
                }, flipDelay);
            }

            let CORRECT = true;
            for (let t = 0; t < code.length; t += 3) {
                if (code[t] !== 'g') {
                    CORRECT = false;
                    break;
                }
            }
            code_his.push(code);

            if (!CORRECT && (currentRow < rows - 1)) {
                setTimeout(() => {
                    logToTerminal(`Input succesfully submitted: ${user_string}`)
                }, 6 * 250);

                setTimeout(() => {
                    logToTerminal(`Checker code: ${code}`)
                }, (6 * 250 + 125));
            }

            setTimeout(() => {
                if (CORRECT) {
                    logToTerminalWithout(" ");
                    logToTerminalWithout(" ");
                    stats.total_wins += 1;
                    stats.current_streak += 1;
                    save_data();

                    const winArt = `
+-------------------+
|     YOU WIN!      |
|   WORD GUESSED    |
+-------------------+`;
                    logToTerminalWithout(winArt)
                    logToTerminalWithout(" ");
                    logToTerminalWithout(" ");

                    isGameOver = true;
                    isProcessing = false;
                    isBotActive = false;
                    return;
                }

                currentRow++;
                currentCol = 0;
                isProcessing = false;

                if (currentRow >= rows && !CORRECT) {
                    stats.current_streak = 0;
                    stats.total_losses += 1;
                    save_data();
                    const loseArt = `
+-------------------+
|     GAME OVER     |
|   STREAK BROKEN   |
+-------------------+`;
                    logToTerminalWithout(" ")
                    logToTerminalWithout(loseArt);
                    logToTerminalWithout(" ")
                    logToTerminal("The word was: " + Random_word);

                    isGameOver = true;
                    isBotActive = false;
                }
                else if (isBotActive) {
                    setTimeout(solve_by_bot, 700);
                }
            }, cols * 250);
        }
    }
});

function make_background() {
    const bg_Element = document.getElementById('main-bg');
    if (!bg_Element) return;

    const chars = "01/*-+$%#@!<>~ ";
    let bgText = "";

    for (let i = 0; i < 100; i++) {
        for (let j = 0; j < 150; j++) {
            bgText += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        bgText += "\n";
    }
    bg_Element.innerText = bgText;
}

get_data();
start_game();
make_background();

if (restartBtn) {
    restartBtn.addEventListener("click", start_game);
}

if (solveBtn) {
    solveBtn.addEventListener("click", () => {
        if (!isGameOver && !isProcessing && !isBotActive) {
            isBotActive = true;
            solve_by_bot();
        }
    });
}
