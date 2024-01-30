import '../libraries/howler.js';


function Sounds() {

    const log = console.log;

    let loadedHowls = {};
    let queued = {};
    let userHasInteracted = false;

    // adding queued sounds on first user interaction
    const processQueue = () => {
        for (const name in queued) {
            const sound = queued[name];
            const src = sound.src;
            const settings = sound.settings;
            settings.src = [src];
            if (loadedHowls[name]) continue;
            loadedHowls[name] = new Howl(settings);
            delete queued[name];
        }
    };

    ["keydown", "click", "touch", "tap"].forEach(event => {
        window.addEventListener(event, () => {
            if (userHasInteracted) return true;
            userHasInteracted = true;
            processQueue();
        });
    });

    this.addSound = (name, src, settings = {}) => {
        if (userHasInteracted) return processQueue();
        queued[name] = { src, settings };
    };

    this.stopAll = () => {
        Howler.stop();
        return this;
    };

    this.play = sound => {
        this.stopAll();
        if (loadedHowls[sound]) loadedHowls[sound].play();
        return this;
    };

    this.stop = sound => {
        if (loadedHowls[sound]) loadedHowls[sound].stop();
        return this;
    };
}


export { Sounds };
