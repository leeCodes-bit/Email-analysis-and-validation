const { getTrips, getDriver, getVehicle } = require('api');

async function driverReport() {
  const tripsData = await getTrips();
  console.log("tripsData", tripsData);
  let driverIDsUnfiltered = [];
  tripsData.forEach((trip) => {
    driverIDsUnfiltered.push(trip.driverID); // Get all driver IDs that went on trip
  });
  driverIDsArray = [...new Set(driverIDsUnfiltered)]; // Filter the array to get only unique drivers
  //driverIDsArray
  let allDrivers = [];  
  let unRegisteredDriver;
  for (id of driverIDsArray) {
    // Loop through array of unique drivers
    try {
      let driverInfo = await getDriver(id); // Get info for a particular driver id
      //driverInfo
      let driverDetails = {};
      let trips = [];
      let noOfTrips = 0;
      let driverCars = driverInfo.vehicleID; // Create an array of vehicles of a particular driver
      let noOfCashTrips = 0;
      let noOfNonCashTrips = 0;
      let totalAmountEarned = 0;
      let totalCashAmount = 0;
      let totalNonCashAmount = 0;
      driverDetails.fullName = driverInfo.name;
      driverDetails.phone = driverInfo.phone;
      driverDetails.id = id;
      driverDetails.noOfVehicles = driverInfo.vehicleID.length;
      driverDetails.vehicle = [];
      //driverCars
      for (car of driverCars) {
        // Loop through array of vehicle IDs for current driver
        let carData = await getVehicle(car); // Get info for vehicle ID
        //carData
        let carParticulars = {}; // Object to hold vehicle plate no and manufacturer
        carParticulars.plate = carData.plate;
        carParticulars.manufacturer = carData.manufacturer;
        driverDetails.vehicle.push(carParticulars);
      }
      //Loop through trips data
      for (trip of tripsData) {
        if (trip.driverID === id && trip.isCash) {
          noOfTrips++;
          noOfCashTrips++;
          if (typeof trip.billedAmount == "string") {
            totalCashAmount += Number(trip.billedAmount.replace(",", ""));
            totalAmountEarned += totalCashAmount;
          } else if (typeof trip.billedAmount == "number") {
            totalCashAmount += trip.billedAmount;
            totalAmountEarned += totalCashAmount;
          }
        }
        if (trip.driverID === id && !trip.isCash) {
          noOfTrips++;
          noOfNonCashTrips++;
          if (typeof trip.billedAmount == "string") {
            totalNonCashAmount += Number(trip.billedAmount.replace(",", ""));
            totalAmountEarned += totalNonCashAmount;
          } else if (typeof trip.billedAmount == "number") {
            totalNonCashAmount += trip.billedAmount;
            totalAmountEarned += totalNonCashAmount;
          }
        }
        if (trip.driverID === id) {
          let tripDetails = {};
          tripDetails.user = trip.user["name"];
          tripDetails.created = trip.created;
          tripDetails.pickup = trip.pickup["address"];
          tripDetails.destination = trip.destination["address"];
          tripDetails.billed = Number(trip.billedAmount.replace(",", ""));
          tripDetails.isCash = trip.isCash;
          trips.push(tripDetails);
        }
      }
      driverDetails.noOfTrips = noOfTrips;
      driverDetails.noOfCashTrips = noOfCashTrips;
      driverDetails.noOfNonCashTrips = noOfNonCashTrips;
      driverDetails.totalAmountEarned = Number(totalAmountEarned.toFixed(2));
      driverDetails.totalCashAmount = Number(totalCashAmount.toFixed(2));
      driverDetails.totalNonCashAmount = Number(totalNonCashAmount.toFixed(2));
      driverDetails.trips = trips;
       allDrivers.push(driverDetails);
    } catch (error) {
      unRegisteredDriver = id;id
      console.error(error.messge, `This ${id} is not registered.`);
    }
  }
  // let unRegisteredDriver = driverIDsArray[driverIDsArray.length - 1];
  //console.log(typeof unRegisteredDriver)
  let unRegisteredDriverInfo = {};
  let noOfTripsUnregistered = 0;
  let noOfCashTripsUnregistered = 0;
  let noOfNonCashTripsUnregistered = 0;
  let billedAmount = 0;
  let tripsUnregistered = [];
  for (trip of tripsData) {
    if (trip.driverID == unRegisteredDriver) {
      unRegisteredDriverInfo.id = unRegisteredDriver;
      unRegisteredDriverInfo.vehicles = [];
      if (trip.driverID == unRegisteredDriver && !trip.isCash) {
        noOfTripsUnregistered++;
        noOfNonCashTripsUnregistered++;
        billedAmount += Number(trip.billedAmount.replace(",", ""));
        unRegisteredDriverInfo.noOfTrips = noOfTripsUnregistered;
        unRegisteredDriverInfo.noOfCashTrips = noOfCashTripsUnregistered;
        unRegisteredDriverInfo.noOfNonCashTrips = noOfNonCashTripsUnregistered;
        let unregTrip = {};
        unregTrip.user = trip.user["name"];
        unregTrip.created = trip.created;
        unregTrip.pickup = trip.pickup["address"];
        unregTrip.destination = trip.destination["address"];
        unregTrip.billed = Number(trip.billedAmount.replace(",", ""));
        unregTrip.isCash = trip.isCash;
        tripsUnregistered.push(unregTrip);
      }
    }
  }
  unRegisteredDriverInfo.trips = tripsUnregistered;
  unRegisteredDriverInfo.totalAmountEarned = billedAmount;
  unRegisteredDriverInfo.totalCashAmount = noOfCashTripsUnregistered;
  unRegisteredDriverInfo.totalNonCashAmount = billedAmount;
  allDrivers.push(unRegisteredDriverInfo);
}
driverReport(); 

module.exports = driverReport;
