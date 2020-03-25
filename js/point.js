// Define a class to represent a 2D point.
// It's easier to pass a Point around than to keep passing separate X and Y coordinates.
export class Point {
	
  constructor(x, y) {
    this.x = x;
    this.y = y;
  }
  
  add(dx, dy) {
    this.x += dx;
    this.y += dy;
    return this;
  }
}
