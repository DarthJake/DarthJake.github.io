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
                        fadeInToFadeOut(title);

                        // Back Arrow
                        fadeOutToFadeIn(backArrow);
                        backArrow.style.pointerEvents = "auto"

                        // Sections
                        var key = solarSystem.getFocusedPlanetID();
                        switch (key) {
                            case 1: // About Me Section
                                fadeOutToFadeIn(about);
                                break;

                            case 2: // Skills Section
                                fadeOutToFadeIn(skills);
                                break;

                            case 3: // Projects Section
                                fadeOutToFadeIn(projects);
                                break;

                            case 4: // Contact Me Section
                                fadeOutToFadeIn(contactMe);
                                break;
                        
                            default:
                                break;
                        }

                        state = STATE.FOCUSED;
                    } else if (!solarSystem.isFocused()) {
                        // Main Title
                        fadeOutToFadeIn(title);

                        // Back Arrow
                        fadeInToFadeOut(backArrow);
                        backArrow.style.pointerEvents = "none"

                        // About Section
                        if (about.classList.contains("fadeIn")) {
                            fadeInToFadeOut(about);
                        }

                        // Skills Section
                        if (skills.classList.contains("fadeIn")) {
                            fadeInToFadeOut(skills);
                        }

                        // Projects Section
                        if (projects.classList.contains("fadeIn")) {
                            fadeInToFadeOut(projects);
                        }

                        // Contact Me Section
                        if (contactMe.classList.contains("fadeIn")) {
                            fadeInToFadeOut(contactMe);
                        }
                        
                        state = STATE.UNFOCUSED;
                    }
                    break;
                default:
                    console.log("Somehow we are here...");
                    break;
            }
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
        const backArrow = document.getElementById("backArrow");
        const about = document.getElementById("aboutWrapper");
        const skills = document.getElementById("skillsWrapper");
        const projects = document.getElementById("projectsWrapper");
        const contactMe = document.getElementById("contactMeWrapper");

        function fadeOutToFadeIn(e) {
            e.classList.remove("fadeOut")
            e.classList.remove("unclickable")
            void e.offsetWidth; // This is sadly necessary to trigger a reflow...
            e.classList.add("fadeIn")
            e.classList.add("clickable")
        }

        function fadeInToFadeOut(e) {
            e.classList.remove("fadeIn")
            e.classList.remove("clickable")
            void e.offsetWidth; // This is sadly necessary to trigger a reflow...
            e.classList.add("fadeOut")
            e.classList.add("unclickable")
        }
    }
}

export {
    TextManager
};