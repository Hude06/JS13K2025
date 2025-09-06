import GA from './ga.js';
// Example usage:
// ga.move(player);
// player.vx = 0;
// player.vy = 0;
// ==ClosureCompiler==
// @output_file_name default.js
// @compilation_level SIMPLE_OPTIMIZATIONS
// @language ECMASCRIPT5
// @fileoverview
// @suppress {checkTypes | globalThis | checkVars}
// ==/ClosureCompiler==

/*
Ga plugins
==========
Weclome to the `plugins.js` file!
This file contains lots of extra tools that are really useful for making games,
but which are more specialized that than the universal tools in `ga.js` file.

How can use these plugins? The easiest way is just to link this entire file
with a `<script>` tag. Then you have immediate access to all this code
and you can decide later what you really need.

Your own custom plugins
-----------------------

If you wan to keep you game file size small, create
your own custom plugins file. Here's how:

1. Make a new JS file called `custom.js` (or an other name you want to give it.)
2. Add this:

    GA.custom = function(ga) {
      //Your own collection of plugins will go here
    };

3. Link `custom.js` to your game's main HTML document with a `<script>` tag.

4. Then just copy/paste any plugin functions from this
file (`plugins.js`) into your own `custom.js` file. Like this:

    GA.custom = function(ga) {
      //Create a random number within a specific range
      ga.randomInt = function(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
      };
    };

The `GA.custom` function is called by Ga as soon as the engine has
finished initializing, but before the game runs. This means you
can use it to run any other custom setup task that you want to
perform before any of the game code runs. You could also use the
`GA.custom` function to overwrite any of Ga's default properties
with your own. Go wild!

The plugins in this file
------------------------

The code in this `plugins.js` file is organized into chapters.
Use your text editor's search features to find what you're looking for.
Here's the table of contents to get you started:

### Prologue: Polyfills

- Necessary polyfills for some of the API's used in this file. 

### Chapter 1: Utilities

`move`: Make a sprite or group move (or an array of them) by updating its velocity.
`distance`: The distance in pixels between the center point of two sprites.
`followEase`: Make a sprite ease to the position of another sprite.
`easeProperty`: Ease a single sprite property to another value.
`slide`: Ease a sprite to a specific position.
`fadeIn`: Fade in a sprite.
`fadeOut`: Fade out a sprite.
`fade`: Fades in or out.
`pulse`: Uses the `fade` method to make a sprite's alpha oscillate.
`follow`: Make a sprite follow another sprite at a fixed speed.
`rotateSprite`: Make a sprite rotate around the center of another sprite.
`rotatePoint`: Make any x/y point rotate around any other point.
`angle`: Get the angle between the center points of two sprites
`randomInt`: Generate a random integer within a range.
`randomFloat`: Generate a random floating point number within a range.
`wait`: Wait for a certain number of milliseconds and then execute a callback function.
`worldCamera`: A method that creates and returns a camera for a scrolling game world.
`scaleToWindow`: Automatically scales and centers the game to the maximum browser window area.
`shake`: Make a sprite or group shake. You can use it for a screen shake effect.

### Chapter 2: The tweening module 

`tweens`: An array to store all of Ga's current tweens.
`updateTweens`: A function that updates all the tweens each frame inside Ga's game loop.
`ease`: An object that stores references to useful easing functions.
`tweenProperty`: A generic low-level method that tweens any sprite property.
`slide`: Make a sprite slide from one x/y position to another.
`fadeIn`: Fade a sprite in.
`fadeOut`: Fade a sprite out.
`pulse`: Make a sprite fade in and out in a loop.
`makeTween`: A low-level function to help construct complex tweens.
`scale`: Smoothly change the scale of a sprite.
`breathe`: A breathing effect that changes the sprite's scale in a continuous loop.
`strobe`: A psychedelic flashing scale effect.
`wobble`: Make a sprite wobble like a plate of jelly.
`removeTween`: A universal method for remove a tween from Ga's engine.
`followCurve`: Make a sprite follow a bezier curve that you can specify.
`followPath`: Make a sprite follow a path of connected waypoints.
`walkCurve`: Make a sprite follow a path of connected curves.

### Chapter 3: Sprite creation tools

`shoot`: A function for making sprites shoot bullets.
`grid`: Easily plot a grid of sprites. Returns a container full of sprite `children`.
`progressBar`: A loading progress bar you can use to display while game assets are loading.`
`particleEffect`: A versatile function for creating particles.
`emitter`: A particle emitter for creating a constant stream of particles.
`tilingSprite`: An easy way to create a seamless scrolling background effect.
`burst`: DEPRICATED. A particle explosion effect.

### Chapter 4: Collision

#### Boundary collisions

`outsideBounds`: Tells you if a sprite has exceeded the boundary of another sprite or container.
`contain`: Contains a sprite inside another sprite. Optional bounce if the sprite hits the edges.

#### Shape collisions

`hitTestPoint`: Returns `true` or `false` if an x/y point is intersecting a rectangle or circle.
`hitTestCircle`: Returns `true` if any two circular sprites overlap.
`hitTestRectangle`: Returns `true` if any two rectangular sprites overlap.
`hitTestCircleRectangle`: Returns `true` if rectangular and circular sprites overlap.
`hitTestCirclePoint`: Returns `true` if a point intersects a circle.
`rectangleCollision`: Prevents two colliding rectangles from overlapping and tells you the collision side
`circleCollision`: Makes a moving circle bounce away from a stationary circle.
`movingCircleCollision`: Makes two moving circles bounce apart.
`multipleCircleCollision`: Bounce apart any two circles that are in the same array.
`bounceOffSurface`: A helper method that's use internally by these collision functions.

#### 2D tile-based collision utilities

`getIndex`: Converts a sprite's x/y pixel coordinates into an array index number.
`getTile`: Converts a sprite's index number into x/y pixel coordinates.
`surroundingCells`: returns an array of 9 index numbers of cells surrounding a center cell.
`getPoints`: returns an object with the x/y positions of all the sprite's corner points.
`hitTestTile`: A versatile collision detection function for tile based games.
`updateMap`: Returns a new map array with the new index positions of sprites.

### Chapter 5: Sprite controllers

`keyControlFourWay`: Assign keyboard keys to make a sprite move at a fixed speed in 4 directions

### Chapter 6: Tiled editor importers

`makeTiledWorld`: Creates a game world using Tiled Editor's JSON export data.

### Chapter 7: The fullscreen module

`requestFullscreen`: Used by `enableFullscreen` to launch fullscreen mode.
`exitFullscreen`: used by `enableFullscreen` to exit fullsrcreen mode.
`alignFullscreen`: Used by `enableFullscreen` to scale and center the canvas in fullscreen mode.
`enableFullscreen`: Enables fullscreen mode when the user clicks or touches the canvas.

### Chapter 8: Sound

`ga.actx`: The audio context.
`makeSound`: a method for loading and controling sound files.
`sound`: a method that returns a sound file object.
`soundEffect`: a versatile method for generating sound effects from pure code.
`impulseResponse`: A helper method for adding reverb to sounds.

*/

/*
Prologue
--------

Some necessary polyfills for some of the newer APIs used in this file
*/

/*
### Fixing the WebAudio API.
The WebAudio API is so new that it's API is not consistently implemented properly across
all modern browsers. Thankfully, Chris Wilson's Audio Context Monkey Patch script
normalizes the API for maximum compatibility.

https://github.com/cwilso/AudioContext-MonkeyPatch/blob/gh-pages/AudioContextMonkeyPatch.js

It's included here.
Thank you, Chris!

*/


