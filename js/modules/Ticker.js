const log = console.log;


function Ticker() {


    let t1 = Date.now();
    let isRunning = false;
    this.elapsedMs = 0;
    this.countdownFrom = undefined;
    this.displayMs = 0;
    this.eachMs = () => undefined;


    setInterval(() => {
        const t2 = Date.now();
        if (isRunning) this.elapsedMs += t2 - t1;
        this.displayMs = this.countdownFrom ? this.countdownFrom - this.elapsedMs : this.elapsedMs;
        if (timeIsUp()) this.onTimeUp();
        t1 = t2;
        this.eachMs();
    }, 1);


    const timeIsUp = () => this.countdownFrom && this.displayMs <= 0;

    this.onTimeUp = () => undefined;
    this.onStateChange = () => undefined;


    this.changeRunningState = val => {
        isRunning = val ?? !isRunning;
        this.onStateChange(isRunning);
        return this;
    };


    this.isRunning = () => isRunning;


    this.clear = () => {
        this.changeRunningState(false);
        this.elapsedMs = 0;
        return this.elapsedMs;
    };
}

export { Ticker };
