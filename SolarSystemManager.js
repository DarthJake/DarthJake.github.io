import * as THREE from 'three';

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
        this.addPlanet = function (planetMesh, orbitRadius, orbitSpeed, id) {
            planets.push(new Planet(planetMesh, orbitRadius, orbitSpeed, id, planetClicked));
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
    constructor(planetMesh, orbitRadius, orbitSpeed, id, planetClicked) {
        // Data
        this.planetMesh = planetMesh;
        this.orbitRadius = orbitRadius;
        this.orbitSpeed = orbitSpeed;
        this.id = id;
        var orbit;

        planetMesh.addEventListener("click", (event) => {
            event.stopPropagation();
            planetClicked(this);
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
    }
}

export { SolarSystemManager };