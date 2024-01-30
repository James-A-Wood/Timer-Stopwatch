import { fitInParent } from "./fitInParent.js";


const log = console.log;


function ProgressBar(obj = {}) {
    const bar = document.querySelector(obj.element_id ?? "#progress-bar");
    this.adjust = n => bar.style.width = n * 100 + "%";
}


function Display(id, obj = {}) {

    const display = document.querySelector(id);
    const progressBar = new ProgressBar();
    const flasher = obj.flasher ?? display.parentNode;
    const flashingClass = obj.flashingClass ?? "flashing";

    fitInParent(display, {
        maxWidthFill: 0.9,
        maxHeightFill: 0.7, // allowing room the +/- buttons, which are position: absolute;
    });

    const formatTime = ms => {

        const totalSeconds = Math.floor(ms / 1000);
        const totalMinutes = Math.floor(totalSeconds / 60);

        return {
            minutes_x10: Math.floor(totalMinutes / 10) % 10,
            minutes_x1: totalMinutes % 10,
            seconds_x10: Math.floor(totalSeconds / 10) % 6,
            seconds_x1: totalSeconds % 10,
            seconds_10ths: Math.floor(ms / 100) % 10,
            seconds_100ths: Math.floor(ms / 10) % 10,
        };
    };

    const fillHoldersWithValues = obj => {
        for (const key in obj) {
            const frame = document.querySelector("#" + key).querySelector(".digit-frame");
            frame.textContent = obj[key];
        }
    };

    this.getMs = () => 0;
    this.getCountdownProgress = () => undefined;
    this.onEachFrame = () => undefined;

    const update = () => {
        const formattedTime = formatTime(this.getMs());
        progressBar.adjust(this.getCountdownProgress());
        fillHoldersWithValues({
            minutes_x10: formattedTime.minutes_x10,
            minutes_x1: formattedTime.minutes_x1,
            seconds_x10: formattedTime.seconds_x10,
            seconds_x1: formattedTime.seconds_x1,
            seconds_10ths: formattedTime.seconds_10ths,
            seconds_100ths: formattedTime.seconds_100ths,
        });
        this.onEachFrame();
        window.requestAnimationFrame(update);
    }
    update();

    this.flash = (value = true) => flasher.classList.toggle(flashingClass, value);
}


export { Display };
