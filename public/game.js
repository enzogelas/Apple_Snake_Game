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
        case 'C':
            return skyColor;
        case 'T':
            return grassColor;
        case 'V':
            return victoryColor;
        case 'P':
            return appleColor;
    }
    return backgroundColor;
}


function texOf(x) {
    switch(x){
        case 'C':
            return skyTex;
        case 'T':
            return dirtTex;
        case 'P':
            return appleTex;
        case 'V':
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
    if (gameArray[p.x][p.y] == 'T') return false;

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

/////////////////////////////////////////////////
/////////////////////////////////////////////////
// TO MODIFY : HANDLE THE ANIMATION
/*
function animMovement(){
    let count=0;
        
        let intervalId = setInterval(()=>{
            ctx.fillStyle = colorOf(gameArray[xback][yback]);
            stepMove(count, xback, yback, lastDirection)
            ctx.fillStyle = snakeColor;
            stepMove(count, xfront, yfront, direction);
            count++;
            if (count==gridSize){
                clearInterval(intervalId);
                manageFalling();
            } 
        },10);
}
*/
/////////////////////////////////////////////////
/////////////////////////////////////////////////


// Move the snake
function goTo(direction){
    const headPosition = snakeArray[0];
    const newHeadPosition = newPosition(headPosition, direction);
    
    if(isValid(newHeadPosition)){
        if(gameArray[newHeadPosition.x][newHeadPosition.y] == 'V'){
            alert("That's a victory !!");
            gameArray[newHeadPosition.x][newHeadPosition.y] = 'C';
        } 
        
        // Updating the snakeArray (positions) and the snakeDirectionArray (directions)
        snakeArray.unshift(newHeadPosition);
        snakeDirectionArray.unshift(direction);

        let tailPosition ;
        let lastDirection ;       
        
        if(gameArray[newHeadPosition.x][newHeadPosition.y] != 'P'){
            tailPosition = snakeArray.pop();
            lastDirection = snakeDirectionArray.pop();
        } else {
            gameArray[newHeadPosition.x][newHeadPosition.y] = 'C';
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
        if(gameArray[position.x][position.y + 1] == 'T'){
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

////////////////////////////////////
// Old functions to display the snake as segments
/*
function directionToAngle(direction){
    if(direction.x == 1) return 0;
    else if(direction.y == 1) return 0.5*Math.PI;
    else if(direction.x == -1) return Math.PI;
    else if(direction. y == -1) return 1.5*Math.PI;
}

function directionToLetter(direction){
    if(direction.x == 1) return 'R';
    else if(direction.y == 1) return 'D';
    else if(direction.x == -1) return 'L';
    else if(direction. y == -1) return 'U';
}

// To test if {a,b} = {c,d}
function areEquals(a1, a2, b1, b2) {
    return (a1 == a2 && b1 == b2);
}

function drawWithRotation(ctx, tex, gridSize, position, angle){
    // Save the current context state
    ctx.save();
    // Move the canvas origin to the snake segment's position
    ctx.translate(position.x * gridSize + gridSize / 2, position.y * gridSize + gridSize / 2);
    // Rotate the canvas to the right angle
    ctx.rotate(angle);
    // Draw the image, adjusting for the canvas translation
    ctx.drawImage(tex, -gridSize / 2, -gridSize / 2, gridSize, gridSize);
    // Restore the context to its original state
    ctx.restore();
}
*/

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

            const tileType = gameArray[i][j];

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
            let data = this.responseText;

            console.log(data);

            const lines = data.split('\r\n');

            if(lines.length <= 1){
                alert("The level is not defined yet !");
                return;
            }

            const figures = lines[0].split(' ');
            
            // Constructing the snake
            const snakeLength = parseInt(figures[0]);
            snakeArray.length=0;
            for(let s=1; s<=snakeLength; s++){
                const coordinates = lines[s].split(' ');
                snakeArray.push({x: parseInt(coordinates[0]),y: parseInt(coordinates[1])})
            }
            
            // Constructing the snake directions 
            for(let d=0; d<snakeLength-1; d++){
                snakeDirectionArray.push(computeDirection(snakeArray[d+1],snakeArray[d]));
            }

            tilesOnRow = parseInt(figures[1]);
            tilesOnColumn = parseInt(figures[2]);

            console.log("The width is",tilesOnRow,"and the height is", tilesOnColumn);

            canvas.width = tilesOnRow * gridSize;
            canvas.height = tilesOnColumn * gridSize;

            gameArray = new Array(tilesOnRow);

            for (let i = 0; i < tilesOnRow; i++) {
                gameArray[i] = new Array(tilesOnColumn);
                for (let j = 0; j < tilesOnColumn; j++) {
                    gameArray[i][j] = lines[j+(snakeLength+1)][i]; 
                }
            }

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