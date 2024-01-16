//import angular from 'angular';

//import CarModel from './CarModel';
//var car = CarModel();

class CarModel {
  constructor() {
    this.frequency = 70;
    this.state = 'steadyRPM';
    this.upshiftposible = false;
    this.otheracclerations = 0;
    this.rpm = 700;
    this.i = 0;
    this.is_new_i = false;
    this.new_i = 0;

    this.audioContext;
    this.oscillator;
    this.gear;
    this.engineRunning = false;
    this.audioInitialised = false;

    this.throttle = 0;
    this.brake = false;
    this.steeringAngle = 0;
    this.shovelLift = 0;
    this.shovelPivot = 0;
  }

  async startEngineButton() {
    if (!this.audioInitialised) {
      this.initAudio();
      this.oscillator.start();
      this.state = 'steadyRPM';
    }
    if (!this.engineRunning) {
      this.engineRunning = true;
      this.rpm = 700;
      // Den Oszillator starten

      // create car sound coresponding to frequency
      this.create_Sound();
      this.play_carsound();
    } else {
      this.engineRunning = false;
      this.rpm = 0;
    }
  }

  initAudio() {
    // Audio-Kontext erstellen
    this.audioContext = new (window.AudioContext ||
      window.webkitAudioContext)();

    // Audio-Knoten für die Ausgabe erstellen
    const gainNode = this.audioContext.createGain();
    gainNode.connect(this.audioContext.destination);

    // Audio-Knoten für den Sinus-Oszillator erstellen
    this.oscillator = this.audioContext.createOscillator();
    this.oscillator.type = 'sine'; // Sinus-Welle
    this.oscillator.connect(gainNode);

    this.audioInitialised = true;
  }

  sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  async create_Sound() {
    //this.frequency = this.rpm / 10;
    if (this.frequency == null || this.frequency == undefined) {
      await this.sleep(1);
      this.frequency = this.rpm / 12;
    } else {
      this.frequency = this.rpm / 12;
    }
    /*this.oscillator.frequency.setValueAtTime(
      this.frequency,
      this.audioContext.currentTime
    );*/
    setTimeout(this.create_Sound, 1);
    console.log(`frequency:  ${frequency}`);
  }

  async play_carsound() {
    let i = 0;
    let a = 1000 - this.rpm;
    let b = this.rpm;
    while (this.engineRunning) {
      if (this.is_new_i) {
        this.i = new_i;
        this.is_new_i = false;
      }
      switch (this.state) {
        case 'accelerate':
          this.upshiftposible = this.rpm > 2000;
          this.rpm = 9300 * (this.i / 10000) ** (1 / 2) + 700;
          this.i += 2;
          break;

        case 'revIt':
          this.upshiftposible = this.rpm > 2000;
          this.rpm = 9300 * (this.i / 10000) ** (1 / 2) + 700;
          this.i += 50;
          break;

        case 'linearrevMatch':
          this.upshiftposible = this.rpm > 2000;
          this.rpm += this.stepsize;
          if (
            (this.endRPM >= this.rpm && this.stepsize < 0) ||
            (this.endRPM <= this.rpm && this.stepsize > 0)
          ) {
            this.state = 'steadyRPM';
          }
          this.i += 1;
          break;

        case 'steadyRPM':
          this.rpm = this.rpm;
          break;
      }
      if (this.i > 10000) {
        this.i = 10000;
      }
      console.log(`RPM:  ${this.rpm}`);
      await this.sleep(1);
    }
  }

  accelerate() {
    this.state = 'accelerate';
  }

  gearUp() {
    //calculate new rpm
    this.rpm = this.rpm * 0.6;
    this.new_i = 10000 * ((this.rpm - 700) / 9300) ** 2;
    this.is_new_i = true;
  }

  gearDown() {
    //calculate new rpm
    this.rpm = this.rpm * 1.66;
    this.linearrevMatch(this.rpm);
  }

  noloadrevUp() {
    this.state = 'revIt';
  }

  linearrevMatch(toRPM) {
    this.state = 'linearrevMatch';
    this.endRPM = this.toRPM;
    this.stepsize = (this.rpm - this.toRPM) / -100;
  }
}

// main

const canvas = document.getElementById('myCanvas');
const ctx = canvas.getContext('2d');
const steeringWheelImage = document.getElementById('customImage');
const connectionButton = document.getElementById('connectionButton');
var steeringspeed = 0;
var rotationAngle = 0;
var a_pressed = false;
var d_pressed = false;
var iterationsincelastchange = 0;
var multiplier = 0;

