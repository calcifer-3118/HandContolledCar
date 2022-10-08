
/**
 * WebSocket Server
 */
 const WebSocket = require('ws')
 const server = new WebSocket.Server({ port: 8085 })
 

const {Motor, Board, Led, Proximity, Servo } = require('johnny-five');
const configs = Motor.SHIELD_CONFIGS.ADAFRUIT_V1; //Configs for L293d motor shield : http://johnny-five.io/api/motor/
require('events').EventEmitter.defaultMaxListeners = Infinity; 




/**
 * Setup
 */
const minDistance = 8;      //minimum distance from the object for the car to stop (in cm)
const arduinoPort = 'COM5'; //port for your board
const ledPin = 8;         
const servoPin = 10;         
const ultrasonicPin = 7;   
let canMove = false;      


//Initialize board with the correct arduino port
const board = new Board({port: arduinoPort })  

board.on("ready", () => {
  
    //Initialize the components  
    const rightMotor = new Motor(configs.M2);
    const leftMotor = new Motor(configs.M1);



    const stop = (socket)=> {
      if(socket)
          socket.send('stop')
       rightMotor.stop();
       leftMotor.stop();  
    }

    stop();

    const forward = (socket)=>{
          if(socket)
            socket.send('fwd')
          leftMotor.forward(255);
          rightMotor.forward(255);
    }
    const reverse = (socket)=>{
          if(socket)
            socket.send('rev')
          leftMotor.reverse(255);
          rightMotor.reverse(255);
    }
    const left = (socket)=>{
          if(socket)
            socket.send('left')
          rightMotor.forward(255);         
          leftMotor.reverse(255);         
    }
    const right = (socket)=>{
          if(socket)
            socket.send('right')
          leftMotor.forward(255);
          rightMotor.reverse(255);
    }

    
    
    /**
     * Keyboard controls
     */
    const keyBoardCtrls = ()=>{

      'use strict';
      const ioHook = require('iohook');
      ioHook.on('keydown', function (data) {
        
         if(canMove){
              switch (data.keycode){
           
                     //W
                case '87': 
                  forward();
                  break;
     
               //S
                case '83':
                  reverse();
                  break;
     
               //A
                case '65':
                  right();
                  break;
     
               //D
                case '68':
                  left();
                  break;
              }
     
         }
     
      });
      ioHook.on('keyup', function () {
              stop();
        });


    }
      
      
    /**
     * Gameoad Controls
     */
    let gamepad_called = false;
    let gamepadCtrls = (socket)=> {
    
                const Gamecontroller = require('../gamecontroller/gamecontroller');
                const gamepad = new Gamecontroller('gamesir_g4s');
    
                gamepad.connect(function() {
                  console.log('Gamepad On!');
                });
              
              
                gamepad.on('X:press', function() {
                  forward(socket);
                });
              
                gamepad.on('X:release', function() {
                  stop(socket);
                });
              
                gamepad.on('B:press', function() {
                  reverse(socket);
                });
              
                gamepad.on('B:release', function() {
                  stop(socket);
                });
              
                gamepad.on('JOYR:move', function(data) {
                  const normalizeVal = (val, max, min) => (val - min) / (max - min); 
                  const normal_speed = normalizeVal(data.y, 255 , 127)
                  const speed = Math.abs(normal_speed) * 255;
                  if(normal_speed < 0)
                    forward(socket)
                
                  else if(normal_speed > 0)
                    reverse(socket)
                
                  else
                    stop(socket);
                
                });
              
                gamepad.on('JOYL:move', function(data) {
                  console.log(data.x)
                  if(data.x < 128)
                    left(socket);
                
                  else if( data.x > 128)
                    right(socket);
                
                  else
                    stop(socket);
                });
              
              
    }
    
    
    /**
     * UltraSonic Sensor and Servo 
     */
    const ultrasonic = (stop)=>{   

   
   const light = new Led(ledPin);
   
   const servo = new Servo({
     pin:servoPin,
     type:'continous',
     range: [ 0, 120 ]
    });
    servo.isMoving = false;

    const proximity = new Proximity({
      controller: "HCSR04",
      pin: ultrasonicPin
    });
    
    
    proximity.on('change', (centimeters)=>{
      
      if(centimeters.cm >= minDistance)
      {
        
        canMove = true;
        
        servo.stop();
        console.log('canMove: ' + canMove + '' + centimeters.cm)
        
        light.stop();
        light.off();
        
      } 
      
      else{
        
          canMove = false;
          
          //sweep sevro for five seconds
          servo.sweep();
          setTimeout(()=>{
            servo.stop();
          }, 5000)
          
          //stop the car
          rightMotor.stop();
          rightMotor2.stop();
          leftMotor.stop();
          leftMotor2.stop();
          
          //  Light Blink (optional)
          light.on();
          light.blink();
        }
        
      })


      if(stop)
        proximity.off();
    }
    
    
    /**
     * Handling server
     */
    server.on('connection', socket =>{
  
         socket.onmessage = ({data}) => {
           //HandGesture Controls
           if(data == 'fwd')
             forward();
           if(data == 'rev')
             reverse();
           if(data == 'left')
             left();
           if(data == 'right')
             right();
           if(data == 'stop')
             stop();


           //Gamepad Controls
           else if(data == 'gamepad' && !gamepad_called)
            {
              gamepadCtrls(socket);
              gamepad_called = true;
            }
          

            //UltraSonic Sensor
            if(data == 'proximity_on')
               ultrasonic();
            else if(data == 'proximity_off') 
               ultrasonic('stop');
          
         }
  
    })  
    
    
    // gamepadCtrls(socket);
    
    
    
  });
