// import * as THREE from 'https://cdn.skypack.dev/three@0.131.3/build/three.module.js';
// import { InteractionManager } from "https://cdn.skypack.dev/three.interactive";
// import { OrbitControls } from 'https://cdn.skypack.dev/three@0.131.3/examples/jsm/controls/OrbitControls.js';

import * as THREE from 'three';
import { InteractionManager } from "three.interactive";
// import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { SolarSystemManager } from "./SolarSystemManager"
import { CameraManager } from "./CameraManager"

// Setup threejs vars
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );
const renderer = new THREE.WebGLRenderer({canvas: document.querySelector( '#background' )});
const interactionManager = new InteractionManager(renderer, camera, renderer.domElement);
// const controls = new OrbitControls(camera, renderer.domElement);

const solarSystem = new SolarSystemManager();
const cameraManager = new CameraManager(camera);

// My Vars
// var planets = [];
var time = 0;
// var cameraFocused = false;
// var focusedPlanetPosition = new THREE.Vector3();
// const cameraStartPosition = new THREE.Vector3(0, 75, 100);
// const cameraStartLook = new THREE.Vector3(0, 0, 0);
// const cameraStartMaxDistance = 125;
// const focusedDistance = 10;
// var desiredCameraPosition = cameraStartPosition;
// var desiredCameraLook = cameraStartLook;
// var desiredCameraMaxDistance = cameraStartMaxDistance;
// const acceptableError = 5;
// var interpol = 0;

// const STATE = {
//   UNFOCUSED: 1,
//   TRANSITIONING: 2,
//   FOCUSED: 3
// }

init();
animate();

function init() {
  // // Setup scene/camera/controls
  renderer.setPixelRatio( window.devicePixelRatio );
  renderer.setSize( window.innerWidth, window.innerHeight );
  camera.look
  // camera.position.copy(cameraStartPosition);
  // // camera.lookAt(0, 0, 0);
  // controls.enabled = false;
  // controls.autoRotate = true;
  // controls.autoRotateSpeed = -1;
  // controls.maxPolarAngle = THREE.MathUtils.degToRad(50);
  // controls.maxDistance = desiredCameraMaxDistance;
  // // controls.saveState();
  window.addEventListener('resize', onWindowResize, false);

  // Torus
  const geometry = new THREE.TorusGeometry( 10, 3, 16, 100 );
  const material = new THREE.MeshStandardMaterial( { color: 0xFF6347 } );
  const torus = new THREE.Mesh( geometry, material );
  scene.add( torus );

  // Ambient Light
  const ambientLight = new THREE.AmbientLight(0xffffff);
  scene.add(ambientLight);

  // Moon Mesh
  const moonTexture = new THREE.TextureLoader().load('moon.jpg');
  const moon = new THREE.Mesh(
    new THREE.SphereBufferGeometry(5, 32, 32),
    new THREE.MeshStandardMaterial( {
      map: moonTexture
    })
  );

  // Make stars
  Array(650).fill().forEach(addStar);
  // Make Planets
  solarSystem.addPlanet(moon.clone(true), 20, 5, 1);
  solarSystem.addPlanet(moon.clone(true), 40, 3, 2);
  solarSystem.addPlanet(moon.clone(true), 50, 2, 3);
  solarSystem.addPlanet(moon.clone(true), 70, 0.5, 4);

  solarSystem.getPlanets().forEach(planet => {
    scene.add(planet.planetMesh);
    scene.add(planet.orbit);
    interactionManager.add(planet.planetMesh);
  });
}

