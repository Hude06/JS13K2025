import GA from "./ga.js";
import "./plugins.js"; // if plugins extend GA
import zzfx from "./sounds.js"
let money = 0;
let moneySPRITE = undefined
class State {
    constructor(g) {
        this.g = g
        this.player = null;
        this.game = null;
        this.buildings = null;
        this.dropPoint = undefined;
        this.mouses = null;
        this.camera = undefined;
        this.gravity = 0.4;
        this.stars = null;
        this.topTowers = [];
        this.worldWidth = 0;
        this.menuStage = 1
        this.menuText = undefined
        this.menuBackground = undefined
    }
    destroy() {
    // remove groups/sprites we added to the stage
    try { if (this.player) g.remove(this.player); } catch(e){}
    try { if (this.mouses) g.remove(this.mouses); } catch(e){}
    try { if (this.buildings) g.remove(this.buildings); } catch(e){}
    try { if (this.stars) g.remove(this.stars); } catch(e){}
    try { if (this.dropPoint) g.remove(this.dropPoint); } catch(e){}
    try { if (this.timeLimitSprite) g.remove(this.timeLimitSprite); } catch(e){}
    // clear references so GC can collect
    this.camera = null;
    this.player = null;
    this.mouses = null;
    this.buildings = null;
    this.stars = null;
    this.dropPoint = null;
    this.game = null;
    };

    setup() {
        const g = this.g; // local alias for convenience

        // create groups and sprites now that assets are loaded
        this.game = g.group();         // top-level game group
        this.buildings = g.group();
        this.mouses = g.group();
        this.stars = g.group();

        // player sprite
        this.player = g.sprite("./Cat.png");
        this.player.width = 40;
        this.player.height = 32;
        this.player.lastDropTime = 0;
        this.player.dropCooldown = 200;
        this.player.grounded = false;
        this.player.canDropMice = false;
        this.player.moveSpeed = 3;
        this.player.speed = 3;
        this.player.hurt = 150;
        this.player.fallSpeed = 0;
        this.player.x = g.canvas.width / 2 - this.player.width / 2;
        this.levelTimeLimit = 30
        this.dropPoint = g.sprite("./Elevator.png");

        // this.player.y = blockUnderPlayer
        this.player.layingMouses = g.group();
        this.player.dropingElevator = false;

        this.timeLimitSprite = drawText("30", g.canvas.width - 200, 16,32,32)
        updateMoneyHUD(money);
        g.stage.addChild(this.timeLimitSprite)


        // create towers/buildings AFTER you have groups
        createLevel(20,5,this.topTowers,this.mouses,this.dropPoint,this.player)
        // world width depends on topTowers
        const blockUnderPlayer = getBlockBelow(this.player.x);
        console.log("block is ",getBlockBelow(this.player.x))
        this.player.y = blockUnderPlayer.y
        this.worldWidth = this.topTowers.length * 64;
        g.stage.width = this.worldWidth;
        g.stage.height = g.canvas.height * 100;

        // place some mice
        placeStars(100, 100);

        // dropPoint and last tower
        

        this.game.addChild(this.stars);

        // add child hierarchy
        this.player.addChild(this.player.layingMouses);
        console.log(this.levelTimeLimit)
        // g.stage.addChild(timeLimit); // if you prefer a HUD group
        this.game.addChild(this.buildings);
        this.game.addChild(this.dropPoint)
        this.game.addChild(this.mouses);
        this.game.addChild(this.player);

        // camera
        this.camera = g.worldCamera(this.game, g.canvas);

        // set keyboard handlers
        this.keyboard();

        // go to menu s
        // tate
        g.state = menu;
    }

