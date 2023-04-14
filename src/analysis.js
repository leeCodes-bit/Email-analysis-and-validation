const { getTrips, getDriver } = require('api');

async function analysis() {
  const data = await getTrips();

  let noOfCashTrips = 0;
  let noOfNonCashTrips = 0;
  let billedTotal = 0;
  let cashBilledTotal = 0;
  let nonCashBilledTotal = 0;
  let driverIDArray = [];
  let noOfDriversWithMoreThanOneVehicle = 0;
  let driverTrips = {};
  let mostNumTrips = 0;
  let driverWithMostTrips = [];
  let driverWithMostTripsBilledTotal = 0;
  let driver2BilledTotal = 0;
  // Loop through DATA

  data.forEach((trip) => {
    console.log(trip);

    // Get the number of CASH trips and number of NON-CASH trips
    if (trip.isCash) {
      noOfCashTrips++;
    } else {
      noOfNonCashTrips++;
    }

    // Get total amount billed for trips
       let billedAmt = trip.billedAmount;
       if (typeof billedAmt === "string") {
        billedAmt = Number(billedAmt.replace(",", ""));
        billedTotal += billedAmt;
      } else {
        billedTotal += billedAmt;
   }
     
    // Get total amount billed for CASH trips
    if (trip.isCash && typeof trip.billedAmount === "string") {
      let cashBilled = trip.billedAmount;
      cashBilled = Number(cashBilled.replace(",", ""));
      cashBilledTotal += cashBilled;
    } else if (trip.isCash && typeof trip.billedAmount !== "string") {
      let cashBilledNum = trip.billedAmount;
      cashBilledTotal += cashBilledNum;
    }

    // Get total amount billed for NON-CASH trips
    if (!trip.isCash && typeof trip.billedAmount === "string") {
      let nonCashBilled = trip.billedAmount;
      nonCashBilled = Number(nonCashBilled.replace(",", ""));
      nonCashBilledTotal += nonCashBilled;
    } else if (!trip.isCash && typeof trip.billedAmount !== "string") {
      let nonCashBilledNum = trip.billedAmount;
      nonCashBilledTotal += nonCashBilledNum;
    }

    // push each driverID into an array
    let driver = trip.driverID;
    driverIDArray.push(driver); 
    
    // Get the driver with MOST trips and HIGHEST number of trips
    if (!driverTrips[trip.driverID]) {
      driverTrips[trip.driverID] = 1;
    } else {
      driverTrips[trip.driverID]++;
    }
    if (driverTrips[trip.driverID] > mostNumTrips) {
      mostNumTrips = driverTrips[trip.driverID];
      driverWithMostTrips = [trip.driverID];
    } else if (driverTrips[trip.driverID] == mostNumTrips) {
      driverWithMostTrips.push(trip.driverID);

    }
  });
  console.log(driverTrips);

  // Sort to get driver with MOST trips
  let driverTripsArray = Object.entries(driverTrips).sort(
    (a, b) => b[1] - a[1]
  );
  driverTripsArray
  // Driver with the highest number of trips
  let theDriverWithMostTrips = driverTripsArray[0][0];

  // 2nd driver with MOST trips
  let driver2WithMostTrips = driverWithMostTrips[0]; //an array that contains driverID & no of trips
console.log(driver2WithMostTrips);

  // Getting amount made by the 2 drivers who had most trips
  data.forEach((trip) => {
    if (trip.driverID == driver2WithMostTrips) {
      let trip2Amount = trip.billedAmount;
      if (typeof trip2Amount == "string") {
        trip2Amount = Number(trip2Amount.replace(",", ""));
        driver2BilledTotal += trip2Amount;
      } else if (typeof trip2Amount == "number") {
        driver2BilledTotal += trip2Amount;
      }
    } else if (trip.driverID == theDriverWithMostTrips) {
      let tripAmount = trip.billedAmount;
      if (typeof tripAmount == "string") {
        tripAmount = Number(tripAmount.replace(",", ""));
        driverWithMostTripsBilledTotal += tripAmount;
      } else if (typeof tripAmount == "number") {
        driverWithMostTripsBilledTotal += tripAmount;
      }
    }
  });
  // Create a unique array of all drivers
  let drivers = [...new Set(driverIDArray)];
  //drivers;
  let driversPromiseArr = [];
  for (driver of drivers) {
    driversPromiseArr.push(getDriver(driver));
  }

  driversPromiseArr = await Promise.allSettled(driversPromiseArr);
  //driversPromiseArr;
  for (let driver of driversPromiseArr) {
    if (driver.value !== undefined && driver.value.vehicleID.length > 1) {
      noOfDriversWithMoreThanOneVehicle++;
    }
  }

  billedTotal = Number(billedTotal.toFixed(2));
  nonCashBilledTotal = Number(nonCashBilledTotal.toFixed(2));

  // Get info for driver with MOST trips
  let driverWithMostTripsData = await getDriver(theDriverWithMostTrips);
 
  let driverWithMostTripsInfo = {
    name: driverWithMostTripsData.name,
    email: driverWithMostTripsData.email,
    phone: driverWithMostTripsData.phone,
    noOfTrips: mostNumTrips,
    totalAmountEarned: driverWithMostTripsBilledTotal,
  };

  // Highest driver Info
  let highestEarningDriverData = await getDriver(driver2WithMostTrips);

  let highestEarningDriverInfo = {
    name: highestEarningDriverData.name,
    email: highestEarningDriverData.email,
    phone: highestEarningDriverData.phone,
    noOfTrips: mostNumTrips,
    totalAmountEarned: driver2BilledTotal,
  };

  let result = {};
  result.noOfCashTrips = noOfCashTrips;
  result.noOfNonCashTrips = noOfNonCashTrips;
  result.billedTotal = billedTotal;
  result.cashBilledTotal = cashBilledTotal;
  result.nonCashBilledTotal = nonCashBilledTotal;
  result.noOfDriversWithMoreThanOneVehicle = noOfDriversWithMoreThanOneVehicle;
  result.mostTripsByDriver = driverWithMostTripsInfo;
  result.highestEarningDriver = highestEarningDriverInfo;
// console.log(result);
  return result;
}
analysis()
module.exports = analysis;
