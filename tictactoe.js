const selectBox = document.querySelector(".select-box"),
  selectBtnX = selectBox.querySelector(".options .playerX"),
  selectBtnO = selectBox.querySelector(".options .playerO"),
  playBoard = document.querySelector(".play-board"),
  players = document.querySelector(".players"),
  allBox = document.querySelectorAll("section span"),
  resultBox = document.querySelector(".result-box"),
  reviewBox = document.querySelector(".review-box"),
  wonText = resultBox.querySelector(".won-text"),
  replayBtn = resultBox.querySelector(".btn"),
  replayBtn2 = reviewBox.querySelector(".btn");

let counter = 1;
let difficulty = "Easy";
let alphabetaprunning = false;
let time = 0;

cases = {
  1: [0, 0],
  2: [0, 1],
  3: [0, 2],
  4: [1, 0],
  5: [1, 1],
  6: [1, 2],
  7: [2, 0],
  8: [2, 1],
  9: [2, 2],
  10: [3, 3],
};

let fontsarray = [
  "Caveat",
  "Indie Flower",
  "Gloria Hallelujah",
  "Shadows Into Light",
];

let playerXIcon = (playerSign = PlayerinitialSign = "X");
let playerOIcon = (AIinitialSign = "O");

window.onload = () => {
  for (let i = 0; i < allBox.length; i++) {
    allBox[i].setAttribute("onclick", `call_button_click(${i + 1},this)`);
  }
  resetGame();
};

selectBtnX.onclick = () => {
  selectBox.classList.add("hide");
  playBoard.classList.add("show");
  start_game();
};

selectBtnO.onclick = () => {
  selectBox.classList.add("hide");
  playBoard.classList.add("show");
  players.setAttribute("class", "players active player");
  playerSign = PlayerinitialSign = "O";
  AIinitialSign = "X";
  start_game();
};

function call_button_click(val, element) {
  element.setAttribute("onclick", "");
  row = cases[val][0];
  column = cases[val][1];
  const key = getKeyByValue(cases, [row, column]);
  changeStyle(`box${key}`);
  clickedBox(element);
  const inputData = { row: row, column: column };
  fetch("/send_data", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ data: inputData }),
  })
    .then((response) => response.json())
    .then((data) => {
      const { row, column, text, box } = data;
      const key = getKeyByValue(cases, [row, column]);
      setTimeout(() => {
        bot(key);
      }, 250 - time);
      if (text !== "") {
        setTimeout(() => {
          gameEnded(text, box);
        }, 250);
      }
    })
    .catch((error) => {
      console.error("Error sending/receiving data:", error);
    });
}

function clickedBox(element) {
  const box = element.getAttribute("class");
  const lastChar = box.charAt(box.length - 1);
  [row, column] = cases[lastChar]; // Get the row and column of the player
  addText(
    counter +
      "- " +
      PlayerinitialSign +
      " -> row: " +
      row +
      " column: " +
      column,
    "p"
  ); // Game review
  if (players.classList.contains("player")) {
    playerSign = "O";
    element.innerHTML = `<i class="${playerOIcon}">O</i>`;
    players.classList.remove("active");
  } else {
    element.innerHTML = `<i class="${playerXIcon}">X</i>`;
    players.classList.add("active");
  }
  element.style.pointerEvents = "none";
  playBoard.style.pointerEvents = "none";
  counter++;
}

function bot(key) {
  if (key <= 9) {
    addText(
      counter + "- " + AIinitialSign + " -> row: " + row + " column: " + column,
      "p"
    ); //Game Review
    playerSign = "O";
    changeStyle(`box${key}`);
    if (players.classList.contains("player")) {
      playerSign = "X";
      allBox[key - 1].innerHTML = `<i class="${playerXIcon}">X</i>`;
      players.classList.add("active");
    } else {
      allBox[key - 1].innerHTML = `<i class="${playerOIcon}">O</i>`;
      players.classList.remove("active");
    }
    allBox[key - 1].style.pointerEvents = "none";
    playBoard.style.pointerEvents = "auto";
    playerSign = "X";
    counter++;
  }
}

function getKeyByValue(obj, targetValue) {
  for (const key in obj) {
    if (obj.hasOwnProperty(key) && Array.isArray(obj[key])) {
      const array = obj[key];
      if (arraysAreEqual(array, targetValue)) {
        return key;
      }
    }
  }
  return null;
}

