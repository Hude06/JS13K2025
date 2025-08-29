import GA from "./ga.js";
import "./plugins.js"; // if plugins extend GA
let g = GA.create(800, 512, setup, [
    "../public/Cat.png",
    "../public/Mouse_Stand.png",
    "../public/Mouse_Lay.png",
    "../public/Roof1.png",
    "../public/Roof2.png",
    "../public/Star.png",
    "../public/WhiteFont.png"
]);
GA.plugins(g);

g.start();
g.scaleToWindow();
let player;
let game;
let buildings;
let dropPoint;
let mouses;
let camera;
let gravity = 0.4;
let background;
let stars;
let topTowers = [];

window.addEventListener("resize", function(event){ 
  g.scaleToWindow();
});
class Menu {
    constructor() { 
        this.menuText = null;
        this.menuBackground = null;
        
    }
}
let menuOBJ = new Menu();
function newMouse(x, y) {
    let mouseSprite = g.sprite("../public/Mouse_Stand.png")
    mouseSprite.width = 22;
    mouseSprite.height = 22;
    mouseSprite.x = x;
    mouseSprite.y = y;
    return mouseSprite
}
function drawText(text, x,y,w,h) {
    const charWidth = 5;
    const charHeight = 5;
    const drawWidth = w;
    const drawHeight = h;
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    let textG = g.group();

    for (let i = 0; i < text.length; i++) {
        let char = text[i].toUpperCase();
        console.log(char)
        let index = chars.indexOf(char);
        console.log(index)
        if (index === -1) continue;

        let sprite = g.sprite("../public/WhiteFont.png"); // NEW sprite for EACH char

        let sx = index * charWidth; // If your font is a single row
        sprite.sourceX = sx;
        sprite.sourceY = 0;
        sprite.sourceWidth = charWidth;
        sprite.sourceHeight = charHeight;

        sprite.width = drawWidth;
        sprite.height = drawHeight;
        sprite.x = x + i * drawWidth;
        sprite.y = y;

        textG.addChild(sprite);
    }

    return textG;
}



function newBuilding(x, y, roof) {
    let roofsrc = roof === 1 ? "Roof1.png" : "Roof2.png";
    let topBlock = null;

    // Get the height of the previous building, or 10 if it's the first
    let leftBuildingHeight = buildings.lastHeight || 20;

    // New building height can only differ by ±2
    let minHeight = Math.max(1, leftBuildingHeight - 2);
    let maxHeight = leftBuildingHeight + 2;

    // Pick random height within allowed range
    let height = Math.floor(Math.random() * (maxHeight - minHeight + 1)) + minHeight;

    for (let i = 0; i < height; i++) {
        let block = g.sprite("../public/" + roofsrc);
        block.width = 64;
        block.height = 32;
        block.x = x;
        block.y = y - (i * 32);
        buildings.addChild(block);

        if (!topBlock || block.y < topBlock.y) {
            topBlock = block;
        }
    }

    // Store this building's height (in blocks) for the next one
    buildings.lastHeight = height;

    return topBlock; // return the top block of this building
}



function placeStars(count, minDist = 100) {
    let placed = [];

    for (let i = 0; i < count; i++) {
        let tries = 0;
        let star;

        while (tries < 50) { // safety limit
            let x = Math.floor(Math.random() * ((g.canvas.width*10) - 64));
            let y = Math.floor(Math.random() * ((g.canvas.height*5) / 2 - 64));

            // Check distance against all placed clouds
            let tooClose = placed.some(c => {
                let dx = c.x - x;
                let dy = c.y - y;
                return Math.sqrt(dx * dx + dy * dy) < minDist;
            });

            if (!tooClose) {
                star = g.sprite("../public/Star.png");
                star.width = 12;
                star.height = 12;
                star.x = x;
                star.y = y;
                stars.addChild(star);
                placed.push(star);
                break; // placed successfully
            }

            tries++;
        }
    }
}

