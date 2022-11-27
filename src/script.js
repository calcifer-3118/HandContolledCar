import './style.css'
import './home.css'
import './slide1691.css'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';


/**
 * Server
*/

 const socket = new WebSocket('ws://localhost:8085')

 socket.onerror = error => {
   console.error(error)

   document.getElementsByClassName('slide1691-text')[0].style.display = "block"
   document.getElementsByClassName('myEllipse')[0].style.display = "block"

   document.getElementsByClassName('slide1691-text')[0].innerHTML = "Server not connected"
   document.getElementsByClassName('myEllipse')[0].style = "fill:rgb(244, 71, 52);"

   document.getElementById('retry').style.display = "block"
   document.getElementById('start').style.display = "none"



 }

 socket.onopen = ()=> {

 document.getElementsByClassName('slide1691-text')[0].style.display = "block"
 document.getElementsByClassName('myEllipse')[0].style.display = "block"
 document.getElementById('start').style.display = "block"


 }

 
 
 /**
  * Load Models
  */
let mixer;
let forward;
let reverse
let left; 
let right;
let allClips;

let models_loaded = false;

const loader = new GLTFLoader();
const loadModels = (url)=>{
  loader.load(url, (model)=>{
    scene.add(model.scene)
    
      
    mixer = new THREE.AnimationMixer(model.scene);
    allClips = model.animations;
      
    const clip1 = THREE.AnimationClip.findByName(allClips, 'wh_bl_fwd');
    const clip2 = THREE.AnimationClip.findByName(allClips, 'wh_fl_fwd');
    const clip3 = THREE.AnimationClip.findByName(allClips, 'wh_br_fwd');
    const clip4 = THREE.AnimationClip.findByName(allClips, 'wh_fr_fwd');
    
      const clip5 = THREE.AnimationClip.findByName(allClips, 't_bl_fwd');
      const clip6 = THREE.AnimationClip.findByName(allClips, 't_fl_fwd');
      const clip7 = THREE.AnimationClip.findByName(allClips, 't_br_fwd');
      const clip8 = THREE.AnimationClip.findByName(allClips, 't_fr_fwd');
      
      const clip9 = THREE.AnimationClip.findByName(allClips, 'wh_bl_rev');
      const clip10 = THREE.AnimationClip.findByName(allClips, 'wh_fl_rev');
      const clip11 = THREE.AnimationClip.findByName(allClips, 'wh_br_rev');
      const clip12 = THREE.AnimationClip.findByName(allClips, 'wh_fr_rev');
      
      const clip13 = THREE.AnimationClip.findByName(allClips, 't_bl_rev');
      const clip14 = THREE.AnimationClip.findByName(allClips, 't_fl_rev');
      const clip15 = THREE.AnimationClip.findByName(allClips, 't_br_rev');
      const clip16 = THREE.AnimationClip.findByName(allClips, 't_fr_rev');
      
      forward = [clip1, clip2, clip3, clip4, clip5, clip6, clip7, clip8]
      reverse = [clip9, clip10, clip11, clip12, clip13, clip14, clip15, clip16]
      left = [clip9, clip10, clip3, clip4, clip13, clip14, clip7, clip8]
      right = [clip11, clip12, clip1, clip2, clip5, clip6, clip15, clip16]
      
      models_loaded = true;
    })
  }
  
  loadModels('/car.glb')  
  let stop_anim = false;
const animate = (direction)=>{
  if(!stop_anim){
    direction.forEach((clip)=>{
      mixer.clipAction(clip).play();
    })
  }
  else{
    mixer.stopAllAction();
    stop_anim = false;
  }
}

socket.onmessage = ({data}) => {
    if(data == 'fwd'){
      animate(forward)
     document.getElementsByClassName('heading')[0].innerHTML = 'FORWARD'
    }
    else if(data == 'rev') 
    {
      animate(reverse)
      document.getElementsByClassName('heading')[0].innerHTML = 'REVERSE'
    }
    else if(data == 'left') {
      animate(left)
     document.getElementsByClassName('heading')[0].innerHTML = 'LEFT'
    }
    else if(data == 'right') {
      animate(right)
      document.getElementsByClassName('heading')[0].innerHTML = 'RIGHT'
    }
    else if(data == 'stop') {
       stop_anim = true;  animate(allClips);
     document.getElementsByClassName('heading')[0].innerHTML = ''
    }
}



window.start = ()=>{
  
  
  document.getElementsByTagName("model-viewer")[0].style.display = 'none'
  document.getElementsByTagName("model-viewer")[0].style.display = 'none'

  document.getElementsByClassName('slide1691-container')[0].style.display = "none"

  document.getElementsByClassName('home-slide1691')[0].style.display = 'flex'

 

}



/**
 * Hand Detection
 */
