const xhttp = new XMLHttpRequest();
const xhttp2 = new XMLHttpRequest();

// Data on canvas
const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

// Data on grid
const gridSize = 50;
let tilesOnRow = canvas.width / gridSize;
let tilesOnColumn = canvas.height / gridSize;

// Colors of elements in game
const backgroundColor = "#222";
const skyColor = "#87CEEB";
const grassColor = "#553333" 
const victoryColor = "#9B1922";
const snakeColor = "#A9C712";
const snakeHeadColor = "#131F1B";
const appleColor = "#A8221F";

const dirtTex = new Image();
dirtTex.src = "textures/dirt.png";

const skyTex = new Image();
skyTex.src = "textures/sky.png";

const appleTex = new Image();
appleTex.src = "textures/apple.png";

const victoryTex = new Image();
victoryTex.src = "textures/victory.png";

// Arrays to store snake positions
let snakeArray = [];
let snakeDirectionArray = [];

// Array to store the state of the game
let gameArray;

// Generate a random color
function colorOf(x) {
    switch(x){
        case 0:
            return skyColor;
        case 1:
            return grassColor;
        case 3:
            return victoryColor;
        case 2:
            return appleColor;
    }
    return backgroundColor;
}


function texOf(x) {
    switch(x){
        case 0:
            return skyTex;
        case 1:
            return dirtTex;
        case 2:
            return appleTex;
        case 3:
            return victoryTex;
    }
    return null;
}

// Test if two positions are equal
function isEqual(p1,p2){
    return p1.x == p2.x && p1.y == p2.y;
}

// Determines if a move is valid
function isValid(p){
    // Test if snake is in grid
    if ((p.x < 0) || (p.x >= tilesOnRow) || (p.y < 0) || (p.y >= tilesOnColumn)) return false;

    // Test if snake is in the sky
    if (gameArray[p.y][p.x] == 1) return false;

    // Test if snake doesn't bump into itself
    for(const position of snakeArray){
        if(isEqual(position,p)){
            return false;
        } 
    }

    // If no problem
    return true;
}

// Computes the possible future direction
function newPosition(position,direction){
    return {x: position.x + direction.x , y: position.y + direction.y};
}

function computeDirection(p1, p2){
    return {x: p2.x-p1.x , y: p2.y-p1.y};
}

function inverseDirection(direction){
    return {x: - direction.x, y: - direction.y};
}

// Functions for movement animations
function stepMove(stepNumber, x, y, direction){
    if(direction.x == 1) stepMoveRight(stepNumber, x, y);
    else if(direction.x == -1) stepMoveLeft(stepNumber, x, y);
    else if(direction.y == 1) stepMoveDown(stepNumber, x, y);
    else if(direction.y == -1) stepMoveUp(stepNumber, x, y);
    else alert("That's not normal ! Directions not managed correctly !");
}

function stepMoveUp(stepNumber, x, y){
    ctx.fillRect(x*gridSize, (y+1)*gridSize-stepNumber-1, gridSize, 1);
};
function stepMoveDown(stepNumber, x, y){
    ctx.fillRect(x*gridSize, y*gridSize+stepNumber, gridSize, 1);
};
function stepMoveLeft(stepNumber, x, y){
    ctx.fillRect((x+1)*gridSize-stepNumber-1, y*gridSize, 1, gridSize);
};
function stepMoveRight(stepNumber, x, y){
    ctx.fillRect(x*gridSize+stepNumber, y*gridSize, 1, gridSize);
};

// Move the snake
function goTo(direction){
    const headPosition = snakeArray[0];
    const newHeadPosition = newPosition(headPosition, direction);
    
    if(isValid(newHeadPosition)){
        if(gameArray[newHeadPosition.y][newHeadPosition.x] == 3){
            alert("That's a victory !!");
            gameArray[newHeadPosition.y][newHeadPosition.x] = 0;
        } 
        
        // Updating the snakeArray (positions) and the snakeDirectionArray (directions)
        snakeArray.unshift(newHeadPosition);
        snakeDirectionArray.unshift(direction);

        let tailPosition ;
        let lastDirection ;       
        
        if(gameArray[newHeadPosition.y][newHeadPosition.x] != 2){
            tailPosition = snakeArray.pop();
            lastDirection = snakeDirectionArray.pop();
        } else {
            gameArray[newHeadPosition.y][newHeadPosition.x] = 0;
        }
        
        manageFalling();
        drawGame();

    } else {

    }

}

