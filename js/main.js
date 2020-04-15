/*
    Formula One Inverted Simulator.
    Copyright (C) 2020 Chris Long of Oceanview Consultancy Ltd.

    This program is free software: you can redistribute it and/or modify
    it under the terms of the GNU General Public License as published by
    the Free Software Foundation, either version 3 of the License, or
    (at your option) any later version.

    This program is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU General Public License for more details.

    You should have received a copy of the GNU General Public License
    along with this program.  If not, see <https://www.gnu.org/licenses/>.
*/

import { World } from "./world.js";
import { Car } from "./car.js";
import { Speed, Units } from "./measurements.js";

//Create our world and the car.
var world = new World();
var car = new Car("F1");

var carControls = {
    playPause: null,
    flip: null,
    torque: 0,
    brake: 0
}

var carParms = {
    mass: car.mass,
    g: car.g,
    coeffFriction: car.wheelRL.frictionCoeff,
    areaLift: car.liftArea,
    coeffLift: car.coeffLift,
    areaDrag: car.dragArea,
    coeffDrag: car.coeffDrag
}

// Clicking the 'playPause' UI element will call an anonymous function that calls the playPause() toggle function.
carControls.playPause = function() { playPause() };

// Clicking the 'flip' UI element will call an anonymous function that:
//   (a) calls the flipOrientation() toggle function;
//   (b) updates the camera position to keep as much information as possible onscreen.
carControls.flip = function() {
  car.flipOrientation()
  if (car.orientation == "erect") {
    cameraYPosTarget = cameraYPosErect;
  } else {
    cameraYPosTarget = cameraYPosInverted;
  }
};

// Create a new GUI object and initialise it with the presets for a few different cars.
var gui = new dat.GUI({
  load: {
    "preset": "F1 - Monaco",
    "closed": false,
    "remembered": {
      "F1 - Monaco": {
        "0": {
          "mass": 740,
          "g": 9.81,
          "coeffFriction": 1.5,
          "areaLift": 5.5,
          "coeffLift": 1.2,
          "areaDrag": 2.5,
          "coeffDrag": 0.85
        }
      },
      "F1 - Monza": {
        "0": {
          "mass": 740,
          "g": 9.81,
          "coeffFriction": 1.5,
          "areaLift": 5.5,
          "coeffLift": 0.7366298262685506,
          "areaDrag": 2.4083824006738657,
          "coeffDrag": 0.4278630589179951
        }
      },
      "McLaren F1": {
        "0": {
          "mass": 1138,
          "g": 9.81,
          "coeffFriction": 1,
          "areaLift": 1.79,
          "coeffLift": 0.1,
          "areaDrag": 1.79,
          "coeffDrag": 0.32
        }
      },
      "Saleen S7": {
        "0": {
          "mass": 1300,
          "g": 9.81,
          "coeffFriction": 1,
          "areaLift": 3.99632577561958,
          "coeffLift": 1.0233418245226378,
          "areaDrag": 1.7467393277798187,
          "coeffDrag": 0.33964398253212214
        }
      },
      "Radical SR8": {
        "0": {
          "mass": 648,
          "g": 9.81,
          "coeffFriction": 1.1,
          "areaLift": 2.1,
          "coeffLift": 0.9,
          "areaDrag": 2,
          "coeffDrag": 0.48
        }
      }
    },
    "folders": {
      "Parameters": {
        "preset": "Default",
        "closed": false,
        "folders": {}
      }
    }
  }
});

gui.remember(carParms);

gui.add(carControls, 'playPause');
gui.add(carControls, 'flip');
gui.add(carControls, 'torque', 0, 3200);
gui.add(carControls, 'brake', 0, 3200);

var parms = gui.addFolder('Parameters');
parms.add(carParms, 'mass', 10, 1800);
parms.add(carParms, 'g', 0, 15);
parms.add(carParms, 'coeffFriction', 0, 2.5);
parms.add(carParms, 'areaLift', 0, 6);
parms.add(carParms, 'coeffLift', 0, 2);
parms.add(carParms, 'areaDrag', 0, 6);
parms.add(carParms, 'coeffDrag', 0, 2);

var width = window.innerWidth;
var height = window.innerHeight;

var cameraScale = 300;
var cameraYPosErect = 1.5;
var cameraYPosInverted = 3.75;

var cameraYPosTarget = cameraYPosErect;

var scene = new THREE.Scene();

var camera = new THREE.OrthographicCamera( width/-cameraScale, width/cameraScale, height/cameraScale, height/-cameraScale, 1, 2000 );
camera.position.z = 3;
camera.position.y = cameraYPosTarget;
camera.lookAt(new THREE.Vector3(0, camera.position.y, 0));
scene.add(camera);

var renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize( window.innerWidth, window.innerHeight );
document.body.appendChild( renderer.domElement );

var light = new THREE.DirectionalLight(0xffffff, 2.0);
light.position.x = 0;
light.position.y = 2;
light.position.z = 4;
light.castShadow = true;
scene.add( light );

var light3 = new THREE.DirectionalLight(0xffffff, 1.5);
light3.position.x = -3;
light3.position.y = 4;
light3.position.z = 8;
light3.castShadow = true;
scene.add( light3 );

var light2 = new THREE.AmbientLight(0xffffff, 1.5);
scene.add( light2 );

scene.background = new THREE.Color('lightgrey');

// Instantiate a loader
var loader = new THREE.GLTFLoader();

// Load the glTF file exported from Blender. This contains the car, tree and road models.
loader.load(
  // resource URL
  'resources/f1-car.glb',
  // called when the resource is loaded
  function ( gltf ) {
    
    gltf.scene.traverse( function( node ) {
      console.log(node.name);
    });

    scene.add( gltf.scene );

    gltf.animations; // Array<THREE.AnimationClip>
    gltf.scene; // THREE.Scene
    gltf.scenes; // Array<THREE.Scene>
    gltf.cameras; // Array<THREE.Camera>
    gltf.asset; // Object
    
    world.bind(scene);
    car.bind(scene);

  },
  // called while loading is progressing
  function ( xhr ) {

    console.log( ( xhr.loaded / xhr.total * 100 ) + '% loaded' );

  },
  // called when loading has errors
  function ( error ) {

    console.log( 'An error happened' );

  }
);

var lastTimestamp

var render = function (timestamp) {
  requestAnimationFrame(render);

  if (!car.boundToModel) return;
  
  if (carControls.brake > 0) {
    car.setWheelTorque(0, Units.MetersPerSecond);
    car.setBraking(carControls.brake);
  } else {
    car.setWheelTorque(carControls.torque, Units.MetersPerSecond);
  }
  car.updateParms(carParms);
  car.calculateForces();
  car.updateDisplay();
  car.updateInfoPanel();
  world.setSpeed(car.speed);
  if (runAnimation) {
    world.updateState();
    car.updateState();
  }

  // Update camera position.
  camera.position.y -= (camera.position.y - cameraYPosTarget) / 9;
  
  renderer.render(scene, camera);
  
//  var frameTime = timestamp - lastTimestamp;
//  lastTimestamp = timestamp;
  
};

render();

var runAnimation = true;

function playPause() {
  runAnimation = !runAnimation;
}
