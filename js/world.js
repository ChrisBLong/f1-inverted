import { Speed, Units } from "./measurements.js";

export class World {
  
  constructor() {
    this.boundToModel = false;
    this.treeMaster = null;
    this.trees = [];
    this.speed = new Speed(0, Units.MetersPerSecond);
  }
  
  bind(scene) {
    this.treeMaster = scene.getObjectByName("Tree");
    
    if (this.treeMaster != null) {
      
      // Set initial position.
      this.treeMaster.position.x = 5;
      this.trees.push(this.treeMaster);
      
      // Duplicate treeMaster to create more trees.
      for (var i=0; i < 6; i++) this.createDuplicateTree(this.treeMaster, scene);
      
      this.boundToModel = true;
    }
  }

  setSpeed(newSpeed) {
    this.speed.setFrom(newSpeed)
  }
  
  updateState() {
    if (!this.boundToModel) return;

    for (var i=0; i < this.trees.length; i++) {
      this.moveTree(this.trees[i], this.speed.value);
    }
  }
  
  createDuplicateTree(master, scene) {
    var newTree = master.clone();
    var random = 1 + (Math.random() * 4);
    var scale = 1 / random;
    console.log("Position: " + random + "; Scale: " + scale);
    newTree.position.z -= random;
    newTree.position.x = 4 - (Math.random() * 8);
    newTree.scale.x *= scale;
    newTree.scale.y *= scale;
    newTree.scale.z *= scale;
    scene.add(newTree);
    this.trees.push(newTree);
  }
  
  moveTree(tree, speed) {
    // The ThreeJS world units approximate to meters. Calculate how fast to move each tree
    // based on its Z location behind the car; the further back, the slower it should move,
    // to create some parallax in the orthogonal scene.
    
    var treeDelta = 0.01 * speed / -tree.position.z;
    
    var xPosition = tree.position.x;
    
    xPosition -= treeDelta;
    
    if (xPosition < -8.0) {
      // Move the tree back to the right hand side so that it can slide by again.
      xPosition = 8.0;
    }
    
    if (xPosition > 8.0) {
      // Move the tree back to the left hand side so that it can slide by again.
      xPosition = -8.0;
    }
    
    tree.position.x = xPosition;
  }
  
}