placeStars(30, 100); // 30 clouds, at least 100px apart

function setup() {
    g.stage.width = g.canvas.width*2 // Total width of all buildings
    g.stage.height = g.canvas.height;
    mouses = g.group();
    buildings = g.group();
    game = g.group(player)
    stars = g.group()
    background = g.rectangle(g.canvas.width * 50, g.canvas.height * 100, "black", "none", 0, -1000, -500);
    
    game.addChild(background);
    g.canvas.ctx.imageSmoothingEnabled = false;
    g.canvas.style.border = "2px black solid";
    g.backgroundColor = "white";
    for (let i = 0; i < 100; i++) {
        topTowers.push(newBuilding(i * 64, g.canvas.height, Math.floor(Math.random() * 2) + 1)); // 128px spacing
    }


    for (let i = 0; i < 5; i++) {
        let mouse = newMouse(i * 64, topTowers[i].y - 22);
        mouses.addChild(mouse)
    }
    placeStars(1000, 100); // 30 clouds, at least 100px apart

    game.addChild(stars);
    game.addChild(buildings);
    game.addChild(mouses);
    dropPoint = g.rectangle(25, 25, "yellow")
    dropPoint.x = g.canvas.width - 25
    dropPoint.y = buildings.children[buildings.children.length - 1].gy
    game.addChild(dropPoint)

    player = g.sprite("../public/Cat.png")
    player.width = 40;
    player.height = 32;
    player.lastDropTime = 0;
    player.dropCooldown = 200;
    player.grounded = false
    player.x = g.canvas.width / 2 - player.width / 2;
    player.layingMouses = g.group();
    game.addChild(player.layingMouses);
    game.addChild(player);

    camera = g.worldCamera(game, g.canvas)
    g.key.a.press = function () { 
        player.vx = -3;
        player.scaleX = -1; // Flip the player horizontally
        if (player.layingMouses.children.length > 0) {
            for (let i = 0; i < player.layingMouses.children.length; i++) {
                player.layingMouses.children[i].scaleX = -1;
                player.layingMouses.children[i].offset = -5
            }
        }
    }
    g.key.a.release = function () { 
        if (!g.key.d.isDown) {
            player.vx = 0;
        }

    }
    g.key.d.press = function () {
        player.vx = 3;
        player.scaleX = 1; // Reset the player to face right
        if (player.layingMouses.children.length > 0) {
            for (let i = 0; i < player.layingMouses.children.length; i++) {
                player.layingMouses.children[i].scaleX = 1;
                player.layingMouses.children[i].offset = 5
            }

        }
    };

    // Right arrow key `release` method
    g.key.d.release = function () {
        if (!g.key.a.isDown) {
            player.vx = 0;
        }
    };
    g.key.leftArrow.press = function () {
        player.vx = -3;
        player.scaleX = -1; // Flip the player horizontally
        if (player.layingMouses.children.length > 0) {
            for (let i = 0; i < player.layingMouses.children.length; i++) {
                player.layingMouses.children[i].scaleX = -1;
                player.layingMouses.children[i].offset = -5
            }
        }
    };
    g.key.leftArrow.release = function () {
        if (!g.key.rightArrow.isDown) {
            player.vx = 0;
        }
    };
    g.key.rightArrow.press = function () {
        player.vx = 3;
        player.scaleX = 1; // Reset the player to face right
        if (player.layingMouses.children.length > 0) {
            for (let i = 0; i < player.layingMouses.children.length; i++) {
                player.layingMouses.children[i].scaleX = 1;
                player.layingMouses.children[i].offset = 5
            }

        }
    };

    // Right arrow key `release` method
    g.key.rightArrow.release = function () {
        if (!g.key.leftArrow.isDown) {
            player.vx = 0;
        }
    };

    // Up arrow key `press` method (Jump)
    g.key.upArrow.press = function () {
        console.log("Pressed", player.grounded)
        if (player.grounded) {
            console.log("ground")
        }
        if (player.grounded) {
            console.log("Jumping")
            player.vy -= 9; // Jump strength
            console.log("Jump!", player.grounded, player.vy);
            player.grounded = false
        }
    };
    g.key.space.press = function () {
        console.log("Pressed", player.grounded)
        if (player.grounded) {
            console.log("ground")
        }
        if (player.grounded) {
            console.log("Jumping")
            player.vy -= 9; // Jump strength
            console.log("Jump!", player.grounded, player.vy);
            player.grounded = false
        }
    };
    g.key.w.press = function () {
        console.log("Pressed", player.grounded)
        if (player.grounded) {
            console.log("ground")
        }
        if (player.grounded) {
            console.log("Jumping")
            player.vy -= 9; // Jump strength
            console.log("Jump!", player.grounded, player.vy);
            player.grounded = false
        }
    };
    
    g.state = menu;  

}
function menu() {
    if (!menuOBJ.menuBackground && !menuOBJ.menuText) {
        menuOBJ.menuBackground = g.rectangle(g.canvas.width * 50, g.canvas.height * 100, "black", "none", 0, -1000, -500);
        g.stage.addChild(menuOBJ.menuBackground);

        menuOBJ.menuText = drawText("THE MIDNIGHT EXPRESS", 75, 200, 32, 32);
        g.stage.addChild(menuOBJ.menuText);
    }

    if (g.key.space.isDown) {
        g.remove(menuOBJ.menuBackground);
        g.remove(menuOBJ.menuText);
        g.state = play;
    }
}

