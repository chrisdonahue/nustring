(function () {
    // Shim by Paul Irish
    // http://paulirish.com/2011/requestanimationframe-for-smart-animating/
    window.requestAnimationFrame = (function () {
      return  window.requestAnimationFrame ||
              window.webkitRequestAnimationFrame ||
              window.mozRequestAnimationFrame ||
              window.oRequestAnimationFrame ||
              window.msRequestAnimationFrame ||
              function (callback) {
                  window.setTimeout(callback, 1000 / 60);
              };
    })();
    
    window.supportsCanvas = (function() {
        var elem = document.createElement('canvas');
        return !!(elem.getContext && elem.getContext('2d'));
    })();
    window.supportsTouchEvents = 'ontouchstart' in window || 'onmsgesturechange' in window;
    window.supportsWebAudio = 'AudioContext' in window || 'MozAudioContext' in window;
    window.supportsWebSocket = 'WebSocket' in window || 'MozWebSocket' in window;



    //window.abstract = function (abstractBaseClass, method) {return method;};

    var ObjectBase = window.ObjectBase = function () {};
    // stolen from backbone.js who stole it from goog.inherits
    ObjectBase.extend = function(protoProps, staticProps) {
        var parent = this;
        var child;

        // The constructor function for the new subclass is either defined by you
        // (the "constructor" property in your `extend` definition), or defaulted
        // by us to simply call the parent constructor.
        if (protoProps && _.has(protoProps, 'constructor')) {
            child = protoProps.constructor;
        } else {
            child = function(){ return parent.apply(this, arguments); };
        }

        // Add static properties to the constructor function, if supplied.
        _.extend(child, parent, staticProps);

        // Set the prototype chain to inherit from `parent`, without calling
        // `parent`'s constructor function and add the prototype properties.
        child.prototype = _.create(parent.prototype, protoProps);
        child.prototype.constructor = child;

        // Set a convenience property in case the parent's prototype is needed
        // later.
        child.__super__ = parent.prototype;

        return child;
    };

    window.mouseToTouchEvent = function (callback) {
        return function(event) {
            event.originalEvent.changedTouches = [];
            event.originalEvent.changedTouches.push({
                clientX: event.offsetX || -1,
                clientY: event.offsetY || -1,
                identifier: 'mouse'
            });
            callback(event);
        };
    }

    window.modPls = function (n, m) {
        return ((n % m) + m) % m;
    };

})();