// import * as THREE from 'three';
import * as THREE from 'https://cdn.skypack.dev/three@0.131.3/build/three.module.js';

class SolarSystemManager {
    constructor() {
        var planets = [];
        var focusedPlanet = undefined;
        var focusedPlanetPosition = new THREE.Vector3();
        const scope = this;
        var focusedFlag = false;

        //
		// Public Methods
		//
        this.addPlanet = function ({planetMesh, orbitRadius, orbitSpeed, positionalVerticalOffset = 0, focusedVerticalAngle = THREE.MathUtils.degToRad(75), focusedHorizontalOffset = 150, focusedDistance = 8, cameraVerticalLookAtOffset = 0, id}) {
            console.log("Attempting to create and push planet id '" + id + "' to planet array.");
            planets.push(new Planet(planetMesh, orbitRadius, orbitSpeed, positionalVerticalOffset, focusedVerticalAngle, focusedHorizontalOffset, focusedDistance, cameraVerticalLookAtOffset, id, planetClicked));
        }

        this.getPlanets = function () {
            return planets;
        }

        this.isFocused = function () {
            return typeof focusedPlanet !== "undefined";
        }

        this.getFocusedPlanet = function () {
            return focusedPlanet;
        }

        this.getFocusedPlanetPosition = function () {
            focusedPlanet.planetMesh.getWorldPosition(focusedPlanetPosition);
            return focusedPlanetPosition;
        }

        this.getFocusedPlanetAngle = function () {
            focusedPlanet.planetMesh.getWorldPosition(focusedPlanetPosition);
            var angle = Math.atan2(focusedPlanetPosition.z, focusedPlanetPosition.x);
            angle = angle * (180 / Math.PI); // Convert radians to degrees
            angle = (angle + 360) % 360; // Convert [-180,180] to [0,360]
            return angle;
        }

        this.getFocusedPlanetOrbitRadius = function () {
            return focusedPlanet.orbitRadius;
        }

        this.getFocusedPlanetFocusedVerticalAngle = function () {
            return focusedPlanet.focusedVerticalAngle;
        }

        this.getFocusedPlanetFocusedHorizontalOffset = function () {
            return focusedPlanet.focusedHorizontalOffset;
        }

        this.getFocusedPlanetFocusedDistance = function () {
            return focusedPlanet.focusedDistance;
        }
        
        this.getFocusedPlanetCameraVerticalLookAtOffset = function () {
            return focusedPlanet.cameraVerticalLookAtOffset;
        }

        //
        // Internals
        //
        function planetClicked(planet) {
            if (planet != focusedPlanet) {
                focusedPlanet = planet;
                console.log(`${planet.id} was clicked and focused.`);
            } else {
                focusedPlanet = undefined;
                console.log(`${planet.id} was clicked and unfocused.`);
            }
        }
    }
}

class Planet {
    constructor(planetMesh, orbitRadius, orbitSpeed, positionalVerticalOffset, focusedVerticalAngle, focusedHorizontalOffset, focusedDistance, cameraVerticalLookAtOffset, id, planetClicked) {
        console.log("Constructor Creating Planet:\n\t- Radius: " + orbitRadius + "\n\t- Speed: " + orbitSpeed + "\n\t- ID: " + id)
        // Data
        this.planetMesh = planetMesh;
        this.orbitRadius = orbitRadius;
        this.orbitSpeed = orbitSpeed;
        this.positionalVerticalOffset = positionalVerticalOffset;
        this.focusedVerticalAngle = focusedVerticalAngle;
        this.focusedHorizontalOffset = focusedHorizontalOffset;
        this.focusedDistance = focusedDistance;
        this.cameraVerticalLookAtOffset = cameraVerticalLookAtOffset;
        this.id = id;
        var orbit;

        // Vertical Offset
        this.planetMesh.position.y = positionalVerticalOffset;

        // Event Listener
        planetMesh.addEventListener("click", (event) => {
            event.stopPropagation();
            planetClicked(this);
        });
        console.log(`Added event Listener to planet id '${id}'.`);

        // Make the Orbit
        var orbitPath = new THREE.Shape();
        orbitPath.moveTo(this.orbitRadius, 0);
        orbitPath.absarc(0, 0, this.orbitRadius, 0, 2 * Math.PI, false);
        var orbitGeometry = new THREE.BufferGeometry().setFromPoints(orbitPath.getSpacedPoints(200));
        orbitGeometry.rotateX(THREE.Math.degToRad(90));
        this.orbit = new THREE.Line(orbitGeometry, new THREE.LineBasicMaterial({
            color: "white"
        }));
    }
}

export { SolarSystemManager };