window.onload = function() {
    
    if (document.getElementsByClassName("jsloaded").length > 0) {
        console.log("JS loaded element exists");
    } else {
        console.log("JS loaded element does not exist");
    }
    
    loadGame();

    document.getElementById("summonApple")
        .onclick = summonApple;

    document.getElementById("collectApple")
        .onclick = collectApples;

    document.getElementById("sellApple")
        .onclick = sellApples;

    document.getElementById("rebirthButton")
        .onclick = rebirth;

    updateUI();
};

let game = {
    level: 1,

    apples: 0,
    collectedApples: 0,
    totalApples: 0,
    coins: 0,

    summonPower: 1,

    autoApples: 0,
    autoCollect: false,

    rebirths: 0,
    rebirthUnlocked: false
};

function collectApples() {

    if (game.apples <= 0) {
        alert("No apples to collect!");
        return;
    }

    game.collectedApples += game.apples;
    game.apples = 0;

    updateUI();
}

function updateLevel() {

    if (game.totalApples >= 1500) {
        game.level = 5;
    }
    else if (game.totalApples >= 1000) {
        game.level = 4;
    }
    else if (game.totalApples >= 500) {
        game.level = 3;
    }
    else if (game.totalApples >= 250) {
        game.level = 2;
    }
    else {
        game.level = 1;
    }
}

function updateUI() {
    
    document.getElementById("collectedapples")
    .innerText = `Collected: ${game.collectedApples}`;

    document.getElementById("levels")
        .innerText = `Level: ${game.level}`;

    document.getElementById("apples")
        .innerText = `Apples: ${game.apples}`;

    document.getElementById("totalapples")
        .innerText = `Total: ${game.totalApples}`;

    document.getElementById("coins")
        .innerText = `Coins: ${game.coins}`;

    document.getElementById("autoapples")
        .innerText = `AutoApples: ${game.autoApples}`;

    document.getElementById("autocollect")
        .innerText =
            `AutoCollect: ${game.autoCollect ? "ON" : "OFF"}`;

    document.getElementById("rebirths")
        .innerText = `Rebirths: ${game.rebirths}`;

    document.getElementById("rebirthunlocked")
        .innerText =
            `Rebirth Unlocked: ${
                game.rebirthUnlocked ? "ENABLED" : "DISABLED"
            }`;
}

function unlockRebirth() {

    if (game.rebirthUnlocked) {
        alert("Already unlocked!");
        return;
    }

    if (game.coins < 6500) {
        alert("Need 6500 coins!");
        return;
    }

    game.coins -= 6500;
    game.rebirthUnlocked = true;

    updateUI();
}

setInterval(function() {

    game.apples += game.autoApples;

    if (game.autoCollect && game.apples > 0) {
        game.coins += game.apples;
        game.apples = 0;
    }

    updateLevel();
    updateUI();

}, 1000);

function summonApple() {
    
    console.log("clicked");
    game.apples += game.summonPower;
    game.totalApples += game.summonPower;

    updateLevel();
    updateUI();
}

function rebirth() {

    if (!game.rebirthUnlocked) {
        alert("Rebirth not unlocked!");
        return;
    }
    
    game.rebirths += 1;
    game.level = 1;
    game.apples = 0;
    game.totalApples = 0;
    game.coins = 0;
    game.collectedApples = 0;
    game.rebirthUnlocked = false;
    game.autoCollect = false;

    game.autoApples += 1;

    updateLevel();
    updateUI();
}

function spendCoins(cost) {

    if (game.coins < cost) {
        alert(`Need ${cost} coins!`);
        return false;
    }

    game.coins -= cost;
    return true;
}

function plusoneAppletree() {

    if (!spendCoins(250))
        return;

    game.autoApples += 1;

    updateUI();
}

function autoCollecttoggle() {

    if (game.autoCollect)
        return;

    if (!spendCoins(1000))
        return;

    game.autoCollect = true;

    updateUI();
}

function plusoneSummoner() {

    if (!spendCoins(20))
        return;

    game.summonPower += 1;

    updateUI();
}

function plustSummoner() {

    if (!spendCoins(200))
        return;

    game.summonPower += 10;

    updateUI();
}

function plustfiveSummoner() {

    if (!spendCoins(500))
        return;

    game.summonPower += 25;

    updateUI();
}

function plusfiftySummoner() {

    if (!spendCoins(1000))
        return;

    game.summonPower += 50;

    updateUI();
}

function plustwofiftySummoner() {
    
    if (!spendCoins(8000))
        return;
    
    game.summonPower += 250;
    
    updateUI();
}

function plussevenfiftySummoner() {
    
    if (!spendCoins(18000))
        return;
    
    game.summonPower += 750;
    
    updateUI();
}

function plustwofiveSummoner() {
    
    if (!spendCoins(25000))
        return;
    
    game.summonPower += 1500;
    
    updateUI();
}

function saveGame() {

    localStorage.setItem(
        "appleCollectorSave",
        JSON.stringify(game)
    );
}

function loadGame() {

    const save =
        localStorage.getItem("appleCollectorSave");

    if (save) {
        game = JSON.parse(save);
    }

    if (game.collectedApples === undefined) {
        game.collectedApples = 0;
    }
}

function sellApples() {

    if (game.collectedApples <= 0) {
        alert("No collected apples to sell!");
        return;
    }

    game.coins += game.collectedApples * 2;

    game.collectedApples = 0;

    updateUI();
}

setInterval(saveGame, 5000);
window.addEventListener("beforeunload", saveGame);
