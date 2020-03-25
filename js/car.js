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

import { Point } from "./point.js";
import { Wheel } from "./wheel.js";
import { Speed, Units } from "./measurements.js";
import { Arrow, Direction } from "./arrow.js";

export class Car {
  
  constructor(name) {

    this.boundToModel = false;
    this.carObject = null;
    this.carBodyModel = null;

    this.name = name;

    this.orientation = "erect";                           // Stop sniggering at the back.
    
    // Physical constants.
    this.g = 9.81;                                        // Acceleration due to gravity (meters per second squared).
    this.rho = 1.2;                                       // Air density (kilograms per meter cubed).
    
    this.mass = 740;                                      // The mass of the car (kg).
    
    this.liftArea = 5.5;                                  // Downforce-producing (wing/diffuser) area (meters squared).
    this.coeffLift = 1.2;                                 // Coefficient of lift (dimensionless).
    
    this.dragArea = 2.5;                                  // Frontal area for drag (meters squared).
    this.coeffDrag = 0.85;                                // Coefficient of drag (dimensionless).
    
    this.speed = 0;                                       // The current speed of the car (m/s).
    this.acceleration = 0;                                // The current acceleration of the car (m/s^2).
    this.braking = 0;
    
    // Calculated values
    this.totalThrust = 0;                                 // The total thrust from the driven wheels (N).
    this.maxAvailableThrust = 0;                          // The maximum thrust available given current tyre load (N).
    this.totalDrag = 0;                                   // The total aerodynamic drag at the current speed (N).
    this.netThrust = 0;                                   // Resultant from thrust and drag (N).
    this.downforce = 0;                                   // The total downforce (lift) from the wings (N).
    
    this.wheelFL = new Wheel(0.7, true);
    this.wheelFR = new Wheel(0.7, false);
    this.wheelRL = new Wheel(0.7, true);
    this.wheelRR = new Wheel(0.7, false);
    this.speed = new Speed(0, Units.MetersPerSecond);
    
    this.frontSlipFactor = 1.0;
    this.rearSlipFactor = 1.0;
    
    // Set initial wheel loads;
    this.setWheelLoadings();
    
    // These will record the starting X and Y position of the car.
    this.initialXPos = 0;
    this.initialYPos = 0;
    
    // This will record the starting X rotation of the car.
    this.initialXRotation = 0;

    // Target X and Y locations. The car will be moved towards these targets if its
    // current position doesn't match exactly.
    this.targetXRotation = 0;
    this.targetXPos = 0;
    this.targetYPos = 0;
    
    this.arrowNetThrust = null;
    this.arrowDrag = null;
    this.arrowRearThrust = null;
    this.arrowRearMaxThrust = null;
    this.arrowRearLoad = null;
    this.arrowFrontLoad = null;
  }
  
  bind(scene) {
    this.carObject = scene.getObjectByName("formula1");
    this.carBodyModel = scene.getObjectByName("formula1_car_color_0");
    
    // Record the starting X and Y position of the car in the loaded scene.
    this.initialXPos = this.carObject.position.x;
    this.initialYPos = this.carObject.position.y;
    this.initialXRotation = this.carObject.rotation.x;
    
    // Set the initial target position to match.
    this.targetXPos = this.carObject.position.x;
    this.targetYPos = this.carObject.position.y;
    this.targetXRotation = this.carObject.rotation.x;
    
    // Bind the four wheels, which are separate objects in the Blender scene.
    this.wheelFL.bindToModel(scene.getObjectByName("Wheel-F-L"));
    this.wheelFR.bindToModel(scene.getObjectByName("Wheel-F-R"));
    this.wheelRL.bindToModel(scene.getObjectByName("Wheel-R-L"));
    this.wheelRR.bindToModel(scene.getObjectByName("Wheel-R-R"));
    
    // Set up an Arrow object and bind it to the master arrow from the Blender scene.
    this.arrowNetThrust = new Arrow();
    this.arrowNetThrust.bindToModel(scene, scene.getObjectByName("Arrow"), scene.getObjectByName("Arrow-Head"));
    this.arrowNetThrust.setDirection(Direction.Right);

    // Create more arrows for the various quantities we want to show;
    this.arrowDrag = new Arrow();
    this.arrowDrag.cloneFrom(scene, this.arrowNetThrust);
    this.arrowDrag.setDirection(Direction.Left);
    this.arrowDrag.setColour(0xDE6014);
    
    this.arrowRearThrust = new Arrow();
    this.arrowRearThrust.cloneFrom(scene, this.arrowNetThrust);
    this.arrowRearThrust.setDirection(Direction.Right);
    
    this.arrowRearMaxThrust = new Arrow();
    this.arrowRearMaxThrust.cloneFrom(scene, this.arrowNetThrust);
    this.arrowRearMaxThrust.setDirection(Direction.Right);
    this.arrowRearMaxThrust.setColour(0x11bb11);
    
    this.arrowRearLoad = new Arrow();
    this.arrowRearLoad.cloneFrom(scene, this.arrowNetThrust);
    this.arrowRearLoad.setDirection(Direction.Down);
    this.arrowRearLoad.setColour(0x1111bb);
    
    this.arrowFrontLoad = new Arrow();
    this.arrowFrontLoad.cloneFrom(scene, this.arrowNetThrust);
    this.arrowFrontLoad.setDirection(Direction.Down);
    this.arrowFrontLoad.setColour(0x1111bb);
    
    this.boundToModel = true;
  }
  