function arraysAreEqual(arr1, arr2) {
  if (arr1.length !== arr2.length) {
    return false;
  }
  for (let i = 0; i < arr1.length; i++) {
    if (arr1[i] !== arr2[i]) {
      return false;
    }
  }
  return true;
}

function gameEnded(text, box) {
  for (let i = 0; i < allBox.length; i++) {
    allBox[i].setAttribute("onclick", "");
  }
  let b0 = box[0];
  let b1 = box[1];
  let b2 = box[2];
  const key0 = getKeyByValue(cases, [b0[0], b0[1]]);
  const key1 = getKeyByValue(cases, [b1[0], b1[1]]);
  const key2 = getKeyByValue(cases, [b2[0], b2[1]]);
  if (text === "AI won the game!") {
    endingCermony(key0, key1, key2, text);
  } else if (text === "You won the game!") {
    endingCermony(key0, key1, key2, text);
  } else {
    setTimeout(() => {
      resultBox.classList.add("show");
      playBoard.classList.remove("show");
    }, 250);
    wonText.textContent = "Match has been drawn!";
    addText("Match has been drawn!");
  }
}

function resetGame() {
  fetch("/reset_game", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ reset: true }),
  }).catch((error) => {
    console.error("Error sending/receiving data:", error);
  });
}

function changeStyle(aclass) {
  var thefont = fontsarray[Math.floor(Math.random() * fontsarray.length)];
  document.getElementsByClassName(aclass)[0].style.fontFamily = thefont;
}

function setBackgroundStyles(className) {
  const element = document.getElementsByClassName(className)[0];
  element.style.background = "#5c5cb1";
  element.style.color = "#fff";
}

function endingCermony(key0, key1, key2, text) {
  setTimeout(() => {
    setBackgroundStyles(`box${key0}`);
  }, 100);
  setTimeout(() => {
    setBackgroundStyles(`box${key1}`);
  }, 400);
  setTimeout(() => {
    setBackgroundStyles(`box${key2}`);
  }, 700);
  setTimeout(() => {
    resultBox.classList.add("show");
    playBoard.classList.remove("show");
  }, 900);
  wonText.innerHTML = text;
  addText(text); // Game Review
}

function showReview() {
  resultBox.classList.remove("show");
  reviewBox.classList.add("show");
}

function addText(text, type = "h3", before = true) {
  const context = document.createElement(type);
  context.innerHTML = text;
  const targetElement = document.querySelector(".review-box");
  if (before) {
    const firstChild = targetElement.querySelector(".review-box .btn");
    targetElement.insertBefore(context, firstChild);
  } else {
    targetElement.appendChild(context);
  }
}

function disablebutton(buttonNumber, diff) {
  if (diff == "Impossible") {
    time = 100;
    alphabetaprunning = true;
    document.getElementById("buttonwith").disabled = true;
    document.getElementById("buttonwithout").disabled = false;
    document.getElementsByClassName("alphabeta")[0].style.display = "flex";
  } else {
    time = 0;
    alphabetaprunning = false;
    document.getElementsByClassName("alphabeta")[0].style.display = "none";
  }
  document.getElementById("button1").disabled = false;
  document.getElementById("button2").disabled = false;
  document.getElementById("button3").disabled = false;
  document.getElementById("button" + buttonNumber).disabled = true;
  difficulty = diff;
}

function start_game() {
  let diff = difficulty;
  let ab = alphabetaprunning;
  let cond_data = { difficulty: diff, alphabeta: ab };
  addText("Difficulty is:<span>" + diff + "</span>");
  fetch("/set_difficulty", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ data: cond_data }),
  }).catch((error) => {
    console.error("Error sending/receiving data:", error);
  });
}

function choosewith(condition) {
  alphabetaprunning = condition;
  if (condition) {
    time = 100;
    document.getElementById("buttonwith").disabled = true;
    document.getElementById("buttonwithout").disabled = false;
  } else {
    time = 0;
    document.getElementById("buttonwith").disabled = false;
    document.getElementById("buttonwithout").disabled = true;
  }
}

replayBtn.onclick = () => {
  window.location.reload();
};

replayBtn2.onclick = () => {
  addText("Game is Reseting", "p", false);
  window.location.reload();
};