(function (doc) {
  // Use JavaScript script mode
  "use strict";

  /*global Element */

  var pollute = true,
    api,
    vendor,
    apis = {
      // http://dvcs.w3.org/hg/fullscreen/raw-file/tip/Overview.html
      w3: {
        enabled: "fullscreenEnabled",
        element: "fullscreenElement",
        request: "requestFullscreen",
        exit: "exitFullscreen",
        events: {
          change: "fullscreenchange",
          error: "fullscreenerror"
        }
      },
      webkit: {
        enabled: "webkitIsFullScreen",
        element: "webkitCurrentFullScreenElement",
        request: "webkitRequestFullScreen",
        exit: "webkitCancelFullScreen",
        events: {
          change: "webkitfullscreenchange",
          error: "webkitfullscreenerror"
        }
      },
      moz: {
        enabled: "mozFullScreen",
        element: "mozFullScreenElement",
        request: "mozRequestFullScreen",
        exit: "mozCancelFullScreen",
        events: {
          change: "mozfullscreenchange",
          error: "mozfullscreenerror"
        }
      },
      ms: {
        enabled: "msFullscreenEnabled",
        element: "msFullscreenElement",
        request: "msRequestFullscreen",
        exit: "msExitFullscreen",
        events: {
          change: "MSFullscreenChange",
          error: "MSFullscreenError"
        }
      }
    },
    w3 = apis.w3;

  // Loop through each vendor's specific API
  for (vendor in apis) {
    // Check if document has the "enabled" property
    if (apis[vendor].enabled in doc) {
      // It seems this browser support the fullscreen API
      api = apis[vendor];
      break;
    }
  }

  function dispatch(type, target) {
    var event = doc.createEvent("Event");

    event.initEvent(type, true, false);
    target.dispatchEvent(event);
  } // end of dispatch()

  function handleChange(e) {
    // Recopy the enabled and element values
    doc[w3.enabled] = doc[api.enabled];
    doc[w3.element] = doc[api.element];

    dispatch(w3.events.change, e.target);
  } // end of handleChange()

  function handleError(e) {
    dispatch(w3.events.error, e.target);
  } // end of handleError()

  // Pollute only if the API doesn't already exists
  if (pollute && !(w3.enabled in doc) && api) {
    // Add listeners for fullscreen events
    doc.addEventListener(api.events.change, handleChange, false);
    doc.addEventListener(api.events.error, handleError, false);

    // Copy the default value
    doc[w3.enabled] = doc[api.enabled];
    doc[w3.element] = doc[api.element];

    // Match the reference for exitFullscreen
    doc[w3.exit] = doc[api.exit];

    // Add the request method to the Element's prototype
    Element.prototype[w3.request] = function () {
      return this[api.request].apply(this, arguments);
    };
  }

  // Return the API found (or undefined if the Fullscreen API is unavailable)
  return api;

}(document));

