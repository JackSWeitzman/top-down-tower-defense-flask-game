let canvas;
let context;
let xhttp;

let stopVar = false;

let fpsInterval = 1000 / 60;
let now;
let then = Date.now();
let request_id;

let speed = {
    player : 2.5,
    playerInitial : 2.5,
    sprint : 1.5,
    enemy : 0.5,
    bullet : 7.5
}

let current = {
    bulletDamage : 1,
    bulletInterval : 900,
    enemyNumber : 3,
    enemyDamage : 1,
    enemyMax : 1,
    playerMax : 3,
    buildingMax : 10
}

let enemies = []
let bullets = []
let player = {
    maxHealth : current.playerMax,
    health : current.playerMax,
    x : 400,
    y : 304,
    size : 16,
    speed : speed.player,
    initialSpeed : speed.playerInitial,
    sprint : speed.sprint
}

let building = {
    maxHealth : current.buildingMax,
    health : current.buildingMax,
    x : 400,
    y : 304,
    size : 20
}

let score = 0;
let perkScore = 5;
let perkScoreIncrease = 1;
let perkSelect = [];

let moveLeft = false;
let moveRight = false;
let moveUp = false;
let moveDown = false;
let mousePos = {
    x : 0,
    y : 0
}

let pauseVar = false;
let eventDisabler = false;

let bulletFiring;

let backgroundImage = new Image();
backgroundImage.src = "static/map.png";
let playerSprite = new Image();
playerSprite.src = "static/spritePlayer.png";
let enemySprite = new Image();
enemySprite.src = "static/spriteEnemy.png";
let buildingSprite = new Image();
buildingSprite.src = "static/spriteBuilding.png";

let pHealthDisplay = document.querySelector("#playerHealth");
pHealthDisplay.innerHTML = "Player Health: " + player.health;
let bHealthDisplay = document.querySelector("#buildingHealth");
bHealthDisplay.innerHTML = "Building Health: " + building.health;
let pSpeedDisplay = document.querySelector("#playerSpeed");
pSpeedDisplay.innerHTML = "Player Speed: " + player.speed;
let bFirerate = document.querySelector("#bulletFirerate");
bFirerate.innerHTML = "Bullet Firerate: " + current.bulletInterval;
let bSpeed = document.querySelector("#bulletSpeed");
bSpeed.innerHTML = "Bullet Speed: " + speed.bullet;
let bDamage = document.querySelector("#bulletDamage");
bDamage.innerHTML = "Bullet Damage: " + current.bulletDamage;

document.addEventListener("DOMContentLoaded", init, false);
if (pauseVar != true) {
    bulletFiring = setInterval(shootBullet, current.bulletInterval); 
}


function init() {
    canvas = document.querySelector("canvas");
    context = canvas.getContext("2d");

        window.addEventListener("keydown", activate, false);
        window.addEventListener("keyup", deactivate, false);
        window.addEventListener("mousemove", mouseMove, false);
    draw();
}

