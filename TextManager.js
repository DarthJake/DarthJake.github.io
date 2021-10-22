class TextManager {
    constructor() {
        //
        // Public Methods
        //
        this.update = function (solarSystem) {
            if (solarSystem.isFocused() && state == STATE.UNFOCUSED) {
                state = STATE.TRANSITIONING;
                console.log(`Text Transition from unfocused`);
            } else if (!solarSystem.isFocused() && state == STATE.FOCUSED) {
                state = STATE.TRANSITIONING;
                console.log(`Text Transition from focused`);
            }

            switch (state) {
                case STATE.FOCUSED: // Stuff that needs to be updated every frame of focused
                    

                    break;
                case STATE.UNFOCUSED: // Stuff that needs to be updated every frame of unfocused
                    

                    break;
                case STATE.TRANSITIONING: // Stuff that only needs to be updated once when transitioning 
                    if (solarSystem.isFocused()) {
                        // Main Title
                        title.classList.remove("fadeIn")
                        void title.offsetWidth; // This is sadly necessary to trigger a reflow...
                        title.classList.add("fadeOut")

                        // About Section
                        if (solarSystem.getFocusedPlanetID() == 1) {
                            about.classList.remove("fadeOut")
                            void title.offsetWidth;
                            about.classList.add("fadeIn")
                        }
                        
                        state = STATE.FOCUSED;
                    } else if (!solarSystem.isFocused()) {
                        // Main Title
                        title.classList.remove("fadeOut")
                        void title.offsetWidth;
                        title.classList.add("fadeIn")

                        // About Section
                        about.classList.remove("fadeIn")
                        void title.offsetWidth;
                        about.classList.add("fadeOut")
                        
                        state = STATE.UNFOCUSED;
                    }
                    break;
                default:
                    console.log("Somehow we are here...");
                    break;
            }

            updateText();
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

        const title = document.getElementById("title");
        const about = document.getElementById("aboutWrapper");

        function updateText() {
            
        }
    }
}

export {
    TextManager
};