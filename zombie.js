const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const startButton = document.getElementById('startButton');

let showingTutorial=false;

const tutorialSteps=["Move : A/D or left arrow/right arrow","Jump : Spacebar","Aim: Mouse","Shoot : Left Click or Enter","Pause: P"]

const pauseButton = {
    x: 20,
    y: 20,
    width: 80,
    height: 40,
    text: 'Pause',
    textColor: 'white',
    backgroundColor: 'blue',
    fontSize: '18px',
    textAlign: 'center',
    textBaseline: 'middle'
};

const tutorialButton = {
    x: canvas.width - 100,
    y: 20,
    width: 80,
    height: 40,
    text: 'Tutorial',
    textColor: 'white',
    backgroundColor: 'orange',
    fontSize: '18px',
    textAlign: 'center',
    textBaseline: 'middle'
};

function drawButton(button) {
    ctx.fillStyle = button.backgroundColor;
    ctx.fillRect(button.x, button.y, button.width, button.height);

    ctx.fillStyle = button.textColor;
    ctx.font = button.fontSize + ' Arial';
    ctx.textAlign = button.textAlign;
    ctx.textBaseline = button.textBaseline;
    ctx.fillText(button.text, button.x + button.width / 2, button.y + button.height / 2);
    ctx.textAlign="left";
    
}

const survivorImage = new Image();
survivorImage.src = 'survivor.png';

const zombieImage = new Image();
zombieImage.src = 'zombie.png';

const blockImage= new Image();
blockImage.src= 'block.png';

const backgroundImage = new Image();
backgroundImage.src = 'background.png'; 

let gameRunning = true;
let score = 0;
let isPaused = false;


function togglePause() {
    isPaused = !isPaused;
    if (!isPaused) {
        gameLoop();
    }
}

function toggleTutorial() {
    togglePause();
    showingTutorial = !showingTutorial;
    drawtutorial();
}

function drawtutorial(){
    if (showingTutorial){    
        ctx.fillStyle = 'black';
        ctx.fillRect(300, 100, canvas.width - 600, canvas.height - 300);

        ctx.fillStyle = 'white';
        ctx.font = '20px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';

        tutorialSteps.forEach((step, index) => {
            ctx.fillText(step, canvas.width / 2, 150 + index * 30);
        });
    }
}

function gameLoop() {
    if (gameRunning && !isPaused) {
        update();
        draw();
        drawButton(pauseButton);
        drawButton(tutorialButton);
        requestAnimationFrame(gameLoop);
    }else {
        
        ctx.fillStyle = 'black';
        ctx.font = 'bold 40px Arial';
        ctx.fillText('Game Paused', canvas.width / 2 - 100,80);
       
    }
    
}

const survivor = {
    x: canvas.width / 2,
    y: canvas.height-320,
    width: 250,
    height: 320,
    speed: 5,
    dx: 0,
    dy: 0,
    jumping: false,
    gravity: 0.5,
    jumpStrength: -10,
    onGround: false,
    health:100,
    maxHealth:100,
    facing:"right",
    image: new Image(),
};

function drawSurvivor() {
    
        if (survivor.facing === 'left') {
            ctx.drawImage(survivorImage, survivor.x, survivor.y, survivor.width, survivor.height);
        } else {
           
            ctx.save();
            ctx.scale(-1, 1); 
            ctx.drawImage(survivorImage, -survivor.x - survivor.width, survivor.y, survivor.width, survivor.height);
            ctx.restore();
        }
    }
    



function updateSurvivor() {
    
    survivor.dy += survivor.gravity;
    survivor.y += survivor.dy;
    survivor.x += survivor.dx;

   
    if (survivor.x < 0) survivor.x = 0;
    if (survivor.x + survivor.width > canvas.width) survivor.x = canvas.width - survivor.width;
    if (survivor.y + survivor.height > canvas.height) {
        survivor.y = canvas.height - survivor.height;
        survivor.dy = 0;
        survivor.onGround = true;
    }
}



document.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowRight' || e.key === 'd') {
        survivor.dx = survivor.speed;
        // survivor.facing = 'right';
    } else if (e.key === 'ArrowLeft' || e.key === 'a') {
        survivor.dx = -survivor.speed;
        // survivor.facing = 'left';
    } else if (e.key === ' ' && survivor.onGround) {
        survivor.dy = survivor.jumpStrength;
        survivor.onGround = false;
    }else if (e.key === 'Enter') {
        shoot();
    }if (e.key === 'p') {
        togglePause();
    }
});


document.addEventListener('keyup', (e) => {
    if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'ArrowLeft' || e.key === 'a') {
        survivor.dx = 0;
    }
});


const zombies = [];

function createZombie() {
    let x = Math.random() < 0.5 ? 0 : canvas.width - 30;
    const y = canvas.height - 180;
    const speed = 0.5;
    zombies.push({ x, y, width: 150, height: 180, speed, isColliding: false,facing: x === 0 ? 'right' : 'left',
        collisionTime: 0});
}