// Functions to manage falling situations

function isFalling(){
    for(const position of snakeArray){
        // Checking if the case below is solid
        if(gameArray[position.y +1][position.x] == 1){
            return false;
        }
    }
    return true;
}

function manageFalling(){
    if(isFalling()){
        for(let s=0; s<snakeArray.length; s++){
            const p = snakeArray[s];
            snakeArray[s] = newPosition(snakeArray[s], {x:0, y:1});
        }
        drawGame();
        setTimeout(() => {
            manageFalling();
        }, 200);
        
    } else {
        drawGame();
    }
}

// Draw the snake current state
function drawSnake(){
    const startX = snakeArray[0].x * gridSize + gridSize / 2;
    const startY = snakeArray[0].y * gridSize + gridSize / 2;
    const endX = snakeArray[snakeArray.length - 1].x * gridSize + gridSize / 2;
    const endY = snakeArray[snakeArray.length - 1].y * gridSize + gridSize / 2;
    const gradient = ctx.createLinearGradient(startX, startY, endX, endY);
    gradient.addColorStop(0, snakeHeadColor);
    gradient.addColorStop(1, snakeColor);

    ctx.beginPath();
    
    const head = snakeArray[0];
    ctx.moveTo(head.x*gridSize + gridSize/2, head.y*gridSize + gridSize/2);

    snakeArray.slice(1).forEach((position) => {
        ctx.lineTo(position.x*gridSize + gridSize/2, position.y*gridSize + gridSize/2)
    }) 
    
    ctx.lineWidth = gridSize/2;
    ctx.strokeStyle = gradient;

    ctx.stroke();
}

// Draw the game current state
function drawGame() {

    // Draw the background
    for (let i = 0; i < tilesOnRow; i++) {
        for (let j = 0; j < tilesOnColumn; j++) {

            const tileType = gameArray[j][i];

            const tex = texOf(tileType);
            if(tex != null){
                ctx.drawImage(tex, i*gridSize, j*gridSize, gridSize, gridSize)
            } else {
                ctx.fillStyle = colorOf(tileType); 
                ctx.fillRect(i*gridSize, j*gridSize, gridSize, gridSize);
            }
            
        }
    }

    // Draw the snake
    drawSnake();
}

window.addEventListener("keydown", function (event) {
    switch (event.key) {
        case 'ArrowUp':
            goTo({x:0, y:-1});
            break;
        case 'ArrowDown':
            goTo({x:0, y:1});
            break;
        case 'ArrowLeft':
            goTo({x:-1, y:0});
            break;
        case 'ArrowRight':
            goTo({x:1, y:0});
            break;
    };
})

document.getElementById("returnToLevels").addEventListener("click", function() {
    window.location = "../levels";
});

// functions to charge the level
function getLevel(){
    console.log("I charge the level ...");

    xhttp.onreadystatechange = function () {
        if (this.status == 200 && this.readyState == 4){
            let data = JSON.parse(this.responseText);

            console.log(data);

            if(data == {}){
                alert("The level is not defined yet !");
                return;
            }

            snakeArray = data.snakeArray;

            // Constructing the snake directions 
            for(let d=0 ; d < snakeArray.length - 1 ; d++){
                snakeDirectionArray.push(computeDirection(snakeArray[d+1],snakeArray[d]));
            }

            tilesOnRow = data.width;
            tilesOnColumn = data.height;

            console.log("The width is",tilesOnRow,"and the height is", tilesOnColumn);

            canvas.width = tilesOnRow * gridSize;
            canvas.height = tilesOnColumn * gridSize;

            gameArray = data.gameArray;

            manageFalling();
            drawGame();
        }
    }

    xhttp.open("GET", "../getLevel");
    xhttp.send();
}

function getLevelNumber() {
    console.log("I search for the level number ...");
    xhttp2.onreadystatechange = function () {
        if(this.status == 200 && this.readyState == 4){
            console.log("I found the level number !");
            document.getElementById("levelNumber").textContent = this.responseText;
        }
    }
    xhttp2.open("GET", "../getLevelNumber");
    xhttp2.send();
}

getLevelNumber();
getLevel();