function plugins(ga) {
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
    ga.distance = function (s1, s2) {
      var vx = s2.centerX - s1.centerX,
        vy = s2.centerY - s1.centerY;
      return Math.sqrt(vx * vx + vy * vy);
    };
    ga.randomInt = function (min, max) {
      return Math.floor(Math.random() * (max - min + 1)) + min;
    };

    ga.randomFloat = function (min, max) {
      return min + Math.random() * (max - min);
    }

    ga.wait = function (duration, callBack) {
      return setTimeout(callBack, duration);
    };
    ga.worldCamera = function (world, canvas) {
      var camera = {
        width: canvas.width,
        height: canvas.height,
        _x: 0,
        _y: 0,
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
          if (sprite.x < this.leftInnerBoundary) {
            this.x = sprite.x - (this.width / 4);
          }
          if (sprite.y < this.topInnerBoundary) {
            this.y = sprite.y - (this.height / 4);
          }
          if (sprite.x + sprite.width > this.rightInnerBoundary) {
            this.x = sprite.x + sprite.width - (this.width / 4 * 3);
          }
          if (sprite.y + sprite.height > this.bottomInnerBoundary) {
            this.y = sprite.y + sprite.height - (this.height / 4 * 3);
          }
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
          state.game.x = -sprite.x + g.canvas.width / 2;
          state.game.y = -sprite.y  + g.canvas.height / 2;
        }
      };

      return camera;
    };

    ga.scaleToWindow = function (backgroundColor) {

      backgroundColor = backgroundColor || "#2C3539";
      var scaleX, scaleY, scale, center;
      scaleX = window.innerWidth / ga.canvas.width;
      scaleY = window.innerHeight / ga.canvas.height;
      scale = Math.min(scaleX, scaleY);
      ga.canvas.style.transformOrigin = "0 0";
      ga.canvas.style.transform = "scale(" + scale + ")";
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
      var margin;
      if (center === "horizontally") {
        margin = (window.innerWidth - ga.canvas.width * scale) / 2;
        ga.canvas.style.marginLeft = margin + "px";
        ga.canvas.style.marginRight = margin + "px";
      }
      if (center === "vertically") {
        margin = (window.innerHeight - ga.canvas.height * scale) / 2;
        ga.canvas.style.marginTop = margin + "px";
        ga.canvas.style.marginBottom = margin + "px";
      }
      ga.canvas.style.paddingLeft = 0;
      ga.canvas.style.paddingRight = 0;
      ga.canvas.style.paddingTop = 0;
      ga.canvas.style.paddingBottom = 0;
      ga.canvas.style.display = "block";
      document.body.style.backgroundColor = backgroundColor;
      ga.pointer.scale = scale;
      ga.scale = scale;
      ga.canvas.scaled = true;
      var ua = navigator.userAgent.toLowerCase();
      if (ua.indexOf("safari") != -1) {
        if (ua.indexOf("chrome") > -1) {
        } else {
          ga.canvas.style.maxHeight = "100%";
          ga.canvas.style.minHeight = "100%";
        }
      }
    };
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
      document.body.style.backgroundColor = color;
      ga.canvas.style.paddingLeft = 0;
      ga.canvas.style.paddingRight = 0;
      ga.canvas.style.marginLeft = "auto";
      ga.canvas.style.marginRight = "auto";
      ga.canvas.style.display = "block";
      ga.canvas.style.minHeight = "100%";
      var ua = navigator.userAgent.toLowerCase();
      if (ua.indexOf('safari') != -1) {
        if (ua.indexOf('chrome') > -1) {
        } else {
          ga.canvas.style.maxHeight = "100%";
          ga.canvas.style.minHeight = "100%";
        }
      }
      ga.scale = scale;
    };

    ga.hitTestPoint = function (point, sprite) {

      var shape, left, right, top, bottom, vx, vy, magnitude, hit;
      if (sprite.radius) {
        shape = "circle";
      } else {
        shape = "rectangle";
      }

      
      if (shape === "rectangle") {

        
        left = sprite.x;
        right = sprite.x + sprite.width;
        top = sprite.y;
        bottom = sprite.y + sprite.height;

        
        hit = point.x > left && point.x < right && point.y > top && point.y < bottom;
      }

      
      if (shape === "circle") {

        
        
        vx = point.x - sprite.centerX,
          vy = point.y - sprite.centerY,
          magnitude = Math.sqrt(vx * vx + vy * vy);

        
        
        hit = magnitude < sprite.radius;
      }

      
      return hit;
    };

  

    ga.hitTestCircle = function (c1, c2, global) {
      var vx, vy, magnitude, totalRadii, hit;

      
      if (global === undefined) global = false;

      
      if (global) {

        
        vx = (c2.gx + c2.radius) - (c1.gx + c1.radius);
        vy = (c2.gy + c2.radius) - (c1.gy + c1.radius);
      } else {

        
        vx = c2.centerX - c1.centerX;
        vy = c2.centerY - c1.centerY;
      }

      
      
      magnitude = Math.sqrt(vx * vx + vy * vy);

      
      totalRadii = c1.radius + c2.radius;

      
      
      hit = magnitude < totalRadii;

      
      return hit;
    };

  

    ga.hitTestRectangle = function (r1, r2, global) {
      var hit, combinedHalfWidths, combinedHalfHeights, vx, vy;

      
      if (global === undefined) global = false;

      
      hit = false;

      
      if (global) {
        vx = (r1.gx + r1.halfWidth) - (r2.gx + r2.halfWidth);
        vy = (r1.gy + r1.halfHeight) - (r2.gy + r2.halfHeight);
      } else {
        vx = r1.centerX - r2.centerX;
        vy = r1.centerY - r2.centerY;
      }

      
      combinedHalfWidths = r1.halfWidth + r2.halfWidth;
      combinedHalfHeights = r1.halfHeight + r2.halfHeight;

      
      if (Math.abs(vx) < combinedHalfWidths) {

        
        if (Math.abs(vy) < combinedHalfHeights) {

          
          hit = true;
        } else {

          
          hit = false;
        }
      } else {

        
        hit = false;
      }

      
      return hit;
    };

  

    ga.hitTestCircleRectangle = function (c1, r1, global) {

      var region, collision, c1x, c1y, r1x, r1y;

      
      if (global === undefined) global = false;

      
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

      
      if (c1y < r1y - r1.halfHeight) {

        
        
        
        
        
        
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

      
      
      else if (c1y > r1y + r1.halfHeight) {

        
        
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

      
      
      else {
        if (c1x < r1x - r1.halfWidth) {
          region = "leftMiddle";
        }
        else {
          region = "rightMiddle";
        }
      }

      
      
      if (region === "topMiddle"
        || region === "bottomMiddle"
        || region === "leftMiddle"
        || region === "rightMiddle") {

        
        collision = ga.hitTestRectangle(c1, r1, global);
      }

      
      
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

        
        collision = ga.hitTestCirclePoint(c1, point, global);
      }

      
      
      if (collision) {
        return region;
      } else {
        return collision;
      }
    };

  

    ga.hitTestCirclePoint = function (c1, point, global) {

      
      if (global === undefined) global = false;

      
      
      
      
      point.diameter = 1;
      point.radius = 0.5;
      point.centerX = point.x;
      point.centerY = point.y;
      point.gx = point.x;
      point.gy = point.y;
      return ga.hitTestCircle(c1, point, global);
    };

  

    ga.rectangleCollision = function (r1, r2, bounce, global) {
      var collision, combinedHalfWidths, combinedHalfHeights,
        overlapX, overlapY, vx, vy;

      
      if (bounce === undefined) bounce = false;

      
      if (global === undefined) global = false;

      
      if (global) {
        vx = (r1.gx + r1.halfWidth) - (r2.gx + r2.halfWidth);
        vy = (r1.gy + r1.halfHeight) - (r2.gy + r2.halfHeight);
      } else {
        vx = r1.centerX - r2.centerX;
        vy = r1.centerY - r2.centerY;
      }

      
      combinedHalfWidths = r1.halfWidth + r2.halfWidth;
      combinedHalfHeights = r1.halfHeight + r2.halfHeight;

      
      if (Math.abs(vx) < combinedHalfWidths) {

        
        
        if (Math.abs(vy) < combinedHalfHeights) {

          
          
          overlapX = combinedHalfWidths - Math.abs(vx);
          overlapY = combinedHalfHeights - Math.abs(vy);

          
          
          

          if (overlapX >= overlapY) {

            
            
            if (vy > 0) {
              collision = "top";

              
              r1.y = r1.y + overlapY;
            } else {
              collision = "bottom";

              
              r1.y = r1.y - overlapY;
            }
            
            if (bounce) {
              r1.vy *= -1;

            
            }
          } else {

            
            
            if (vx > 0) {
              collision = "left";

              
              r1.x = r1.x + overlapX;
            } else {
              collision = "right";

              
              r1.x = r1.x - overlapX;
            }

            
            if (bounce) {
              r1.vx *= -1;

            
            }
          }
        } else {

          
        }
      } else {

        
      }

      
      
      return collision;
    }

  

    ga.circleCollision = function (c1, c2, bounce, global) {
      var magnitude, combinedRadii, overlap,
        vx, vy, dx, dy, s = {},
        hit = false;

      
      if (bounce === undefined) bounce = true;

      
      if (global === undefined) global = false;

      

      if (global) {

        
        vx = (c2.gx + c2.radius) - (c1.gx + c1.radius);
        vy = (c2.gy + c2.radius) - (c1.gy + c1.radius);
      } else {

        
        vx = c2.centerX - c1.centerX;
        vy = c2.centerY - c1.centerY;
      }

      
      
      magnitude = Math.sqrt(vx * vx + vy * vy);

      
      combinedRadii = c1.radius + c2.radius;

      
      if (magnitude < combinedRadii) {

        
        hit = true;

        
        overlap = combinedRadii - magnitude;

        
        
        
        
        
        
        var quantumPadding = 0.3;
        overlap += quantumPadding;

        
        
        dx = vx / magnitude;
        dy = vy / magnitude;

        
        
        
        c1.x -= overlap * dx;
        c1.y -= overlap * dy;

        
        if (bounce) {
          
          
          
          s.x = vy;
          s.y = -vx;

          
          bounceOffSurface(c1, s);
        } else {
        
        }
      }

      return hit;
    };

  

    ga.movingCircleCollision = function (c1, c2, global) {
      var combinedRadii, overlap, xSide, ySide,
        
        s = {},
        p1A = {}, p1B = {}, p2A = {}, p2B = {},
        hit = false;

      
      c1.mass = c1.mass || 1;
      c2.mass = c2.mass || 1;

      
      if (global === undefined) global = false;

      
      if (global) {

        
        s.vx = (c2.gx + c2.radius) - (c1.gx + c1.radius);
        s.vy = (c2.gy + c2.radius) - (c1.gy + c1.radius);
      } else {

        
        s.vx = c2.centerX - c1.centerX;
        s.vy = c2.centerY - c1.centerY;
      }

      
      
      s.magnitude = Math.sqrt(s.vx * s.vx + s.vy * s.vy);

      
      combinedRadii = c1.radius + c2.radius;

      
      if (s.magnitude < combinedRadii) {

        
        hit = true;

        
        overlap = combinedRadii - s.magnitude;

        
        overlap += 0.3;

        
        
        s.dx = s.vx / s.magnitude;
        s.dy = s.vy / s.magnitude;

        
        
        s.vxHalf = Math.abs(s.dx * overlap / 2);
        s.vyHalf = Math.abs(s.dy * overlap / 2);

        
        (c1.x > c2.x) ? xSide = 1 : xSide = -1;
        (c1.y > c2.y) ? ySide = 1 : ySide = -1;

        
        
        
        c1.x = c1.x + (s.vxHalf * xSide);
        c1.y = c1.y + (s.vyHalf * ySide);

        
        c2.x = c2.x + (s.vxHalf * -xSide);
        c2.y = c2.y + (s.vyHalf * -ySide);

        

        
        s.lx = s.vy;
        s.ly = -s.vx;

        

        
        var dp1 = c1.vx * s.dx + c1.vy * s.dy;

        
        p1A.x = dp1 * s.dx;
        p1A.y = dp1 * s.dy;

        
        var dp2 = c1.vx * (s.lx / s.magnitude) + c1.vy * (s.ly / s.magnitude);

        
        p1B.x = dp2 * (s.lx / s.magnitude);
        p1B.y = dp2 * (s.ly / s.magnitude);

        

        
        var dp3 = c2.vx * s.dx + c2.vy * s.dy;

        
        p2A.x = dp3 * s.dx;
        p2A.y = dp3 * s.dy;

        
        var dp4 = c2.vx * (s.lx / s.magnitude) + c2.vy * (s.ly / s.magnitude);

        
        p2B.x = dp4 * (s.lx / s.magnitude);
        p2B.y = dp4 * (s.ly / s.magnitude);

        
        
        
        c1.bounce = {};
        c1.bounce.x = p1B.x + p2A.x;
        c1.bounce.y = p1B.y + p2A.y;

        
        
        c2.bounce = {};
        c2.bounce.x = p1A.x + p2B.x;
        c2.bounce.y = p1A.y + p2B.y;

        
        
        c1.vx = c1.bounce.x / c1.mass;
        c1.vy = c1.bounce.y / c1.mass;
        c2.vx = c2.bounce.x / c2.mass;
        c2.vy = c2.bounce.y / c2.mass;
      }
      return hit;
    };

    
  

    ga.multipleCircleCollision = function (arrayOfCircles, global) {

      
      if (global === undefined) global = false;

      
      for (var i = 0; i < arrayOfCircles.length; i++) {

        
        var c1 = arrayOfCircles[i];
        for (var j = i + 1; j < arrayOfCircles.length; j++) {

          
          var c2 = arrayOfCircles[j];

          
          
          
          ga.movingCircleCollision(c1, c2, global);
        }
      }
    };

  

    ga.circlePointCollision = function (c1, point, bounce, global) {

      
      if (global === undefined) global = false;
      if (bounce === undefined) bounce = false;

      
      
      
      
      point.diameter = 1;
      point.radius = 0.5;
      point.centerX = point.x;
      point.centerY = point.y;
      point.gx = point.x;
      point.gy = point.y;
      return ga.circleCollision(c1, point, bounce, global);
    }

  

    ga.circleRectangleCollision = function (c1, r1, bounce, global) {

      var region, collision, c1x, c1y, r1x, r1y;

      
      if (global === undefined) global = false;
      if (bounce === undefined) bounce = false;

      
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

      
      if (c1y < r1y - r1.halfHeight) {

        
        
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

      
      
      else if (c1y > r1y + r1.halfHeight) {

        
        
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

      
      
      else {
        if (c1x < r1x - r1.halfWidth) {
          region = "leftMiddle";
        }
        else {
          region = "rightMiddle";
        }
      }

      
      
      if (region === "topMiddle"
        || region === "bottomMiddle"
        || region === "leftMiddle"
        || region === "rightMiddle") {

        
        collision = ga.rectangleCollision(c1, r1, bounce, global);
      }

      
      
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

        
        collision = ga.circlePointCollision(c1, point, bounce, global);
      }

      if (collision) {
        return region;
      } else {
        return collision;
      }
    }

  

    function bounceOffSurface(o, s) {
      var dp1, dp2,
        p1 = {},
        p2 = {},
        bounce = {},
        mass = o.mass || 1;

      
      
      s.lx = s.y;
      s.ly = -s.x;

      
      s.magnitude = Math.sqrt(s.x * s.x + s.y * s.y);

      
      s.dx = s.x / s.magnitude;
      s.dy = s.y / s.magnitude;

      

      
      dp1 = o.vx * s.dx + o.vy * s.dy;

      
      p1.vx = dp1 * s.dx;
      p1.vy = dp1 * s.dy;

      
      dp2 = o.vx * (s.lx / s.magnitude) + o.vy * (s.ly / s.magnitude);

      
      p2.vx = dp2 * (s.lx / s.magnitude);
      p2.vy = dp2 * (s.ly / s.magnitude);

      
      p2.vx *= -1;
      p2.vy *= -1;

      
      bounce.x = p1.vx + p2.vx;
      bounce.y = p1.vy + p2.vy;

      
      
      o.vx = bounce.x / mass;
      o.vy = bounce.y / mass;
    }

  

    ga.hit = function (a, b, react, bounce, global, extra) {
      var collision;

      
      react = react || false;
      bounce = bounce || false;
      global = global || false;

      
      if (b instanceof Array || a instanceof Array) {

        
        spriteVsArray();
      } else {

        
        
        collision = findCollisionType(a, b);
        if (collision && extra) extra(collision);
      }

      
      
      
      
      
      return collision;

      function findCollisionType(a, b) {

        
        
        
        var aIsASprite = a.parent !== undefined,
          bIsASprite = b.parent !== undefined;

        if (aIsASprite && bIsASprite) {

          
          if (a.diameter && b.diameter) {

            
            return circleVsCircle(a, b);
          }
          else if (a.diameter && !b.diameter) {

            
            return circleVsRectangle(a, b);
          }
          else {

            
            return rectangleVsRectangle(a, b);
          }
        }

        
        
        else if (bIsASprite && !(a.x === undefined) && !(a.y === undefined)) {

          
          return ga.hitTestPoint(a, b);
        }
        else {
          
          throw new Error("I'm sorry, " + a + " and " + b + " cannot be use together in a collision test.");
        }
      }

      function spriteVsArray() {

        
        if (a instanceof Array) {
          var temp = a;
          b = a;
          a = temp;
        }

        
        for (var i = b.length - 1; i >= 0; i--) {
          var sprite = b[i];
          collision = findCollisionType(a, sprite);
          if (collision && extra) extra(collision, sprite);
        }
      }

      function circleVsCircle(a, b) {

        
        
        if (!react) {
          return ga.hitTestCircle(a, b, global);
        }

        
        else {

          
          if (a.vx + a.vy !== 0 && b.vx + b.vy !== 0) {

            
            
            
            return ga.movingCircleCollision(a, b, global);
          }
          else {

            
            return ga.circleCollision(a, b, bounce, global);
          }
        }
      }

      function rectangleVsRectangle(a, b) {

        
        
        if (!react) {
          return ga.hitTestRectangle(a, b, global);
        }
        
        else {

          
          
          if (bounce) {
            return ga.rectangleCollision(a, b, true, global);
          }
          
          else {
            return ga.rectangleCollision(a, b, false, global);
          }
        }
      }

      function circleVsRectangle(a, b) {

        
        
        if (!react) {
          return ga.hitTestCircleRectangle(a, b, global);
        }
        else {
          return ga.circleRectangleCollision(a, b, bounce, global);
        }
      }
    };

    
  

  

    
  


    
  
    ga.requestFullScreen = function () {
      if (!document.fullscreenEnabled) {
        ga.canvas.requestFullscreen();
      }
    };

    
    
    ga.exitFullScreen = function () {
      if (document.fullscreenEnabled) {
        document.exitFullscreen();
      }
    };

    
    
    
    
    
    ga.alignFullscreen = function () {
      var scaleX, scaleY;

      
      
      scaleX = screen.width / ga.canvas.width;
      scaleY = screen.height / ga.canvas.height;

      
      ga.fullscreenScale = Math.min(scaleX, scaleY);

      
      
      
      
      
      var styleSheets = document.styleSheets;
      if (styleSheets.length === 0) {
        var divNode = document.createElement("div");
        divNode.innerHTML = "<style></style>";
        document.body.appendChild(divNode);
      }

      
      
      
      
      var ua = navigator.userAgent.toLowerCase();

      
      
      

      if (ga.canvas.width > ga.canvas.height) {

        
        
        
        
        
        
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

    
  
    ga.enableFullscreen = function (exitKeyCodes) {

      
      if (exitKeyCodes) exitKeyCodes = Array.prototype.slice.call(arguments);

      
      ga.alignFullscreen();

      
      
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
    // ga.updateFunctions.push(ga.scaleFullscreen);
  };
export default plugins