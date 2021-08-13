import * as THREE from 'three';
import {
    SolarSystemManager
} from "./SolarSystemManager"

class CameraManager {
    constructor(camera) {


        //
        // Public Methods
        //
        this.update = function (solarSystem) {
            if (solarSystem.isFocused() && state == STATE.UNFOCUSED) {
                state = STATE.TRANSITIONING;
                resetInterpolation();
                console.log(`Transition from Focused`);
            } else if (!solarSystem.isFocused() && state == STATE.FOCUSED) {
                state = STATE.TRANSITIONING;
                resetInterpolation();
                console.log(`Transition from unfocused`);
            }

            switch (state) {
                case STATE.FOCUSED:
                    desiredCameraLook.copy(solarSystem.getFocusedPlanetPosition());
                    // console.log(`${solarSystem.getFocusedPlanetPosition().x}`);
                    break;
                case STATE.UNFOCUSED:
                    desiredCameraLook.copy(cameraStartLook);
                    sphericalCameraPosition.theta += 0.1;
                    break;
                case STATE.TRANSITIONING:
                    interpol = 0;
                    if (solarSystem.isFocused()) {
                        state = STATE.FOCUSED;
                    } else if (!solarSystem.isFocused()) {
                        state = STATE.UNFOCUSED;
                    }
                    break;
                default:
                    console.log("Somehow we are here...");
                    break;
            }

            updateCameraPosition();

            // planet.planetMesh.position.x = Math.cos(time * planet.orbitSpeed) * planet.orbitRadius;
        }

        //
        // Internals
        //
        const STATE = {
            UNFOCUSED: 0,
            TRANSITIONING: 1,
            FOCUSED: 2
        }
        let state = STATE.UNFOCUSED;

        const cameraStartPosition = new THREE.Vector3(0, 75, 100);
        const cameraStartLook = new THREE.Vector3(0, 0, 0);
        const cameraStartMaxDistance = 125;
        const focusedDistance = 10;
        const acceptableError = 5;

        var desiredCameraPosition = new THREE.Vector3().copy(cameraStartPosition);
        var desiredCameraLook = new THREE.Vector3().copy(cameraStartLook)
        var desiredCameraMaxDistance = cameraStartMaxDistance;
        var sphericalCameraPosition = new THREE.Spherical();
        var interpolatingLookAt = new THREE.Vector3();
        var interpol = 0;

        sphericalCameraPosition.setFromVector3(cameraStartPosition);
        camera.position.setFromSpherical(sphericalCameraPosition);
        camera.lookAt(0, 0, 0);

        function updateCameraPosition() {
            // Position
            // if (!closeTo(camera.position, desiredCameraPosition)) {
            //     console.log(`${camera.position.toArray()} - ${desiredCameraPosition.toArray()}`);
            //     if (interpol < 1) {
            //         camera.position.lerp(desiredCameraPosition, interpol);
            //         interpol += 0.01;

            //     } else {
            //         camera.position.copy(desiredCameraPosition);
            //     }
            // }

            // Look
            // console.log(`${interpolatingLookAt.toArray()} - ${desiredCameraLook.toArray()}`);
            if (interpol < 1) {
                interpolatingLookAt.lerp(desiredCameraLook, interpol);
                camera.lookAt(interpolatingLookAt);
                interpol += 0.01;
                
            } else {
                camera.lookAt(desiredCameraLook);
            }

            // // Max Distance
            // // if (cameraFocused == true) {
            // if (cameraFocused == true) {
            //     if (interpol < 1) {
            //         controls.maxDistance = interpolateNum(controls.maxDistance, desiredCameraMaxDistance, interpol);
            //         interpol += 0.01;
            //     } else {
            //         controls.maxDistance = desiredCameraMaxDistance;
            //     }
            // } else {
            //     controls.maxDistance = cameraStartMaxDistance;
            // }

            // }
        }

        function resetInterpolation(){
            interpol = 0;
        }

        // function mutateToFocusedView(planetPosition) {
        //     if(planetPosition.x >)
        // }

        function closeTo(vector1, vector2) {
            var difference = new THREE.Vector3().subVectors(vector1, vector2);
            if (difference.x > acceptableError) {
                return false;
            }
            if (difference.y > acceptableError) {
                return false;
            }
            if (difference.z > acceptableError) {
                return false;
            }
            return true;
        }
    }
}

export {
    CameraManager
};