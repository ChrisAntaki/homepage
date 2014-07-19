require({
    baseUrl: 'js',
    // three.js should have UMD support soon, but it currently does not
    shim: {
        'vendor/underscore': {
            exports: '_'
        },
        'vendor/three': {
            exports: 'THREE'
        },
        'vendor/threex.domevents': {
            exports: 'THREEx'
        },
        'vendor/threex.keyboardstate': {
            exports: 'THREEx'
        },
        'vendor/threex.windowresize': {
            exports: 'THREEx'
        }
    }
}, [
    'vendor/underscore',
    'vendor/three',
    'vendor/threex.domevents',
    'vendor/threex.keyboardstate',
    'vendor/threex.windowresize'
], function(_, THREE, THREEx) {

var camera,
    domEvents,
    keyboard,
    projector,
    renderer,
    scene;

var boxes = [];

var accelerations = {
    x: 0,
    y: 1.2,
    z: 0
};

var velocities = {
    x: 0,
    y: 3,
    z: 0
};

init();
listenToAcceleration();
addParticles();
animate();

function init() {

    projector = new THREE.Projector();

    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 1, 10000);
    camera.position.z = 500;

    scene = new THREE.Scene();

    scene.fog = new THREE.FogExp2(0x000000, 0.001);

    renderer = new THREE.WebGLRenderer({
        alpha: true,
        antialiasing: true
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    // renderer.setClearColor( 0xffffff, 1);

    document.body.appendChild(renderer.domElement);

    // Set up DOM events.
    domEvents = new THREEx.DomEvents(camera, renderer.domElement);

    // Set up Keyboard events.
    keyboard = new THREEx.KeyboardState();

    // Allow for browser resize events.
    var winResize   = new THREEx.WindowResize(renderer, camera)

}


function addParticles() {
    // create the particle variables
    window.particleCount = 600;
    window.particles = new THREE.Geometry();
    window.pMaterial = new THREE.ParticleBasicMaterial({
        color: 0xFFFFFF,
        size: 10,
        map: THREE.ImageUtils.loadTexture(
            "images/particle.png"
        ),
        blending: THREE.AdditiveBlending,
        transparent: true
    });

    pMaterial.opacity = 0;

    // now create the individual particles
    for(var p = 0; p < particleCount; p++) {

        // create a particle with random
        // position values, -250 -> 250
        var amount = window.innerHeight;
        var pX = Math.random() * 2 * amount - (amount),
            pY = Math.random() * 2 * amount - (amount),
            pZ = Math.random() * 2 * amount - (amount),
            particle = new THREE.Vector3(pX, pY, pZ);

        // create a velocity vector
        particle.velocity = new THREE.Vector3(
            0,              // x
            -Math.random(), // y
            0);             // z

        // add it to the geometry
        particles.vertices.push(particle);
    }

    // create the particle system
    window.particleSystem = new THREE.ParticleSystem(particles, pMaterial);

    particleSystem.sortParticles = true;

    // add it to the scene
    scene.add(particleSystem);
}

function animate() {
    var spinModifier = 0.001;
    if (keyboard.pressed("c")) {
        spinModifier = 0.005;
    }

    if (window.orientation === 90) {
        velocities.y += accelerations.x * 0.1;
    } else if (window.orientation === -90) {
        velocities.y -= accelerations.x * 0.1;
    } else {
        velocities.y += accelerations.y * 0.1;
    }

    velocities.y *= 0.97;

    velocities.y = Math.min(velocities.y, 9);
    velocities.y = Math.max(velocities.y, -9);

    particleSystem.rotation.x -= velocities.y * spinModifier;

    if (pMaterial.opacity < 1) {
        pMaterial.opacity += 0.01;
    }

    renderer.render(scene, camera);

    // Repeat.
    requestAnimationFrame(animate);
}

function deviceMotionHandler(e) {
    accelerations = e.accelerationIncludingGravity;
}

function listenToAcceleration() {
    if (window.DeviceMotionEvent) {
        window.addEventListener('devicemotion', _.throttle(deviceMotionHandler, 200), false);
    }
}

});