function draw() {
    if (stopVar == true) {
        return;
    }
    if (pause() != true) {
        request_id = window.requestAnimationFrame(draw);
    }
    let now = Date.now()
    let elapsed = now - then;
    if (elapsed <= fpsInterval) {
        return;
    }
    then = now - (elapsed % fpsInterval);

    bHealthDisplay.innerHTML = "Building Health: " + building.health;
    pHealthDisplay.innerHTML = "Player Health: " + player.health;
    bDamage.innerHTML = "Bullet Damage: " + current.bulletDamage;
    bFirerate.innerHTML = "Bullet Firerate: " + current.bulletInterval;
    bSpeed.innerHTML = "Bullet Speed: " + speed.bullet;
    pSpeedDisplay.innerHTML = "Player Speed: " + player.speed;


    if (enemies.length < Math.floor((score / 30)) + current.enemyNumber)
    {
        let spawnSide = randint(1,4);
        if (spawnSide == 1) 
        {
            let a = {
                x : canvas.width - 16,
                y : randint(0, (canvas.height - 16)),
                size : 16,
                maxHealth : current.enemyMax,
                health : current.enemyMax,
                damage : current.enemyDamage,
                speed : speed.enemy,
                target : 2
            };
            enemies.push(a);
        }
        else if (spawnSide == 2) 
        {
            let a = {
                x : 0,
                y : randint(0, canvas.height - 16),
                size : 16,
                maxHealth : current.enemyMax,
                health : current.enemyMax,
                damage : current.enemyDamage,
                speed : speed.enemy,
                target : 2
            };
            enemies.push(a);
        }
        else if (spawnSide == 3) 
        {
            let a = {
                x : randint(0, canvas.width - 16),
                y : canvas.height - 16,
                size : 16,
                maxHealth : current.enemyMax,
                health : current.enemyMax,
                damage : current.enemyDamage,
                speed : speed.enemy,
                target : 2
            };
            enemies.push(a);
        }
        else 
        {
            let a = {
                x : randint(0, canvas.width - 16),
                y : 0,
                size : 16,
                maxHealth : current.enemyMax,
                health : current.enemyMax,
                damage : current.enemyDamage,
                speed : speed.enemy,
                target : 2
            };
            enemies.push(a);
        }
    }
    context.drawImage(backgroundImage, 0, 0);
    context.drawImage(playerSprite, player.x, player.y);
    context.drawImage(buildingSprite, building.x - (building.size/2), building.y - (building.size/2));
    for (let a of enemies) 
    {
        context.drawImage(enemySprite, a.x, a.y);
    }
    context.fillStyle = "yellow";
    for (let b of bullets)
    {
        context.fillRect(b.x, b.y, b.size, b.size)
    }
    for (let a of enemies) {
        let respawnSide = randint(1,4);
        if (player_collides(a)) 
        {
            if (player.health > 0) 
            {
                player.health -= current.enemyDamage;
            }
            if (player.health <= 0)
            {
                pHealthDisplay.innerHTML = "Player Health: 0";
                stop();
                return;
            }
            respawnEnemy(a, respawnSide);
            a.health = a.maxHealth;
            score += 1;
            let counter = document.querySelector("#killCount");
            counter.innerHTML = "Enemies Slain: " + score;
        }
        if (bulletCollides(a))
        {
            a.health -= current.bulletDamage;
            if (a.health <= 0) 
            {
                respawnEnemy(a, respawnSide);
                a.health = a.maxHealth;
                score += 1;
                let counter = document.querySelector("#killCount");
                counter.innerHTML = "Enemies Slain: " + score;
            }
        }
        if (buildingCollides(a))
        {
            if (building.health > 0) 
            {
                building.health -= current.enemyDamage;
            }
            if (building.health <= 0)
            {
                bHealthDisplay.innerHTML = "Building Health: 0";
            }
            respawnEnemy(a, respawnSide);
            a.health = a.maxHealth;
            score += 1;
            let counter = document.querySelector("#killCount");
            counter.innerHTML = "Enemies Slain: " + score;
        }
        else
        {
            if (a.target == 1) 
            {
                let xDiff = player.x - a.x;
                let yDiff = player.y - a.y;
                let xVector = (xDiff / Math.sqrt(Math.pow(xDiff, 2) + Math.pow(yDiff, 2))) * a.speed;
                let yVector = (yDiff / Math.sqrt(Math.pow(xDiff, 2) + Math.pow(yDiff, 2))) * a.speed;
                a.x += xVector;
                a.y += yVector;
            }
            else if (a.target == 2 &&
                building.health <= 0) {
                                
                let xDiff = player.x - a.x;
                let yDiff = player.y - a.y;
                let xVector = (xDiff / Math.sqrt(Math.pow(xDiff, 2) + Math.pow(yDiff, 2))) * a.speed;
                let yVector = (yDiff / Math.sqrt(Math.pow(xDiff, 2) + Math.pow(yDiff, 2))) * a.speed;
                a.x += xVector;
                a.y += yVector;
            }
            else 
            {
                let xDiff = building.x - a.x;
                let yDiff = building.y - a.y;
                let xVector = (xDiff / Math.sqrt(Math.pow(xDiff, 2) + Math.pow(yDiff, 2))) * a.speed;
                let yVector = (yDiff / Math.sqrt(Math.pow(xDiff, 2) + Math.pow(yDiff, 2))) * a.speed;
                a.x += xVector;
                a.y += yVector;
            }
        }
    }
    
    for (let b of bullets) 
    {
        if (b.x + b.size < 0 ||
            b.x - b.size > canvas.width ||
            b.y + b.size < 0 ||
            b.y - b.size > canvas.height) 
        {
            bulletRemove(b);
        }
        else 
        {
            b.x += b.xVector;
            b.y += b.yVector;
        }
    }

    if (moveLeft) {
        player.x -= player.speed;
    }
    if (moveRight) {
        player.x += player.speed;
    }
    if (moveUp) {
        player.y -= player.speed;
    }
    if (moveDown) {
        player.y += player.speed;
    }
    if (player.x <= 0) {
        player.x = 0;
    }
    if (player.x + player.size >= canvas.width) {
        player.x = canvas.width - player.size;
    }
    if (player.y <= 0) {
        player.y = 0;
    }
    if (player.y + player.size >= canvas.height) {
        player.y = canvas.height - player.size;
    }

    perkUp();
}
function shootBullet() {
    let rect = canvas.getBoundingClientRect();
    let xMouseCanvas = (mousePos.x - rect.left) / (rect.right - rect.left) * canvas.width
    let yMouseCanvas = (mousePos.y - rect.top) / (rect.bottom - rect.top) * canvas.height
    let xDiff = xMouseCanvas - player.x;
    let yDiff = yMouseCanvas - player.y;
    let bullet = 
        {
        x : player.x - player.size/4,
        y : player.y - player.size/4,
        size : 5,
        damage : 1,
        xVector : (xDiff / Math.sqrt(Math.pow(xDiff, 2) + Math.pow(yDiff, 2))) * speed.bullet,
        yVector : (yDiff / Math.sqrt(Math.pow(xDiff, 2) + Math.pow(yDiff, 2))) * speed.bullet
        }
    bullets.push(bullet);
}
function randint(min, max) {
    return Math.round(Math.random() * (max - min)) + min;
}