function play() {
    // 1️⃣ Apply gravity
    player.vy += gravity; // Gravity strength

    // 2️⃣ Move the player
    g.move(player);

    // 3️⃣ Collide with buildings
    for (let i = 0; i < buildings.children.length; i++) {
        let block = buildings.children[i];

        g.hit(player, block, true, false, false, (collision) => {
            if (collision === "top") {
                player.vy = 0;
            } else if (collision === "bottom" && player.vy >= 0) {
                player.vy = 0; // head hits bottom of block
                console.log("Landed on block");
                player.grounded = true;
                player.y = (block.y - player.height); // Position player on top of block
                player.vy = -gravity
            } else if (collision === "left" || collision === "right") {
                player.vx = 0;
            }
            if (collision !== "bottom" && player.vy > 0) {
                player.grounded = false;
            }
        });
    }

    // 4️⃣ Collect mice
    for (let i = 0; i < mouses.children.length; i++) {
        const mouse = mouses.children[i];

        g.hit(player, mouse, true, false, false, () => {
            const layingMouse = g.sprite("../public/Mouse_Lay.png");
            layingMouse.width = 20;
            layingMouse.height = 20;
            layingMouse.x = player.gx
            layingMouse.y = player.gy + 10
            player.layingMouses.addChild(layingMouse);
            mouses.removeChild(mouse);
            console.log("hit", layingMouse, player)
        });
    }
    if (player.layingMouses.children.length > 1) {
        console.log("MOUSE",player.layingMouses.children[0].x, player.layingMouses.children[0].y)
    }
    // 5️⃣ Update stacked mice positions
    let baseX = player.x + (player.scaleX === 1 ? 3 : 19);
    let baseY = player.y + 5; // start a little above player
    for (let i = 0; i < player.layingMouses.children.length; i++) {
        const layingMouse = player.layingMouses.children[i];
        layingMouse.x = baseX;
        layingMouse.y = baseY - i * 10; // stack upwards
    }

    // 6️⃣ Move clouds
    for (let i = 0; i < stars.children.length; i++) {
        const star = stars.children[i];
        star.x -= 0.05; // Move cloud left slowly
    }

    // 7️⃣ Center camera on player
    camera.centerOver(player);
}
