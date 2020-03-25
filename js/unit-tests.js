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

import { Speed, Units } from "./measurements.js";

var tr = document.getElementById("testResults");

function runTest(inValue, inUnit, outUnit, expectedValue) {
  
  var testSpeed = new Speed(1, outUnit);
  var inSpeed = new Speed(inValue, inUnit);

  testSpeed.setFrom(inSpeed);

  var result = Math.abs(expectedValue - testSpeed.value) < 0.0001;
  
  tr.innerHTML += "In: " + inSpeed + "<br>";
  tr.innerHTML += "Out: " + testSpeed + "<br>";
  tr.innerHTML += "Expected: " + expectedValue + "<br>";
  
  if (result) {
    tr.innerHTML += "Result: <span style='color: green'>Passed</span><br><br>";
  } else {
    tr.innerHTML += "Result: <span style='color: red'>Failed</span><br><br>";
  }
}

runTest(10, Units.MetersPerSecond, Units.MetersPerSecond, 10);
runTest(4, Units.KilometersPerHour, Units.MetersPerSecond, 1.1111);

runTest(6.5, Units.MetersPerSecond, Units.KilometersPerHour, 23.4);
runTest(6.5, Units.MetersPerSecond, Units.MilesPerHour, 14.5405);

runTest(70, Units.MilesPerHour, Units.KilometersPerHour, 112.6508);
runTest(70, Units.MilesPerHour, Units.MilesPerHour, 70);
runTest(70, Units.MilesPerHour, Units.MetersPerSecond, 31.2919);

runTest(110, Units.KilometersPerHour, Units.KilometersPerHour, 110);
runTest(110, Units.KilometersPerHour, Units.MilesPerHour, 68.3527);
runTest(110, Units.KilometersPerHour, Units.MetersPerSecond, 30.5556);