function activate(event) {
    let key = event.key;
    if (key === "a") {
        moveLeft = true;
    } else if (key === "d") {
        moveRight = true;
    } else if (key === "w") {
        moveUp = true;
    } else if (key === "s") {
        moveDown = true;
    } else if (key === " " ) {
        player.speed = player.initialSpeed + player.sprint;
    } else if (key === "p") {
        pauseVar = true
        pause()
    }
}

function deactivate(event) {
    let key = event.key;
    if (key === "a") {
        moveLeft = false;
    } else if (key === "d") {
        moveRight = false;
    } else if (key === "w") {
        moveUp = false;
    } else if (key === "s") {
        moveDown = false;
    } else if (key === " ") {
        player.speed = player.initialSpeed;
    } else if (key === "p") {
        unpause();
    }
}

function bulletCollides(a) {
    for (let b of bullets) 
    {
        if ((b.x + b.size < a.x - 5||
        a.x + a.size + 5 < b.x ||
        b.y > a.y + a.size + 5||
        a.y - 5 > b.y + b.size))
        {
        }
        else
        {
            bulletRemove(b);
            return true;
        }
    }
}

function bulletRemove(b) {
    let index = bullets.indexOf(b);
    bullets.splice(index, 1);
}

function buildingCollides(a) 
{
    if (building.health > 0) 
    {
        if (building.x + building.size < a.x ||
            a.x + a.size < building.x ||
            building.y > a.y + a.size ||
            a.y > building.y + building.size) {
                return false;
            } else {
                return true;
            }
    }
    else {
        return false
    }

}

function player_collides(a) {
    if (player.x + player.size < a.x ||
        a.x + a.size < player.x ||
        player.y > a.y + a.size ||
        a.y > player.y + player.size) {
            return false;
        } else {
            return true;
        }
}

function respawnEnemy(a, respawnSide) 
{
    let target = randint(1,2);
    if (respawnSide == 1)
    {
        a.x = canvas.width - a.size;
        a.y = randint(0, canvas.height - a.size);
        a.health = Math.floor((score / 50)) + current.enemyMax;
        a.maxHealth = Math.floor((score / 50)) + current.enemyMax;
        a.speed = ((Math.floor((score / 200)))/3) + speed.enemy;
        a.damage = Math.floor((score / 150)) + current.enemyDamage;
        a.target = target;
    }
    else if (respawnSide == 2) 
    {
        a.x = 0;
        a.y = randint(0, canvas.height - a.size);
        a.health = Math.floor((score / 50)) + current.enemyMax;
        a.maxHealth = Math.floor((score / 50)) + current.enemyMax;
        a.speed = ((Math.floor((score / 200)))/3) + speed.enemy;
        a.damage = Math.floor((score / 150)) + current.enemyDamage;
        a.target = target;
    } 
    else if (respawnSide == 3) 
    {
        a.y = canvas.height - a.size;
        a.x = randint(0, canvas.width - a.size);
        a.health = Math.floor((score / 50)) + current.enemyMax;
        a.maxHealth = Math.floor((score / 50)) + current.enemyMax;
        a.speed = ((Math.floor((score / 200)))/3) + speed.enemy;
        a.damage = Math.floor((score / 150)) + current.enemyDamage;
        a.target = target;
    } 
    else
    {
        a.y = 0;
        a.x = randint(0, canvas.width - a.size);
        a.health = Math.floor((score / 50)) + current.enemyMax;
        a.maxHealth = Math.floor((score / 50)) + current.enemyMax;
        a.speed = ((Math.floor((score / 200)))/3) + speed.enemy;
        a.damage = Math.floor((score / 150)) + current.enemyDamage;
        a.target = target;
    }
}