var w_pressed = false;
var s_pressed = false;
var shift_pressed = false;
var gear = 1;
var Car = new CarModel();
var sendData = false;

//angular.module('myApp', ['ngRadialGauge']);
//initAudio()
setInterval(rotateSteeringwheel, 20);
var sendDataInterval = setInterval(sendCarData, 30);

function connect() {
  sendData = !sendData;
  if (sendData) {
    connectionButton.style.backgroundColor = 'blue';
  }
  if (!sendData) {
    connectionButton.style.backgroundColor = '#e0e0e0';
  }
}

function changeSteeringwheel() {
  const steeringWheelbutton = document.getElementById('steeringWheelbutton');
  if (steeringWheelImage.src.includes('volvosteuerrad.png')) {
    steeringWheelImage.src = 'img/BMWsteuerrad.png';
    steeringWheelbutton.textContent = 'Bimer';
  } else {
    steeringWheelImage.src = 'img/volvosteuerrad.png';
    steeringWheelbutton.textContent = 'Volvo';
  }
}

let hwSteeringlastValue = 0;
async function sendCarData() {
  let result;
  if (!sendData) {
    return;
  }
  try {
    if (Car.engineRunning) {
      const response = await fetch('http://192.168.4.1:3000/api/send-command', {
        //192.168.50.1:
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          throttle: gear === 0 ? 2 * Car.throttle : Car.throttle, //hack sollte noch verbessert werden
          brake: Car.brake,
          rpm: Car.rpm,
          steeringangle: Car.steeringAngle,
          isEngingRunning: Car.engineRunning,
          shovelPivot: Car.shovelPivot,
          shovelLift: Car.shovelLift
        })
      });
      result = await response.json();
    } else {
      const response = await fetch('http://192.168.4.1:3000/api/send-command', {
        //192.168.50.1:
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          throttle: 0,
          brake: Car.brake,
          rpm: 0,
          steeringangle: 0,
          isEngingRunning: 0,
          shovelPivot: 0,
          shovelLift: 0
        })
      });
      result = await response.json();
    }

    let hwSteering = result.steeringAngle;
    rotationAngle += (hwSteering - hwSteeringlastValue) * 9;
    hwSteeringlastValue = hwSteering;

    connectionButton.style.backgroundColor = 'green';
    //console.log(result);
  } catch (error) {
    console.error('Error:', error);
    connectionButton.style.backgroundColor = 'red';
  }
}

function addPressedEffect() {
  let startbutton = document.getElementById('startbutton');
  console.log('pressed');
  startbutton.classList.add('pressed');
  Car.startEngineButton();
}

function removePressedEffect() {
  let startbutton = document.getElementById('startbutton');
  startbutton.classList.remove('pressed');
}

document.addEventListener('keydown', (event) => {
  if (event.key === 'a' || event.key === 'A') {
    a_pressed = true;
  } else if (event.key === 'd' || event.key === 'D') {
    d_pressed = true;
  } else if (event.key === 'w' || event.key === 'W') {
    w_pressed = true;
    determinThrottle();
  } else if (event.key === 's' || event.key === 'S') {
    s_pressed = true;
    Car.brake = true;
  } else if (event.key === 'z' || event.key === 'Z') {
    addPressedEffect();
  }
  //---------------shovel controll ----------------
  else if (event.key === 'u' || event.key === 'U') {
    Car.shovelLift = 1;
  } else if (event.key === 'i' || event.key === 'I') {
    Car.shovelPivot = 1;
  } else if (event.key === 'j' || event.key === 'J') {
    Car.shovelLift = 0;
  } else if (event.key === 'k' || event.key === 'K') {
    Car.shovelPivot = 0;
  } else if (event.key === 'n' || event.key === 'N') {
    Car.shovelLift = 2;
  } else if (event.key === 'm' || event.key === 'M') {
    Car.shovelPivot = 2;
  }

  if (!event.shiftKey) {
    return;
  }
  shift_pressed = true;
  if (event.key === '1' || event.key === '+') {
    gear = 1;
  } else if (event.key === '2' || event.key === '"') {
    gear = 2;
  } else if (event.key === '3' || event.key === '*') {
    gear = 3;
  } else if (event.key === '4' || event.key === 'ç') {
    gear = 4;
  } else if (event.key === '5' || event.key === '%') {
    gear = 5;
  } else if (event.key === '6' || event.key === '&') {
    gear = 6;
  } else if (event.key === '0' || event.key === '=') {
    gear = 0;
  }
});

