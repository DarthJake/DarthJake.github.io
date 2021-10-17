// import * as THREE from 'three';
import * as THREE from 'https://cdn.skypack.dev/three@0.131.3/build/three.module.js';

class CameraManager {
    constructor(camera) {
        //
        // Public Methods
        //
        this.update = function (solarSystem) {
            if (solarSystem.isFocused() && state == STATE.UNFOCUSED) {
                state = STATE.TRANSITIONING;
                console.log(`Transition from unfocused`);
            } else if (!solarSystem.isFocused() && state == STATE.FOCUSED) {
                state = STATE.TRANSITIONING;
                console.log(`Transition from focused`);
            }

            switch (state) {
                case STATE.FOCUSED:
                    // Focus Point (Camera Look)
                    desiredCameraFocusPoint.copy(solarSystem.getFocusedPlanetPosition());

                    // Focus Offset
                    focusOffset.copy(new THREE.Vector3(desiredCameraFocusPoint.x, 0, desiredCameraFocusPoint.z));

                    // Camera Theta
                    desiredSphericalCameraCoordinates.theta = -THREE.MathUtils.degToRad(solarSystem.getFocusedPlanetAngle() - planetFocusHorizontalOffset);

                    // Camera Phi
                    desiredSphericalCameraCoordinates.phi = planetFocusVerticalAngle;

                    // Camera Radius
                    desiredSphericalCameraCoordinates.radius = planetFocusedDistanceOffset;

                    break;
                case STATE.UNFOCUSED:
                    // Focus Point (Camera Look)
                    desiredCameraFocusPoint.copy(cameraStartLook);

                    // Focus Offset
                    focusOffset.copy(cameraStartLook);

                    // Camera Theta
                    desiredSphericalCameraCoordinates.theta += 0.0025;

                    // Camera Phi
                    desiredSphericalCameraCoordinates.phi = cameraStartPhi;

                    // Camera Radius
                    desiredSphericalCameraCoordinates.radius = cameraStartRadius;

                    break;
                case STATE.TRANSITIONING:
                    resetInterpolation();
                    interpolatingCameraFocusPoint.copy(desiredCameraFocusPoint);
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
        }

        //
        // Internals
        //
        const STATE = {
            UNFOCUSED: 0,
            TRANSITIONING: 1,
            FOCUSED: 2
        }
        var state = STATE.UNFOCUSED;

        const cameraStartTheta = 0;
        const cameraStartPhi = THREE.MathUtils.degToRad(65);
        const cameraStartRadius = 63;
        const cameraStartLook = new THREE.Vector3(0, 0, 0);

        const planetFocusHorizontalOffset = 150;
        const planetFocusVerticalAngle = THREE.MathUtils.degToRad(75);
        const planetFocusedDistanceOffset = 8;
        const interpolationIncrease = 0.01;

        var interpol = 1;
        var desiredSphericalCameraCoordinates = new THREE.Spherical();
        var desiredCameraFocusPoint = new THREE.Vector3().copy(cameraStartLook);
        var interpolatingCameraFocusPoint = new THREE.Vector3().copy(cameraStartLook);
        var focusOffset = new THREE.Vector3().copy(cameraStartLook);

        // Set initial position and look at
        desiredSphericalCameraCoordinates.theta = cameraStartTheta;
        desiredSphericalCameraCoordinates.phi = cameraStartPhi;
        desiredSphericalCameraCoordinates.radius = cameraStartRadius;
        camera.position.setFromSpherical(desiredSphericalCameraCoordinates);
        camera.lookAt(cameraStartLook);

        function updateCameraPosition() {
            // Interpolate values towards desired values
            if (interpol < 1) {
                // Camera Position
                camera.position.lerp(new THREE.Vector3().setFromSpherical(desiredSphericalCameraCoordinates).add(focusOffset), interpol);

                // Camera Look
                interpolatingCameraFocusPoint.lerp(desiredCameraFocusPoint, interpol);
                camera.lookAt(interpolatingCameraFocusPoint);

                // Increase interpolation percent
                interpol += interpolationIncrease;
            } else {
                // Camera Position
                camera.position.copy(new THREE.Vector3().setFromSpherical(desiredSphericalCameraCoordinates).add(focusOffset));

                // Camera Look
                camera.lookAt(desiredCameraFocusPoint);
                // interpolatingCameraFocusPoint.copy(desiredCameraFocusPoint); // could move this to be run only once
            }
        }

        function resetInterpolation() {
            interpol = 0;
        }

        // https://en.wikipedia.org/wiki/Linear_interpolation
        function lerp(a, b, t) {
            return (1 - t) * a + t * b;
        }
    }
}

export {
    CameraManager
};