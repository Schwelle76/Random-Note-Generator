let notes = ['C', 'C#', 'D','D#', 'E', 'F','F#', 'G','G#', 'A', 'A#', 'B'];
let intervals = ['1', 'm2','M2', 'm3', 'M3', '4', 'b5', '5', 'm6', 'M6', 'm7', 'M7'];
let allowedNotes = ['C', 'C#', 'D','D#', 'E', 'F','F#', 'G','G#', 'A', 'A#', 'B'];
let allowedIntervals = ['1'];
let currentTargetNote;
let currentTargetInterval;
let displayInterval = false;
let htmlTargetNoteElement;
let htmlTargetIntervalElement;
let htmlNoteDisplayElement;
let htmlDetectedNoteElement = document.getElementById("detectedNote");

function startGame(){
  setInterval("play()", 10);
  htmlTargetNoteElement = document.getElementById("targetNote");
  htmlTargetIntervalElement = document.getElementById("targetInterval");
  htmlNoteDisplayElement = document.getElementById("noteDisplay");
  htmlDetectedNoteElement = document.getElementById("detectedNote");
}

function play(){
    if (currentTargetNote == null)
      nextNote();

    if (!synthIsPlaying){
      htmlDetectedNoteElement.textContent = detectedNote;  
      if(detectedNote == currentTargetNotePlusInterval()){
        playRewardAndTriggerNextNote();
      }
    } else htmlDetectedNoteElement.textContent = "";

    if (document.getElementById("showRoot").checked) {
        htmlTargetNoteElement.style.display = "none";
    } else {
        htmlTargetNoteElement.style.display = "block";
    }

    if (document.getElementById("showInterval").checked) {
        htmlTargetIntervalElement.style.display = "none";
    } else {
        htmlTargetIntervalElement.style.display = "block";
    }

    htmlTargetIntervalElement.textContent = currentTargetInterval;
    htmlTargetNoteElement.textContent = currentTargetNote;
}

function currentTargetNotePlusInterval(){
  return notes[(notes.indexOf(currentTargetNote) + intervals.indexOf(currentTargetInterval)) % 12];
}

function playRewardAndTriggerNextNote(){
  pop(htmlNoteDisplayElement);
  nextNote();
}

function nextNote(){
    let lastTargetNote = currentTargetNote;
    let lastTargetInterval = currentTargetInterval;
    
    if (allowedNotes.length > 1 || allowedIntervals.length > 1)
      while(lastTargetNote == currentTargetNote
        && lastTargetInterval == currentTargetInterval){
          currentTargetNote = allowedNotes[Math.floor(Math.random()*allowedNotes.length)];
          currentTargetInterval = allowedIntervals[Math.floor(Math.random()*allowedIntervals.length)]; 
        }

    playIntervalDelay = 0;

    if (!document.getElementById("playRoot").checked) {
        playNote(currentTargetNote);
        playIntervalDelay = 500;
    }

    if (!document.getElementById("playInterval").checked) {
        setTimeout(() => {
            playNote(currentTargetNotePlusInterval());
        }, playIntervalDelay); // Delay to play interval after target note
    }

    htmlTargetNoteElement.classList.remove("rewardingTarget");   
    htmlTargetIntervalElement.classList.remove("rewardingTarget");   
}

function enableOrDisableInterval(interval){
  const indexOfInterval = allowedIntervals.indexOf(interval);
  if (indexOfInterval > -1) { 
    allowedIntervals.splice(indexOfInterval, 1);
  } else {
    allowedIntervals.push(interval);
  }

  if (!allowedIntervals.includes(currentTargetInterval))
    nextNote();

  if(allowedIntervals.length == 1 && allowedIntervals[0] == "1")
    document.getElementById("targetInterval").style.display = 'none';
  else
    document.getElementById("targetInterval").style.display = 'inline';
}

function enableOrDisableNote(interval){
  const IndexOfNote = allowedNotes.indexOf(interval);
  if (IndexOfNote > -1) { 
    allowedNotes.splice(IndexOfNote, 1);
  } else {
    allowedNotes.push(interval);
  }

  if (!allowedNotes.includes(currentTargetNote))
    nextNote();
}

function scrollDown() {
  window.scrollBy(0, 99999999);
}

function scrollUp() {
  window.scrollBy(0, -99999999);  
}

function getStyleProp(elem, prop){
    if(window.getComputedStyle)
        return window.getComputedStyle(elem, null).getPropertyValue(prop);
    else if(elem.currentStyle) return elem.currentStyle[prop]; //IE
}

function getAnimationDuration(elem){
  return parseFloat(getStyleProp(elem, "animation-duration").replace('s', ''));
}