function stop() {
    stopVar = true;
    window.removeEventListener("keydown", activate, false);
    window.removeEventListener("keyup", deactivate, false);
    window.removeEventListener("click", shootBullet, false);
    document.removeEventListener("DOMContentLoaded", init, false);
    window.removeEventListener("mousemove", mouseMove, false);
    window.cancelAnimationFrame(request_id);

    let data = new FormData();
    data.append("score", score);
    xhttp = new XMLHttpRequest();
    xhttp.addEventListener("readystatechange", handle_response, false);
    xhttp.open("POST", "/~jsw2/cgi-bin/ca2/run.py/store_score", true);
    xhttp.send(data);
    console.log("am here")

}

function handle_response() {
    if (xhttp.readyState === 4)
    {
        console.log("pass 1")
        if (xhttp.status === 200) 
        {
            console.log("pass 2")
            if (xhttp.responseText === "success") 
            {
                console.log("Updated!")
            }
            else 
            {
                console.log("failed")
            }
        }
        else 
        {
            console.log("failed")
        }
    }
    else 
    {
        console.log("failed")
    }
}

function mouseMove(event) {
    mousePos = {
        x : event.clientX,
        y : event.clientY
    }
}

function perkUp() {
    if (building.health > 0) {
        if (score == perkScore) {
            pauseVar = true;
            eventDisabler = true;
            while (perkSelect.length < 3) {
                let perkSelectCurrent = randint(1,7);
                if ((perkSelect.includes(perkSelectCurrent))) {
                }
                else {
                    perkSelect.push(perkSelectCurrent)
                }
            }
            if (perkSelect.length == 3) {
                context.fillStyle = "green"
                context.fillRect(0, 0, canvas.width/3, canvas.height)
                context.fillStyle = "red"
                context.fillRect(0 + canvas.width/3, 0, canvas.width/3, canvas.height)
                context.fillStyle = "blue"
                context.fillRect(0 + (canvas.width/3)*2, 0, canvas.width/3, canvas.height)
                window.addEventListener("click", perkChoice, false);
                context.fillStyle = "white"
                if (perkSelect[0] == 1) {
                    context.font = "30px Arial";
                    context.fillText("Bullet Firerate", 33, 304)
                }
                else if (perkSelect[0] == 2) {
                    context.font = "30px Arial";
                    context.fillText("Bullet Damage", 33, 304)
                }
                else if (perkSelect[0] == 3) {
                    context.font = "30px Arial";
                    context.fillText("Player Speed", 33, 304)
                }
                else if (perkSelect[0] == 4) {
                    context.font = "30px Arial";
                    context.fillText("Player Health", 33, 304)
                }
                else if (perkSelect[0] == 5) {
                    context.font = "30px Arial";
                    context.fillText("Building Health", 33, 304)
                }
                else if (perkSelect[0] == 6) {
                    context.font = "30px Arial";
                    context.fillText("Heal To Full", 33, 304)
                }
                else if (perkSelect[0] == 7) {
                    context.font = "30px Arial";
                    context.fillText("Bullet Speed", 33, 304)
                }
                if (perkSelect[1] == 1) {
                    context.font = "30px Arial";
                    context.fillText("Bullet Firerate", 33+canvas.width/3, 304)
                }
                else if (perkSelect[1] == 2) {
                    context.font = "30px Arial";
                    context.fillText("Bullet Damage", 33+canvas.width/3, 304)
                }
                else if (perkSelect[1] == 3) {
                    context.font = "30px Arial";
                    context.fillText("Player Speed", 33+canvas.width/3, 304)
                }
                else if (perkSelect[1] == 4) {
                    context.font = "30px Arial";
                    context.fillText("Player Health", 33+canvas.width/3, 304)
                }
                else if (perkSelect[1] == 5) {
                    context.font = "30px Arial";
                    context.fillText("Building Health", 33+canvas.width/3, 304)
                }
                else if (perkSelect[1] == 6) {
                    context.font = "30px Arial";
                    context.fillText("Heal To Full", 33+canvas.width/3, 304)
                }
                else if (perkSelect[1] == 7) {
                    context.font = "30px Arial";
                    context.fillText("Bullet Speed", 33+canvas.width/3, 304)
                }
                if (perkSelect[2] == 1) {
                    context.font = "30px Arial";
                    context.fillText("Bullet Firerate", 33+(canvas.width/3)*2, 304)
                }
                else if (perkSelect[2] == 2) {
                    context.font = "30px Arial";
                    context.fillText("Bullet Damage", 33+(canvas.width/3)*2, 304)
                }
                else if (perkSelect[2] == 3) {
                    context.font = "30px Arial";
                    context.fillText("Player Speed", 33+(canvas.width/3)*2, 304)
                }
                else if (perkSelect[2] == 4) {
                    context.font = "30px Arial";
                    context.fillText("Player Health", 33+(canvas.width/3)*2, 304)
                }
                else if (perkSelect[2] == 5) {
                    context.font = "30px Arial";
                    context.fillText("Building Health", 33+(canvas.width/3)*2, 304)
                }
                else if (perkSelect[2] == 6) {
                    context.font = "30px Arial";
                    context.fillText("Heal To Full", 33+(canvas.width/3)*2, 304)
                }
                else if (perkSelect[2] == 7) {
                    context.font = "30px Arial";
                    context.fillText("Bullet Speed", 33+(canvas.width/3)*2, 304)
                }
            }
        }
    }
}

