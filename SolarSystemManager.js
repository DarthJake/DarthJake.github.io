import * as THREE from 'three';
// import * as THREE from 'https://cdn.skypack.dev/three@0.131.3/build/three.module.js';

class SolarSystemManager {
    constructor() {
        var planets = [];
        var focusedPlanet = undefined;
        var focusedPlanetPosition = new THREE.Vector3();
        const scope = this;
        var focusedFlag = false;
        var font;

        //
		// Public Methods
		//
        this.addPlanet = function ({planetMesh, orbitRadius, orbitSpeed, positionalVerticalOffset = 0, focusedVerticalAngle = THREE.MathUtils.degToRad(75), focusedHorizontalOffset = 150, focusedDistance = 8, cameraVerticalLookAtOffset = 0, childMesh = null, id}) {
            console.log("Attempting to create and push planet id '" + id + "' to planet array.");
            planets.push(new Planet(planetMesh, orbitRadius, orbitSpeed, positionalVerticalOffset, focusedVerticalAngle, focusedHorizontalOffset, focusedDistance, cameraVerticalLookAtOffset, childMesh, id, planetClicked));
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

        this.getFocusedPlanetID = function () {
            return focusedPlanet.id;
        }

        this.getPlanetByID = function (i) {
            planets.forEach(planet => {
                if (planet.id == i) {
                    return planet;
                }
            });
            return planets[i]; // Fallback to index
        }

        this.unfocus = function () {
            focusedPlanet = undefined;
        }

        //
        // Internals
        //
        function planetClicked(planet) {
            if (focusedPlanet == undefined) {
                focusedPlanet = planet;
                console.log(`${planet.id} was clicked and focused.`);
            } else if (planet == focusedPlanet) {
                focusedPlanet = undefined;
                console.log(`${planet.id} was clicked and unfocused.`);
            }
        }
    }
}

class Planet {
    constructor(planetMesh, orbitRadius, orbitSpeed, positionalVerticalOffset, focusedVerticalAngle, focusedHorizontalOffset, focusedDistance, cameraVerticalLookAtOffset, childMesh, id, planetClicked) {
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
        this.childMesh = childMesh;
        this.id = id;
        this.mouseover = false;
        var orbit;

        // Vertical Offset
        this.planetMesh.position.y = positionalVerticalOffset;

        // Event Listeners
        this.planetMesh.addEventListener("click", (event) => {
            event.stopPropagation();
            planetClicked(this);
        });
        
        this.planetMesh.addEventListener("mouseover", (event) => {
            event.stopPropagation();
            document.body.style.cursor = 'pointer'
            this.mouseover = true;
            // this.planetMesh.scale.multiplyScalar(1.5);
        });

        this.planetMesh.addEventListener("mouseout", (event) => {
            event.stopPropagation();
            document.body.style.cursor = 'default'
            this.mouseover = false;
            // this.planetMesh.scale.multiplyScalar(1/1.5);
        });

        // Make the Orbit
        var orbitPath = new THREE.Shape();
        orbitPath.moveTo(this.orbitRadius, 0);
        orbitPath.absarc(0, 0, this.orbitRadius, 0, 2 * Math.PI, false);
        var orbitGeometry = new THREE.BufferGeometry().setFromPoints(orbitPath.getSpacedPoints(200));
        orbitGeometry.rotateX(THREE.Math.degToRad(90));
        this.orbit = new THREE.Line(orbitGeometry, new THREE.LineBasicMaterial({
            color: "white"
        }));

        ////// Functions ///////
        this.addChildMesh = function () {
            this.planetMesh.add(this.childMesh);
            console.log("ADDED!!")
        }
    }

    
}

export { SolarSystemManager };