// import * as THREE from 'https://cdn.skypack.dev/three@0.131.3/build/three.module.js';
// import { InteractionManager } from "https://cdn.skypack.dev/three.interactive";
// import { OrbitControls } from 'https://cdn.skypack.dev/three@0.131.3/examples/jsm/controls/OrbitControls.js';

import * as THREE from 'three';
import { InteractionManager } from "three.interactive";
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

// Setup threejs vars
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );
const renderer = new THREE.WebGLRenderer({
  canvas: document.querySelector( '#background' ),
});
const interactionManager = new InteractionManager(
  renderer,
  camera,
  renderer.domElement
);
const controls = new OrbitControls(camera, renderer.domElement);

// My Vars
var planets = [];
var time = 0;
var cameraState = 0;
var focusedPlanetPosition = new THREE.Vector3();
var smoothAlpha = 0;
const cameraStartPosition = new THREE.Vector3(0, 75, 100);

// Setup scene/camera/controls
renderer.setPixelRatio( window.devicePixelRatio );
renderer.setSize( window.innerWidth, window.innerHeight );
camera.position.copy(cameraStartPosition);
// camera.lookAt(0, 0, 0);
renderer.render( scene, camera );
controls.enabled = false;
controls.autoRotate = true;
controls.autoRotateSpeed = -1;
controls.maxPolarAngle = THREE.MathUtils.degToRad(50);
controls.saveState();



function addStar() {
  const geometry = new THREE.SphereGeometry(0.25, 24, 24);
  const material = new THREE.MeshBasicMaterial();
  const star = new THREE.Mesh( geometry, material );

  const [x, y, z] = [
    Array(1).fill().map(() => THREE.MathUtils.randFloatSpread(350)),
    Array(1).fill().map(() => THREE.MathUtils.randFloatSpread(200)),
    Array(1).fill().map(() => THREE.MathUtils.randFloatSpread(350))
  ];

  star.position.set(x, y, z);
  scene.add(star);
  scene.at
}

function addPlanet(mesh, orbitRadius, orbitSpeed, num) {
  // Make the Planet
  var planet = mesh;
  planet.userData.orbitRadius = orbitRadius;
  planet.userData.orbitSpeed = orbitSpeed;
  planet.userData.focused = false;
  planet.userData.num = num;
  planet.addEventListener("click", (event) => {
    event.stopPropagation();
    if (planet.userData.focused == true) {
      planet.userData.focused = false;
      controls.maxDistance = Infinity;
      controls.reset();
      console.log(`${num} was clicked and reset.`);
    } else {
      console.log(`${num} was clicked and focused.`);
      unfocusAllPlanets();
      smoothAlpha = 0;
      controls.maxDistance = 10;
      planet.userData.focused = true;
    }
  });
  interactionManager.add(planet);
  planets.push(planet);
  scene.add(planet);

  // Make the Orbit
  var orbitPath = new THREE.Shape();
  orbitPath.moveTo(orbitRadius, 0);
  orbitPath.absarc(0, 0, orbitRadius, 0, 2 * Math.PI, false);
  var orbitGeometry = new THREE.BufferGeometry().setFromPoints(orbitPath.getSpacedPoints(200));
  orbitGeometry.rotateX(THREE.Math.degToRad(90));
  var orbit = new THREE.Line(orbitGeometry, new THREE.LineBasicMaterial({
    color: "white"
  }));
  scene.add(orbit);
}

function unfocusAllPlanets() {
  planets.forEach(function(planet) {
    planet.userData.focused = false;
  });
}

function onWindowResize() {
	camera.aspect = window.innerWidth / window.innerHeight;
	camera.updateProjectionMatrix();
	renderer.setSize( window.innerWidth, window.innerHeight );
}

window.addEventListener( 'resize', onWindowResize, false );

// Scene elements
const geometry = new THREE.TorusGeometry( 10, 3, 16, 100 );
const material = new THREE.MeshStandardMaterial( { color: 0xFF6347 } );
const torus = new THREE.Mesh( geometry, material );

scene.add( torus );

// const pointLight = new THREE.PointLight(0xffffff);
// pointLight.position.set(5, 5, 5);
// scene.add(pointLight);

const ambientLight = new THREE.AmbientLight(0xffffff);
scene.add(ambientLight);

// const lightHelper = new THREE.PointLightHelper(pointLight);
// const gridHelper = new THREE.GridHelper(200, 50);
// scene.add(lightHelper, gridHelper);

// Moon
const moonTexture = new THREE.TextureLoader().load('moon.jpg');
// const moonNormal = new THREE.TextureLoader().load('normal.jpg');

const moon = new THREE.Mesh(
  new THREE.SphereBufferGeometry(5, 32, 32),
  new THREE.MeshStandardMaterial( {
    map: moonTexture
    // , normalMap: moonNormal
  })
);
// scene.add(moon);

Array(650).fill().forEach(addStar);
addPlanet(moon.clone(true), 20, 5, 1);
addPlanet(moon.clone(true), 40, 3, 2);
addPlanet(moon.clone(true), 50, 2, 3);
addPlanet(moon.clone(true), 70, 0.5, 4);

function focusOffset() {

}

function animate() {
  requestAnimationFrame(animate);
  time = Date.now() * 0.0001;

  // Animate Torus
  torus.rotation.x += 0.01;
  torus.rotation.y += 0.005;
  torus.rotation.z += 0.01;

  // Animate Planets
  planets.forEach(function(planet) {
    planet.position.x = Math.cos(time * planet.userData.orbitSpeed) * planet.userData.orbitRadius;
    planet.position.z = Math.sin(time * planet.userData.orbitSpeed) * planet.userData.orbitRadius;

    if (planet.userData.focused) {
      planet.getWorldPosition(focusedPlanetPosition);

      // controls.target = focusedPlanetPosition;
      controls.target.lerp(focusedPlanetPosition, smoothAlpha);
      if (smoothAlpha < 1) {
        // smoothAlpha += ((time * 0.000000001) ** 3) / 6;
        smoothAlpha += (time * 0.000000001) ** 3 / 6;
      } else {
        smoothAlpha = 1;
      }
      
      console.log(smoothAlpha);
      // var oldTargetPos = controls.target.clone();
      // controls.target = focusedPlanetPosition;
      // var dPosition = oldTargetPos.sub(controls.target);
      // camera.position.sub(dPosition);

      // controls.autoRotate = false;
      // camera.position.copy(focusOffset(focusedPlanetPosition));
      // console.log(`${planet.userData.num} is focused.`);
    }
  })

  // Camera Animation
  // if (cameraState == 0) {
  //   camera.position.setX(cameraStartX + Math.cos(time) * cameraXAmplitude)
  // }

  interactionManager.update();
  controls.update();
  renderer.render( scene, camera );
}

animate();