function perkChoice(event) {
    let rect = canvas.getBoundingClientRect();
    let xMouseCanvas = (event.clientX - rect.left) / (rect.right - rect.left) * canvas.width
    if (xMouseCanvas >= 0 &&
        xMouseCanvas <= canvas.width/3)
    {
        if (perkSelect[0] == 1) {
            current.bulletInterval -= 75
            if (current.bulletInterval < 0) {
                current.bulletInterval = 1
            }
        }
        else if (perkSelect[0] == 2) {
            current.bulletDamage += 0.75
        }
        else if (perkSelect[0] == 3) {
            player.speed += 0.2
            player.initialSpeed += 0.2
            player.sprint += 0.2
        }
        else if (perkSelect[0] == 4) {
            player.health += 1
            player.maxHealth += 1
        }
        else if (perkSelect[0] == 5) {
            building.health += 2
            building.maxHealth += 2
        }
        else if (perkSelect[0] == 6) {
            player.health = player.maxHealth
            building.health = building.maxHealth
        }
        else if (perkSelect[0] == 7) {
            speed.bullet += 1
        }
        pauseVar = false;
        eventDisabler = false;
    }
    else if (xMouseCanvas >= canvas.width/3 &&
        xMouseCanvas <= (canvas.width/3)*2)
    {
        if (perkSelect[1] == 1) {
            current.bulletInterval -= 75
            if (current.bulletInterval < 0) {
                current.bulletInterval = 1
            }
        }
        else if (perkSelect[1] == 2) {
            current.bulletDamage += 0.75
        }
        else if (perkSelect[1] == 3) {
            player.speed += 0.2
            player.initialSpeed += 0.2
            player.sprint += 0.2
        }
        else if (perkSelect[1] == 4) {
            player.health += 1
            player.maxHealth += 1
        }
        else if (perkSelect[1] == 5) {
            building.health += 2
            building.maxHealth += 2
        }
        else if (perkSelect[1] == 6) {
            player.health = player.maxHealth
            building.health = building.maxHealth
        }
        else if (perkSelect[1] == 7) {
            speed.bullet += 1
        }
        pauseVar = false;
        eventDisabler = false;
    }
    else if (xMouseCanvas >= (canvas.width/3)*2 &&
        xMouseCanvas <= canvas.width)
    {
        if (perkSelect[2] == 1) {
            current.bulletInterval -= 75
            if (current.bulletInterval < 0) {
                current.bulletInterval = 1
            }
        }
        else if (perkSelect[2] == 2) {
            current.bulletDamage += 0.75
        }
        else if (perkSelect[2] == 3) {
            player.speed += 0.2
            player.initialSpeed += 0.2
            player.sprint += 0.2
        }
        else if (perkSelect[2] == 4) {
            player.health += 1
            player.maxHealth += 1
        }
        else if (perkSelect[2] == 5) {
            building.health += 2
            building.maxHealth += 2
        }
        else if (perkSelect[2] == 6) {
            player.health = player.maxHealth
            building.health = building.maxHealth
        }
        else if (perkSelect[2] == 7) {
            speed.bullet += 1
        }
        pauseVar = false;
        eventDisabler = false;
    }   
    perkScore += perkScoreIncrease;
    perkScoreIncrease += 2;
    perkSelect = [];
    unpause();
}

function pause() {
    if (pauseVar == true){
        return true;
    }
    else {
        return false;
    }

}

function unpause()
{
    if (eventDisabler != true) {
        pauseVar = false;
        draw();
        return;
    }
}