function drawZombies() {
    ctx.fillStyle = 'red';
    zombies.forEach(zombie => {
        
        if (zombie.facing === 'right') {
            ctx.drawImage(zombieImage, zombie.x, zombie.y, zombie.width, zombie.height);
        } else {
            
            ctx.save();
            ctx.scale(-1, 1); 
            ctx.drawImage(zombieImage, -zombie.x - zombie.width, zombie.y, zombie.width, zombie.height);
            ctx.restore();
        }    
    });
}

function updateZombies() {
    zombies.forEach((zombie,index) => {
        if (!zombie.isColliding){
            if (zombie.x < survivor.x) {
                zombie.x += zombie.speed;
            } else {
                zombie.x -= zombie.speed;
            }
         }
        if (zombie.x < 0) zombie.x = 0;
        if (zombie.x + zombie.width > canvas.width) zombie.x = canvas.width - zombie.width;

        blocks.forEach((block, blockIndex) => {
            if (
                zombie.x < block.x + block.width-30 &&
                zombie.x + zombie.width > block.x+30 &&
                zombie.y < block.y + block.height &&
                zombie.y + zombie.height > block.y
            ) {
                
                if (!zombie.isColliding) {
                    zombie.isColliding = true;
                    zombie.collisionTime = Date.now();
                    zombie.speed = 0;
                }

                
                if (Date.now() - zombie.collisionTime >= block.blockstrength) {
                    blocks.splice(blockIndex, 1);
                    zombie.isColliding = false;
                    zombie.speed = 0.5; 
                }
            }
        }
    );

        if (
            survivor.x < zombie.x + zombie.width &&
            survivor.x + survivor.width > zombie.x &&
            survivor.y < zombie.y + zombie.height &&
            survivor.y + survivor.height > zombie.y
        ) {
            survivor.health-=20;
            drawHealthBar();
            zombies.splice(index, 1);

            if (survivor.health==0){
                gameRunning =false;
                saveScore();
                showLeaderboard();
                alert("Game over  Your score: "+score )
                } 
        }
     }
    );
}

const bullets = [];

let mouseX = 0;
let mouseY = 0;

canvas.addEventListener('mousemove', (e) => {
    const rect = canvas.getBoundingClientRect();
    mouseX = e.clientX - rect.left;
    mouseY = e.clientY - rect.top;
    if (mouseX > survivor.x + survivor.width / 2) {
        survivor.facing = 'right';
    } else {
        survivor.facing = 'left';
    }
});


canvas.addEventListener('click', (e) => {
    if (mouseX >= pauseButton.x && mouseX <= pauseButton.x + pauseButton.width &&
        mouseY >= pauseButton.y && mouseY <= pauseButton.y + pauseButton.height) {
        togglePause();
    }
     else if (mouseX >= tutorialButton.x && mouseX <= tutorialButton.x + tutorialButton.width &&
        mouseY >= tutorialButton.y && mouseY <= tutorialButton.y + tutorialButton.height) {
        toggleTutorial();
    }
     else if (!placingBlocks) {
        shoot();
    }   
     else {
        const rect = canvas.getBoundingClientRect();
        const x = Math.floor((e.clientX - rect.left) / blockWidth) * blockWidth;
        const y = Math.floor((e.clientY - rect.top) / blockHeight) * blockHeight;

        if (!blocks.some(block => block.x === x && block.y === y) &&
            !(x < survivor.x + survivor.width && x + blockWidth > survivor.x &&
              y < survivor.y + survivor.height && y + blockHeight > survivor.y)) {
            blocks.push({ x, y, width: blockWidth, height: blockHeight,dy:0 ,blockstrength:2000});
        }
    }
});


function shoot() {
    
   
    const angle = Math.atan2(mouseY - (survivor.y + survivor.height / 2), mouseX - (survivor.x + survivor.width / 2));
    const bulletSpeed = 7;
    const bulletDx = bulletSpeed * Math.cos(angle);
    const bulletDy = bulletSpeed * Math.sin(angle);

    const bullet = {
        x: survivor.x + survivor.width / 2+30,
        y: survivor.y + survivor.height / 2-50,
        dx: bulletDx,
        dy: bulletDy,
        gravity: 0.1
    };
    bullets.push(bullet);

}


function drawBullets() {
   
    bullets.forEach(bullet => {
      
        ctx.beginPath();
        ctx.strokeStyle="black";
        ctx.fillStyle="Black";
        ctx.arc(bullet.x,bullet.y,5,0,360,false);
        ctx.stroke()
        ctx.fill();
    });
}

