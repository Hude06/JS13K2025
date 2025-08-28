import GA from "./ga.js";
import "./plugins.js"; // if plugins extend GA
let g = GA.create(800, 512, setup, [
    "../public/Cat.png",
    "../public/Mouse_Stand.png",
    "../public/Mouse_Lay.png",
    "../public/Roof1.png",
    "../public/Roof2.png"
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
let gravity = 0.2;

window.addEventListener("resize", function(event){ 
  g.scaleToWindow();
});
function newMouse(x, y) {
    let mouseSprite = g.sprite("../public/Mouse_Stand.png")
    mouseSprite.width = 22;
    mouseSprite.height = 22;
    mouseSprite.x = x;
    mouseSprite.y = y;
    return mouseSprite
}
function newBuilding(x, y, roof) {
    let roofsrc = roof === 1 ? "Roof1.png" : "Roof2.png";

    for (let i = 0; i < Math.random() * 10; i++) {
        let block = g.sprite("../public/" + roofsrc);
        block.width = 64;
        block.height = 32;
        block.x = x;
        block.y = y - 100 - (i * 32);
        buildings.addChild(block); // 👈 goes directly in global group
    }
}


function setup() {
    console.log("real");
    g.stage.width = g.canvas.width*2 // Total width of all buildings
    g.stage.height = g.canvas.height;
    mouses = g.group();
    buildings = g.group();
    game = g.group(player)

    g.canvas.ctx.imageSmoothingEnabled = false;
    console.log(g.canvas.ctx.imageSmoothingEnabled)
    g.canvas.style.border = "2px black solid";
    g.backgroundColor = "white";
    for (let i = 0; i < 100; i++) {
        newBuilding(i * 64, g.canvas.height, Math.floor(Math.random() * 2) + 1); // 128px spacing
    }
    game.addChild(buildings);

    for (let i = 0; i < 5; i++) {
        let mouse = newMouse(i * 20, buildings.children[0].gy - 25)
        mouses.addChild(mouse)
    }
    game.addChild(mouses)
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
    player.mouses = g.group();

    camera = g.worldCamera(game,g.canvas)
    g.key.leftArrow.press = function () {
        player.vx = -2;
        player.scaleX = -1; // Flip the player horizontally
        if (mouses.children.length > 0) {
            for (let i = 0; i < mouses.children.length; i++) {
                mouses.children[i].scaleX = -1;
                // player.mouse.rotation = 120
                mouses.children[i].offset = -5
            }
        }
    };
    g.key.leftArrow.release = function () {
        if (!g.key.rightArrow.isDown) {
            player.vx = 0;
        }
    };
    g.key.rightArrow.press = function () {
        player.vx = 2;
        player.scaleX = 1; // Reset the player to face right
        if (mouses.children.length > 0) {
            for (let i = 0; i < mouses.children.length; i++) {
                mouses.children[i].scaleX = 1;
                mouses.children[i].offset = 5
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
            player.vy -= 6; // Jump strength
            console.log("Jump!", player.grounded, player.vy);
            player.grounded = false
        }
    };
    g.state = play;  

}
function play() {
    // Move the player
    g.move(player);

    // Apply gravity
    player.vy += gravity; // Gravity strength

    // Collect mice
    for (let i = 0; i < mouses.children.length; i++) {
        const mouse = mouses.children[i];

        g.hit(player, mouse, false, false, true, () => {
            const layingMouse = g.sprite("../public/Mouse_Lay.png");
            layingMouse.width = 20;
            layingMouse.height = 20;
            layingMouse.offset = mouse.offset || 5;
            player.mouses.addChild(layingMouse);
            g.remove(mouse);
            mouses.removeChild(mouse);
            i--;
        });
    }

    // Reset grounded before collision check

    // Collide with buildings
    for (let i = 0; i < buildings.children.length; i++) {
        let block = buildings.children[i];

        g.hit(player, block, true, false, true, (collision) => {
            if (collision === "top") {
                // Player’s bottom hits block’s top
                player.vy = 0;
            } else if (collision === "bottom" && player.vy >= 0) {
                player.vy = 0; // head hits bottom of block
                console.log("Landed on block");
                player.grounded = true;
                player.y = (block.gy - (player.height)); // Position player on top of block
                player.vy = -gravity


            } else if (collision === "left" || collision === "right") {
                player.vx = 0;
            }
            if (collision !== "bottom" && player.vy > 0) {
                player.grounded = false;
            }
        });
    }

    // Center camera on player
    camera.centerOver(player);
}
