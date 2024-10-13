//@input Component.Text myText
//@input int time {"label":"Time", "min":0, "max":9999, "step":1}

var startTime = 0;
var countdownTime = 0;
var countdownInterval = null;

function startCountdown() {
    if (countdownInterval != null) {
        return;
    }

    startTime = getTime();
    countdownTime = script.time;
    updateCountdown();
}

function stopCountdown() {
    if (countdownInterval != null) {
        countdownInterval = null;
    }
    // do something here when it reaches 0
    script.myText.text = "Time's up!";
    
}

function updateCountdown() {
    var remainingTime = countdownTime - (getTime() - startTime);
    if (remainingTime < 0) {
        stopCountdown();
    } else {
        var minutes = Math.floor(remainingTime / 60);
        var seconds = remainingTime % 60;
        var countdownString = ("00" + minutes).slice(-2) + ":" + ("00" + seconds).slice(-2);
        script.myText.text = countdownString;

        countdownInterval = script.createEvent("DelayedCallbackEvent");
        countdownInterval.bind(updateCountdown);
        countdownInterval.reset(1);
    }
}

function getTime() {
    return Math.floor(Date.now() / 1000);
}

var event = script.createEvent("TapEvent");
event.bind(startCountdown);