  setWheelLoadings() {
    // Calculate the weight from the mass, add the downforce, and divide 45/55 front to rear.
    var weight = this.mass * this.g;
    
    // Negate the weight if the car is inverted.
    if (this.orientation == "inverted") {
      weight = -weight;
    }
    
    this.downforce = this.getDownforce();
    var loadPerFrontWheel = (weight + this.downforce) * 0.45 / 2;
    var loadPerRearWheel = (weight + this.downforce) * 0.55 / 2;
    this.wheelFL.setNormalForce(loadPerFrontWheel);
    this.wheelFR.setNormalForce(loadPerFrontWheel);
    this.wheelRL.setNormalForce(loadPerRearWheel);
    this.wheelRR.setNormalForce(loadPerRearWheel);
  }

  setOrientation(newOrientation) {
    if (newOrientation == "erect") {
      this.targetXRotation = this.initialXRotation;
      this.targetYPos = this.initialYPos;
      this.orientation = "erect";
      this.arrowRearLoad.setDirection(Direction.Down);
      this.arrowFrontLoad.setDirection(Direction.Down);
    } else {
      this.targetXRotation = this.initialXRotation + Math.PI;
      this.targetYPos = this.initialYPos + 4.95;      // Magic number matches the Y position of the upper 'road' in the scene.
      this.orientation = "inverted";
      this.arrowRearLoad.setDirection(Direction.Up);
      this.arrowFrontLoad.setDirection(Direction.Up);
    }
  }
  
  flipOrientation() {
    if (this.orientation == "erect") {
      this.setOrientation("inverted");
    } else {
      this.setOrientation("erect");
    }
  }

  // Read the parameters from the UI and update the models accordingly.
  updateParms(parms) {
    this.mass = parms.mass;
    this.g = parms.g;
    this.wheelFL.frictionCoeff = parms.coeffFriction;
    this.wheelFR.frictionCoeff = parms.coeffFriction;
    this.wheelRR.frictionCoeff = parms.coeffFriction;
    this.wheelRL.frictionCoeff = parms.coeffFriction;
    this.coeffLift = parms.coeffLift;
    this.coeffDrag = parms.coeffDrag;
  }
  
  // Recalculate the values for all the forces acting on the car.
  calculateForces() {
    
    // Update wheel loadings, which affect thrust available.
    this.setWheelLoadings();
     
    // Add up the thrust from each wheel.
    this.totalThrust = this.wheelFL.getThrust();
    this.totalThrust += this.wheelFR.getThrust();
    this.totalThrust += this.wheelRL.getThrust();
    this.totalThrust += this.wheelRR.getThrust();
    
    this.maxAvailableThrust = this.wheelRL.getAvailableTraction() + this.wheelRR.getAvailableTraction();
    
    this.totalDrag = this.getTotalDrag();
    this.netThrust = this.totalThrust - this.totalDrag;
      
  }
  
