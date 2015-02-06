(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({"./src/js/index.js":[function(require,module,exports){
var Chemicals = require('./Chemicals');

document.addEventListener('DOMContentLoaded', function() {
    // The chemicals between us...
    new Chemicals();
});

},{"./Chemicals":"c:\\Users\\Chris\\projects\\screensaver-chemicals\\src\\js\\Chemicals.js"}],"c:\\Users\\Chris\\projects\\screensaver-chemicals\\node_modules\\dom-pool\\Pool.js":[function(require,module,exports){
function Pool(params) {
    this.storage = [];
    this.tagName = params.tagName;
    this.namespace = params.namespace;
}

Pool.prototype.push = function(el) {
    if (el.tagName !== this.tagName) {
        return;
    }

    this.storage.push(el);
}

Pool.prototype.pop = function(argument) {
    if (this.storage.length === 0) {
        return this.create();
    } else {
        return this.storage.pop();
    }
}

Pool.prototype.create = function() {
    if (this.namespace) {
        return document.createElementNS(this.namespace, this.tagName);
    } else {
        return document.createElement(this.tagName);
    }
}

Pool.prototype.allocate = function(size) {
    if (this.storage.length >= size) {
        return;
    }

    var difference = size - this.storage.length;
    for (var i = 0; i < difference; i++) {
        this.storage.push(this.create());
    }
}

module.exports = Pool;

},{}],"c:\\Users\\Chris\\projects\\screensaver-chemicals\\src\\js\\Chemical.js":[function(require,module,exports){
var colors = [
    '099BCC',
    '24FFBE',
    '358099',
    'CC093C',
    'FF6F64',
];
function getRandomColor() {
    var key = Math.floor(Math.random() * colors.length);
    return colors[key];
}

function Chemical(params) {
    this.endX = params.endX;
    this.endY = params.endY;
    this.pool = params.pool;
    this.queue = params.queue;
    this.size = params.size;
    this.startX = params.startX;
    this.startY = params.startY;
    this.target = params.target;

    this.setTimers();
    this.setupDOMNode();
}

Chemical.prototype.setupDOMNode = function() {
    this.el = this.pool.pop();

    var color = '#' + getRandomColor();
    this.el.style.backgroundColor = color;
    this.el.style.boxShadow = '0 0 ' + (30 + (this.size / 10)) + 'px ' + color;
    this.el.style.width = this.el.style.height = this.size + 'px';

    var translate =
        'translate3d(' +
            this.startX + 'px,' +
            this.startY + 'px,' +
            '0' +
        ')';

    this.el.style.transform = this.el.style.webkitTransform = translate;
    this.el.style.opacity = 0;
    this.el.removeAttribute('class');

    this.target.appendChild(this.el);
};

Chemical.prototype.setTimers = function() {
    var now = Date.now();

    this.queue.set({
        callback: this.animateIn,
        context: this,
        time: now + 20,
    });

    this.queue.set({
        callback: this.animateOut,
        context: this,
        time: now + 2040,
    });

    this.queue.set({
        callback: this.destroy,
        context: this,
        time: now + 2560,
    });
};

Chemical.prototype.animateIn = function() {
    var translate =
        'translate3d(' +
            this.endX + 'px,' +
            this.endY + 'px,' +
            '0' +
        ')';

    this.el.style.transform = this.el.style.webkitTransform = translate;
    this.el.style.opacity = 1;
}

Chemical.prototype.animateOut = function() {
    this.el.setAttribute('class', 'animate-out');
    this.el.style.opacity = 0;
}

Chemical.prototype.destroy = function() {
    this.pool.push(this.el);
    this.target.removeChild(this.el);
}

module.exports = Chemical;

},{}],"c:\\Users\\Chris\\projects\\screensaver-chemicals\\src\\js\\Chemicals.js":[function(require,module,exports){
var Pool = require('dom-pool');
var TimeQueue = require('./time-queue');
var Chemical = require('./Chemical');

function Chemicals() {
    this.lastFrames = [];

    this.createChemicalDelay = 128;

    this.target = document.querySelector('.chemicals');

    this.queue = new TimeQueue();

    this.pool = new Pool({
        tagName: 'div'
    });
    this.pool.allocate(100);

    this.requestAnimationFrame = this.requestAnimationFrame.bind(this);
    this.requestAnimationFrame();

    this.queueDisplayFPS();
    this.queueCreateChemical();
}

Chemicals.prototype.queueCreateChemical = function() {
    this.queue.set({
        callback: this.createChemical,
        context: this,
        time: Date.now() + this.createChemicalDelay,
    });
};

Chemicals.prototype.requestAnimationFrame = function() {
    requestAnimationFrame(this.requestAnimationFrame);
    this.queue.tick();
    this.calculateFPS();
};

Chemicals.prototype.calculateFPS = function() {
    if (this.lastFrames.length > 60) {
        this.lastFrames.shift();
    }

    this.lastFrames.push(Date.now());
}

Chemicals.prototype.createChemical = function() {
    new Chemical({
        endX: rand(innerWidth),
        endY: rand(innerHeight),
        pool: this.pool,
        queue: this.queue,
        size: rand(60) + 20,
        startX: rand(innerWidth),
        startY: rand(innerHeight),
        target: this.target,
    });

    this.queueCreateChemical();
};

Chemicals.prototype.queueDisplayFPS = function() {
    this.queue.set({
        callback: this.displayFPS,
        context: this,
        time: Date.now() + 1000,
    });
};

Chemicals.prototype.displayFPS = function() {
    var length = this.lastFrames.length;
    var difference = (this.lastFrames[length - 1] - this.lastFrames[0]) / (length - 1);
    var fps = 1000 / difference;
    console.log(fps);

    if (fps < 55 && this.createChemicalDelay < 1000) {
        this.createChemicalDelay += 10;
        // console.log('Added 10ms to this.createChemicalDelay');
        // console.log('this.createChemicalDelay:', this.createChemicalDelay);
    } else if (fps > 59 && this.createChemicalDelay > 32) {
        this.createChemicalDelay -= 1;
        // console.log('Removed 1ms from this.createChemicalDelay');
        // console.log('this.createChemicalDelay:', this.createChemicalDelay);
    }

    this.queueDisplayFPS();
};

function rand(maximum) {
    return Math.floor(Math.random() * (maximum + 1));
}

module.exports = Chemicals;

},{"./Chemical":"c:\\Users\\Chris\\projects\\screensaver-chemicals\\src\\js\\Chemical.js","./time-queue":"c:\\Users\\Chris\\projects\\screensaver-chemicals\\src\\js\\time-queue.js","dom-pool":"c:\\Users\\Chris\\projects\\screensaver-chemicals\\node_modules\\dom-pool\\Pool.js"}],"c:\\Users\\Chris\\projects\\screensaver-chemicals\\src\\js\\time-queue.js":[function(require,module,exports){
function TimeQueue() {
    this.queue = [];
}

TimeQueue.prototype.set = function(params) {
    this.queue.push(new TimeQueueItem(params));
};

TimeQueue.prototype.tick = function() {
    var now = Date.now();

    for (var i = (this.queue.length - 1); i > -1; i--) {
        if (now < this.queue[i].time) {
            continue;
        }

        this.queue[i].callback.call(this.queue[i].context);
        this.queue.splice(i, 1);
    }
};



function TimeQueueItem(params) {
    this.callback = params.callback;
    this.context = params.context || this;
    this.time = params.time;
}



module.exports = TimeQueue;

},{}]},{},["./src/js/index.js"]);