function animate() {
  requestAnimationFrame(animate);
  time = Date.now() * 0.0001;

  // Animate Torus
  // torus.rotation.x += 0.01;
  // torus.rotation.y += 0.005;
  // torus.rotation.z += 0.01;

  // Animate Planets
  solarSystem.getPlanets().forEach(planet => {
    planet.planetMesh.position.x = Math.cos(time * planet.orbitSpeed) * planet.orbitRadius;
    planet.planetMesh.position.z = Math.sin(time * planet.orbitSpeed) * planet.orbitRadius;

    // if (planet.userData.focused) {
    //   planet.getWorldPosition(focusedPlanetPosition);

    //   // controls.target = focusedPlanetPosition;
    //   // controls.target.lerp(focusedPlanetPosition, smoothAlpha);
    //   desiredCameraLook = focusedPlanetPosition;
    //   // if (smoothAlpha < 1) {
    //   //   // smoothAlpha += ((time * 0.000000001) ** 3) / 6;
    //   //   smoothAlpha += (time * 0.000000001) ** 3 / 6;
    //   // } else {
    //   //   smoothAlpha = 1;
    //   // }
      
    //   // console.log(smoothAlpha);
    //   // var oldTargetPos = controls.target.clone();
    //   // controls.target = focusedPlanetPosition;
    //   // var dPosition = oldTargetPos.sub(controls.target);
    //   // camera.position.sub(dPosition);

    //   // controls.autoRotate = false;
    //   // camera.position.copy(focusOffset(focusedPlanetPosition));
    //   // console.log(`${planet.userData.num} is focused.`);
    // }
  });

  // Camera Animation
  // if (cameraState == 0) {
  //   camera.position.setX(cameraStartX + Math.cos(time) * cameraXAmplitude)
  // }
  
  interactionManager.update();
  cameraManager.update(solarSystem);
  // controls.update();
  renderer.render( scene, camera );
}

function interpolateCamera(){
  // Position
  
  if (!closeTo(camera.position, desiredCameraPosition)) {
    console.log(`${camera.position.toArray()} - ${desiredCameraPosition.toArray()}`);
    if (interpol < 1) {
      camera.position.lerp(desiredCameraPosition, interpol);
      interpol += 0.01;
      
    } else {
      camera.position.copy(desiredCameraPosition);
    }
  }

  // Look
  if (interpol < 1) {
    controls.target.lerp(desiredCameraLook, interpol);
    interpol += 0.01;
    // console.log(`${interpol} is int.`);
  } else {
    controls.target.copy(desiredCameraLook);
  }
  
  // Max Distance
  // if (cameraFocused == true) {
    if (cameraFocused == true) {
      if (interpol < 1) {
        controls.maxDistance = interpolateNum(controls.maxDistance, desiredCameraMaxDistance, interpol);
        interpol += 0.01;
      } else {
        controls.maxDistance = desiredCameraMaxDistance;
      }
    } else {
      controls.maxDistance = cameraStartMaxDistance;
    }
    
  // }
}

function closeTo(vector1, vector2) {
  var difference = new THREE.Vector3().subVectors(vector1, vector2);
  if(difference.x > acceptableError){ return false; }
  if(difference.y > acceptableError){ return false; }
  if(difference.z > acceptableError){ return false; }
  return true;
}



function resetInterpolation(){
  interpol = 0;
}

function unfocus() {
  desiredCameraPosition.copy(cameraStartPosition);
  desiredCameraLook.copy(cameraStartLook);
}

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

function addPlanet(planet, orbitRadius, orbitSpeed, num) {
  // Make the Planet
  planet.userData.orbitRadius = orbitRadius;
  planet.userData.orbitSpeed = orbitSpeed;
  planet.userData.focused = false;
  planet.userData.num = num;
  planet.addEventListener("click", (event) => {
    event.stopPropagation();
    if (planet.userData.focused == false) { // If planet not focused
      console.log(`${num} was clicked and focused.`);
      unfocusAllPlanets(); // Make sure Other Planets aren't focused
      // controls.maxDistance = 10;
      desiredCameraMaxDistance = focusedDistance;
      resetInterpolation();
      cameraFocused = true;
      planet.userData.focused = true;
    } else { // If planet is already focused
      planet.userData.focused = false;
      // controls.maxDistance = Infinity;
      resetInterpolation();
      cameraFocused = false;
      desiredCameraMaxDistance = cameraStartMaxDistance;
      unfocus();
      // controls.reset();
      console.log(`${num} was clicked and reset.`);
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








