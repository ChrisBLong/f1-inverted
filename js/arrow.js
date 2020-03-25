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

export class Arrow {
  
  constructor() {
    this.x = 0;
    this.y = 0;
    this.length = 1;
    this.baseLength = 1;
    this.direction = Direction.Up;
    this.modelArrow = null;
    this.modelHead = null;
    this.arrowGroup = null;
    this.bound = false;
  }
  
  bindToModel(scene, arrowModel, headModel) {
    this.modelArrow = arrowModel;
    this.modelHead = headModel;
    
    this.arrowGroup = new THREE.Group();
    this.arrowGroup.add(this.modelArrow);
    this.arrowGroup.add(this.modelHead);
    scene.add(this.arrowGroup);
    
    this.bound = true;
    
    this.x = this.modelArrow.position.x;
    this.y = this.modelArrow.position.y;
    
    // Measure the arrow's body when at a scale of 1.0. This will allow us to convert
    // any other desired length to the correct scale value.
    this.modelArrow.scale.y = 1.0;
    var box = new THREE.Box3().setFromObject(this.modelArrow);
    this.baseLength = box.max.y - box.min.y;
    
    this.modelArrow.position.x = 0;
    this.modelArrow.position.y = 0;
    this.modelHead.position.x = 0;
    this.modelHead.position.y = 0;
  }
  
  moveTo(p) {
    this.x = p.x;
    this.y = p.y;
    this.updateModel();
  }
  
  setLength(length) {
    this.length = length;
    this.updateModel();
  }

  setDirection(direction) {
    this.direction = direction;
    this.updateModel();
  }
  
  setColour(newColour) {
    this.modelArrow.material.color.setHex(newColour);
    this.modelHead.material.color.setHex(newColour);
  }
  
  cloneFrom(scene, sourceArrow) {
    
    // Clone the two objects that make up the arrow.
    this.modelArrow = sourceArrow.modelArrow.clone();
    this.modelHead = sourceArrow.modelHead.clone();
    
    // Clone the material.
    var material = sourceArrow.modelArrow.material.clone();
    this.modelArrow.material = material;
    this.modelHead.material = material;
    
    this.arrowGroup = new THREE.Group();
    this.arrowGroup.add(this.modelArrow);
    this.arrowGroup.add(this.modelHead);
    this.baseLength = sourceArrow.baseLength;
    scene.add(this.arrowGroup);
  }

  updateModel() {
    this.arrowGroup.position.x = this.x;
    this.arrowGroup.position.y = this.y;
    this.arrowGroup.rotation.z = this.direction;
    this.modelArrow.scale.y = this.length / this.baseLength;
    this.modelHead.position.y = this.length;
    if (this.length >= 0) {
      this.modelHead.rotation.z = 0;
    } else {
      this.modelHead.rotation.z = Math.PI;
    }
  }
  
}

export const Direction = Object.freeze({
  Up: 0,
  Down: Math.PI,
  Left: 0.5 * Math.PI,
  Right: 1.5 * Math.PI
})