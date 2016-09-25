// Particle background
function ParticleBackground() {
    this.iosClickTimeout = 0;
    this.isAnimating = false;
    this.particleContainer = document.querySelector('.particles');

    this.addEventListeners();
    this.createParticles();
}

ParticleBackground.prototype.addEventListeners = function() {
    document.body.addEventListener('mousedown', this.onMouseDown.bind(this), false);
    document.body.addEventListener('touchstart', this.onTouchStart.bind(this), true);
};

ParticleBackground.prototype.createParticles = function(i) {
    for (var i = 0; i < 100; i++) {
        this.createParticle(i);
    }
};

ParticleBackground.prototype.createParticle = function(i) {
    var el = document.createElement('div');
    el.classList.add('particle');
    this.particleContainer.appendChild(el);
    
    var circle = document.createElement('div');
    circle.classList.add('circle');
    circle.classList.add('animated');
    el.appendChild(circle);

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
};

ParticleBackground.prototype.onTouchStart = function(e) {
    e.stopPropagation();
    if (this.isAnimating) {
        return;
    }

    // Debounce
    clearTimeout(this.iosClickTimeout);
    this.iosClickTimeout = setTimeout(this.onMouseDown.bind(this, e), 100);

    // Mimic mouse event
    e.clientX = e.touches[0].clientX;
    e.clientY = e.touches[0].clientY;
};

ParticleBackground.prototype.onMouseDown = function(e) {
    if (this.isAnimating) {
        return;
    }

    const column = e.clientX / window.innerWidth * 10 | 0;
    const row = e.clientY / window.innerHeight * 10 | 0;
    const index = row * 10 + column;
    const node = this.particleContainer.children[index];

    this.isAnimating = true;
    this.createWave(node.meta.column, node.meta.row);
    setTimeout(this.cleanParticles.bind(this), 1500);
};

ParticleBackground.prototype.cleanParticles = function() {
    for (let i = 0; i < this.particleContainer.children.length; i++) {
        const node = this.particleContainer.children[i].firstElementChild;
        node.style.animationName = '';
    }

    this.isAnimating = false;
};

ParticleBackground.prototype.positionIsValid = function(column, row) {
    return !(
        column < 0 || column > 9
        ||
        row < 0 || row > 9
    );
};

ParticleBackground.prototype.animateParticle = function(column, row, delay) {
    const index = row * 10 + column;
    const node = this.particleContainer.children[index].firstElementChild;
    node.style.animationName = 'rubberBand';
    node.style.animationDelay = delay * 100 + 'ms';
};

ParticleBackground.prototype.createWave = function(column, row) {
    this.animateParticle(column, row, 0);
    for (let distance = 1; distance <= 9; distance++) {
        // Top left to right
        for (let i = column - distance; i < column + distance; i++) {
            if (!this.positionIsValid(i, row - distance)) {
                continue;
            }
            this.animateParticle(i, row - distance, distance);
        }

        // Top right to bottom
        for (let i = row - distance; i < row + distance; i++) {
            if (!this.positionIsValid(column + distance, i)) {
                continue;
            }
            this.animateParticle(column + distance, i, distance);
        }

        // Bottom right to left
        for (let i = column + distance; i > column - distance; i--) {
            if (!this.positionIsValid(i, row + distance)) {
                continue;
            }
            this.animateParticle(i, row + distance, distance);
        }

        // Bottom left to top
        for (let i = row + distance; i > row - distance; i--) {
            if (!this.positionIsValid(column - distance, i)) {
                continue;
            }
            this.animateParticle(column - distance, i, distance);
        }
    }
};

// Create background
const background = new ParticleBackground();