  // Update acceleration, velocity, position, etc.
  // Called once per frame whenever the animation is running.
  updateState() {
    
    this.acceleration = this.netThrust / this.mass;
    this.speed.add(this.acceleration / 60); // Assume 60fps.
    
    // Check for being nearly stopped and force speed to zero. This stops the car
    // being left with a very low +ve or -ve speed even after all forces are removed.
    if (Math.abs(this.acceleration) < 0.01 && Math.abs(this.speed) < 0.5) {
      this.speed.value = 0.0;
    }

    this.setWheelSpeed(this.speed);
    
    this.wheelFL.updateState();
    this.wheelFR.updateState();
    this.wheelRL.updateState();
    this.wheelRR.updateState();
    
    // Are we established inverted?
    if (this.orientation == "inverted" && Math.abs(this.carObject.position.y - this.targetYPos) < 0.001) {
      
      // If so, make the car fall if there isn't enough downforce.
      // Vertical acceleration and movement is faked rather than simulated.
      if (this.downforce < (this.mass * this.g)) {
        // I'm falling!
        this.targetXRotation = this.initialXRotation + Math.PI - 0.35;
        this.targetYPos = 1.3;
      }
    }
    
  }

  updateDisplay() {

    // Move the car model on screen in proportion to the acceleration.
    // This should give some visual feedback of what the car's doing.
    var acceleratedXPosDelta = this.acceleration / 10;
    this.targetXPos = this.initialXPos + acceleratedXPosDelta;
    
    // Move the car towards the target position and rotation.
    this.carObject.rotation.x -= (this.carObject.rotation.x - this.targetXRotation) / 9;
    this.carObject.position.x -= (this.carObject.position.x - this.targetXPos) / 9;
    this.carObject.position.y -= (this.carObject.position.y - this.targetYPos) / 9;
    
    // Update the arrows.
    var forceScaleFactor = 5000;
    
    this.arrowNetThrust.moveTo(this.getCarCentre());
    this.arrowNetThrust.setLength(this.netThrust / forceScaleFactor);
    
    this.arrowDrag.moveTo(this.getCarCentre().add(0, 0.1));
    this.arrowDrag.setLength(this.totalDrag / forceScaleFactor);
    
    this.arrowRearThrust.moveTo(this.getRearWheelCentre());
    this.arrowRearThrust.setLength(this.totalThrust / forceScaleFactor);
    
    this.arrowRearMaxThrust.moveTo(this.getRearWheelCentre().add(0, 0.1));
    this.arrowRearMaxThrust.setLength(this.maxAvailableThrust / forceScaleFactor);
    
    this.arrowRearLoad.moveTo(this.getWheelBottom(this.wheelRR));
    this.arrowRearLoad.setLength(this.wheelRR.normalForce * 2 / forceScaleFactor);
    
    this.arrowFrontLoad.moveTo(this.getWheelBottom(this.wheelFR));
    this.arrowFrontLoad.setLength(this.wheelFR.normalForce * 2 / forceScaleFactor);
    
  }
  
