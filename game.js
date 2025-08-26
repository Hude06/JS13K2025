let g = ga(800, 512, setup,["./assets/Cat.png","./assets/Mouse_Stand.png","./assets/Mouse_Lay.png"]);
g.start();
g.scaleToWindow();
let player;
let game;
let buildings;
let dropPoint;
let mouses;
let camera

window.addEventListener("resize", function(event){ 
  g.scaleToWindow();
});
function newMouse(x, y) {
    let mouseSprite = g.sprite("./assets/Mouse_Stand.png")
    mouseSprite.width = 22;
    mouseSprite.height = 22;
    mouseSprite.x = x;
    mouseSprite.y = y;
    return mouseSprite
}
function newBuilding(x, y, height) {
    let building = g.rectangle(100, height, "grey");
    building.x = x;
    building.y = y - height;
    return building
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
    for (let i = 0; i < (10); i++) {
        console.log("I is ",i)
        let building = newBuilding((i)*99, g.canvas.height, 100 + Math.random() * 200)
        buildings.addChild(building)
    }
    game.addChild(buildings)

    for (let i = 0; i < 5; i++) {
        let mouse = newMouse(i * 20, buildings.children[0].y - 25)
        mouses.addChild(mouse)
    }
    game.addChild(mouses)
    dropPoint = g.rectangle(25, 25, "yellow")
    dropPoint.x = g.canvas.width - 25
    dropPoint.y = buildings.children[buildings.children.length - 1].y


    player = g.sprite("./assets/Cat.png")
    player.width = 40;
    player.height = 32;
    player.lastDropTime = 0;
    player.dropCooldown = 200;
    player.grounded = false
    player.x = g.canvas.width / 2 - player.width / 2;

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
        console.log("Pressed",player.grounded)
        if (player.grounded) {
            console.log("Jump!");
            player.vy += 7; // Jump strength
            player.y -= 5; // Slightly move the player up to avoid immediate re-collision
            player.grounded = false
        }
    };
    g.state = play;  

}
function play() {
    // Left arrow key `press` method
    g.move(player);

    // Left arrow key `release` method

    // Right arrow key `press` method

    // Apply gravity
    if (!player.grounded) {
        player.vy += 0.2; // Gravity strength
    }

    for (let i = 0; i < mouses.children.length; i++) {
        const mouse = mouses.children[i];

        g.hit(player, mouse, false, false, true, () => {
            // Player collected the mouse
            const layingMouse = g.sprite("./assets/Mouse_Lay.png");
            layingMouse.width = 20;
            layingMouse.height = 20;
            layingMouse.offset = mouse.offset || 5; // Preserve the offset if it exists

            // Add the new mouse to the player's mouses array
            mouses.addChild(layingMouse);

            // Remove the collided mouse from the game stage and the mouses array
            g.remove(mouse); // Remove the sprite from the game stage
            mouses.removeChild(mouse);
            i--; // Adjust the index after removal
        });
    }
    for (let i = 0; i < buildings.children.length; i++) {
        const building = buildings.children[i];

        g.hit(player, building, true, false, true, (collision) => {
            if (collision === "top") {
                player.vy = 0;  // stop vertical movement
                player.grounded = true;
                console.log("We Collided")
            } else if (collision === "bottom") {
                player.vy = 0;
            } else if (collision === "left" || collision === "right") {
                player.vx = 0;
            }
        });
    }

    console.log(player.grounded)
    // Contain the player within the game boundaries
    // g.contain(player, { x: 0, y: 0, width: g.canvas.width, height: g.canvas.height });

    // Move the player
    camera.centerOver(player, 0.2);
}