GA.plugins = function (ga) {

  /*
  Chapter 1: Utilities
  --------------------
  */

  //### move
  //Move a sprite or an array of sprites by adding its
  //velocity to its position
  function internal_move(sprite) {
    sprite.x += sprite.vx | 0;
    sprite.y += sprite.vy | 0;
  }
  ga.move = function (sprites) {
    if (sprites instanceof Array === false) {
      internal_move(sprites)
    } else {
      for (var i = 0; i < sprites.length; i++) {
        internal_move(sprites[i])
      }
    }
  };
  /*
  ### distance

  Find the distance in pixels between two sprites.
  Parameters:
  a. A sprite object with `centerX` and `centerX` properties.
  b. A sprite object with `centerY` and `centerY` properties.
  The function returns the number of pixels distance between the sprites.

  */

  ga.distance = function (s1, s2) {
    var vx = s2.centerX - s1.centerX,
      vy = s2.centerY - s1.centerY;
    return Math.sqrt(vx * vx + vy * vy);
  };

  /*
  ### followEase

  Make a sprite ease to the position of another sprite.
  Parameters:
  a. A sprite object with `centerX` and `centerY` properties. This is the `follower`
  sprite.
  b. A sprite object with `centerX` and `centerY` properties. This is the `leader` sprite that
  the follower will chase
  c. The easing value, such as 0.3. A higher number makes the follower move faster

  */

  /*
  ### followConstant

  Make a sprite move towards another sprite at a regular speed.
  Parameters:
  a. A sprite object with `centerX` and `centerY` properties. This is the `follower`
  sprite.
  b. A sprite object with `centerX` and `centerY` properties. This is the `leader` sprite that
  the follower will chase
  c. The speed value, such as 3. The is the pixels per frame that the sprite will move. A higher number makes the follower move faster.

  */

  //### rotateAroundPoint
  //Make a point rotate around another point.
  //If distanceX and distanceY are the same value, the rotation will
  //be circular. If they're different values, the rotation will be
  //ellipical.

  /*
  ### angle

  Return the angle in Radians between two sprites.
  Parameters:
  a. A sprite object with `centerX` and `centerY` properties.
  b. A sprite object with `centerX` and `centerY` properties.
  You can use it to make a sprite rotate towards another sprite like this:

      box.rotation = angle(box, pointer);

  */

  /*
  ### random

  Returns a random integer between a minimum and maximum value
  Parameters:
  a. An integer.
  b. An integer.
  Here's how you can use it to get a random number between, 1 and 10:

      randomInt(1, 10);

  */
  ga.randomInt = function (min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  };

  //### randomFloat
  // Returns a random floating point number between a minimum and maximum value
  ga.randomFloat = function (min, max) {
    return min + Math.random() * (max - min);
  }

  //### wait
  ga.wait = function (duration, callBack) {
    return setTimeout(callBack, duration);
  };
  ga.worldCamera = function (world, canvas) {
    var camera = {
      width: canvas.width,
      height: canvas.height,
      _x: 0,
      _y: 0,

      //`x` and `y` getters/setters
      //When you change the camera's position,
      //they acutally reposition the world
      get x() {
        return this._x;
      },
      set x(value) {
        this._x = value;
        world.x = -this._x;
        world._previousX = world.x;
      },
      get y() {
        return this._y;
      },
      set y(value) {
        this._y = value;
        world.y = -this._y;
        world._previousY = world.y;
      },
      get centerX() {
        return this.x + (this.width / 2);
      },
      get centerY() {
        return this.y + (this.height / 2);
      },
      get rightInnerBoundary() {
        return this.x + (this.width / 2) + (this.width / 4);
      },
      get leftInnerBoundary() {
        return this.x + (this.width / 2) - (this.width / 4);
      },
      get topInnerBoundary() {
        return this.y + (this.height / 2) - (this.height / 4);
      },
      get bottomInnerBoundary() {
        return this.y + (this.height / 2) + (this.height / 4);
      },
      follow: function (sprite) {

        //Check the sprites position in relation to the inner boundary
        if (sprite.x < this.leftInnerBoundary) {
          //Move the camera to follow the sprite if the sprite strays outside
          //this.x = Math.floor(sprite.x - (this.width / 4));
          this.x = sprite.x - (this.width / 4);
        }
        if (sprite.y < this.topInnerBoundary) {

          //this.y = Math.floor(sprite.y - (this.height / 4));
          this.y = sprite.y - (this.height / 4);
        }
        if (sprite.x + sprite.width > this.rightInnerBoundary) {

          //this.x = Math.floor(sprite.x + sprite.width - (this.width / 4 * 3));
          this.x = sprite.x + sprite.width - (this.width / 4 * 3);
        }
        if (sprite.y + sprite.height > this.bottomInnerBoundary) {

          //this.y = Math.floor(sprite.y + sprite.height - (this.height / 4 * 3));
          this.y = sprite.y + sprite.height - (this.height / 4 * 3);
        }
        //If the camera reaches the edge of the map, stop it from moving
        if (this.x < 0) {
          this.x = 0;
        }
        if (this.y < 0) {
          this.y = 0;
        }
        if (this.x + this.width > world.width) {
          this.x = world.width - this.width;
        }
        if (this.y + this.height > world.height) {
          this.y = world.height - this.height;
        }
      },
      centerOver: function (sprite) {

        //Center the camera over a sprite
        this.x = ((sprite.x + sprite.halfWidth) - (this.width / 2));
        this.y = ((sprite.y + sprite.halfHeight) - (this.height / 2));
      }
    };

    return camera;
  };

  
  //### scaleToWindow
  //Center and scale the game engine inside the HTML page 
  ga.scaleToWindow = function (backgroundColor) {

    backgroundColor = backgroundColor || "#2C3539";
    var scaleX, scaleY, scale, center;

    //1. Scale the canvas to the correct size
    //Figure out the scale amount on each axis
    scaleX = window.innerWidth / ga.canvas.width;
    scaleY = window.innerHeight / ga.canvas.height;

    //Scale the canvas based on whichever value is less: `scaleX` or `scaleY`
    scale = Math.min(scaleX, scaleY);
    ga.canvas.style.transformOrigin = "0 0";
    ga.canvas.style.transform = "scale(" + scale + ")";

    //2. Center the canvas.
    //Decide whether to center the canvas vertically or horizontally.
    //Wide canvases should be centered vertically, and 
    //square or tall canvases should be centered horizontally
    if (ga.canvas.width > ga.canvas.height) {
      if (ga.canvas.width * scale < window.innerWidth) {
        center = "horizontally";
      } else {
        center = "vertically";
      }
    } else {
      if (ga.canvas.height * scale < window.innerHeight) {
        center = "vertically";
      } else {
        center = "horizontally";
      }
    }

    //Center horizontally (for square or tall canvases)
    var margin;
    if (center === "horizontally") {
      margin = (window.innerWidth - ga.canvas.width * scale) / 2;
      ga.canvas.style.marginLeft = margin + "px";
      ga.canvas.style.marginRight = margin + "px";
    }

    //Center vertically (for wide canvases) 
    if (center === "vertically") {
      margin = (window.innerHeight - ga.canvas.height * scale) / 2;
      ga.canvas.style.marginTop = margin + "px";
      ga.canvas.style.marginBottom = margin + "px";
    }

    //3. Remove any padding from the canvas  and body and set the canvas
    //display style to "block"
    ga.canvas.style.paddingLeft = 0;
    ga.canvas.style.paddingRight = 0;
    ga.canvas.style.paddingTop = 0;
    ga.canvas.style.paddingBottom = 0;
    ga.canvas.style.display = "block";

    //4. Set the color of the HTML body background
    document.body.style.backgroundColor = backgroundColor;

    //5. Set the game engine and pointer to the correct scale. 
    //This is important for correct hit testing between the pointer and sprites
    ga.pointer.scale = scale;
    ga.scale = scale;

    //It's important to set `canvasHasBeenScaled` to `true` so that
    //the scale values aren't overridden by Ga's check for fullscreen
    //mode in the `update` function (in the `ga.js` file.)
    ga.canvas.scaled = true;

    //Fix some quirkiness in scaling for Safari
    var ua = navigator.userAgent.toLowerCase();
    if (ua.indexOf("safari") != -1) {
      if (ua.indexOf("chrome") > -1) {
        // Chrome
      } else {
        // Safari
        ga.canvas.style.maxHeight = "100%";
        ga.canvas.style.minHeight = "100%";
      }
    }
  };



  //### scaleToFit - DEPRICATED - DO NOT USE!
  /*
  Center and scale Ga inside the HTML page. The `dimension` can be either "width" or "height"
  depending on you want to center the game horizontally ("width") or vertically ("height").
  */
  ga.scaleToFit = function (dimension, color) {
    var scaleX, scaleY, scale;

    if (dimension === "width") {
      scaleX = ga.canvas.width / window.innerWidth;
      scaleY = ga.canvas.height / window.innerHeight;
    }
    if (dimension === "height") {
      scaleX = window.innerWidth / ga.canvas.width;
      scaleY = window.innerHeight / ga.canvas.height;
    }
    scale = Math.min(scaleX, scaleY);
    ga.canvas.style.transformOrigin = "0 0";
    ga.canvas.style.transform = "scale(" + scale + ")";

    //Set the color of the HTML body background
    document.body.style.backgroundColor = color;

    //Center the canvas in the HTML body
    ga.canvas.style.paddingLeft = 0;
    ga.canvas.style.paddingRight = 0;
    ga.canvas.style.marginLeft = "auto";
    ga.canvas.style.marginRight = "auto";
    ga.canvas.style.display = "block";
    ga.canvas.style.minHeight = "100%";

    //Fix some quirkiness in scaling for Safari
    var ua = navigator.userAgent.toLowerCase();
    if (ua.indexOf('safari') != -1) {
      if (ua.indexOf('chrome') > -1) {
        // Chrome
      } else {
        // Safari
        ga.canvas.style.maxHeight = "100%";
        ga.canvas.style.minHeight = "100%";
      }
    }

    //Set ga to the correct scale. This important for correct hit testing
    //between the pointer and sprites
    ga.scale = scale;
  };




  /*
  Chapter 4: Collision
  --------------------
  */

  /*
  ### Boundary collisions
  */

  //#### outsideBounds
  
  /*
  #### hitTestPoint

  Use it to find out if a point is touching a circular or rectangular sprite.
  Parameters:
  a. An object with `x` and `y` properties.
  b. A sprite object with `x`, `y`, `centerX` and `centerY` properties.
  If the sprite has a `radius` property, the function will interpret
  the shape as a circle.
  */

  ga.hitTestPoint = function (point, sprite) {

    var shape, left, right, top, bottom, vx, vy, magnitude, hit;

    //Find out if the sprite is rectangular or circular depending
    //on whether it has a `radius` property
    if (sprite.radius) {
      shape = "circle";
    } else {
      shape = "rectangle";
    }

    //Rectangle
    if (shape === "rectangle") {

      //Get the position of the sprite's edges
      left = sprite.x;
      right = sprite.x + sprite.width;
      top = sprite.y;
      bottom = sprite.y + sprite.height;

      //Find out if the point is intersecting the rectangle
      hit = point.x > left && point.x < right && point.y > top && point.y < bottom;
    }

    //Circle
    if (shape === "circle") {

      //Find the distance between the point and the
      //center of the circle
      vx = point.x - sprite.centerX,
        vy = point.y - sprite.centerY,
        magnitude = Math.sqrt(vx * vx + vy * vy);

      //The point is intersecting the circle if the magnitude
      //(distance) is less than the circle's radius
      hit = magnitude < sprite.radius;
    }

    //`hit` will be either `true` or `false`
    return hit;
  };

  /*
  #### hitTestCircle

  Use it to find out if two circular sprites are touching.
  Parameters:
  a. A sprite object with `centerX`, `centerY` and `radius` properties.
  b. A sprite object with `centerX`, `centerY` and `radius`.
  */

  ga.hitTestCircle = function (c1, c2, global) {
    var vx, vy, magnitude, totalRadii, hit;

    //Set `global` to a default value of `false`
    if (global === undefined) global = false;

    //Calculate the vector between the circles’ center points
    if (global) {

      //Use global coordinates
      vx = (c2.gx + c2.radius) - (c1.gx + c1.radius);
      vy = (c2.gy + c2.radius) - (c1.gy + c1.radius);
    } else {

      //Use local coordinates
      vx = c2.centerX - c1.centerX;
      vy = c2.centerY - c1.centerY;
    }

    //Find the distance between the circles by calculating
    //the vector's magnitude (how long the vector is)
    magnitude = Math.sqrt(vx * vx + vy * vy);

    //Add together the circles' total radii
    totalRadii = c1.radius + c2.radius;

    //Set hit to true if the distance between the circles is
    //less than their totalRadii
    hit = magnitude < totalRadii;

    //`hit` will be either `true` or `false`
    return hit;
  };

  /*
  #### hitTestRectangle

  Use it to find out if two rectangular sprites are touching.
  Parameters:
  a. A sprite object with `centerX`, `centerY`, `halfWidth` and `halfHeight` properties.
  b. A sprite object with `centerX`, `centerY`, `halfWidth` and `halfHeight` properties.

  */

  ga.hitTestRectangle = function (r1, r2, global) {
    var hit, combinedHalfWidths, combinedHalfHeights, vx, vy;

    //Set `global` to a default value of `false`
    if (global === undefined) global = false;

    //A variable to determine whether there's a collision
    hit = false;

    //Calculate the distance vector
    if (global) {
      vx = (r1.gx + r1.halfWidth) - (r2.gx + r2.halfWidth);
      vy = (r1.gy + r1.halfHeight) - (r2.gy + r2.halfHeight);
    } else {
      vx = r1.centerX - r2.centerX;
      vy = r1.centerY - r2.centerY;
    }

    //Figure out the combined half-widths and half-heights
    combinedHalfWidths = r1.halfWidth + r2.halfWidth;
    combinedHalfHeights = r1.halfHeight + r2.halfHeight;

    //Check for a collision on the x axis
    if (Math.abs(vx) < combinedHalfWidths) {

      //A collision might be occuring. Check for a collision on the y axis
      if (Math.abs(vy) < combinedHalfHeights) {

        //There's definitely a collision happening
        hit = true;
      } else {

        //There's no collision on the y axis
        hit = false;
      }
    } else {

      //There's no collision on the x axis
      hit = false;
    }

    //`hit` will be either `true` or `false`
    return hit;
  };

  /*
   hitTestCircleRectangle
   ----------------
 
   Use it to find out if a circular shape is touching a rectangular shape
   Parameters: 
   a. A sprite object with `centerX`, `centerY`, `halfWidth` and `halfHeight` properties.
   b. A sprite object with `centerX`, `centerY`, `halfWidth` and `halfHeight` properties.
 
   */

  ga.hitTestCircleRectangle = function (c1, r1, global) {

    var region, collision, c1x, c1y, r1x, r1y;

    //Set `global` to a default value of `false`
    if (global === undefined) global = false;

    //Use either global or local coordinates
    if (global) {
      c1x = c1.gx;
      c1y = c1.gy
      r1x = r1.gx;
      r1y = r1.gy;
    } else {
      c1x = c1.x;
      c1y = c1.y
      r1x = r1.x;
      r1y = r1.y;
    }

    //Is the circle above the rectangle's top edge?
    if (c1y < r1y - r1.halfHeight) {

      //If it is, we need to check whether it's in the 
      //top left, top center or top right
      //(Increasing the size of the region by 2 pixels slightly weights
      //the text in favor of a rectangle vs. rectangle collision test.
      //This gives a more natural looking result with corner collisions
      //when physics is added)
      if (c1x < r1x - 1 - r1.halfWidth) {
        region = "topLeft";
      }
      else if (c1x > r1x + 1 + r1.halfWidth) {
        region = "topRight";
      }
      else {
        region = "topMiddle";
      }
    }

    //The circle isn't above the top edge, so it might be
    //below the bottom edge
    else if (c1y > r1y + r1.halfHeight) {

      //If it is, we need to check whether it's in the bottom left,
      //bottom center, or bottom right
      if (c1x < r1x - 1 - r1.halfWidth) {
        region = "bottomLeft";
      }
      else if (c1x > r1x + 1 + r1.halfWidth) {
        region = "bottomRight";
      }
      else {
        region = "bottomMiddle";
      }
    }

    //The circle isn't above the top edge or below the bottom edge,
    //so it must be on the left or right side
    else {
      if (c1x < r1x - r1.halfWidth) {
        region = "leftMiddle";
      }
      else {
        region = "rightMiddle";
      }
    }

    //Is this the circle touching the flat sides
    //of the rectangle?
    if (region === "topMiddle"
      || region === "bottomMiddle"
      || region === "leftMiddle"
      || region === "rightMiddle") {

      //Yes, it is, so do a standard rectangle vs. rectangle collision test
      collision = ga.hitTestRectangle(c1, r1, global);
    }

    //The circle is touching one of the corners, so do a
    //circle vs. point collision test
    else {
      var point = {};

      switch (region) {
        case "topLeft":
          point.x = r1x;
          point.y = r1y;
          break;

        case "topRight":
          point.x = r1x + r1.width;
          point.y = r1y;
          break;

        case "bottomLeft":
          point.x = r1x;
          point.y = r1y + r1.height;
          break;

        case "bottomRight":
          point.x = r1x + r1.width;
          point.y = r1y + r1.height;
      }

      //Check for a collision between the circle and the point
      collision = ga.hitTestCirclePoint(c1, point, global);
    }

    //Return the result of the collision.
    //The return value will be `undefined` if there's no collision
    if (collision) {
      return region;
    } else {
      return collision;
    }
  };

  /*
  hitTestCirclePoint
  ------------------

  Use it to find out if a circular shape is touching a point
  Parameters: 
  a. A sprite object with `centerX`, `centerY`, and `radius` properties.
  b. A point object with `x` and `y` properties.

  */

  ga.hitTestCirclePoint = function (c1, point, global) {

    //Set `global` to a default value of `false`
    if (global === undefined) global = false;

    //A point is just a circle with a diameter of
    //1 pixel, so we can cheat. All we need to do is an ordinary circle vs. circle
    //Collision test. Just supply the point with the properties
    //it needs
    point.diameter = 1;
    point.radius = 0.5;
    point.centerX = point.x;
    point.centerY = point.y;
    point.gx = point.x;
    point.gy = point.y;
    return ga.hitTestCircle(c1, point, global);
  };

  /*
  #### rectangleCollision

  Use it to prevent two rectangular sprites from overlapping.
  Optionally, make the first retangle bounceoff the second rectangle.
  Parameters:
  a. A sprite object with `x`, `y` `center.x`, `center.y`, `halfWidth` and `halfHeight` properties.
  b. A sprite object with `x`, `y` `center.x`, `center.y`, `halfWidth` and `halfHeight` properties.
  c. Optional: true or false to indicate whether or not the first sprite
  should bounce off the second sprite.
  */

  ga.rectangleCollision = function (r1, r2, bounce, global) {
    var collision, combinedHalfWidths, combinedHalfHeights,
      overlapX, overlapY, vx, vy;

    //Set `bounce` to a default value of `true`
    if (bounce === undefined) bounce = false;

    //Set `global` to a default value of `false`
    if (global === undefined) global = false;

    //Calculate the distance vector
    if (global) {
      vx = (r1.gx + r1.halfWidth) - (r2.gx + r2.halfWidth);
      vy = (r1.gy + r1.halfHeight) - (r2.gy + r2.halfHeight);
    } else {
      vx = r1.centerX - r2.centerX;
      vy = r1.centerY - r2.centerY;
    }

    //Figure out the combined half-widths and half-heights
    combinedHalfWidths = r1.halfWidth + r2.halfWidth;
    combinedHalfHeights = r1.halfHeight + r2.halfHeight;

    //Check whether vx is less than the combined half widths
    if (Math.abs(vx) < combinedHalfWidths) {

      //A collision might be occurring!
      //Check whether vy is less than the combined half heights
      if (Math.abs(vy) < combinedHalfHeights) {

        //A collision has occurred! This is good!
        //Find out the size of the overlap on both the X and Y axes
        overlapX = combinedHalfWidths - Math.abs(vx);
        overlapY = combinedHalfHeights - Math.abs(vy);

        //The collision has occurred on the axis with the
        //*smallest* amount of overlap. Let's figure out which
        //axis that is

        if (overlapX >= overlapY) {

          //The collision is happening on the X axis
          //But on which side? vy can tell us
          if (vy > 0) {
            collision = "top";

            //Move the rectangle out of the collision
            r1.y = r1.y + overlapY;
          } else {
            collision = "bottom";

            //Move the rectangle out of the collision
            r1.y = r1.y - overlapY;
          }
          //Bounce
          if (bounce) {
            r1.vy *= -1;

            /*Alternative
            //Find the bounce surface's vx and vy properties
            var s = {};
            s.vx = r2.x - r2.x + r2.width;
            s.vy = 0;

            //Bounce r1 off the surface
            //bounceOffSurface(r1, s);
            */
          }
        } else {

          //The collision is happening on the Y axis
          //But on which side? vx can tell us
          if (vx > 0) {
            collision = "left";

            //Move the rectangle out of the collision
            r1.x = r1.x + overlapX;
          } else {
            collision = "right";

            //Move the rectangle out of the collision
            r1.x = r1.x - overlapX;
          }

          //Bounce
          if (bounce) {
            r1.vx *= -1;

            /*Alternative
            //Find the bounce surface's vx and vy properties
            var s = {};
            s.vx = 0;
            s.vy = r2.y - r2.y + r2.height;

            //Bounce r1 off the surface
            bounceOffSurface(r1, s);
            */
          }
        }
      } else {

        //No collision
      }
    } else {

      //No collision
    }

    //Return the collision string. it will be either "top", "right",
    //"bottom", or "left" depening on which side of r1 is touching r2.
    return collision;
  }

  /*
  #### circleCollision

  Use this function to prevent a moving circular sprite from overlapping and optionally
  bouncing off a non-moving circular sprite.
  Parameters:
  a. A sprite object with `x`, `y` `centerX`, `centerY` and `radius` properties.
  b. A sprite object with `x`, `y` `centerX`, `centerY` and `radius` properties.
  c. Optional: `true` or `false` to indicate whether or not the first sprite
  d. Optional: `true` or `false` to indicate whether or not local or global sprite positions should be used.
  This defaults to `true` so set it to `false` if you want to use the sprite's local coordinates.
  should bounce off the second sprite.
  The sprites can contain an optional mass property that should be greater than 1.

  */

  ga.circleCollision = function (c1, c2, bounce, global) {
    var magnitude, combinedRadii, overlap,
      vx, vy, dx, dy, s = {},
      hit = false;

    //Set `bounce` to a default value of `true`
    if (bounce === undefined) bounce = true;

    //Set `global` to a default value of `false`
    if (global === undefined) global = false;

    //Calculate the vector between the circles’ center points

    if (global) {

      //Use global coordinates
      vx = (c2.gx + c2.radius) - (c1.gx + c1.radius);
      vy = (c2.gy + c2.radius) - (c1.gy + c1.radius);
    } else {

      //Use local coordinates
      vx = c2.centerX - c1.centerX;
      vy = c2.centerY - c1.centerY;
    }

    //Find the distance between the circles by calculating
    //the vector's magnitude (how long the vector is)
    magnitude = Math.sqrt(vx * vx + vy * vy);

    //Add together the circles' combined half-widths
    combinedRadii = c1.radius + c2.radius;

    //Figure out if there's a collision
    if (magnitude < combinedRadii) {

      //Yes, a collision is happening.
      hit = true;

      //Find the amount of overlap between the circles
      overlap = combinedRadii - magnitude;

      //Add some "quantum padding". This adds a tiny amount of space
      //between the circles to reduce their surface tension and make
      //them more slippery. "0.3" is a good place to start but you might
      //need to modify this slightly depending on the exact behaviour
      //you want. Too little and the balls will feel sticky, too much
      //and they could start to jitter if they're jammed together
      var quantumPadding = 0.3;
      overlap += quantumPadding;

      //Normalize the vector.
      //These numbers tell us the direction of the collision
      dx = vx / magnitude;
      dy = vy / magnitude;

      //Move circle 1 out of the collision by multiplying
      //the overlap with the normalized vector and subtract it from
      //circle 1's position
      c1.x -= overlap * dx;
      c1.y -= overlap * dy;

      //Bounce
      if (bounce) {
        //Create a collision vector object, `s` to represent the bounce surface.
        //Find the bounce surface's x and y properties
        //(This represents the normal of the distance vector between the circles)
        s.x = vy;
        s.y = -vx;

        //Bounce c1 off the surface
        bounceOffSurface(c1, s);
      } else {
        /*
        //Make it a bit slippery
        var friction = 0.9;
        c1.vx *= friction;
        c1.vy *= friction;
        */
      }
    }

    return hit;
  };

  /*
  #### movingCircleCollision

  Use it to make two moving circles bounce off each other.
  Parameters:
  a. A sprite object with `x`, `y` `centerX`, `centerY` and `radius` properties.
  b. A sprite object with `x`, `y` `centerX`, `centerY` and `radius` properties.
  The sprites can contain an optional mass property that should be greater than 1.

  */

  ga.movingCircleCollision = function (c1, c2, global) {
    var combinedRadii, overlap, xSide, ySide,
      //`s` refers to the collision surface
      s = {},
      p1A = {}, p1B = {}, p2A = {}, p2B = {},
      hit = false;

    //Apply mass, if the circles have mass properties
    c1.mass = c1.mass || 1;
    c2.mass = c2.mass || 1;

    //Set `global` to a default value of `false`
    if (global === undefined) global = false;

    //Calculate the vector between the circles’ center points
    if (global) {

      //Use global coordinates
      s.vx = (c2.gx + c2.radius) - (c1.gx + c1.radius);
      s.vy = (c2.gy + c2.radius) - (c1.gy + c1.radius);
    } else {

      //Use local coordinates
      s.vx = c2.centerX - c1.centerX;
      s.vy = c2.centerY - c1.centerY;
    }

    //Find the distance between the circles by calculating
    //the vector's magnitude (how long the vector is)
    s.magnitude = Math.sqrt(s.vx * s.vx + s.vy * s.vy);

    //Add together the circles' combined half-widths
    combinedRadii = c1.radius + c2.radius;

    //Figure out if there's a collision
    if (s.magnitude < combinedRadii) {

      //Yes, a collision is happening
      hit = true;

      //Find the amount of overlap between the circles
      overlap = combinedRadii - s.magnitude;

      //Add some "quantum padding" to the overlap
      overlap += 0.3;

      //Normalize the vector.
      //These numbers tell us the direction of the collision
      s.dx = s.vx / s.magnitude;
      s.dy = s.vy / s.magnitude;

      //Find the collision vector.
      //Divide it in half to share between the circles, and make it absolute
      s.vxHalf = Math.abs(s.dx * overlap / 2);
      s.vyHalf = Math.abs(s.dy * overlap / 2);

      //Find the side that the collision if occurring on
      (c1.x > c2.x) ? xSide = 1 : xSide = -1;
      (c1.y > c2.y) ? ySide = 1 : ySide = -1;

      //Move c1 out of the collision by multiplying
      //the overlap with the normalized vector and adding it to
      //the circle's positions
      c1.x = c1.x + (s.vxHalf * xSide);
      c1.y = c1.y + (s.vyHalf * ySide);

      //Move c2 out of the collision
      c2.x = c2.x + (s.vxHalf * -xSide);
      c2.y = c2.y + (s.vyHalf * -ySide);

      //1. Calculate the collision surface's properties

      //Find the surface vector's left normal
      s.lx = s.vy;
      s.ly = -s.vx;

      //2. Bounce c1 off the surface (s)

      //Find the dot product between c1 and the surface
      var dp1 = c1.vx * s.dx + c1.vy * s.dy;

      //Project c1's velocity onto the collision surface
      p1A.x = dp1 * s.dx;
      p1A.y = dp1 * s.dy;

      //Find the dot product of c1 and the surface's left normal (s.l.x and s.l.y)
      var dp2 = c1.vx * (s.lx / s.magnitude) + c1.vy * (s.ly / s.magnitude);

      //Project the c1's velocity onto the surface's left normal
      p1B.x = dp2 * (s.lx / s.magnitude);
      p1B.y = dp2 * (s.ly / s.magnitude);

      //3. Bounce c2 off the surface (s)

      //Find the dot product between c2 and the surface
      var dp3 = c2.vx * s.dx + c2.vy * s.dy;

      //Project c2's velocity onto the collision surface
      p2A.x = dp3 * s.dx;
      p2A.y = dp3 * s.dy;

      //Find the dot product of c2 and the surface's left normal (s.l.x and s.l.y)
      var dp4 = c2.vx * (s.lx / s.magnitude) + c2.vy * (s.ly / s.magnitude);

      //Project c2's velocity onto the surface's left normal
      p2B.x = dp4 * (s.lx / s.magnitude);
      p2B.y = dp4 * (s.ly / s.magnitude);

      //Calculate the bounce vectors
      //Bounce c1
      //using p1B and p2A
      c1.bounce = {};
      c1.bounce.x = p1B.x + p2A.x;
      c1.bounce.y = p1B.y + p2A.y;

      //Bounce c2
      //using p1A and p2B
      c2.bounce = {};
      c2.bounce.x = p1A.x + p2B.x;
      c2.bounce.y = p1A.y + p2B.y;

      //Add the bounce vector to the circles' velocity
      //and add mass if the circle has a mass property
      c1.vx = c1.bounce.x / c1.mass;
      c1.vy = c1.bounce.y / c1.mass;
      c2.vx = c2.bounce.x / c2.mass;
      c2.vy = c2.bounce.y / c2.mass;
    }
    return hit;
  };

  //#### multipleCircleCollision
  /*
  Checks all the circles in an array for a collision against
  all the other circles in an array, using `movingCircleCollision` (above)
  */

  ga.multipleCircleCollision = function (arrayOfCircles, global) {

    //Set `global` to a default value of `false`
    if (global === undefined) global = false;

    //marble collisions
    for (var i = 0; i < arrayOfCircles.length; i++) {

      //The first marble to use in the collision check
      var c1 = arrayOfCircles[i];
      for (var j = i + 1; j < arrayOfCircles.length; j++) {

        //The second marble to use in the collision check
        var c2 = arrayOfCircles[j];

        //Check for a collision and bounce the marbles apart if
        //they collide. Use an optional mass property on the sprite
        //to affect the bounciness of each marble
        ga.movingCircleCollision(c1, c2, global);
      }
    }
  };

  /*
  circlePointCollision
  --------------------

  Use it to bounce a circular sprite off a point.
  Parameters: 
  a. A sprite object with `centerX`, `centerY`, and `radius` properties.
  b. A point object with `x` and `y` properties.

  */

  ga.circlePointCollision = function (c1, point, bounce, global) {

    //Set `global` and `bounce` to a default values of `false`
    if (global === undefined) global = false;
    if (bounce === undefined) bounce = false;

    //A point is just a circle with a diameter of
    //1 pixel, so we can cheat. All we need to do is an ordinary circle vs. circle
    //Collision test. Just supply the point with the properties
    //it needs
    point.diameter = 1;
    point.radius = 0.5;
    point.centerX = point.x;
    point.centerY = point.y;
    point.gx = point.x;
    point.gy = point.y;
    return ga.circleCollision(c1, point, bounce, global);
  }

  /*
  circleRectangleCollision
  ------------------------

  Use it to bounce a circular shape off a rectangular shape
  Parameters: 
  a. A sprite object with `centerX`, `centerY`, `halfWidth` and `halfHeight` properties.
  b. A sprite object with `centerX`, `centerY`, `halfWidth` and `halfHeight` properties.

  */

  ga.circleRectangleCollision = function (c1, r1, bounce, global) {

    var region, collision, c1x, c1y, r1x, r1y;

    //Set `global` and `bounce` to a default values of `false`
    if (global === undefined) global = false;
    if (bounce === undefined) bounce = false;

    //Use either the global or local coordinates
    if (global) {
      c1x = c1.gx;
      c1y = c1.gy
      r1x = r1.gx;
      r1y = r1.gy;
    } else {
      c1x = c1.x;
      c1y = c1.y
      r1x = r1.x;
      r1y = r1.y;
    }

    //Is the circle above the rectangle's top edge?
    if (c1y < r1y - r1.halfHeight) {

      //If it is, we need to check whether it's in the 
      //top left, top center or top right
      if (c1x < r1x - 1 - r1.halfWidth) {
        region = "topLeft";
      }
      else if (c1x > r1x + 1 + r1.halfWidth) {
        region = "topRight";
      }
      else {
        region = "topMiddle";
      }
    }

    //The circle isn't above the top edge, so it might be
    //below the bottom edge
    else if (c1y > r1y + r1.halfHeight) {

      //If it is, we need to check whether it's in the bottom left,
      //bottom center, or bottom right
      if (c1x < r1x - 1 - r1.halfWidth) {
        region = "bottomLeft";
      }
      else if (c1x > r1x + 1 + r1.halfWidth) {
        region = "bottomRight";
      }
      else {
        region = "bottomMiddle";
      }
    }

    //The circle isn't above the top edge or below the bottom edge,
    //so it must be on the left or right side
    else {
      if (c1x < r1x - r1.halfWidth) {
        region = "leftMiddle";
      }
      else {
        region = "rightMiddle";
      }
    }

    //Is this the circle touching the flat sides
    //of the rectangle?
    if (region === "topMiddle"
      || region === "bottomMiddle"
      || region === "leftMiddle"
      || region === "rightMiddle") {

      //Yes, it is, so do a standard rectangle vs. rectangle collision test
      collision = ga.rectangleCollision(c1, r1, bounce, global);
    }

    //The circle is touching one of the corners, so do a
    //circle vs. point collision test
    else {
      var point = {};

      switch (region) {
        case "topLeft":
          point.x = r1x;
          point.y = r1y;
          break;

        case "topRight":
          point.x = r1x + r1.width;
          point.y = r1y;
          break;

        case "bottomLeft":
          point.x = r1x;
          point.y = r1y + r1.height;
          break;

        case "bottomRight":
          point.x = r1x + r1.width;
          point.y = r1y + r1.height;
      }

      //Check for a collision between the circle and the point
      collision = ga.circlePointCollision(c1, point, bounce, global);
    }

    if (collision) {
      return region;
    } else {
      return collision;
    }
  }

  /*
  #### bounceOffSurface

  Use this to bounce an object off another object. It's only used by the other collision functions,
  so you don't need to call it yourself.
  Parameters:
  a. An object with `vx` and `vy` properties. This represents the object that is colliding
  with a surface.
  b. An object with `x` and `y` properties. This represents the surface that the object
  is colliding into.
  The first object can optionally have a mass property that's greater than 1. The mass will
  be used to dampen the bounce effect.
  */

  function bounceOffSurface(o, s) {
    var dp1, dp2,
      p1 = {},
      p2 = {},
      bounce = {},
      mass = o.mass || 1;

    //1. Calculate the collision surface's properties
    //Find the surface vector's left normal
    s.lx = s.y;
    s.ly = -s.x;

    //Find its magnitude
    s.magnitude = Math.sqrt(s.x * s.x + s.y * s.y);

    //Find its normalized values
    s.dx = s.x / s.magnitude;
    s.dy = s.y / s.magnitude;

    //2. Bounce the object (o) off the surface (s)

    //Find the dot product between the object and the surface
    dp1 = o.vx * s.dx + o.vy * s.dy;

    //Project the object's velocity onto the collision surface
    p1.vx = dp1 * s.dx;
    p1.vy = dp1 * s.dy;

    //Find the dot product of the object and the surface's left normal (s.l.x and s.l.y)
    dp2 = o.vx * (s.lx / s.magnitude) + o.vy * (s.ly / s.magnitude);

    //Project the object's velocity onto the surface's left normal
    p2.vx = dp2 * (s.lx / s.magnitude);
    p2.vy = dp2 * (s.ly / s.magnitude);

    //Reverse the projection on the surface's left normal
    p2.vx *= -1;
    p2.vy *= -1;

    //Add up the projections to create a new bounce vector
    bounce.x = p1.vx + p2.vx;
    bounce.y = p1.vy + p2.vy;

    //Assign the bounce vector to the object's velocity
    //with optional mass to dampen the effect
    o.vx = bounce.x / mass;
    o.vy = bounce.y / mass;
  }

  /*
  //#### hit
  An universal collision method that works for rectangular and circular sprites.
  it figures out what kinds of sprites are involved in the collision and
  automatically chooses the correct collision method.
  */

  ga.hit = function (a, b, react, bounce, global, extra) {
    var collision;

    //Set the defaults
    react = react || false;
    bounce = bounce || false;
    global = global || false;

    //Check to make sure one of the arguments isn't an array
    if (b instanceof Array || a instanceof Array) {

      //If it is, check for a collision between a sprite and an array
      spriteVsArray();
    } else {

      //If one of the arguments isn't an array, find out what type of
      //collision check to run
      collision = findCollisionType(a, b);
      if (collision && extra) extra(collision);
    }

    //Return the result of the collision.
    //It will be `undefined` if there's no collision and `true` if
    //there is a collision. `rectangleCollision` sets `collsision` to
    //"top", "bottom", "left" or "right" depeneding on which side the
    //collision is occuring on
    return collision;

    function findCollisionType(a, b) {

      //Are `a` and `b` both sprites?
      //(We have to check again if this function was called from
      //`spriteVsArray`)
      var aIsASprite = a.parent !== undefined,
        bIsASprite = b.parent !== undefined;

      if (aIsASprite && bIsASprite) {

        //Yes, but what kind of sprites?
        if (a.diameter && b.diameter) {

          //They're circles
          return circleVsCircle(a, b);
        }
        else if (a.diameter && !b.diameter) {

          //The first one is a circle and the second is a rectangle
          return circleVsRectangle(a, b);
        }
        else {

          //They're rectangles
          return rectangleVsRectangle(a, b);
        }
      }

      //They're not both sprites, so what are they?
      //Is `a` not a sprite and does it have x and y properties?
      else if (bIsASprite && !(a.x === undefined) && !(a.y === undefined)) {

        //Yes, so this is a point vs. sprite collision test
        return ga.hitTestPoint(a, b);
      }
      else {
        //The user is trying to test some incompatible objects
        throw new Error("I'm sorry, " + a + " and " + b + " cannot be use together in a collision test.");
      }
    }

    function spriteVsArray() {

      //If `a` happens to be the array, flip it around so that it becomes `b`
      if (a instanceof Array) {
        var temp = a;
        b = a;
        a = temp;
      }

      //Loop through the array in reverse
      for (var i = b.length - 1; i >= 0; i--) {
        var sprite = b[i];
        collision = findCollisionType(a, sprite);
        if (collision && extra) extra(collision, sprite);
      }
    }

    function circleVsCircle(a, b) {

      //If the circles shouldn't react to the collision,
      //just test to see if they're touching
      if (!react) {
        return ga.hitTestCircle(a, b, global);
      }

      //Yes, the circles should react to the collision
      else {

        //Are they both moving?
        if (a.vx + a.vy !== 0 && b.vx + b.vy !== 0) {

          //Yes, they are both moving
          //(moving circle collisions always bounce apart so there's
          //no need for the third, `bounce`, argument)
          return ga.movingCircleCollision(a, b, global);
        }
        else {

          //No, they're not both moving
          return ga.circleCollision(a, b, bounce, global);
        }
      }
    }

    function rectangleVsRectangle(a, b) {

      //If the rectangles shouldn't react to the collision, just
      //test to see if they're touching
      if (!react) {
        return ga.hitTestRectangle(a, b, global);
      }
      //Yes
      else {

        //Should they bounce apart?
        //Yes
        if (bounce) {
          return ga.rectangleCollision(a, b, true, global);
        }
        //No
        else {
          return ga.rectangleCollision(a, b, false, global);
        }
      }
    }

    function circleVsRectangle(a, b) {

      //If the rectangles shouldn't react to the collision, just
      //test to see if they're touching
      if (!react) {
        return ga.hitTestCircleRectangle(a, b, global);
      }
      else {
        return ga.circleRectangleCollision(a, b, bounce, global);
      }
    }
  };

  //### 2D Tile based collision utilities
  /*
  #### getTile
  The `getTile` helper method
  converts a tile's index number into x/y screen
  coordinates, and capture's the tile's grid index (`gid`) number.
  It returns an object with `x`, `y`, `centerX`, `centerY`, `width`, `height`, `halfWidth`
  `halffHeight` and `gid` properties. (The `gid` number is the value that the tile has in the
  mapArray) This lets you use the returned object
  with the 2d geometric collision functions like `hitTestRectangle`
  or `rectangleCollision`

  The `world` object requires these properties:
  `x`, `y`, `tilewidth`, `tileheight` and `widthInTiles`
  */

  /*
  #### surroundingCells
  The `surroundingCells` helper method returns an array containing 9
  index numbers of map array cells around any given index number.
  Use it for an efficient broadphase/narrowphase collision test.
  The 2 arguments are the index number that represents the center cell,
  and the width of the map array.
  */

  //#### getPoints
  /*
  The `getPoints` method takes a sprite and returns
  an object that tells you what all its corner points are.
  If the sprite has a `collisionArea` property that defines a
  smaller rectangular area inside the sprite, that collision
  area will be used istead of the sprite's dimensions. Here's
  How you could define a `collsionArea` on a sprite:

      elf.collisionArea = {x: 22, y: 44, width: 20, height: 20};

  */


  //### hitTestTile
  /*
  `hitTestTile` checks for a
  collision between a sprite and a tile in any map array that you
  specify. It returns a `collision` object.
  `collision.hit` is a Boolean that tells you if a sprite is colliding
  with the tile that you're checking. `collision.index` tells you the
  map array's index number of the colliding sprite. You can check for
  a collision with the tile against "every" corner point on the
  sprite, "some" corner points, or the sprite's "center" point.
  `hitTestTile` arguments:
  sprite, array, collisionTileGridIdNumber, worldObject, spritesPointsToCheck
  The `world` object (the 4th argument) has to have these properties:
  `tileheight`, `tilewidth`, `widthInTiles`.
  */
  ga.requestFullScreen = function () {
    if (!document.fullscreenEnabled) {
      ga.canvas.requestFullscreen();
    }
  };

  //`exitFullscreen` is used by `enableFullscreen` to exit
  //fullscreen mode.
  ga.exitFullScreen = function () {
    if (document.fullscreenEnabled) {
      document.exitFullscreen();
    }
  };

  //`alignFullscreen` is called by `enableFullscreen` to center and
  //align the canvas vertically or horizontally inside the users
  //screen. It also sets `ga.fullscreenScale` that Ga's `update` loop
  //uses to changed the values of `ga.scale` and `ga.pointer.scale`
  //when fullscreen mode is entered or exited.
  ga.alignFullscreen = function () {
    var scaleX, scaleY;

    //Scale the canvas to the correct size.
    //Figure out the scale amount on each axis.
    scaleX = screen.width / ga.canvas.width;
    scaleY = screen.height / ga.canvas.height;

    //Set the scale based on whichever value is less: `scaleX` or `scaleY`.
    ga.fullscreenScale = Math.min(scaleX, scaleY);

    //To center the canvas we need to inject some CSS
    //and into the HTML document's `<style>` tag. Some
    //browsers require an existing `<style>` tag to do this, so
    //if no `<style>` tag already exists, let's create one and
    //append it to the `<body>:
    var styleSheets = document.styleSheets;
    if (styleSheets.length === 0) {
      var divNode = document.createElement("div");
      divNode.innerHTML = "<style></style>";
      document.body.appendChild(divNode);
    }

    //Unfortunately we also need to do some browser detection
    //to inject the full screen CSS with the correct vendor 
    //prefix. So, let's find out what the `userAgent` is.
    //`ua` will be an array containing lower-case browser names.
    var ua = navigator.userAgent.toLowerCase();

    //Now Decide whether to center the canvas vertically or horizontally.
    //Wide canvases should be centered vertically, and 
    //square or tall canvases should be centered horizontally.

    if (ga.canvas.width > ga.canvas.height) {

      //Center vertically.
      //Add CSS to the stylesheet to center the canvas vertically.
      //You need a version for each browser vendor, plus a generic
      //version
      //(Unfortunately the CSS string cannot include line breaks, so
      //it all has to be on one long line.)
      if (ua.indexOf("safari") !== -1 || ua.indexOf("chrome") !== -1) {
        document.styleSheets[0].insertRule("canvas:-webkit-full-screen {position: fixed; width: 100%; height: auto; top: 0; right: 0; bottom: 0; left: 0; margin: auto; object-fit: contain}", 0);
      }
      else if (ua.indexOf("firefox") !== -1) {
        document.styleSheets[0].insertRule("canvas:-moz-full-screen {position: fixed; width: 100%; height: auto; top: 0; right: 0; bottom: 0; left: 0; margin: auto; object-fit: contain;}", 0);
      }
      else if (ua.indexOf("opera") !== -1) {
        document.styleSheets[0].insertRule("canvas:-o-full-screen {position: fixed; width: 100%; height: auto; top: 0; right: 0; bottom: 0; left: 0; margin: auto; object-fit: contain;}", 0);
      }
      else if (ua.indexOf("explorer") !== -1) {
        document.styleSheets[0].insertRule("canvas:-ms-full-screen {position: fixed; width: 100%; height: auto; top: 0; right: 0; bottom: 0; left: 0; margin: auto; object-fit: contain;}", 0);
      }
      else {
        document.styleSheets[0].insertRule("canvas:fullscreen {position: fixed; width: 100%; height: auto; top: 0; right: 0; bottom: 0; left: 0; margin: auto; object-fit: contain;}", 0);
      }
    } else {

      //Center horizontally.
      if (ua.indexOf("safari") !== -1 || ua.indexOf("chrome") !== -1) {
        document.styleSheets[0].insertRule("canvas:-webkit-full-screen {height: 100%; margin: 0 auto; object-fit: contain;}", 0);
      }
      else if (ua.indexOf("firefox") !== -1) {
        document.styleSheets[0].insertRule("canvas:-moz-full-screen {height: 100%; margin: 0 auto; object-fit: contain;}", 0);
      }
      else if (ua.indexOf("opera") !== -1) {
        document.styleSheets[0].insertRule("canvas:-o-full-screen {height: 100%; margin: 0 auto; object-fit: contain;}", 0);
      }
      else if (ua.indexOf("msie") !== -1) {
        document.styleSheets[0].insertRule("canvas:-ms-full-screen {height: 100%; margin: 0 auto; object-fit: contain;}", 0);
      }
      else {
        document.styleSheets[0].insertRule("canvas:fullscreen {height: 100%; margin: 0 auto; object-fit: contain;}", 0);
      }
    }
  };

  //### enableFullscreen
  /*
  Use `enterFullscreen` to make the browser display the game full screen.
  It automatically centers the game canvas for the best fit. Optionally supply any number of ascii
  keycodes as arguments to represent the keyboard keys that should exit fullscreen mode.
  */
  ga.enableFullscreen = function (exitKeyCodes) {

    //Get an array of the optional exit key codes.
    if (exitKeyCodes) exitKeyCodes = Array.prototype.slice.call(arguments);

    //Center and align the fullscreen element.
    ga.alignFullscreen();

    //Add mouse and touch listeners to the canvas to enable
    //fullscreen mode.
    ga.canvas.addEventListener("mouseup", ga.requestFullScreen, false);
    ga.canvas.addEventListener("touchend", ga.requestFullScreen, false);

    if (exitKeyCodes) {
      exitKeyCodes.forEach(function (keyCode) {
        window.addEventListener(
          "keyup",
          function (event) {
            if (event.keyCode === keyCode) {
              ga.exitFullScreen();
            }
            event.preventDefault();
          },
          false
        );
      });
    }
  }

  ga.launchFullscreen = function (sprite) {
    if (ga.hitTestPoint(ga.pointer.position, sprite)) ga.enableFullscreen();
  }

  ga.scaleFullscreen = function () {
    if (document.fullscreenEnabled) {
      ga.scale = ga.fullscreenScale;
      ga.pointer.scale = ga.fullscreenScale;
    } else {
      if (!ga.canvas.scaled) {
        ga.scale = 1;
        ga.pointer.scale = 1;
      }
    }
  }
  ga.updateFunctions.push(ga.scaleFullscreen);
};
export default GA.plugins