const grid = document.getElementById("gridarea");
let classes = {}; 
let npcCubes = []; // NPC cubes (index none)

// Generate 30x30 grid
for (let i = 0; i < 900; i++) {
    const cell = document.createElement("div");
    cell.classList.add("cell");

    // Store coordinates
    cell.dataset.x = i % 30;
    cell.dataset.y = Math.floor(i / 30);

    // DRAG movement (mobile)
    cell.addEventListener("touchmove", (e) => {
        e.preventDefault();
        const x = parseInt(cell.dataset.x);
        const y = parseInt(cell.dataset.y);
        dragMove(x, y);
    });

    grid.appendChild(cell);
}

class Cube {
    constructor(name, x, y, props) {
        this.name = name;
        this.x = x;
        this.y = y;

        props = props || {};

        this.borderCollision = props["border-collision"] === "true";
        this.bgColor = props["bg-color"] || "lime";

        this.element = document.createElement("div");
        this.element.classList.add("cube");
        this.element.style.backgroundColor = this.bgColor;

        // MOBILE: select cube on touch
        this.element.addEventListener("touchstart", () => {
            activeCube = this;
        });

        this.updatePosition();
        grid.appendChild(this.element);
    }

    updatePosition() {
        this.element.style.gridColumn = this.x + 1;
        this.element.style.gridRow = this.y + 1;
    }
}

// Default cube at (0,0)
let activeCube = new Cube("player", 0, 0);
activeCube.element.classList.add("player");

// Permanent reference to cube1
let cube1 = activeCube;

// Store cubes by index
let cubesByIndex = { 1: cube1 };
let currentIndex = 1;

// Collision toggle
let collisionEnabled = false;

function isOccupied(x, y) {
    for (const index in cubesByIndex) {
        const cube = cubesByIndex[index];
        if (cube.x === x && cube.y === y) return true;
    }
    for (const cube of npcCubes) {
        if (cube.x === x && cube.y === y) return true;
    }
    return false;
}

function switchToNextCube() {
    const indexes = Object.keys(cubesByIndex)
        .map(n => parseInt(n))
        .sort((a, b) => a - b);

    if (indexes.length === 0) return;

    let pos = indexes.indexOf(currentIndex);
    pos = (pos + 1) % indexes.length;

    currentIndex = indexes[pos];
    activeCube = cubesByIndex[currentIndex];
}

// KEYBOARD MOVEMENT
document.addEventListener("keydown", (e) => {
    const codeArea = document.getElementById("codearea");
    if (document.activeElement === codeArea) return;

    if (e.key.toLowerCase() === "e") {
        switchToNextCube();
        return;
    }

    let newX = activeCube.x;
    let newY = activeCube.y;

    switch (e.key.toLowerCase()) {
        case "w": newY -= 1; break;
        case "s": newY += 1; break;
        case "a": newX -= 1; break;
        case "d": newX += 1; break;
    }

    moveCube(newX, newY);
});

// DRAG MOVEMENT FUNCTION
function dragMove(targetX, targetY) {
    moveCube(targetX, targetY);
}

// SHARED MOVEMENT LOGIC
function moveCube(targetX, targetY) {
    // Border collision
    if (activeCube.borderCollision) {
        if (targetX < 0 || targetX > 29 || targetY < 0 || targetY > 29) return;
    }

    // Cube collision
    if (collisionEnabled) {
        const blockingCube = [...Object.values(cubesByIndex), ...npcCubes]
            .find(c => c.x === targetX && c.y === targetY && c.borderCollision);

        if (blockingCube) return;
    }

    activeCube.x = targetX;
    activeCube.y = targetY;

    activeCube.element.style.transform = "scale(1.15)";
    setTimeout(() => activeCube.element.style.transform = "scale(1)", 150);

    activeCube.updatePosition();
}

// PARSER
function parseCode() {
    const raw = document.getElementById("codearea").innerText;
    const code = raw.replace(/\u00A0/g, " ");

    collisionEnabled = /import\s+collision/i.test(code);

    classes = {};
    npcCubes = [];

    // Create Class(Name)
    const createClassRegex = /create\s+class\((\w+)\)/gi;
    let createMatch;
    while ((createMatch = createClassRegex.exec(code)) !== null) {
        const className = createMatch[1];
        classes[className] = {};
    }

    // .ClassName { ... }
    const classRegex = /\.([A-Za-z0-9_]+)\s*{\s*([\s\S]*?)\s*}/g;
    let classMatch;
    while ((classMatch = classRegex.exec(code)) !== null) {
        const className = classMatch[1];
        const body = classMatch[2];

        const props = {};
        body.split(";").forEach(line => {
            const [key, value] = line.split(":").map(s => s.trim());
            if (key && value) props[key] = value;
        });

        classes[className] = props;
    }

    // Cube blocks
    const cubeBlockRegex = /cube(\w+)\s*{\s*([\s\S]*?)\s*}/gi;
    let match;

    document.querySelectorAll(".cube:not(.player)").forEach(c => c.remove());
    cubesByIndex = { 1: cube1 };

    while ((match = cubeBlockRegex.exec(code)) !== null) {
        const name = match[1];
        const body = match[2];

        let x = 0, y = 0;
        let colorOverride = null;
        let className = null;
        let index = null;
        let borderOverride = null;

        const gridMatch = /grid\((\d+)x,\s*(\d+)y\)/i.exec(body);
        if (gridMatch) {
            x = parseInt(gridMatch[1]);
            y = parseInt(gridMatch[2]);
        }

        const colorMatch = /bg-color:\s*([\w#]+)/i.exec(body);
        if (colorMatch) colorOverride = colorMatch[1];

        const classMatchInside = /class:\s*([\w]+)/i.exec(body);
        if (classMatchInside) className = classMatchInside[1];

        const borderMatch = /border-collision:\s*(true|false)/i.exec(body);
        if (borderMatch) borderOverride = borderMatch[1].toLowerCase();

        const indexNoneMatch = /index\(none\)/i.exec(body);
        if (indexNoneMatch) {
            index = null;
        } else {
            const indexMatch = /index\((\d+)\)/i.exec(body);
            if (indexMatch) index = parseInt(indexMatch[1]);
        }

        if (collisionEnabled && isOccupied(x, y)) continue;

        let props = {};
        if (className && classes[className]) props = { ...classes[className] };

        if (colorOverride) props["bg-color"] = colorOverride;
        if (borderOverride !== null) props["border-collision"] = borderOverride;

        // Modify existing cube
        if (index !== null && cubesByIndex[index]) {
            const cube = cubesByIndex[index];
            cube.x = x;
            cube.y = y;
            cube.borderCollision = props["border-collision"] === "true";
            cube.bgColor = props["bg-color"] || cube.bgColor;
            cube.element.style.backgroundColor = cube.bgColor;
            cube.updatePosition();
        } else {
            const cube = new Cube(name, x, y, props);

            if (index === null) {
                npcCubes.push(cube);
            } else {
                cubesByIndex[index] = cube;
            }
        }
    }
}

// Parse whenever user edits code
document.getElementById("codearea").addEventListener("input", parseCode);
window.onload = parseCode;

