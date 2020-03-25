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
