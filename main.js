// import './style.css' // This line causes github pages to get angry...

import * as THREE from 'https://cdn.skypack.dev/three@0.131.3/build/three.module.js';
import { InteractionManager } from "https://cdn.skypack.dev/three.interactive";
import { OrbitControls } from 'https://cdn.skypack.dev/three@0.131.3/examples/jsm/controls/OrbitControls.js';

// import * as THREE from 'three';
// import { InteractionManager } from "three.interactive";
// import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

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

// Setup scene/camera
renderer.setPixelRatio( window.devicePixelRatio );
renderer.setSize( window.innerWidth, window.innerHeight );
camera.position.set(0, 75, 100);
// camera.lookAt(0, 0, 0);
renderer.render( scene, camera );
controls.enabled = false;
controls.autoRotate = true;
controls.autoRotateSpeed = -1;

// My Vars
var planets = [];
var time = 0;
var cameraState = 0;
var cameraStartX = 0;
var cameraStartY = 100;
var cameraStartZ = 50;

// Scene elements
const geometry = new THREE.TorusGeometry( 10, 3, 16, 100 );
const material = new THREE.MeshStandardMaterial( { color: 0xFF6347 } );
const torus = new THREE.Mesh( geometry, material );

scene.add( torus );

const pointLight = new THREE.PointLight(0xffffff);
pointLight.position.set(5, 5, 5);

const ambientLight = new THREE.AmbientLight(0xffffff);
scene.add( pointLight, ambientLight );

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
}

function addPlanet(mesh, orbitRadius, orbitSpeed, num) {
  // Make the Planet
  var planet = mesh;
  planet.userData.orbitRadius = orbitRadius;
  planet.userData.orbitSpeed = orbitSpeed;
  planet.addEventListener("click", (event) => {
    event.stopPropagation();
    console.log(`${num} was clicked.`);
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

Array(650).fill().forEach(addStar);
addPlanet(moon.clone(true), 20, 5, 1);
addPlanet(moon.clone(true), 40, 3, 2);
addPlanet(moon.clone(true), 50, 2, 3);
addPlanet(moon.clone(true), 70, 0.5, 4);

function animate() {
  requestAnimationFrame( animate );
  time = Date.now() * 0.0001;

  torus.rotation.x += 0.01;
  torus.rotation.y += 0.005;
  torus.rotation.z += 0.01;

  planets.forEach(function(planet) {
    planet.position.x = Math.cos(time * planet.userData.orbitSpeed) * planet.userData.orbitRadius;
    planet.position.z = Math.sin(time * planet.userData.orbitSpeed) * planet.userData.orbitRadius;
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