    keyboard() {
        const g = this.g;
        // use arrow functions so `this` is the State instance
        g.key.a.press = () => { playerMoveLeft(); };
        g.key.a.release = () => {
            if (!g.key.d.isDown) {
                this.player.vx = 0;
            }
        };

        g.key.d.press = () => { playerMoveRight(); };
        g.key.d.release = () => {
            if (!g.key.a.isDown) {
                this.player.vx = 0;
            }
        };

        // similarly for arrows
        g.key.leftArrow.press = () => { playerMoveLeft(); };
        g.key.leftArrow.release = () => {
            if (!g.key.rightArrow.isDown) this.player.vx = 0;
        };
        g.key.rightArrow.press = () => { playerMoveRight(); };
        g.key.rightArrow.release = () => {
            if (!g.key.leftArrow.isDown) this.player.vx = 0;
        };

        g.key.upArrow.press = () => { playerMoveUp(); };
        g.key.space.press = () => {
            if (g.state === play) {
                playerMoveUp();
            } else if (g.state === menu) {
                console.log("menu")
                state.menuStage += 1
                console.log(money)
            }
            };
        g.key.w.press = () => { playerMoveUp(); };
        console.log(g.state)
        g.key.r.press = () => { resetGame()};
        g.key.q.release = async () => {
            if (this.player.dropingElevator) {
                let count = this.player.layingMouses.children.length;
                let m = this.player.layingMouses.children[count - 1];
                this.player.layingMouses.removeChild(m);
                this.player.canDropMice = false
                this.player.moveSpeed = this.player.speed - (this.player.layingMouses.children.length / 5);
                console.log(this.player.moveSpeed)
                playJump()
                money += 1;
                console.log("money ->", money);
                updateMoneyHUD(money);
                console.log("MNouse left",this.mouses.children.length)
                if (this.mouses.children.length === 0 && this.player.layingMouses.children.length === 0) {
                    console.log("reset")
                    resetGame();
                }

            } else {
                if (this.player.layingMouses.children.length > 0) {
                    let b = await getBuildingTopUnderPlayer(this.player)
                    console.log(b)
                    let firstMouse = this.player.layingMouses.children[0];
                    this.player.layingMouses.removeChild(firstMouse);
                    let mouse = newMouse(this.player.x - 25, getBuildingTopUnderPlayer(this.player).y - 22);
                    state.mouses.addChild(mouse);
                    this.player.moveSpeed = this.player.speed - (this.player.layingMouses.children.length / 5);


                    console.log(this.player.moveSpeed)
                }
            }
        };
    }
}
const assets = [
    "./Cat.png",
    "./Mouse_Stand.png",
    "./Mouse_Lay.png",
    "./Roof1.png",
    "./Roof2.png",
    "./Star.png",
    "./WhiteFont.png",
    "./Elevator.png"
];
let state = null;
const g = GA.create(800, 512, () => {
    if (state && typeof state.setup === "function") state.setup();
}, assets);
state = new State(g);
GA.plugins(g);
g.start();
g.scaleToWindow();
g.canvas.ctx.imageSmoothingEnabled = false;
console.log(g.canvas.ctx.imageSmoothingEnabled)
g.canvas.style.border = "2px black solid";
g.backgroundColor = "black";
function playJump() {
    zzfx(...[, , 488, .02, .01, .07, , .7, , 162, , , , , , , , .82, .04]);
}
window.addEventListener("resize", function(event){ 
g.scaleToWindow();
});
function updateMoneyHUD(newMoney) {
  // remove old sprite if present
  if (typeof moneySPRITE !== "undefined" && moneySPRITE) {
    try { g.remove(moneySPRITE); } catch(e) { /* ignore */ }
  }
  moneySPRITE = drawText(String(newMoney) + " money", g.canvas.width - 800, 16, 32, 32);
  g.stage.addChild(moneySPRITE);
}
function resetGame() {
    g.state = menu
    state.destroy()
    console.log("active cameras count:", (window.__cameras || []).length);

    state = new State(g)
    state.setup();
}
function newMouse(x, y) {
    let mouseSprite = g.sprite("./Mouse_Stand.png")
    mouseSprite.width = 22;
    mouseSprite.height = 22;
    mouseSprite.x = x;
    mouseSprite.y = y;
    return mouseSprite
}
function getBlockBelow(x) {
    let closestBlock = null;

    for (let i = 0; i < state.buildings.children.length; i++) {
        const block = state.buildings.children[i];

        // Check if x is within this block's horizontal bounds
        const withinX = x >= block.x && x <= block.x + block.width;

        if (withinX) {
            // If block is higher (i.e., lower y value) than current closest
            if (!closestBlock || block.y < closestBlock.y) {
                closestBlock = block;
            }
        }
    }

        return closestBlock;
}
function createLevel(length,mouseAmount,topTowers,mouses,dropPoint,player) {
        for (let i = 0; i < length; i++) {
            // call your newBuilding function but make sure it uses `g` and `this.buildings`
            topTowers.push(newBuilding(i * 64, g.canvas.height, Math.floor(Math.random() * 2) + 1));
        }
        for (let i = 0; i < mouseAmount; i++) {
            let mouse = newMouse(i * 64, topTowers[i].y - 22);
            mouses.addChild(mouse);
        }

        // Get the player's building position (rounded to the closest building)
        const playerBuildingIndex = Math.floor(player.x / 64);

        // Set the minimum and maximum distance from the player
        const minDistance = 5;
        const maxDistance = 10;

        // Calculate the building index range (at least 5, at most 10 buildings away)
        const minBuilding = Math.max(0, playerBuildingIndex - maxDistance);
        const maxBuilding = Math.min(topTowers.length - 1, playerBuildingIndex + maxDistance);

        // Randomly select a building that is at least 5 buildings away
        let validBuildingFound = false;
        let selectedBuilding = null;

        while (!validBuildingFound) {
            // Randomly choose a building that is within the distance range
            let randomBuildingIndex = Math.floor(Math.random() * (maxBuilding - minBuilding + 1)) + minBuilding;

            // Ensure it's at least 5 buildings away (either to the left or right)
            if ((randomBuildingIndex - playerBuildingIndex) < minDistance) {
                continue; // If too close, try again
            }

            // Get the top block of the building
            selectedBuilding = topTowers[randomBuildingIndex];

            // Check if the building is a pit (height <= 1)
            const isPit = selectedBuilding.height <= 1;

            if (!isPit) {
                validBuildingFound = true; // Valid building found
            }
        }

        // Now place the drop point on top of the valid building
        dropPoint.x = selectedBuilding.x + selectedBuilding.width / 2 - dropPoint.width / 2;
        dropPoint.y = selectedBuilding.y - dropPoint.height;


        // Add the drop point to the game

}
function getBuildingTopUnderPlayer(player) {
    let topBlock = null;

    for (let i = 0; i < state.buildings.children.length; i++) {
        let block = state.buildings.children[i];

        // Check if player is horizontally overlapping this block
        let withinX = player.x + player.width > block.x && player.x < block.x + block.width;

        if (withinX) {
            // Choose the *highest* block (lowest y value) under the player
            if (!topBlock || block.y < topBlock.y) {
                topBlock = block;
            }
        }
    }

    return topBlock;
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
        let index = chars.indexOf(char);
        if (index === -1) continue;

        let sprite = g.sprite("./WhiteFont.png"); // NEW sprite for EACH char

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
    let pit = Math.floor(Math.random() * 10); // 0–9
    let isPit = false
    // Get the height of the previous building, or 10 if it's the first
    let leftBuildingHeight = state.buildings.lastHeight || 10;
    // New building height can only differ by ±2
    let minHeight = Math.max(1, leftBuildingHeight - 2);
    let maxHeight = leftBuildingHeight + 3;
    if (maxHeight === 20) {
        maxHeight = leftBuildingHeight - 3
    }

    // Pick random height within allowed range
    let height = (Math.floor(Math.random() * (maxHeight - minHeight + 1)) + minHeight);
    while(height === 1) {
        minHeight = Math.max(1, leftBuildingHeight - 2);
        maxHeight = leftBuildingHeight + 2;
        height = (Math.floor(Math.random() * (maxHeight - minHeight + 1)) + minHeight);
    }
    if (pit === 3) {
        height = 1
        isPit = true
    }
    for (let i = 0; i < height; i++) {
        let block = g.sprite("./" + roofsrc);
        block.width = 64;
        block.height = 32;
        block.x = x;
        block.y = y - (i * 32);
        state.buildings.addChild(block);

        if (!topBlock || block.y < topBlock.y) {
            topBlock = block;
        }
    }

    // Store this building's height (in blocks) for the next one
    if (pit !== 3) {
        state.buildings.lastHeight = height;
    }

    return topBlock; // return the top block of this building
}
function placeStars(count, minDist = 100) {
    let placed = [];

    for (let i = 0; i < count; i++) {
        let tries = 0;
        let star;

        while (tries < 50) { // safety limit
            let x = (Math.floor(Math.random() * ((g.canvas.width*10) - 64)))-500;
            let y = (Math.floor(Math.random() * ((g.canvas.height*5) / 2 - 64)))-700;

            // Check distance against all placed clouds
            let tooClose = placed.some(c => {
                let dx = c.x - x;
                let dy = c.y - y;
                return Math.sqrt(dx * dx + dy * dy) < minDist;
            });

            if (!tooClose) {
                star = g.sprite("./Star.png");
                star.width = 12;
                star.height = 12;
                star.x = x;
                star.y = y;
                state.stars.addChild(star);
                placed.push(star);
                break; // placed successfully
            }

            tries++;
        }
    }
}
function menu() {

    if (!state.menuBackground && !state.menuText) {
        state.menuBackground = g.rectangle(g.canvas.width * 50, g.canvas.height * 100, "black", "none", 0, -1000, -500);
        g.stage.addChild(state.menuBackground);
        state.menuText = drawText("PRESS SPACE!", 220, 220, 32, 32);
        g.stage.addChild(state.menuText);
    }
        if (state.menuStage === 2) {
            g.remove(state.menuText)
            state.menuText = drawText("CATS CARGO", 240, 220, 32, 32);
        }
        if (state.menuStage === 3) {
            g.remove(state.menuText)
            state.menuText = drawText("JS13K By JUDE HILL", 110, 220, 32, 32);
        }
        if (state.menuStage === 4) {
            g.remove(state.menuText)
            g.stage.remove(state.menuBackground);
            state.menuBackground = null
            state.menuText = null
            state.menuStage = 1
            g.state = play
        }
}
function playerMoveRight() {
    state.player.vx = state.player.moveSpeed;
    state.player.scaleX = 1; // Reset the player to face right
    if (state.player.layingMouses.children.length > 0) {
        for (let i = 0; i < state.player.layingMouses.children.length; i++) {
            state.player.layingMouses.children[i].scaleX = 1;
            state.player.layingMouses.children[i].offset = 5
        }

    }

}
function playerMoveLeft() {
    state.player.vx = -state.player.moveSpeed;
    state.player.scaleX = -1; // Flip the player horizontally
    if (state.player.layingMouses.children.length > 0) {
        for (let i = 0; i < state.player.layingMouses.children.length; i++) {
            state.player.layingMouses.children[i].scaleX = -1;
            state.player.layingMouses.children[i].offset = 20
        }
    }

}
function playerMoveUp() {
    playJump();
    if (state.player.grounded) {
        console.log("ground")
    }
    if (state.player.grounded) {
        console.log("Jumping")
        state.player.vy -= 10; // Jump strength
        state.player.grounded = false
    }

}
function play() {
    // 1️⃣ Apply gravity
    state.player.vy += state.gravity; // Gravity strength
    g.move(state.player);
    state.levelTimeLimit -= 0.01
    g.remove(state.timeLimitSprite);
    state.timeLimitSprite = drawText((state.levelTimeLimit) + "", g.canvas.width - 90, 16, 32, 32)

    if (state.levelTimeLimit < 0) {
        resetGame();
        money = 0;
        updateMoneyHUD(money);
    }
    // remove old text and draw new (simple approach)
    for (let i = 0; i < state.buildings.children.length; i++) {
        let block = state.buildings.children[i];

        g.hit(state.player, block, true, false, false, (collision) => {
            if (collision === "top") {
                state.player.vy = 0;
            } else if (collision === "bottom" && state.player.vy >= 0) {
                state.player.vy = 0; // head hits bottom of block
                state.player.grounded = true;
                if (state.player.fallSpeed > 15) { // tweak this threshold
                    let damage = Math.floor(state.player.fallSpeed*10); // scale damage
                    state.player.hurt += damage;

                    // Clamp health at 0
                    if (state.player.hurt < 0) state.player.hurt = 0;
                    if (state.player.hurt > 150) {
                        console.log("Dead")
                        money = 0;
                        updateMoneyHUD(money);

                        resetGame();
                    }


                    // Update health bar
                    // state.healthBar.inner.width = state.player.hurt;

                    // Maybe add sound/flash
                    zzfx(...[, , 50, .1, .2, .6, 4, 1.5]); // "thud" noise
                }

                state.player.y = (block.y - state.player.height); // Position player on top of block
                state.player.vy = -state.gravity
            } else if (collision === "left" || collision === "right") {
                state.player.vx = 0;
            }
            if (collision !== "bottom" && state.player.vy > 0) {
                state.player.grounded = false;
            }
        });
    }
    // 4️⃣ Collect mice
    if (g.hit(state.player, state.dropPoint, false, false, false)) {
        state.player.dropingElevator= true;
    } else {
        state.player.dropingElevator = false;
    }
    state.player.fallSpeed = state.player.vy;
    for (let i = 0; i < state.mouses.children.length; i++) {
        const mouse = state.mouses.children[i];

        g.hit(state.player, mouse, true, false, false, () => {
            const layingMouse = g.sprite("./Mouse_Lay.png");
            layingMouse.width = 20;
            layingMouse.height = 20;
            layingMouse.x = state.player.x;
            layingMouse.y = state.player.y - 20;
            layingMouse.layer = 2
            layingMouse.offset = 0
            state.player.layingMouses.addChild(layingMouse);
            console.log(state.player.layingMouses.children)
            state.mouses.removeChild(mouse);

            state.player.moveSpeed = state.player.speed - (state.player.layingMouses.children.length/6)
            console.log("Move Speed = ", state.player.moveSpeed)

        }); 
    }
    for (let i = 0; i < state.player.layingMouses.children.length; i++) {
        const layingMouse = state.player.layingMouses.children[i];
        layingMouse.x = (state.player.scaleX === 1 ? 3 : 19) - state.player.layingMouses.children[i].offset;
        layingMouse.y = (state.player.height - i * 10) - 25;
    }

    // 6️⃣ Move clouds
    for (let i = 0; i < state.stars.children.length; i++) {
        const star = state.stars.children[i];
        star.x -= 0.05; // Move cloud left slowly
    }

    // 7️⃣ Center camera on player
    state.camera.centerOver(state.player);
}