window.loadHandModel = ()=>{

     document.getElementsByClassName('home-frame1')[0].style.display = 'none'
     document.getElementsByClassName('home-text')[0].style.display = 'none'


     document.getElementsByClassName('start')[0].style.display = 'inline'
     document.getElementsByClassName('stop')[0].style.display = 'inline'


     document.getElementsByClassName('webgl')[0].style.display = 'block'

     

      const videoElement = document.getElementsByClassName('input_video')[0];
      const canvasElement = document.getElementsByClassName('output_canvas')[0];
      const canvasCtx = canvasElement.getContext('2d');
      let toStart = false;

      function onResults(results) {
      
        canvasCtx.save();
        canvasCtx.clearRect(0, 0, canvasElement.width, canvasElement.height);
        // canvasCtx.drawImage(
            // results.image, 0, 0, canvasElement.width, canvasElement.height);
        if (results.multiHandLandmarks[0]) {
           const x = results.multiHandLandmarks[0][12].x;
           const z = Math.abs(results.multiHandLandmarks[0][12].z * 100);
        
           // console.log(z)
        
         document.getElementsByClassName('start')[0].onclick = ()=> toStart = true;  
         document.getElementsByClassName('stop')[0].onclick = ()=> {toStart = false; socket.send('stop')}

         console.log(toStart)
        
        
       if(toStart){  
           if(x < 0.3)
            {
              console.log('right'); socket.send('right'); animate(right);  
              document.getElementsByClassName('heading')[0].innerHTML = 'RIGHT'
            }
            else if(x > 0.7)
            {
              console.log('left'); socket.send('left'); animate(left); 
              document.getElementsByClassName('heading')[0].innerHTML = 'LEFT'
            }
            else if(z < 2)
            {
              console.log('rev'); socket.send('rev'); animate(reverse); 
              document.getElementsByClassName('heading')[0].innerHTML = 'REVERSE'
            }
            else if(z > 14)
            {
              console.log('fwd'); socket.send('fwd'); animate(forward);
              document.getElementsByClassName('heading')[0].innerHTML = 'FORWARD'
            }
            else{
               socket.send('stop');  stop_anim = true;  animate(allClips);
               document.getElementsByClassName('heading')[0].innerHTML = ''
            }
       }

     
     
       for (const landmarks of results.multiHandLandmarks) {
        drawConnectors(canvasCtx, landmarks, HAND_CONNECTIONS,
                       {color: '#47423c', lineWidth: 3});
        drawLandmarks(canvasCtx, landmarks, {color: '#908579', lineWidth: 1});
       }
      }
      canvasCtx.restore();
      }

      const hands = new Hands({locateFile: (file) => {
        return `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`;
      }});
      hands.setOptions({
        maxNumHands: 1,
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
        height: 720,
      });
      ML_camera.start();
    
}

window.loadKeyboard = ()=>{

  document.getElementsByClassName('home-frame1')[0].style.display = 'none'
  document.getElementsByClassName('home-text')[0].style.display = 'none'
  document.getElementsByClassName('webgl')[0].style.display = 'block'
  

  window.addEventListener('keydown', (e) => {
      if(e.keyCode == 87) 
      {
        console.log('fwd'); socket.send('fwd'); animate(forward);
        document.getElementsByClassName('heading')[0].innerHTML = 'FORWARD'
      }
      else if(e.keyCode == 65) 
      {
        console.log('left'); socket.send('left'); animate(left); 
        document.getElementsByClassName('heading')[0].innerHTML = 'LEFT'
      }
      else if(e.keyCode == 83) 
      {
        console.log('rev'); socket.send('rev'); animate(reverse); 
        document.getElementsByClassName('heading')[0].innerHTML = 'REVERSE'
      }
      else if(e.keyCode == 68) 
      {
        console.log('right'); socket.send('right'); animate(right);  
        document.getElementsByClassName('heading')[0].innerHTML = 'RIGHT'
      }
  })

  window.addEventListener('keyup', ()=>{
    socket.send('stop');  stop_anim = true;  animate(allClips);
    document.getElementsByClassName('heading')[0].innerHTML = ''
  })

}

window.loadGamepad = ()=>{

  document.getElementsByClassName('home-frame1')[0].style.display = 'none'
  document.getElementsByClassName('home-text')[0].style.display = 'none'

  socket.send('gamepad')

  document.getElementsByClassName('webgl')[0].style.display = 'block'
}

 

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
controls.enableDamping = true;
controls.maxDistance = 6;
controls.minDistance = 4;
controls.maxPolarAngle = 1.3089969389957472
controls.enablePan = false 
controls.target.set(0, -0.2, 0)

/**
 * Lighting
 */

const light = new THREE.HemisphereLight(
  'white', // bright sky color
  'darkslategrey', // dim ground color
  5, // intensity
);

const mainLight = new THREE.DirectionalLight('white', 55);
mainLight.position.set(10, 10, 10);
scene.add(light, mainLight)

//  const hemiLight  = new THREE.HemisphereLight(0xffeeb1, 0x080820, 5);
//  scene.add(hemiLight);
 const ambientLight  = new THREE.AmbientLight(0xffac95c, 5);
 scene.add(ambientLight);
 const dirlight  = new THREE.DirectionalLight(0xffac95c, 50);
 scene.add(dirlight);
//  const planeLight  = new THREE.RectAreaLight(0xffac95c, 50, 30, 10);
//  scene.add(planeLight);
 const pointLight  = new THREE.PointLight(0xffac95c, 50, 50);
 scene.add(pointLight);


/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
    canvas: canvas,
    antialias: true,
    alpha: true 
})
renderer.setSize(sizes.width, sizes.height)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
renderer.toneMapping = THREE.ReinhardToneMapping;
renderer.toneMappingExposure = 2.3;

/**
 * Animate
 */
const clock = new THREE.Clock()
let lastElapsedTime = 0

const tick = () =>
{
    if(mixer)
      mixer.update(clock.getDelta());

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