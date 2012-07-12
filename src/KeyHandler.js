
var keyHandler = (function(window, document, undefined){

    var activeKeys = [];
    var keyDownCallback = function(){};
    var keyUpCallback = function(){};

    var keyMap = {
        13: 'ENTER',
        16: 'SHIFT',
        17: 'CTRL',
        18: 'ALT',
        37: 'LEFT',
        38: 'UP',
        39: 'RIGHT',
        40: 'DOWN',
        224: 'META'
    };

    var identifyKey = function(ev){
        var code, key;
        if (ev.wich) {
            code = ev.which;
        }
        else if (ev.keyCode) {
            code = ev.keyCode;
        }
        else {
            return;
        }

        if (code in keyMap){
            key = keyMap[code];
        } else {
            key = String.fromCharCode(code);
        }

        return key;
    };

    var isKeyActive = function(key)
    {
        return (activeKeys.indexOf(key) >= 0);
    };

    window.addEventListener('keydown', function(ev){
        var key = identifyKey(ev);
        
        if (isKeyActive(key)) {
            return;
        }

        activeKeys.push(key);
        keyDownCallback(key);
    });

    window.addEventListener('keyup', function(ev){
        var key = identifyKey(ev);
        var idx = activeKeys.indexOf(key);

        if (idx >= 0) {
            activeKeys.splice(idx, 1);
        }
        keyUpCallback(key);
    });

    return {
        getActiveKeys: function() {
            return activeKeys;
        },
        isKeyActive: isKeyActive,
        onKeyDown: function(callback) {
            keyDownCallback = callback;
        },
        onKeyUp: function(callback) {
            keyUpCallback = callback;
        }
    };
}(window, document));