function updateBullets() {
    bullets.forEach((bullet, index) => {
        bullet.dy += bullet.gravity;
        bullet.x += bullet.dx;
        bullet.y += bullet.dy;

        if (bullet.y > canvas.height || bullet.x < 0 || bullet.x > canvas.width || bullet.y<0) {
            bullets.splice(index, 1); 
        }
        
        
        blocks.forEach((block, blockIndex) => {
            if (
                bullet.x < block.x + block.width &&
                bullet.x + 5 > block.x &&
                bullet.y < block.y + block.height &&
                bullet.y + 5 > block.y
            ) {
                bullets.splice(index, 1); 
            }
        });
        
       
        zombies.forEach((zombie, zIndex) => {
            if (
                bullet.x < zombie.x + zombie.width &&
                bullet.x + 5 > zombie.x &&
                bullet.y < zombie.y + zombie.height &&
                bullet.y + 5 > zombie.y
            ) {
                zombies.splice(zIndex, 1); 
                bullets.splice(index, 1); 
                score += 10;
            }
        });
    });
}

const blocks = [];
const blockWidth = 100;
const blockHeight=200;
const blockGravity = 0.5; 

let placingBlocks = true;
let blockPlacementTime = 5; 
let timer = blockPlacementTime;
let intervalId;

function drawBlocks() {
    ctx.fillStyle = 'brown';
    blocks.forEach(block => {
       
        ctx.drawImage(blockImage, block.x, block.y, block.width, block.height);
    });
}


   
function updateBlocks() {
    blocks.forEach(block => {
       
        block.dy += blockGravity;
        block.y += block.dy;

        
        if (block.y + block.height >= canvas.height) {
            block.y = canvas.height - block.height;
            block.dy = 0;
        }
        
    });
}    
 
function startBlockPlacementTimer() {
    
    intervalId = setInterval(() => {
        if (!isPaused){
        timer--;
        if (timer <= 0) {
            clearInterval(intervalId);
            placingBlocks = false;
            setInterval(createZombie, 5000); 
        }
        }
    }, 1000); 
}

function saveScore() {
    let scores = JSON.parse(localStorage.getItem('scores')) || [];
    scores.push(score);
    scores.sort((a, b) => b - a);
    scores = scores.slice(0, 5); 
    localStorage.setItem('scores', JSON.stringify(scores));
}
function showLeaderboard() {
    let scores = JSON.parse(localStorage.getItem('scores')) || [];
    let leaderboard = 'Top Scores:\n';
    scores.forEach((score, index) => {
        leaderboard += `${index + 1}. ${score}\n`;
    });
    alert(leaderboard);
}

function drawBackground() {
    ctx.drawImage(backgroundImage, 0, 0, canvas.width, canvas.height);
}

function displayscore(){
        ctx.font = '50px Arial';
        ctx.fillStyle = 'red';
        ctx.fillText('Score: ' + score, 30, 100);
    }

function displaytimer(){
    if (placingBlocks) {
        ctx.fillStyle="yellow";
        ctx.fillText(`Place your blocks. Time left: ${timer}s`, 250, 150);
    }
}

function drawHealthBar() {
    const healthBarWidth = 200;
    const healthBarHeight = 20;
    const healthBarX = survivor.x;
    const healthBarY = survivor.y-5;

    
    const currentHealthWidth = (survivor.health / survivor.maxHealth) * healthBarWidth;

    
    ctx.fillStyle = 'red';
    ctx.fillRect(healthBarX, healthBarY, healthBarWidth, healthBarHeight);

   
    ctx.fillStyle = 'green';
    ctx.fillRect(healthBarX, healthBarY, currentHealthWidth, healthBarHeight);

    
    ctx.strokeStyle = 'black';
    ctx.strokeRect(healthBarX, healthBarY, healthBarWidth, healthBarHeight);
}


function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawBackground();
    drawSurvivor();
    drawHealthBar();
    drawZombies();
    drawBullets();
    displayscore();
    drawBlocks();
    updateBlocks();
    displaytimer();
   
}

function update() {
    updateSurvivor();
    updateZombies();
    updateBullets();
}

function drawStartScreen() {
    drawBackground();
    

    ctx.fillStyle = "yellow"
    ctx.font = 'bold 48px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('Zombie Apocalypse Game', canvas.width / 2, canvas.height / 2 - 50);
    ctx.font = '24px Arial';
    ctx.fillText('Press Start to Play', canvas.width / 2, canvas.height / 2 + 20);
    ctx.textAlign="left"
}



Promise.all([
    new Promise((resolve) => { survivorImage.onload = resolve; }),
    new Promise((resolve) => { zombieImage.onload = resolve; }),
    new Promise((resolve) => { blockImage.onload= resolve;}),
    new Promise((resolve) => { backgroundImage.onload = resolve; })
]).then(drawStartScreen);

function startGame() {
    
    startButton.addEventListener('click', () => {
        startButton.style.display = 'none';
        startBlockPlacementTimer();
        gameLoop(); 
    });
}
startGame();