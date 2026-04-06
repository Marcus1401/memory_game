let cols = 8;
let rows = 5;
let totalCards = 40;

let cards = [];
let cartoons = []; // 20 unique cartoons

let firstSelected = null;
let secondSelected = null;

let currentPlayer = 1;
let p1Score = 0, p2Score = 0;

let gamePhase = -1; // -1: Start, 0: Memorize, 1: Playing, 2: Delay
let timerStart = 0;
let revealDuration = 800; 
let matchDelay = 1000;

// p5.js needs preload to handle images before the game starts
function preload() {
  for (let i = 0; i < 20; i++) {
    cartoons[i] = loadImage(i + ".jpg");
  }
}

function setup() {
  // This makes the canvas the same size as the phone screen
  createCanvas(windowWidth, windowHeight);
  calculateLayout();
}

function setupGame() {
  p1Score = 0;
  p2Score = 0;
  currentPlayer = 1;
  firstSelected = null;
  secondSelected = null;
  
  let ids = [];
  for (let i = 0; i < totalCards / 2; i++) {
    ids.push(i);
    ids.push(i);
  }
  
  // Shuffle array for p5.js
  for (let i = ids.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [ids[i], ids[j]] = [ids[j], ids[i]];
  }
  
  let w = 95;
  let h = 95;
  let gutter = 12;
  let startX = (width - (cols * (w + gutter))) / 2;
  let startY = 160;
  
  let index = 0;
  cards = []; // Clear existing cards
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      let x = startX + c * (w + gutter);
      let y = startY + r * (h + gutter);
      cards.push(new Card(ids[index], x, y, w, h));
      index++;
    }
  }
}

function draw() {
  background(25, 25, 35); 
  
  if (gamePhase === -1) {
    displayStartScreen();
  } else {
    displayUI();
    
    if (gamePhase === 0) {
      if (millis() - timerStart > revealDuration) {
        gamePhase = 1;
        cards.forEach(c => c.revealed = false);
      } else {
        cards.forEach(c => c.revealed = true);
      }
    } 
    else if (gamePhase === 2) {
      if (millis() - timerStart > matchDelay) {
        checkMatch();
      }
    }

    for (let c of cards) c.display();
    
    if (gamePhase >= 1 && isGameOver()) {
      displayWinScreen();
    }
  }
}

function displayStartScreen() {
  textAlign(CENTER, CENTER);
  fill(255);
  textSize(60);
  text("Let's play", width/2, height/2 - 30);
  
  fill(0, 255, 150);
  textSize(28);
  text("Click anywhere to play", width/2, height/2 + 50);
}

function mousePressed() {
  if (gamePhase === -1) {
    gamePhase = 0;
    timerStart = millis();
    return;
  }

  // Restart logic when win screen is showing
  if (gamePhase >= 1 && isGameOver()) {
    setupGame();
    gamePhase = -1;
    return;
  }

  if (gamePhase !== 1) return; 

  for (let c of cards) {
    if (c.isMouseOver() && !c.revealed) {
      c.revealed = true;
      if (firstSelected === null) {
        firstSelected = c;
      } else {
        secondSelected = c;
        gamePhase = 2;
        timerStart = millis();
      }
      break; 
    }
  }
}

function checkMatch() {
  if (firstSelected.id === secondSelected.id) {
    if (currentPlayer === 1) p1Score++; else p2Score++;
  } else {
    firstSelected.revealed = false;
    secondSelected.revealed = false;
    currentPlayer = (currentPlayer === 1) ? 2 : 1;
  }
  firstSelected = null;
  secondSelected = null;
  gamePhase = 1;
}

function isGameOver() {
  for (let c of cards) {
    if (!c.revealed) return false;
  }
  return true;
}

function displayUI() {
  textAlign(CENTER);
  fill(255);
  textSize(32);
  text("Memory Game", width/2, 50);
  
  textSize(22);
  fill(currentPlayer === 1 ? color(255, 100, 200) : 100);
  text("P1 Score: " + p1Score, 200, 100);
  
  fill(currentPlayer === 2 ? color(100, 200, 255) : 100);
  text("P2 Score: " + p2Score, width - 200, 100);
  
  fill(255, 215, 0);
  if (gamePhase === 0) text("MEMORIZE!", width/2, 110);
  else if (gamePhase === 1) text("PLAYER " + currentPlayer + ": GO!", width/2, 110);
}

function displayWinScreen() {
  fill(0, 230);
  rect(0, 0, width, height);
  fill(255);
  textSize(60);
  
  let winnerName = "";
  if (p1Score > p2Score) winnerName = "PLAYER 1";
  else if (p2Score > p1Score) winnerName = "PLAYER 2";
  
  let winMessage = (p1Score === p2Score) ? "IT'S A DRAW!" : winnerName + " WINS!";
  text(winMessage, width/2, height/2 - 40);
  
  if (p1Score !== p2Score) {
    textSize(28);
    fill(255, 215, 0);
    text(winnerName + " Win who can guess more", width/2, height/2 + 20);
  }

  fill(255);
  textSize(25);
  text("Final Count: " + p1Score + " - " + p2Score, width/2, height/2 + 80);
  fill(0, 255, 150);
  text("Click anywhere to play again", width/2, height/2 + 130);
}

class Card {
  constructor(id, x, y, w, h) {
    this.id = id;
    this.x = x;
    this.y = y;
    this.w = w;
    this.h = h;
    this.revealed = false;
  }

  display() {
    noStroke();
    if (this.revealed) {
      fill(255);
      rect(this.x, this.y, this.w, this.h, 8); 
      if (cartoons[this.id]) {
        imageMode(CENTER);
        image(cartoons[this.id], this.x + this.w/2, this.y + this.h/2, 87, 87);
        imageMode(CORNER);
      }
    } else {
      fill(60, 40, 100); 
      rect(this.x, this.y, this.w, this.h, 8);
      fill(255, 50);
      textSize(24);
      textAlign(CENTER, CENTER);
      text("?", this.x + this.w/2, this.y + this.h/2);
    }
  }

  isMouseOver() {
    return mouseX > this.x && mouseX < this.x + this.w && mouseY > this.y && mouseY < this.y + this.h;
  }
}