document.addEventListener('keyup', (event) => {
  if (event.key === 'a' || event.key === 'A') {
    a_pressed = false;
  } else if (event.key === 'd' || event.key === 'D') {
    d_pressed = false;
  } else if (event.key === 'w' || event.key === 'W') {
    w_pressed = false;
    determinThrottle();
  } else if (event.key === 's' || event.key === 'S') {
    s_pressed = false;
    Car.brake = false;
  } else if (event.key === 'Shift') {
    shift_pressed = false;
  } else if (event.key === 'z' || event.key === 'Z') {
    removePressedEffect();
  }
});
var height;
function rotateSteeringwheel() {
  let laststeeringspeed = steeringspeed;
  steeringspeed = 0;
  steeringspeed -= a_pressed ? 1 : 0;
  steeringspeed += d_pressed ? 1 : 0;

  if (laststeeringspeed === steeringspeed) {
    iterationsincelastchange += iterationsincelastchange > 55 ? 0 : 1;
  } else {
    iterationsincelastchange = 0;
    multiplier = 0;
  }

  if (
    iterationsincelastchange === 10 ||
    iterationsincelastchange === 20 ||
    iterationsincelastchange === 30 ||
    iterationsincelastchange === 40
  ) {
    multiplier += 0.5;
  }
  rotationAngle += steeringspeed * multiplier;

  // max 2Umdrehungen in beide Richtung zulassen
  if (rotationAngle > 720) {
    rotationAngle = 720;
  }
  if (rotationAngle < -720) {
    rotationAngle = -720;
  }
  Car.steeringAngle = rotationAngle;
  var img = document.querySelector('#customImage');
  img.style.transform = `rotate(${rotationAngle}deg)`;

  redrawShape();
}

function determinThrottle() {
  if (w_pressed) {
    Car.throttle = 1; //erweiterbar auf verschiedene gasstufen
    Car.state = 'accelerate';
  } else {
    Car.throttle = 0;
    Car.state = 'steadyRPM';
  }
}

function redrawShape() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  drawGasPedal(!w_pressed);
  drawBrakePedal(!Car.brake);
  drawClutchepedal(!shift_pressed);
  drawGearselect(gear);
  drawControllsticks(Car.shovelLift, Car.shovelPivot);
  drawEnginIndcatorLight(Car.engineRunning);
}

// Zeichne Gaspedal
function drawGasPedal(isPressed) {
  ctx.fillStyle = '#000000';
  if (isPressed) {
    ctx.fillRect(640, 50, 30, 80);
  } else {
    ctx.fillRect(640, 100, 30, 30);
  }
}

// Zeichne Breakepedal
function drawBrakePedal(isPressed) {
  ctx.fillStyle = '#000000';
  if (isPressed) {
    ctx.fillRect(570, 60, 60, 50);
  } else {
    ctx.fillRect(570, 90, 60, 20);
  }
}

// Zeichne clutchepedal
function drawClutchepedal(isPressed) {
  ctx.fillStyle = '#000000';
  if (isPressed) {
    ctx.fillRect(490, 60, 60, 50);
  } else {
    ctx.fillRect(490, 90, 60, 20);
  }
}

const gearCoords = [
  [840, 45],
  [875, 45],
  [875, 105],
  [910, 45],
  [910, 105],
  [945, 45],
  [945, 105]
];
// Zeichne Schaltknüppel
function drawGearselect(gear) {
  ctx.fillStyle = '#000000';
  ctx.fillRect(835, 70, 110, 10);
  ctx.fillRect(835, 45, 10, 30);
  ctx.fillRect(870, 45, 10, 60);
  ctx.fillRect(905, 45, 10, 60);
  ctx.fillRect(940, 45, 10, 60);

  ctx.font = 'bold 10px Arial';
  ctx.fillStyle = 'black';
  // Draw text on the canvas
  ctx.fillText('R', 836, 40);
  ctx.fillText('1', 872, 40);
  ctx.fillText('2', 872, 116);
  ctx.fillText('3', 907, 40);
  ctx.fillText('4', 907, 116);
  ctx.fillText('5', 942, 40);
  ctx.fillText('6', 942, 116);

  ctx.beginPath();
  ctx.arc(gearCoords[gear][0], gearCoords[gear][1], 20, 0, 2 * Math.PI, false);
  ctx.fillStyle = 'green';
  ctx.fill();
}