  // Update the various table cells displaying performance details.
  updateInfoPanel() {
    var el;
    var displayData;
    
    el = document.getElementById("carSpeedKph");
    displayData = this.speed.inUnit("kilometers per hour").toFixed(1); 
    el.innerHTML = displayData;
    
    el = document.getElementById("carNetThrustN");
    displayData = this.netThrust.toFixed(0); 
    el.innerHTML = displayData;
    
    el = document.getElementById("carAccelG");
    displayData = (this.acceleration / this.g).toFixed(1); 
    el.innerHTML = displayData;
    
    el = document.getElementById("carTractionN");
    displayData = this.maxAvailableThrust.toFixed(0); 
    el.innerHTML = displayData;
    
    el = document.getElementById("carThrustN");
    displayData = this.totalThrust.toFixed(0); 
    el.innerHTML = displayData;
    
    el = document.getElementById("carDragN");
    displayData = this.totalDrag.toFixed(0); 
    el.innerHTML = displayData;
    
    el = document.getElementById("carDownforceN");
    displayData = this.downforce.toFixed(0); 
    el.innerHTML = displayData;
    
    el = document.getElementById("carDownforcePc");
    displayData = (this.downforce * 100 / (this.mass * this.g)).toFixed(1);
    el.innerHTML = displayData;
    
    el = document.getElementById("wheelRearLoad");
    displayData = (this.wheelRL.normalForce + this.wheelRR.normalForce).toFixed(0) 
    el.innerHTML = displayData;
    
    el = document.getElementById("wheelRearRpm");
    displayData = this.wheelRL.getSpeedRpm().toFixed(0) 
    el.innerHTML = displayData;
    if (this.wheelRL.wheelSlipping) {
      el.style.backgroundColor = "coral";
    } else {
      el.style.backgroundColor = null;
    }

    el = document.getElementById("wheelRearPower");
    displayData = (this.wheelRL.getPowerBhp() + this.wheelRR.getPowerBhp()).toFixed(1) 
    el.innerHTML = displayData;

    el = document.getElementById("wheelFrontLoad");
    displayData = (this.wheelFL.normalForce + this.wheelFR.normalForce).toFixed(0) 
    el.innerHTML = displayData;

    el = document.getElementById("wheelFrontRpm");
    displayData = this.wheelFL.getSpeedRpm().toFixed(0) 
    el.innerHTML = displayData;

  }
  
  getDisplaySpeed() {
    return this.speed.toString();
  }

  // Calculate aerodynamic drag in Newtons.
  getTotalDrag() {
    return 0.5 * this.rho * this.coeffDrag * this.dragArea * (this.speed.value * this.speed.value);
  }
  
  // Calculate aerodynamic downforce in Newtons - positive values add to the tyres' normal force.
  getDownforce() {
    return 0.5 * this.rho * this.coeffLift * this.liftArea * (this.speed.value * this.speed.value);
  }
  
  setWheelTorque(torque) {
    // Send half the total torque to each of the rear wheels, nothing to the front.
    this.wheelRL.setTorque(torque / 2.0);
    this.wheelRR.setTorque(torque / 2.0);
  }
  
  setBraking(braking) {
    // Update the wheel torque to simulate braking.
    // Braking torque should be proportional to braking effort, which will give
    // increasing deceleration at lower speeds.
    // Rear-wheel braking only but braking is only used for stopping the simulated car, we're not
    // too interested in modelling it accurately.
    if (this.speed.value > 0 && braking > 0) {
      this.wheelRL.setTorque(-(braking / 2.0));
      this.wheelRR.setTorque(-(braking / 2.0));
    }
  }
  
  setSpeed(newSpeed) {
    this.speed.setFrom(newSpeed);
  }
  
  setWheelSpeed(speed) {
    this.setFrontWheelSpeed(speed);
    this.setRearWheelSpeed(speed);
  }
  
  setFrontWheelSpeed(speed) {
    this.wheelFL.setSpeedFromCarSpeed(speed, this.frontSlipFactor);
    this.wheelFR.setSpeedFromCarSpeed(speed, this.frontSlipFactor);
  }
  
  setRearWheelSpeed(speed) {
    this.wheelRL.setSpeedFromCarSpeed(speed, this.rearSlipFactor);
    this.wheelRR.setSpeedFromCarSpeed(speed, this.rearSlipFactor);
  }
  
  getRearWheelCentre() {
    var box = this.wheelRR.getBoundingBox();
    return new Point((box.min.x+box.max.x)/2, (box.min.y+box.max.y)/2);
  }
  
  getWheelBottom(wheel) {
    var wheelBox = wheel.getBoundingBox();
    var carBox = new THREE.Box3().setFromObject(this.carBodyModel);
    if (this.orientation == "erect") {
      return new Point((wheelBox.min.x+wheelBox.max.x)/2, carBox.min.y);
    } else {
      return new Point((wheelBox.min.x+wheelBox.max.x)/2, carBox.max.y);
    }
  }
  
  getCarCentre() {
    var box = new THREE.Box3().setFromObject(this.carBodyModel);
    return new Point((box.min.x+box.max.x)/2, (box.min.y+box.max.y)/2);
  }
}