import { Ticker } from "./modules/Ticker.js";
import { Display } from "./modules/Display.js";
import { Sounds } from "./modules/Sounds.js";


const log = console.log;


function ControlButton(id, settings = {}) {

    settings.clickSound = settings.clickSound ?? function () { };

    const button = document.querySelector(id);
    const label = settings.label ? button.querySelector(settings.label) : null;
    const subLabel = settings.subLabel ? button.querySelector(settings.subLabel) : null;

    this.onclick = func => button.addEventListener("click", func);
    this.label = str => label.textContent = str;
    this.subLabel = str => subLabel.textContent = str;
    this.click = () => button.dispatchEvent(new KeyboardEvent("click"));

    button.addEventListener("click", settings.clickSound);
}


const controller = new TimerController(Ticker, Display, ControlButton, {
    body: document.querySelector("body"),
});


function TimerController(Ticker, Display, ControlButton, settings = {}) {


    const body = settings.body;
    const ticker = new Ticker();
    const display = new Display("#display");
    const sounds = new Sounds();
    const startButton = new ControlButton("#start-button", {
        label: ".button-label",
        clickSound: () => sounds.play("tick"),
    });
    const clearButton = new ControlButton("#clear-button", {
        label: ".button-label",
        subLabel: ".number-holder",
        clickSound: () => sounds.play("tick"),
    });


    const maxAllowedMs = settings.maxAllowedMs ?? 1000 * 60 * 99 + 59000; // 99m 59sec
    const minAllowedMs = settings.minAllowedMs ?? 1000; // lowest possible countdown is 1 second (not 0)
    const keyBindings = settings.keyBindings ?? {
        "Escape": clearTimer,
        " ": toggleRunningState,
        "s": toggleRunningState,
        "p": toggleRunningState,
        "c": ticker.clear,
    };


    let isRinging = false;
    let countdownFromMs = 0;


    function setCountdownFrom() {
        countdownFromMs = parseInt(localStorage.countdownFromMs) ?? (10 * 1000);
        localStorage.countdownFromMs = countdownFromMs || (10 * 1000);
    }
    setCountdownFrom();


    const timeIsUp = () => countdownFromMs && ticker.elapsedMs > countdownFromMs;


    display.getCountdownProgress = () => countdownFromMs ? ticker.elapsedMs / countdownFromMs : 0;
    display.getMs = () => {
        if (timeIsUp()) return 0;
        if (countdownFromMs) return countdownFromMs - ticker.elapsedMs;
        return ticker.elapsedMs;
    };


    sounds.addSound("ring", "sounds/alarm.mp3", { loop: true });
    sounds.addSound("tick", "sounds/tick.mp3");


    ticker.onStateChange = isRunning => {
        startButton.label(ticker.isRunning() ? "Pause" : "Start");
        // clearButton.subLabel(mode === "countdown" ? display.getTimeAsText(countdownFromMs) : "");
        body.classList.toggle("is-running", isRunning);
        return true;
    };


    function toggleRunningState() {
        ticker.changeRunningState();
        onAnyButtonPress();
    };


    function clearTimer() {
        ticker.clear();
        onAnyButtonPress();
    };


    startButton.onclick(() => isRinging ? clearTimer() : toggleRunningState());
    clearButton.onclick(() => clearTimer());


    window.addEventListener("keydown", e => {
        onAnyButtonPress();
        if (keyBindings[e.key]) keyBindings[e.key]();
    });


    document.querySelectorAll(".increment-button").forEach(button => {
        button.onclick = () => incrementButtonHandler(button);
    });


    function onAnyButtonPress() {
        sounds.stop("ring");
        sounds.stopAll();
        display.flash(false);
        isRinging = false;
    }


    function incrementButtonHandler(button) {
        onAnyButtonPress();
        ticker.clear();
        const ms = parseInt(button.getAttribute("data-seconds")) * 1000;
        if (setCountdownMs(ms).timeDidChange) sounds.play("tick");
        if (!isNaN(countdownFromMs)) localStorage.countdownFromMs = countdownFromMs;
    }


    function setCountdownMs(ms) {

        const startValue = countdownFromMs;

        if (ms > 1000 && countdownFromMs === 1000) countdownFromMs -= 1000;
        countdownFromMs = Math.max(countdownFromMs + ms, minAllowedMs); // preventing setting countdown time to 0 seconds
        countdownFromMs = Math.min(countdownFromMs, maxAllowedMs); // preventing large values from rolling over

        return {
            timeDidChange: startValue !== countdownFromMs,
        };
    }


    function setMode(newMode = undefined) {
        const mode = newMode ?? localStorage.mode ?? "countdown"; // countdown by default
        localStorage.mode = newMode ?? localStorage.mode ?? "countdown";
        body.classList.remove("stopwatch", "countdown");
        body.classList.add(mode);
        countdownFromMs = (mode === "stopwatch") ? 0 : parseInt(localStorage.countdownFromMs);
        clearTimer();
        sounds.play("tick");
    };
    setMode();


    document.querySelectorAll(".mode-button").forEach(button => {
        const mode = button.getAttribute("data-mode");
        button.onclick = () => setMode(mode);
    });


    function timeUp() {
        return ticker.isRunning() && !isRinging && countdownFromMs && ticker.elapsedMs >= countdownFromMs;
    }


    function checkForFinishLineCross() {
        window.requestAnimationFrame(checkForFinishLineCross);
        if (!timeUp()) return false;
        isRinging = true;
        sounds.play("ring");
        display.flash(true);
    };
    checkForFinishLineCross();
}
