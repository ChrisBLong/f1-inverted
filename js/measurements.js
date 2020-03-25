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

// Abstract base class for physical measurements.

class Measurement {
  
  constructor(value, unit) {
    this.value = value;
    this.unit = unit;
  }
  
  toString() {
    return this.value.toFixed(1);
  }
  
  setFrom(newSpeed) {
    if (this.unit == newSpeed.unit) {
      this.value = newSpeed.value;
    } else {
      this.value = this.convert(newSpeed.value, newSpeed.unit, this.unit);
    }
  }
  
  convert(value, fromUnit, toUnit) {
    return value * this.conversionFactor(toUnit) / this.conversionFactor(fromUnit);
  }
  
  inUnit(toUnit) {
    return this.convert(this.value, this.unit, toUnit);
  }
  
  add(delta) {
    this.value += delta;
  }
  
}

export class Speed extends Measurement {
  
  conversionFactor(toUnit) {
    // Meters per second is the standard unit.
    // Return conversion factors for other units.
    switch (toUnit) {
      case Units.MetersPerSecond:
        return 1;
      case Units.KilometersPerHour:
        return 3.6;
      case Units.MilesPerHour:
        return 2.237;
      default:
        return 0;
    }
  }

}

export const Units = Object.freeze({
  MetersPerSecond: "meters per second",
  KilometersPerHour: "kilometers per hour",
  MilesPerHour: "miles per hour",
  RPM: "rpm",
  RadiansPerSecond: "radians per second"
})