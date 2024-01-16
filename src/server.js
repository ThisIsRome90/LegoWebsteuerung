import express from 'express';
import cors from 'cors';
import fs from 'fs';

import rpio from "rpio";



const pinA = 3; // Verbunden mit CLK
const pinB = 4; // Verbunden mit DT
var potiValue = 0;
let encoderPosCount = 0;
let pinALast;
let aVal;
let bCW;

// Initialisiere die GPIO-Bibliothek
rpio.init({ gpiomem: false, mapping: 'gpio' });

// Verwende die PIN-Nummerierung (BCM) statt WiringPi
const gpioPin = 27;


const HBridge1_1 = 5;
const HBridge1_2 = 6;
const HBridge2_1 = 19;
const HBridge2_2 = 13;
const HBridge3_1 = 20;
const HBridge3_2 = 16;
const HBridge4_1 = 26;
const HBridge4_2 = 21;

// Setze den PIN als OUTPUT
rpio.open(gpioPin, rpio.OUTPUT);

rpio.open(HBridge1_1, rpio.OUTPUT);
rpio.open(HBridge1_2, rpio.OUTPUT);
rpio.open(HBridge2_1, rpio.OUTPUT);
rpio.open(HBridge2_2, rpio.OUTPUT);
rpio.open(HBridge3_1, rpio.OUTPUT);
rpio.open(HBridge3_2, rpio.OUTPUT);
rpio.open(HBridge4_1, rpio.OUTPUT);
rpio.open(HBridge4_2, rpio.OUTPUT);

rpio.write(HBridge1_1, rpio.LOW);
rpio.write(HBridge1_2, rpio.LOW);
rpio.write(HBridge2_1, rpio.LOW);
rpio.write(HBridge2_2, rpio.LOW);
rpio.write(HBridge3_1, rpio.LOW);
rpio.write(HBridge3_2, rpio.LOW);
rpio.write(HBridge4_1, rpio.LOW);
rpio.write(HBridge4_2, rpio.LOW);


let Motors = [
    {ctr1: HBridge1_1, ctr2: HBridge1_2, state: 0},
    {ctr1: HBridge2_1, ctr2: HBridge2_2, state: 0},
    {ctr1: HBridge3_1, ctr2: HBridge3_2, state: 0},
    {ctr1: HBridge4_1, ctr2: HBridge4_2, state: 0}
]

// Toggle den PIN
setInterval(() => {
  rpio.write(gpioPin, rpio.read(gpioPin) === rpio.HIGH ? rpio.LOW : rpio.HIGH);
}, 1000);

// GPIO-Pin für den Piezo-Lautsprecher
const piezoPin = 12;


// Funktion zum Erzeugen eines Tons
function playTone(frequency, duration) {
  rpio.open(piezoPin, rpio.PWM);
  rpio.pwmSetClockDivider(16); // Teiler für 19.2 MHz
  rpio.pwmSetRange(piezoPin, 1050); // Berechne PWM-Range basierend auf der Frequenz

  rpio.pwmSetData(piezoPin, 1050 /  2); // Setze PWM-Daten auf die Hälfte des Bereichs

  rpio.msleep(duration); // Warte für die angegebene Dauer

  rpio.pwmSetData(piezoPin, 0); // Stoppe den Ton, indem PWM-Daten auf 0 gesetzt werden
  rpio.close(piezoPin);

}


// Initialisierung der GPIO-Pins
rpio.open(pinA, rpio.INPUT);
rpio.open(pinB, rpio.INPUT);
rpio.open(2, rpio.INPUT);

// Lesen von Pin A
pinALast = rpio.read(pinA);

// Event-Handler für Zustandsänderungen
const onPinAChange = () => {
    aVal = rpio.read(pinA);
    
    if (aVal !== pinALast) {
        // Drehgeber wird gedreht
        if (rpio.read(pinB) !== aVal) {
            encoderPosCount++;
            bCW = true;
        } else {
            encoderPosCount--;
            bCW = false;
        }

        /*console.log(`Rotated: ${bCW ? 'clockwise' : 'counterclockwise'}`);
        console.log(`Encoder Position: ${encoderPosCount}`);*/
    }

    pinALast = aVal;
};





// Event-Handler registrieren
rpio.poll(pinA, onPinAChange);

// Funktion zum Beenden des Programms
const cleanup = () => {
    rpio.close(pinA);
    rpio.close(pinB);
    process.exit();
};


setInterval(() => {
    let isplayingTune = false;
    potiValue = rpio.read(2); // Ersetze 'yourPotiPin' durch den tatsächlichen GPIO-Pin für den Poti
    if(potiValue===0 && !isplayingTune){
        playTone(1,500);
        isplayingTune = true;
    }else{
        isplayingTune = false;
    }
}, 100); // Hier kannst du die Update-Frequenz anpassen (in Millisekunden)


function sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }


function motorController(motor, desiredState){
    if(motor.state === desiredState){return;}

    if(motor.state === 0 && desiredState === 1){
        rpio.write(motor.ctr2, rpio.LOW); // sollte schon der fall sein darum kein sleep
        rpio.write(motor.ctr1, rpio.HIGH);
        motor.state = 1;
    }else if(motor.state === 0 && desiredState === 2){
        rpio.write(motor.ctr1, rpio.LOW); // sollte schon der fall sein darum kein sleep
        rpio.write(motor.ctr2, rpio.HIGH);
        motor.state = 2;
    }else if((motor.state === 1 || motor.state === 2)&& desiredState === 0){
        rpio.write(motor.ctr2, rpio.LOW);
        rpio.write(motor.ctr1, rpio.LOW);
        motor.state = 0;
    }else if(motor.state === 1 && desiredState === 2){
        rpio.write(motor.ctr1, rpio.LOW);
        sleep(1);
        rpio.write(motor.ctr2, rpio.HIGH);
        motor.state = 2;
    }else if(motor.state === 2 && desiredState === 1){
        rpio.write(motor.ctr2, rpio.LOW);
        sleep(1);
        rpio.write(motor.ctr1, rpio.HIGH);
        motor.state = 1;
    }
}

function throttle2State(throttle){
    if(throttle>50){return 1;}
    if(throttle<-50){return 2;}
    return 0;
}
function steeringAngle2State(steeringAngle){
    if(steeringAngle>45){return 1;}
    if(steeringAngle<-45){return 2;}
    return 0;
}



const app = express();
const port = 3000;

app.use(express.json());
app.use(cors());

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html');
});

app.post('/api/send-command', (req, res) => {
  const { throttle, brake, rpm, steeringangle, isEnginRunning, shovelPivot, shovelLift } = req.body;

  // Hier kannst du mit den empfangenen Daten machen, was du möchtest
  //console.log('Received command:', req.body);

  // GPIO-Pin 17 toggeln
  rpio.write(17, (isEnginRunning)? rpio.LOW : rpio.HIGH);

  motorController(Motors[0], throttle);
  motorController(Motors[1], steeringAngle2State(steeringangle));
  motorController(Motors[2], shovelPivot);
  motorController(Motors[3], shovelLift);

  res.json({ status: 'ok' , steeringAngle: encoderPosCount});
});

// Hier wird der Server auf allen verfügbaren Netzwerkschnittstellen gestartet
app.listen(port, '0.0.0.0', () => {
  console.log(`Server is running on http://0.0.0.0:${port}`);
});