// Zeichne Schaufelsteuerung
function drawControllsticks(stickUppos, stickPivpos) {
  var choseLengtharr = [60, 80, 45]; //Stielleangen in Neutral, Vorwaerts, Rueckwaerts

  stielleange = choseLengtharr[stickUppos];
  ctx.fillStyle = 'black';
  ctx.fillRect(240, 45 + (60 - stielleange), 10, stielleange);
  ctx.beginPath();
  ctx.arc(245, 45 + (60 - stielleange), 20, 0, 2 * Math.PI, false);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(245, 105, 10, 0, 2 * Math.PI, false);
  ctx.fill();
  ctx.fillRect(235, 105, 20, 20);

  ctx.fillStyle = '#269900'; // grün abgeschaltet
  if (stickUppos === 1) {
    ctx.fillStyle = '#80ff00'; // grün leuchend
  }
  ctx.beginPath();
  ctx.moveTo(275, 80);
  ctx.lineTo(265, 90);
  ctx.lineTo(285, 90);
  ctx.closePath();
  ctx.fill();

  ctx.fillStyle = '#269900'; // grün abgeschaltet
  if (stickUppos === 0) {
    ctx.fillStyle = '#80ff00'; // grün leuchend
  }
  ctx.beginPath();
  ctx.arc(275, 100, 7.5, 0, 2 * Math.PI, false);
  ctx.fill();

  ctx.fillStyle = '#269900'; // grün abgeschaltet
  if (stickUppos === 2) {
    ctx.fillStyle = '#80ff00'; // grün leuchend
  }
  ctx.beginPath();
  ctx.moveTo(275, 120);
  ctx.lineTo(265, 110);
  ctx.lineTo(285, 110);
  ctx.closePath();
  ctx.fill();

  //-----------------------------------------------------

  var stielleange = choseLengtharr[stickPivpos];
  ctx.fillStyle = 'black';
  ctx.fillRect(340, 45 + (60 - stielleange), 10, stielleange);
  ctx.beginPath();
  ctx.arc(345, 45 + (60 - stielleange), 20, 0, 2 * Math.PI, false);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(345, 105, 10, 0, 2 * Math.PI, false);
  ctx.fill();
  ctx.fillRect(335, 105, 20, 20);

  // Zeichne Pfeil nach unten
  ctx.fillStyle = '#269900'; // grün abgeschaltet
  if (stickPivpos === 1) {
    ctx.fillStyle = '#80ff00'; // grün leuchend
  }
  ctx.beginPath();
  ctx.moveTo(375, 80);
  ctx.lineTo(365, 90);
  ctx.lineTo(385, 90);
  ctx.closePath();
  ctx.fill();

  ctx.fillStyle = '#269900'; // grün abgeschaltet
  if (stickPivpos === 0) {
    ctx.fillStyle = '#80ff00'; // grün leuchend
  }
  ctx.beginPath();
  ctx.arc(375, 100, 7.5, 0, 2 * Math.PI, false);
  ctx.fill();

  ctx.fillStyle = '#269900'; // grün abgeschaltet
  if (stickPivpos === 2) {
    ctx.fillStyle = '#80ff00'; // grün leuchend
  }

  ctx.beginPath();
  ctx.moveTo(375, 120);
  ctx.lineTo(365, 110);
  ctx.lineTo(385, 110);
  ctx.closePath();
  ctx.fill();
  return;
}

function drawEnginIndcatorLight(isOn) {
  ctx.fillStyle = '#b31919'; // rot abgeschaltet
  if (isOn) {
    ctx.fillStyle = '#ff0000'; // rot leuchtend
  }
  ctx.beginPath();
  ctx.arc(752, 25, 6, 0, 2 * Math.PI, false);
  ctx.fill();
}

async function addCommand(newCommand) {
  try {
    const response = await fetch('http://localhost:3000/api/add-command', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(newCommand)
    });

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const result = await response.json();
    console.log('Command added successfully:', result);

    // Hier können Sie weitere Operationen nach dem Hinzufügen eines Befehls durchführen
  } catch (error) {
    console.error('Error adding command:', error);
  }
}
