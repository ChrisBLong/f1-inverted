export class Wheel {
  
  constructor(diameter, forwardIsAddingZ) {

    this.wheelModel = null;                     // Pointer to the ThreeJS model for this wheel.
    this.bound = false;

    this.diameter = diameter;                   // Wheel diameter (m).
    this.normalForce = 0;                       // The normal force between the wheel and the road (N).
    this.frictionCoeff = 1.5;                   // The coefficient of friction between the tyre and the road.
    this.availableTraction = 0;                 // The maximum traction (N) available from the tyre given current load.
    this.torque = 0;                            // The torque being applied to the wheel (Nm).
    this.speed = 0;                             // Wheel rotation rate in radians per second.
    this.wheelSlipping = false;                 // True if torque exceeds traction.
    this.forwardIsAddingZ = forwardIsAddingZ;
    
    this.frameCounter = 0;                      // Used for counting frames when showing the 'wheel slip' animation.
    this.originalMaterial = null;               // A reference to the original material attached to the imported model.
    this.highlightMaterial = null;              // A reference to the secondary material, used to make the wheel flash.

    this.highlightMaterial = new THREE.MeshLambertMaterial({
      color: 0x660000
    })
    
  }
  
  bindToModel(node) {
    this.wheelModel = node;
    this.originalMaterial = this.wheelModel.material;
    this.bound = true;
  }
  
  getAvailableTraction() {
    this.availableTraction = this.normalForce * this.frictionCoeff;
    if (this.torque < 0) this.availableTraction = -this.availableTraction;
    return this.availableTraction;
  }
  
  getThrust() {
    
    // The thrust force is the torque in Nm divided by the radius of the wheel.
    // NB: Both thrust and traction will be negative when torque is negative.
    var thrust = this.torque / (this.diameter * 0.5);
    
    // Traction available is the maximum force the tyre can take without slipping.
    var traction = this.getAvailableTraction();

    // Thrust can't be more than traction; is it is, we'll be slipping.
    // To simulate the loss of traction when a wheel spins, reduce thrust to half the available traction.
    if (Math.abs(thrust) > Math.abs(traction)) {
      thrust = traction / 2;
      this.wheelSlipping = true;
    } else {
      this.wheelSlipping = false;
    }
    
    return thrust;
    
  }
  
  setTorque(torque) {
    this.torque = torque;
  }
  
  setSpeed(speed) {
    this.speed = speed;
  }
  
  getSpeedRpm() {
    return (this.speed * 30 / Math.PI);
  }
  
  // Calculate the wheel horsepower being developed based on the current speed and torque.
  getPowerBhp() {
    // Assumes speed in radians per second and torque in Newton-meters.
    // Gives result in brake horsepower.
    return (this.speed * this.torque * 1.341) / 1000;
  }
  
  setSpeedFromCarSpeed(linearSpeed, slipFactor) {
    // Calculate rotation rate based on the wheel's diameter.
    this.speed = ((2 * linearSpeed.value) / this.diameter) * slipFactor;
  }
  
  setNormalForce(force) {
    if (force >= 0) {
      this.normalForce = force;
    } else {
      this.normalForce = 0;
    }
  }
  
  // Update the position, rotation etc for the next animation frame.
  updateState() {
    if (!this.bound) return;
    
    var rotDelta = this.speed / 60; // Assume 60 fps
    
    if (this.forwardIsAddingZ) {
      this.wheelModel.rotation.z += rotDelta;      
    } else {
      this.wheelModel.rotation.z -= rotDelta;
    }
    
    if (this.wheelSlipping) {
      this.frameCounter++;
      if (this.frameCounter % 10 == 0) {
        this.wheelModel.material = this.highlightMaterial;
      } else if (this.frameCounter % 10 == 5) {
        this.wheelModel.material = this.originalMaterial;
      }
    } else {
      this.wheelModel.material = this.originalMaterial;
    }
    
  }
   
  getDisplayData() {
    var data = {
      speed: this.speed.toFixed(1),
      normalForce: this.normalForce.toFixed(1)
    };
    return data;
  }
  
  getBoundingBox() {
    return new THREE.Box3().setFromObject(this.wheelModel);
  }
  
}