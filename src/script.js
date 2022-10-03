import './style.css'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'


/**
 * Server
 */
 const socket = new WebSocket('ws://localhost:8085')

 socket.onerror = error => {
   console.error(error)
 }
 
 socket.onmessage = ({data}) => {
     console.log('message from data', data)
 }
 



/**
 * Hand Detection
 */

 const videoElement = document.getElementsByClassName('input_video')[0];
 const canvasElement = document.getElementsByClassName('output_canvas')[0];
 const canvasCtx = canvasElement.getContext('2d');
 let toStart = false;
 
 function onResults(results) {
   canvasCtx.save();
   canvasCtx.clearRect(0, 0, canvasElement.width, canvasElement.height);
   canvasCtx.drawImage(
       results.image, 0, 0, canvasElement.width, canvasElement.height);
   if (results.multiHandLandmarks[0]) {
      const x = results.multiHandLandmarks[0][12].x;
      const z = Math.abs(results.multiHandLandmarks[0][12].z * 100);

      // console.log(z)

    document.getElementsByClassName('start')[0].onclick = ()=> toStart = true;  
    document.getElementsByClassName('stop')[0].onclick = ()=> {toStart = false; socket.send('stop')}
    

  if(toStart){  
      if(x < 0.3)
       {
         console.log('right'); socket.send('right');
       }
       else if(x > 0.7)
       {
         console.log('left'); socket.send('left');
       }
       else if(z < 2)
       {
         console.log('rev'); socket.send('rev');
       }
       else if(z > 14)
       {
         console.log('fwd'); socket.send('fw');
       }
       else
          socket.send('stop');
  }
        


     for (const landmarks of results.multiHandLandmarks) {
       drawConnectors(canvasCtx, landmarks, HAND_CONNECTIONS,
                      {color: '#00FF00', lineWidth: 5});
       drawLandmarks(canvasCtx, landmarks, {color: '#FF0000', lineWidth: 2});
     }
   }
   canvasCtx.restore();
 }
 
 const hands = new Hands({locateFile: (file) => {
   return `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`;
 }});
 hands.setOptions({
   maxNumHands: 2,
   modelComplexity: 1,
   minDetectionConfidence: 0.5,
   minTrackingConfidence: 0.5
 });
 hands.onResults(onResults);
 
 const ML_camera = new Camera(videoElement, {
   onFrame: async () => {
     await hands.send({image: videoElement});
   },
   width: 1280,
   height: 720
 });
 ML_camera.start();






 

/**
 * Base
 */
// Canvas
const canvas = document.querySelector('canvas.webgl')

// Scene
const scene = new THREE.Scene()

/**
 * Sizes
 */
const sizes = {
    width: window.innerWidth,
    height: window.innerHeight
}

window.addEventListener('resize', () =>
{
    // Update sizes
    sizes.width = window.innerWidth
    sizes.height = window.innerHeight

    // Update camera
    camera.aspect = sizes.width / sizes.height
    camera.updateProjectionMatrix()

    // Update renderer
    renderer.setSize(sizes.width, sizes.height)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
})

/**
 * Camera
 */
// Base camera
const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height, 0.1, 100)
camera.position.x = 1
camera.position.y = 1
camera.position.z = 1
scene.add(camera)

// Controls
const controls = new OrbitControls(camera, canvas)
controls.enableDamping = true



/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
    canvas: canvas,
    antialias: true,
})
renderer.setSize(sizes.width, sizes.height)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))

/**
 * Animate
 */
const clock = new THREE.Clock()
let lastElapsedTime = 0

const tick = () =>
{
    const elapsedTime = clock.getElapsedTime()
    const deltaTime = elapsedTime - lastElapsedTime
    lastElapsedTime = elapsedTime

    // Update controls
    controls.update()

    // Render
    renderer.render(scene, camera)

    // Call tick again on the next frame
    window.requestAnimationFrame(tick)
}

tick()