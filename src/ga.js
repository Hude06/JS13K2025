
var GA = GA || {};



GA.VERSION = '0.0.1';



GA.plugins = undefined;
GA.custom = undefined;







GA.create = function (width, height, setup, assetsToLoad, load) {

  
  
  var ga = {};

 

  
  var dips = 1; 
  ga.canvas = document.createElement("canvas");
  ga.canvas.setAttribute("width", width * dips);
  ga.canvas.setAttribute("height", height * dips);
  ga.canvas.style.backgroundColor = "black";
  document.body.appendChild(ga.canvas);

  
  ga.canvas.ctx = ga.canvas.getContext("2d");

  
  
  ga.stage = makeStage();

  
  ga.pointer = makePointer();

  
  ga.key = makeKeys();

  
  ga.buttons = [];

  
  
  
  ga.dragAndDrop = false;

  
  ga.draggableSprites = [];

  
  ga.tweens = [];

  
  ga.state = undefined;

  
  ga.load = load || undefined;
  ga.setup = setup || undefined;

  
  
  if (ga.setup === undefined) {
    throw new Error(
      "Please supply the setup function in the constructor"
    );
  }

  
  
  ga.assetFilePaths = assetsToLoad || undefined;

  
  ga.paused = false;

  
  
  
  ga._fps = 60;
  ga._startTime = Date.now();
  ga._frameDuration = 1000 / ga._fps;
  ga._lag = 0;

  
  
  ga.interpolate = true;

  
  
  
  ga.updateFunctions = [];

 
  
  
  ga.scale = 1;

 

  
  
  
  
  
  
  
  
  
  
  function gameLoop() {
    requestAnimationFrame(gameLoop, ga.canvas);
    if (ga._fps === undefined) {

      
      update();
      ga.render(ga.canvas, 0);

    }

    
    else {

      
      var current = Date.now(),
        elapsed = current - ga._startTime;

      if (elapsed > 1000) elapsed = ga._frameDuration;

      
      ga._startTime = current;

      
      ga._lag += elapsed;

      
      
      while (ga._lag >= ga._frameDuration) {

        
        
        capturePreviousSpritePositions();

        
        update();

        
        ga._lag -= ga._frameDuration;
      }

      
      var lagOffset = ga._lag / ga._frameDuration;
      ga.render(ga.canvas, lagOffset);
    }
  }

  
  
  
  
  
  function capturePreviousSpritePositions() {
    ga.stage.children.forEach(function (sprite) {
      setPosition(sprite);
    });

    function setPosition(sprite) {
      sprite._previousX = sprite.x;
      sprite._previousY = sprite.y;
      if (sprite.children && sprite.children.length > 0) {
        sprite.children.forEach(function (child) {
          setPosition(child);
        });
      }
    }
  }

  
  
  function update() {

    
    

    
    if (ga.buttons.length > 0) {
      ga.canvas.style.cursor = "auto";
      for (var i = ga.buttons.length - 1; i >= 0; i--) {
        var button = ga.buttons[i];
        button.update(ga.pointer, ga.canvas);
        if (button.state === "over" || button.state === "down") {

          
          
          if (!button.stage) {
            ga.canvas.style.cursor = "pointer";
          }
        }
      }
    }

    
    if (ga.dragAndDrop) {
      ga.pointer.updateDragAndDrop();
    }

    
    
    if (ga.state && !ga.paused) {
      ga.state();
    }

   

    if (ga.updateFunctions.length !== 0) {
      for (var l = 0; l < ga.updateFunctions.length; l++) {
        var updateFunction = ga.updateFunctions[l];
        updateFunction();
      }
    }
  }

  
  
  
  
  ga.start = function () {
    if (ga.assetFilePaths) {

      
      
      ga.assets.whenLoaded = function () {

        
        ga.state = undefined;

        
        
        ga.setup();
      };
      ga.assets.load(ga.assetFilePaths);

      
      
      
      if (ga.load) {
        ga.state = ga.load;
      }
    }

    
    
    else {
      ga.setup();
    }

    
    gameLoop();
  };

  
  
  
  
  ga.pause = function () {
    ga.paused = true;
  };
  ga.resume = function () {
    ga.paused = false;
  };

  
  
  
  ga.hidePointer = function () {
    ga.canvas.style.cursor = "none";
  };
  ga.showPointer = function () {
    ga.canvas.style.cursor = "auto";
  };

  
  Object.defineProperties(ga, {

    
    
    fps: {
      get: function () {
        return ga._fps;
      },
      set: function (value) {
        ga._fps = value;
        ga._startTime = Date.now();
        ga._frameDuration = 1000 / ga._fps;
      },
      enumerable: true,
      configurable: true
    },

    
    
    backgroundColor: {
      set: function (value) {
        ga.canvas.style.backgroundColor = value;
      },
      enumerable: true,
      configurable: true
    }
  });



 

  
  
  function makeDisplayObject(o) {

    
    o.x = 0;
    o.y = 0;

    
    o.vx = 0;
    o.vy = 0;

    
    o.width = 0;
    o.height = 0;

    
    o.scaleX = 1;
    o.scaleY = 1;

    
    
    o.pivotX = 0.5;
    o.pivotY = 0.5;

    
    o.rotation = 0;
    o.visible = true;

    
    
    o.parent = undefined;

    
    
    o.stage = false;

    
    
    
    o.shadow = false;
    o.shadowColor = "rgba(100, 100, 100, 0.5)";
    o.shadowOffsetX = 3;
    o.shadowOffsetY = 3;
    o.shadowBlur = 3;

    
    o.blendMode = undefined;

    
    
    o._alpha = 1;
    o._draggable = undefined;

    
    o._layer = 0;

    
    
    o._circular = false;

    
    
    o._interactive = false;

    
    
    o._previousX = undefined;
    o._previousY = undefined;

    
    
    
    

    o.children = [];
    

    o.addChild = function (sprite) {

      
      
      if (sprite.parent) {
        sprite.parent.removeChild(sprite);
      }

      
      
      sprite.parent = o;
      o.children.push(sprite);

      
      
    };

    
    
    o.removeChild = function (sprite) {
      if (sprite.parent === o) {
        o.children.splice(o.children.indexOf(sprite), 1);
      } else {
        throw new Error(sprite + "is not a child of " + o);
      }

      
      
    };

    
    
   


    
    
    o.add = function (spritesToAdd) {
      var sprites = Array.prototype.slice.call(arguments);
      if (sprites.length > 1) {
        sprites.forEach(function (sprite) {
          o.addChild(sprite);
        });
      } else {
        o.addChild(sprites[0]);
      }
    };
    o.remove = function (spritesToRemove) {
      var sprites = Array.prototype.slice.call(arguments);
      if (sprites.length > 1) {
        sprites.forEach(function (sprite) {
          o.removeChild(sprite);
        });
      } else {
        o.removeChild(sprites[0]);
      }
    };

    
    
    o.setPosition = function (x, y) {
      o.x = x;
      o.y = y;
    };

    
    
    
    
    var a = o;

    
    
    
    
    
    
    
    

    
    o.compensateForParentPosition = function (a, b) {
      if (b.parent.gx !== 0 || b.parent.gy !== 0) {
        b.x -= a.gx;
        b.y -= a.gy;
      }
    }

    
    Object.defineProperties(o, {

      
      
      gx: {
        get: function () {
          if (this.parent) {

            
            
            return this.x + this.parent.gx;
          } else {
            return this.x;
          }
        },
        enumerable: true,
        configurable: true
      },
      gy: {
        get: function () {
          if (this.parent) {
            return this.y + this.parent.gy;
          } else {
            return this.y;
          }
        },
        enumerable: true,
        configurable: true
      },

      
      
      position: {
        get: function () {
          return {
            x: o.x,
            y: o.y
          };
        },
        enumerable: true,
        configurable: true
      },

      
      
      alpha: {
        get: function () {

          
          var relativeAlpha = o.parent._alpha * o._alpha;
          return relativeAlpha;
        },
        set: function (value) {
          o._alpha = value;
        },
        enumerable: true,
        configurable: true
      },

      
      halfWidth: {
        get: function () {
          return o.width / 2;
        },
        enumerable: true,
        configurable: true
      },
      halfHeight: {
        get: function () {
          return o.height / 2;
        },
        enumerable: true,
        configurable: true
      },

      
      centerX: {
        get: function () {
          return o.x + o.halfWidth;
        },
        enumerable: true,
        configurable: true
      },
      centerY: {
        get: function () {
          return o.y + o.halfHeight;
        },
        enumerable: true,
        configurable: true
      },

      
      
      
      
      layer: {
        get: function () {
          return o._layer;
        },
        set: function (value) {
          o._layer = value;
          o.parent.children.sort(byLayer);
        },
        enumerable: true,
        configurable: true
      },

      
      
      
      
      circular: {
        get: function () {
          return o._circular;
        },
        set: function (value) {

          
          
          if (value === true && o._circular === false) {
            makeCircular(o);
            o._circular = true;
          }

          
          
          if (value === false && o._circular === true) {
            delete o.diameter;
            delete o.radius;
            o._circular = false;
          }
        },
        enumerable: true,
        configurable: true
      },

      
      
      
      
      draggable: {
        get: function () {
          return o._draggable;
        },
        set: function (value) {

          
          
          if (value === true) {
            ga.draggableSprites.push(o);
            o._draggable = true;

            
            
            if (ga.dragAndDrop === false) ga.dragAndDrop = true;
          }

          
          if (value === false) {
            ga.draggableSprites.splice(ga.draggableSprites.indexOf(o), 1);
          }
        },
        enumerable: true,
        configurable: true
      },

      
      
      
      
      
      interactive: {
        get: function () {
          return o._interactive;
        },
        set: function (value) {
          if (value === true) {

            
            
            makeInteractive(o);
            o._interactive = true;
          }
          if (value === false) {

            
            
            
            ga.buttons.splice(ga.buttons.indexOf(o), 1);
            o._interactive = false;
          }
        },
        enumerable: true,
        configurable: true
      },

      
      
      
      
      
      localBounds: {
        get: function () {
          var rectangle = {
            x: 0,
            y: 0,
            width: o.width,
            height: o.height
          };
          return rectangle;
        },
        enumerable: true,
        configurable: true
      },
      globalBounds: {
        get: function () {
          rectangle = {
            x: o.gx,
            y: o.gy,
            width: o.gx + o.width,
            height: o.gy + o.height
          };
          return rectangle;
        },
        enumerable: true,
        configurable: true
      },

      
      
      
      empty: {
        get: function () {
          if (o.children.length === 0) {
            return true;
          } else {
            return false;
          }
        },
        enumerable: true,
        configurable: true
      }
    });
  };

  
  
  
  ga.remove = function (spritesToRemove) {
    var sprites = Array.prototype.slice.call(arguments);

    
    if (!(sprites[0] instanceof Array)) {
      if (sprites.length > 1) {
        sprites.forEach(function (sprite) {
          sprite.parent.removeChild(sprite);
        });
      } else {
        sprites[0].parent.removeChild(sprites[0]);
      }
    }

    
    else {
      var spritesArray = sprites[0];
      if (spritesArray.length > 0) {
        for (var i = spritesArray.length - 1; i >= 0; i--) {
          var sprite = spritesArray[i];
          sprite.parent.removeChild(sprite);
          spritesArray.splice(spritesArray.indexOf(sprite), 1);
        }
      }
    }
  };

  
  
  
  
  function makeCircular(o) {
    Object.defineProperties(o, {
      diameter: {
        get: function () {
          return o.width;
        },
        set: function (value) {
          o.width = value;
          o.height = value;
        },
        enumerable: true,
        configurable: true
      },
      radius: {
        get: function () {
          return o.width / 2;
        },
        set: function (value) {
          o.width = value * 2;
          o.height = value * 2;
        },
        enumerable: true,
        configurable: true
      }
    });
  }

  
  
  
  
  function makeStage() {
    var o = {};
    makeDisplayObject(o);

    
    
    o.stage = true;

    
    
    o.width = ga.canvas.width;
    o.height = ga.canvas.height;
    o.x = 0;
    o.y = 0;

    
    o.parent = undefined;
    return o;
  }

  
  
  
  
  
  
  
  ga.group = function (spritesToGroup) {
    var o = {};

    
    makeDisplayObject(o);

    
    
    o.addChild = function (sprite) {
      if (sprite.parent) {
        sprite.parent.removeChild(sprite);
      }
      sprite.parent = o;
      o.children.push(sprite);
      o.calculateSize();
    };
    o.removeChild = function (sprite) {
      if (sprite.parent === o) {
        o.children.splice(o.children.indexOf(sprite), 1);
      } else {
        throw new Error(sprite + "is not a child of " + o);
      }
      o.calculateSize();
    };

    
    
   

    o.calculateSize = function () {
      
      
      if (o.children.length > 0) {

        
        
        o._newWidth = 0;
        o._newHeight = 0;

        
        
        o.children.forEach(function (child) {

          
          
          if (child.x + child.width > o._newWidth) {

            
            
            o._newWidth = child.x + child.width;
          }
          if (child.y + child.height > o._newHeight) {
            o._newHeight = child.y + child.height;
          }
        });

        
        
        o.width = o._newWidth;
        o.height = o._newHeight;
      }
    };

    
    ga.stage.addChild(o);

    
    
    if (spritesToGroup) {
      var sprites = Array.prototype.slice.call(arguments);
      sprites.forEach(function (sprite) {
        o.addChild(sprite);
      });
    }

    
    return o;
  };

  
  
  
  
  ga.rectangle = function (width, height, fillStyle, strokeStyle, lineWidth, x, y) {
    var o = {};

    
    makeDisplayObject(o);

    
    o.mask = false;

    
    o.width = width || 32;
    o.height = height || 32;
    o.fillStyle = fillStyle || "red";
    o.strokeStyle = strokeStyle || "none";
    o.lineWidth = lineWidth || 0;
    o.x = x || 0;
    o.y = y || 0;

    
    ga.stage.addChild(o);

    
    
    o.render = function (ctx) {
      ctx.strokeStyle = o.strokeStyle;
      ctx.lineWidth = o.lineWidth;
      ctx.fillStyle = o.fillStyle;
      ctx.beginPath();

      
      ctx.rect(-o.width * o.pivotX, -o.height * o.pivotY,
        o.width,
        o.height
      );
      if (o.mask === true) {
        ctx.clip();
      } else {
        if (o.strokeStyle !== "none") ctx.stroke();
        if (o.fillStyle !== "none") ctx.fill();
      }
    };

    
    return o;
  };

  
  
  

  
  
  
  
  

  
  
  
  
  
  ga.frames = function (source, arrayOfPositions, width, height) {
    var o = {};
    o.image = source;
    o.data = arrayOfPositions;
    o.width = width;
    o.height = height;
    return o;
  };

  
  
  
  
  
  
  
  
   
  
  
  
  
  ga.sprite = function (source) {
    var o = {};

    
    if (source === undefined) throw new Error("Sprites require a source");

    
    makeDisplayObject(o);
    o.frames = [];
    o.loop = true;
    o._currentFrame = 0;

    
    
    
    o.setTexture = function (source) {
      
      
      if (!source.image) {
        
        if (!(source instanceof Array)) {
          
          

          
          

          
          
          o.tilesetFrame = ga.assets[source];
          o.source = o.tilesetFrame.source;
          o.sourceX = o.tilesetFrame.frame.x;
          o.sourceY = o.tilesetFrame.frame.y;
          o.width = o.tilesetFrame.frame.w;
          o.height = o.tilesetFrame.frame.h;
          o.sourceWidth = o.tilesetFrame.frame.w;
          o.sourceHeight = o.tilesetFrame.frame.h;

          
          
        } else {
          
          o.frames = source;
          o.source = ga.assets[source[0]].source;
          o.sourceX = ga.assets[source[0]].frame.x;
          o.sourceY = ga.assets[source[0]].frame.y;
          o.width = ga.assets[source[0]].frame.w;
          o.height = ga.assets[source[0]].frame.h;
          o.sourceWidth = ga.assets[source[0]].frame.w;
          o.sourceHeight = ga.assets[source[0]].frame.h;
        }
      }

      
      
      
      
      else if (source.image && !source.data) {
        
        if (!(ga.assets[source.image].source instanceof Image)) {
          throw new Error(source.image + " is not an image file");
        }
        o.source = ga.assets[source.image].source;
        o.sourceX = source.x;
        o.sourceY = source.y;
        o.width = source.width;
        o.height = source.height;
        o.sourceWidth = source.width;
        o.sourceHeight = source.height;
      }

      
      
      else if (source.image && source.data) {
        o.source = ga.assets[source.image].source;
        o.frames = source.data;

        
        o.sourceX = o.frames[0][0];
        o.sourceY = o.frames[0][1];
        o.width = source.width;
        o.height = source.height;
        o.sourceWidth = source.width;
        o.sourceHeight = source.height;
      }
    };

    
    
    o.setTexture(source);

    
    o.gotoAndStop = function (frameNumber) {
      if (o.frames.length > 0) {

        
        
        if (o.frames[0] instanceof Array) {
          o.sourceX = o.frames[frameNumber][0];
          o.sourceY = o.frames[frameNumber][1];
        }

        
        
        
        else if (ga.assets[o.frames[frameNumber]].frame) {
          o.source = ga.assets[o.frames[frameNumber]].source;
          o.sourceX = ga.assets[o.frames[frameNumber]].frame.x;
          o.sourceY = ga.assets[o.frames[frameNumber]].frame.y;
          o.sourceWidth = ga.assets[o.frames[frameNumber]].frame.w;
          o.sourceHeight = ga.assets[o.frames[frameNumber]].frame.h;
          o.width = ga.assets[o.frames[frameNumber]].frame.w;
          o.height = ga.assets[o.frames[frameNumber]].frame.h;
        }

        
        o._currentFrame = frameNumber;
      } else {
        throw new Error("Frame number " + frameNumber + "doesn't exist");
      }
    };

    
    o.x = 0;
    o.y = 0;

    
    if (o.frames.length > 0) {
      ga.addStatePlayer(o);

      
      Object.defineProperty(o, "currentFrame", {
        get: function () {
          return o._currentFrame;
        },
        enumerable: false,
        configurable: false
      });
    }

    
    ga.stage.addChild(o);

    
    o.render = function (ctx) {
      ctx.drawImage(
        o.source,
        o.sourceX, o.sourceY,
        o.sourceWidth, o.sourceHeight, -o.width * o.pivotX, -o.height * o.pivotY,
        o.width, o.height
      );
    };

    
    return o;
  };

  
  
  
  
  ga.button = function (source) {

    
    var o = ga.sprite(source);

    
    o.subtype = "button";

    
    makeInteractive(o);

    
    return o;
  };

  
  
  
  
  
  
  function makeInteractive(o) {

    
    
    o.press = o.press || undefined;
    o.release = o.release || undefined;
    o.over = o.over || undefined;
    o.out = o.out || undefined;
    o.tap = o.tap || undefined;

    
    
    o.state = "up";

    
    
    o.action = "";

    
    
    o.pressed = false;

    
    o.enabled = true;

    
    
    o.hoverOver = false;

    
    
    ga.buttons.push(o);

    
    
    o.update = function (pointer, canvas) {

      
      if (o.enabled) {

        
        var hit = ga.pointer.hitTestSprite(o);

        
        if (pointer.isUp) {

          
          o.state = "up";

          
          if (o.subtype === "button") o.show(0);
        }

        
        
        if (hit) {

          
          o.state = "over";

          
          
          if (o.frames && o.frames.length === 3 && o.subtype === "button") {
            o.show(1);
          }

          
          if (pointer.isDown) {
            o.state = "down";

            
            
            
            if (o.subtype === "button") {
              if (o.frames.length === 3) {
                o.show(2);
              } else {
                o.show(1);
              }
            }
          }
        }

        
        
        
        if (o.state === "down") {
          if (!o.pressed) {
            if (o.press) o.press();
            o.pressed = true;
            o.action = "pressed";
          }
        }

        
        
        if (o.state === "over") {
          if (o.pressed) {
            if (o.release) o.release();
            o.pressed = false;
            o.action = "released";

            
            
            if (ga.pointer.tapped && o.tap) o.tap();
          }

          
          if (!o.hoverOver) {
            if (o.over) o.over();
            o.hoverOver = true;
          }
        }

        
        
        
        if (o.state === "up") {
          if (o.pressed) {
            if (o.release) o.release();
            o.pressed = false;
            o.action = "released";
          }

          
          if (o.hoverOver) {
            if (o.out) o.out();
            o.hoverOver = false;
          }
        }
      }
    };
  }

  
  ga.image = function (imageFileName) {
    return ga.assets[imageFileName];
  };

  
  ga.json = function (jsonFileName) {
    return ga.assets[jsonFileName];
  };

  
  
  
  
  ga.addStatePlayer = function (sprite) {
    var frameCounter = 0,
      numberOfFrames = 0,
      startFrame = 0,
      endFrame = 0,
      timerInterval = undefined,
      playing = false;

    
    function show(frameNumber) {

      
      reset();

      
      
      
      if (typeof frameNumber !== "string") {
        sprite.gotoAndStop(frameNumber);
      }

      
      
      else {
        sprite.gotoAndStop(sprite.frames.indexOf(frameNumber));
      }
    }

    
    function play() {
      playSequence([0, sprite.frames.length - 1]);
    }

    
    function stop() {
      reset();
      sprite.gotoAndStop(sprite.currentFrame);
    }

    
    function playSequence(sequenceArray) {

      
      reset();

      
      startFrame = sequenceArray[0];
      endFrame = sequenceArray[1];
      numberOfFrames = endFrame - startFrame;

      
      
      if (startFrame === 0) {
        numberOfFrames += 1;
        frameCounter += 1;
      }

      
      if (numberOfFrames === 1) {
        numberOfFrames = 2;
        frameCounter += 1;
      };

      
      if (!sprite.fps) sprite.fps = 12;
      var frameRate = 1000 / sprite.fps;

      
      sprite.gotoAndStop(startFrame);

      
      if (!playing) {
        timerInterval = setInterval(advanceFrame.bind(this), frameRate);
        playing = true;
      }
    }

    
    
    
    function advanceFrame() {

      
      
      if (frameCounter < numberOfFrames) {

        
        sprite.gotoAndStop(sprite.currentFrame + 1);

        
        frameCounter += 1;
      } else {

        
        
        if (sprite.loop) {
          sprite.gotoAndStop(startFrame);
          frameCounter = 1;
        }
      }
    }

    function reset() {

      
      
      if (timerInterval !== undefined && playing === true) {
        playing = false;
        frameCounter = 0;
        startFrame = 0;
        endFrame = 0;
        numberOfFrames = 0;
        clearInterval(timerInterval);
      }
    }

    
    sprite.show = show;
    sprite.play = play;
    sprite.stop = stop;
    sprite.playing = playing;
    sprite.playSequence = playSequence;
  };


 

  ga.render = function (canvas, lagOffset) {

    
    var ctx = canvas.ctx;

    
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    
    for (var i = 0; i < ga.stage.children.length; i++) {
      var sprite = ga.stage.children[i];

      
      
      displaySprite(sprite);
    }

    function displaySprite(sprite) {
      if (
        sprite.visible && sprite.gx < canvas.width + sprite.width && sprite.gx + sprite.width >= -sprite.width && sprite.gy < canvas.height + sprite.height && sprite.gy + sprite.height >= -sprite.height
      ) {

        
        ctx.save();

        
        
        
        if (ga.interpolate) {
          if (sprite._previousX !== undefined) {
            sprite.renderX = (sprite.x - sprite._previousX) * lagOffset + sprite._previousX;
          } else {
            sprite.renderX = sprite.x;
          }
          if (sprite._previousY !== undefined) {
            sprite.renderY = (sprite.y - sprite._previousY) * lagOffset + sprite._previousY;
          } else {
            sprite.renderY = sprite.y;
          }
        } else {
          sprite.renderX = sprite.x;
          sprite.renderY = sprite.y;
        }

        
        ctx.translate(
          sprite.renderX + (sprite.width * sprite.pivotX),
          sprite.renderY + (sprite.height * sprite.pivotY)
        );
       
        

        
        ctx.globalAlpha = sprite.alpha;

        
        ctx.rotate(sprite.rotation);

        
        ctx.scale(sprite.scaleX, sprite.scaleY);

        
        if (sprite.shadow) {
          ctx.shadowColor = sprite.shadowColor;
          ctx.shadowOffsetX = sprite.shadowOffsetX;
          ctx.shadowOffsetY = sprite.shadowOffsetY;
          ctx.shadowBlur = sprite.shadowBlur;
        }

        
        if (sprite.blendMode) ctx.globalCompositeOperation = sprite.blendMode;

        
        
        
        
        if (sprite.render) sprite.render(ctx);

        
        
        
        if (sprite.children && sprite.children.length > 0) {

          
          ctx.translate(-sprite.width * sprite.pivotX, -sprite.height * sprite.pivotY);
         
          for (var j = 0; j < sprite.children.length; j++) {

            
            var child = sprite.children[j];

            
            displaySprite(child);
          }
        }

        
        
        
        ctx.restore();
        
      }
    }
  }

 

  
  
  
  
  ga.assets = {

    
    toLoad: 0,
    loaded: 0,

    
    imageExtensions: ["png", "jpg", "gif", "webp"],
    fontExtensions: ["ttf", "otf", "ttc", "woff"],
    audioExtensions: ["mp3", "ogg", "wav", "webm"],
    jsonExtensions: ["json"],

    
    
    whenLoaded: undefined,

    
    

    load: function (sources) {
      console.log("Loading assets...");

      
      
      var self = this;

      
      self.toLoad = sources.length;
      sources.forEach(function (source) {

        
        var extension = source.split('.').pop();

        
        
        
        if (self.imageExtensions.indexOf(extension) !== -1) {

          
          var image = new Image();
          image.addEventListener("load", function () {
            
            image.name = source;
            self[image.name] = {
              
              
              
              
              
              source: image,
              frame: {
                x: 0,
                y: 0,
                w: image.width,
                h: image.height
              }
            };
            self.loadHandler();
          }, false);

          
          image.src = source;
        }

        
        
        else if (self.fontExtensions.indexOf(extension) !== -1) {

          
          var fontFamily = source.split("/").pop().split(".")[0];

          
          
          
          var newStyle = document.createElement('style');
          var fontFace = "@font-face {font-family: '" + fontFamily + "'; src: url('" + source + "');}";
          newStyle.appendChild(document.createTextNode(fontFace));
          document.head.appendChild(newStyle);

          
          self.loadHandler();
        }

        
        
        
        else if (self.audioExtensions.indexOf(extension) !== -1) {
          
          
          var soundSprite = ga.makeSound(source, self.loadHandler.bind(self));

          
          soundSprite.name = source;

          
          
          
          
          
          self[soundSprite.name] = soundSprite;
        }

        
        
        
        else if (self.jsonExtensions.indexOf(extension) !== -1) {

          
          var xhr = new XMLHttpRequest();
          var file = {};

          
          xhr.open("GET", source, true);
          xhr.addEventListener("readystatechange", function () {

            
            if (xhr.status === 200 && xhr.readyState === 4) {

              
              file = JSON.parse(xhr.responseText);

              
              file.name = source;

              
              
              self[file.name] = file;

              
              
              
              if (file.frames) {

                
                self.createTilesetFrames(file, source);
              } else {

                
                self.loadHandler();
              }
            }
          });

          
          xhr.send();
        }

        
        else {
          console.log("File type not recognized: " + source);
        }
      });
    },

    
    
    
    createTilesetFrames: function (json, source) {
      var self = this;

      
      var baseUrl = source.replace(/[^\/]*$/, '');
      var image = new Image();
      image.addEventListener("load", loadImage, false);
      image.src = baseUrl + json.meta.image;

      function loadImage() {

        
        
        
        self[baseUrl + json.meta.image] = {
          source: image,
          frame: {
            x: 0,
            y: 0,
            w: image.width,
            h: image.height
          }
        };

        
        Object.keys(json.frames).forEach(function (tilesetImage) {

          
          
          
          
          
          self[tilesetImage] = json.frames[tilesetImage];

          
          
          self[tilesetImage].source = image;
          
        });

        
        self.loadHandler();
      }
    },

    
    
    loadHandler: function () {
      var self = this;
      self.loaded += 1;
      console.log(self.loaded);

      
      if (self.toLoad === self.loaded) {

        

        
        
        self.toLoad = 0;
        self.loaded = 0;
        self.whenLoaded();
      }
    }
  };

  
  
  
  
  function makePointer() {
    var o = {};
    o._x = 0;
    o._y = 0;

    
    
    
    Object.defineProperties(o, {
      x: {
        get: function () {
          return o._x / ga.scale;
        },
        enumerable: true,
        configurable: true
      },
      y: {
        get: function () {
          return o._y / ga.scale;
        },
        enumerable: true,
        configurable: true
      },
      centerX: {
        get: function () {
          return o.x;
        },
        enumerable: true,
        configurable: true
      },
      centerY: {
        get: function () {
          return o.y;
        },
        enumerable: true,
        configurable: true
      },
      
      
      position: {
        get: function () {
          return {
            x: o.x,
            y: o.y
          };
        },
        enumerable: true,
        configurable: true
      }
    });

    
    o.isDown = false;
    o.isUp = true;
    o.tapped = false;

    
    o.downTime = 0;
    o.elapsedTime = 0;

    
    o.press = undefined;
    o.release = undefined;
    o.tap = undefined;

    
    o.dragSprite = null;

    
    o.dragOffsetX = 0;
    o.dragOffsetY = 0;


    
    o.moveHandler = function (event) {

      
      
      o._x = (event.pageX - event.target.offsetLeft);
      o._y = (event.pageY - event.target.offsetTop);

      
      event.preventDefault();
    };

    
    o.touchmoveHandler = function (event) {

      
      o._x = (event.targetTouches[0].pageX - ga.canvas.offsetLeft);
      o._y = (event.targetTouches[0].pageY - ga.canvas.offsetTop);

      
      event.preventDefault();
    };

    
    o.downHandler = function (event) {

      
      o._x = (event.pageX - event.target.offsetLeft);
      o._y = (event.pageY - event.target.offsetTop);

      
      o.isDown = true;
      o.isUp = false;
      o.tapped = false;

      
      o.downTime = Date.now();

      
      if (o.press) o.press();

      
      event.preventDefault();
    };

    
    o.touchstartHandler = function (event) {

      
      o._x = event.targetTouches[0].pageX - ga.canvas.offsetLeft;
      o._y = event.targetTouches[0].pageY - ga.canvas.offsetTop;

      
      o.isDown = true;
      o.isUp = false;
      o.tapped = false;

      
      o.downTime = Date.now();

      
      if (o.press) o.press();

      
      event.preventDefault();
    };

    
    o.upHandler = function (event) {

      
      o.elapsedTime = Math.abs(o.downTime - Date.now());

      
      if (o.elapsedTime <= 200) {
        o.tapped = true;

        
        if (o.tap) o.tap();
      }
      o.isUp = true;
      o.isDown = false;

      
      if (o.release) o.release();

      
      event.preventDefault();
    };

    
    
    ga.canvas.addEventListener(
      "mousemove", o.moveHandler.bind(o), false
    );
    ga.canvas.addEventListener(
      "mousedown", o.downHandler.bind(o), false
    );

    
    
    window.addEventListener(
      "mouseup", o.upHandler.bind(o), false
    );

    
    ga.canvas.addEventListener(
      "touchmove", o.touchmoveHandler.bind(o), false
    );
    ga.canvas.addEventListener(
      "touchstart", o.touchstartHandler.bind(o), false
    );

    
    
    window.addEventListener(
      "touchend", o.upHandler.bind(o), false
    );

    
    ga.canvas.style.touchAction = "none";

    
    o.hitTestSprite = function (sprite) {
      var hit = false;

      
      if (!sprite.circular) {

        
        
        var left = sprite.gx, 
          right = (sprite.gx + sprite.width), 
          top = sprite.gy, 
          bottom = (sprite.gy + sprite.height), 

          
          hit = o.x > left && o.x < right && o.y > top && o.y < bottom;
      }

      
      else {

        
        
        var vx = o.x - ((sprite.gx + sprite.halfWidth)), 
          vy = o.y - ((sprite.gy + sprite.halfHeight)), 
          magnitude = Math.sqrt(vx * vx + vy * vy);

        
        
        hit = magnitude < sprite.radius;
      }
      return hit;
    };

    o.updateDragAndDrop = function () {
      if (o.isDown) {

        
        
        if (o.dragSprite === null) {

          
          for (var i = ga.draggableSprites.length - 1; i > -1; i--) {
            var sprite = ga.draggableSprites[i];

            
            if (sprite.draggable && o.hitTestSprite(sprite)) {

              
              
              o.dragOffsetX = o.x - sprite.gx;
              o.dragOffsetY = o.y - sprite.gy;

              
              o.dragSprite = sprite;

              
              
              
              
              var children = sprite.parent.children;
              children.splice(children.indexOf(sprite), 1);

              
              
              children.push(sprite);

              
              ga.draggableSprites.splice(ga.draggableSprites.indexOf(sprite), 1);
              ga.draggableSprites.push(sprite);
              break;
            }
          }
        } else {

          
          
          o.dragSprite.x = o.x - o.dragOffsetX;
          o.dragSprite.y = o.y - o.dragOffsetY;
        }
      }

      
      if (o.isUp) {
        o.dragSprite = null;
      }

      
      
      ga.draggableSprites.some(function (sprite) {
        if (sprite.draggable && o.hitTestSprite(sprite)) {
          ga.canvas.style.cursor = "pointer";
          return true;
        } else {
          ga.canvas.style.cursor = "auto";
          return false;
        }
      });
    }

    
    return o;
  }

 

  function keyboard(keyCode) {
    var key = {};
    key.code = keyCode;
    key.isDown = false;
    key.isUp = true;
    key.press = undefined;
    key.release = undefined;

    
    key.downHandler = function (event) {
      if (event.keyCode === key.code) {
        if (key.isUp && key.press) key.press();
        key.isDown = true;
        key.isUp = false;
      }
      event.preventDefault();
    };

    
    key.upHandler = function (event) {
      if (event.keyCode === key.code) {
        if (key.isDown && key.release) key.release();
        key.isDown = false;
        key.isUp = true;
      }
      event.preventDefault();
    };

    
    window.addEventListener(
      "keydown", key.downHandler.bind(key), false
    );
    window.addEventListener(
      "keyup", key.upHandler.bind(key), false
    );
    return key;
  }

 

    function makeKeys() {
        var o = {};
        
        o.leftArrow = keyboard(37);
        o.upArrow = keyboard(38);
        o.rightArrow = keyboard(39);
        o.downArrow = keyboard(40);
        o.space = keyboard(32);
        o.a = keyboard(65)
        o.d = keyboard(68)
        o.w = keyboard(87)
        o.s = keyboard(83)
        o.q = keyboard(81)
        o.r = keyboard(82)
        return o;
    }

  
  
  
  function byLayer(a, b) {

    
    if (a.layer < b.layer) {
      return -1;
    } else if (a.layer > b.layer) {
      return 1;
    } else {
      return 1;
    }
  }

  
  ga.keyboard = keyboard;
  ga.makeDisplayObject = makeDisplayObject;

  
  if (GA.plugins !== undefined) GA.plugins(ga);

  
  if (GA.custom !== undefined) GA.custom(ga);

  
  return ga;
};





window.ga = GA.create;
export default GA