var pool;

setTimeout(function() {
    pool = new Pool();
    pool.allocate(200);
    for (var i = 0; i < 100; i++) {
        createParticle(i);
    }
}, 50);

var container = document.querySelector('.particles');

function createParticle(i) {
    var el = pool.pop();
    var circle = pool.pop();
    circle.classList.add('circle');
    circle.classList.add('animated');
    el.appendChild(circle);
    el.classList.add('particle');
    container.appendChild(el);

    var column = i % 10 | 0;
    var row = i / 10 | 0;
    el.meta = {
        column: column,
        row: row,
    };
    el.style.transform = 'translate3d(' + (216 - column * 44) + 'px, ' + (212 - row * 44) + 'px, 0)';
    el.style.transitionDelay = (i * 4) + 'ms';
    el.offsetWidth = el.offsetWidth;
    el.style.opacity = 1;
    el.style.transform = 'translate3d(0, 0, 0)';
}

var iosClickTimeout = 0;
function onTouchStart(e) {
    e.stopPropagation();
    if (isAnimating) {
        return;
    }
    clearTimeout(iosClickTimeout);
    iosClickTimeout = setTimeout(onClick.bind(null, e), 100);

    // Polyfill touch event
    e.clientX = e.touches[0].clientX;
    e.clientY = e.touches[0].clientY;
}

var isAnimating = false;

function onClick(e) {
    if (isAnimating) {
        return;
    }

    var column = e.clientX / window.innerWidth * 10 | 0;
    var row = e.clientY / window.innerHeight * 10 | 0;
    var index = row * 10 + column;
    var node = container.children[index];

    isAnimating = true;
    createWave(node.meta.column, node.meta.row);
    setTimeout(onReadyToClean, 1500);
}

function onReadyToClean() {
    cleanParticles();
    isAnimating = false;
}

function cleanParticles() {
    for (var i = 0; i < container.children.length; i++) {
        var node = container.children[i].firstElementChild;
        node.style.animationName = '';
    }
}

function positionIsValid(column, row) {
    return !(
        column < 0 || column > 9
        ||
        row < 0 || row > 9
    );
}

function animateParticle(column, row, delay) {
    var index = row * 10 + column;
    
    var node = container.children[index].firstElementChild;
    node.style.animationName = 'rubberBand';
    node.style.animationDelay = delay * 100 + 'ms';
}

function createWave(column, row) {
    animateParticle(column, row, 0);
    for (var distance = 1; distance <= 9; distance++) {
        // Top left to right
        for (var i = column - distance; i < column + distance; i++) {
            if (!positionIsValid(i, row - distance)) {
                continue;
            }
            animateParticle(i, row - distance, distance);
        }

        // Top right to bottom
        for (var i = row - distance; i < row + distance; i++) {
            if (!positionIsValid(column + distance, i)) {
                continue;
            }
            animateParticle(column + distance, i, distance);
        }

        // Bottom right to left
        for (var i = column + distance; i > column - distance; i--) {
            if (!positionIsValid(i, row + distance)) {
                continue;
            }
            animateParticle(i, row + distance, distance);
        }

        // Bottom left to top
        for (var i = row + distance; i > row - distance; i--) {
            if (!positionIsValid(column - distance, i)) {
                continue;
            }
            animateParticle(column - distance, i, distance);
        }
    }
}

document.body.addEventListener('touchstart', onTouchStart, true);
document.body.addEventListener('mousedown', onClick, false);

class Pool {
    constructor(params) {
        this.storage = [];
        if (params) {
            if (params.tagName) {
                this.tagName = params.tagName.toLowerCase();
            }
            if (params.namespace) {
                this.namespace = params.namespace;
            }
        }
    }

    push(el) {
        if (el.tagName.toLowerCase() !== this.tagName) {
            return;
        }
        
        this.storage.push(el);
    }

    pop() {
        if (this.storage.length === 0) {
            return this.create();
        } else {
            return this.storage.pop();
        }
    }

    create() {
        if (this.namespace) {
            return document.createElementNS(this.namespace, this.tagName);
        } else {
            return document.createElement(this.tagName);
        }
    }

    allocate(size) {
        if (this.storage.length >= size) {
            return;
        }

        var difference = size - this.storage.length;
        for (var i = 0; i < difference; i++) {
            this.storage.push(this.create());
        }
    }
}

Pool.prototype.namespace = '';
Pool.prototype.tagName = 'div';
