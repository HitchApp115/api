const express = require('express');
const axios = require('axios');
const fs = require('fs')
const multer = require('multer')



const {connection, connect, close } = require('./database_functions/connect')
const {
  createAccount,
  login,
  pollCompletedRidesByRider,
  pollCompletedRidesByDriver,
  getNearbyRides,
  createNewRide,
  createDriverInfo,
  resolveRiderRequest,
  sendRiderRequest,
  removeRiderRequest,
  getNumRiders,
  getCreatedRidesByDriver,
  getRequestingRidersByRid,
  getRideStartPoint,
  getAccountInfo,
  getPendingRideStatus,
  deletePendingRide,
  deletePendingRiders,
  getAcceptedRidersByRide,
  getPendingRideByRide,
  markRideAsActive,
  grabActiveRide,
  completeRide,
  ridesAwaitingPickup,
  riderPickedUp
} = require("./database_functions/queries");
const {
  randomId,
  loginHash,
  passwordSalt,
  verifyLoginHash,
  getRoutesJSON,
  formatDateTime
} = require("./helpers");
const { start } = require("repl");
const loginHashMap = JSON.parse(fs.readFileSync("logins.json")); // new Map()

const app = express();
const port = process.env.PORT || 3000;
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });


app.use(express.json());
app.use(express.urlencoded({ extended: true }));

connect(connection);

app.post("/account/create", async (req, res) => {
  const { username, email, password, phone, first_name, last_name } = req.body;
  console.log(username, email, password, phone, first_name, last_name)
  createAccount(
    connection,
    randomId(),
    username,
    email,
    passwordSalt(username, password),
    phone,
    first_name,
    last_name,
    (err, result) => {
      if (err) {
        // Handle the error case
        res.status(400).send(err);
      } else {
        // Handle the success case
        res.status(200).send(result);
      }
    }
  );
});

app.post("/account/logout", (req, res) => {
  const { authorization } = req.headers;
  if (!verifyLoginHash(loginHashMap, authorization, new Date())) {
    res.status(401).send("User not logged in");
    return;
  }
  delete loginHashMap[authorization];
  fs.writeFileSync("logins.json", JSON.stringify(loginHashMap));
  res.send({ status: "success" });
});

app.post("/account/login", async (req, res) => {
  const { username, password } = req.body;
  const resp = await login(
    connection,
    username,
    passwordSalt(username, password)
  );

  if (!resp.length) {
    res.status(400).send("Account not found");
    return;
  }

  const userId = resp[0]["user_id"];

  const now = new Date();
  const loginToken = loginHash(username, now.toISOString());

  const expiry = new Date();
  expiry.setDate(now.getDate() + 1);

  //loginHashMap.set(loginToken, {username, userId, expiry: expiry.toISOString()})
  loginHashMap[loginToken] = { username, userId, expiry: expiry.toISOString() };
  fs.writeFileSync("logins.json", JSON.stringify(loginHashMap));
  res.send({ status: "success", loginToken });
});

app.get("/rides/completedByRider", async (req, res) => {
  const { authorization } = req.headers;
  if (!verifyLoginHash(loginHashMap, authorization, new Date())) {
    res.status(401).send("User not logged in");
    return;
  }

  //const { userId } = loginHashMap.get(authorization)
  const { userId } = loginHashMap[authorization];
  const rides = await pollCompletedRidesByRider(connection, userId);
  console.log(rides);
  res.send({
    status: "success",
    rides,
  });
});

app.get("/rides/completedByDriver", async (req, res) => {
  const { authorization } = req.headers;
  if (!verifyLoginHash(loginHashMap, authorization, new Date())) {
    res.status(401).send("User not logged in");
    return;
  }

  //const { userId } = loginHashMap.get(authorization)
  const { userId } = loginHashMap[authorization];
  const rides = await pollCompletedRidesByDriver(connection, userId);
  console.log(rides);
  res.send({
    status: "success",
    rides,
  });
});

app.post("/rides/create", async (req, res) => {
  const { authorization } = req.headers;
  if (!verifyLoginHash(loginHashMap, authorization, new Date())) {
    res.status(401).send("User not logged in");
    return;
  }

  //const { userId } = loginHashMap.get(authorization)
  const { userId } = loginHashMap[authorization];
  const rideId = randomId();
  const {
    startPointName,
    endPointName,
    startPoint,
    destination,
    riders,
    costPerRider,
    pickUpDistance,
    rideStartTime,
  } = req.body;

  const [startPointLat, startPointLong] = [
    startPoint.latitude,
    startPoint.longitude,
  ];
  const [endPointLat, endPointLong] = [
    destination.latitude,
    destination.longitude,
  ];
  const formattedStartTime = formatDateTime(rideStartTime);
  let response = await createNewRide(
    connection,
    rideId,
    userId,
    `${startPointName}:${startPointLat},${startPointLong}`,
    `${endPointName}:${endPointLat},${endPointLong}`,
    riders,
    costPerRider,
    pickUpDistance,
    formattedStartTime
  );
  res.send({
    status: "success",
    rideId,
    userId,
    start: `StartPoint:${startPointLat},${startPointLong}`,
    end: `EndPoint:${endPointLat},${endPointLong}`,
    riders,
    costPerRider,
    pickUpDistance,
    sql: response
  }); 
});
//startPoint: string in StartPoint:Lat,Lon
//maxPrice: float
app.get("/rides/view", async (req, res) => {
  const { startPoint, maxPrice } = req.query;
  // get should use req.query
  let rides = await getNearbyRides(connection, startPoint, maxPrice);
  res.send({
    status: "success",
    rides,
  });
});


app.get("/rides/pending", async (req, res) => {
  const { authorization } = req.headers;
  if (!verifyLoginHash(loginHashMap, authorization, new Date())) {
    res.status(401).send("User not logged in");
    return;
  }

  //const { userId } = loginHashMap.get(authorization)
  const { userId } = loginHashMap[authorization];

  //Get rides created by the userId

  let rides = await getCreatedRidesByDriver(connection, userId);
  console.log(rides);
  for (let ride of rides) {
    ride["requesting_riders"] = await getRequestingRidersByRid(
      connection,
      ride["ride_id"]
    );
  }

  console.log(rides);

  res.send({
    status: "success",
    pendingRides: rides,
  });
});


app.get("/directions", async (req, res) => {
  try {
    const { origin, destination } = req.query;

    if (!origin || !destination) {
      return res
        .status(400)
        .json({ error: "Both origin and destination are required." });
    }

    // Make a request to the Google Maps Directions API
    const response = getRoutesJSON(origin, destination);

    // Extract and send the response from Google Maps API to the client
    res.json(response.data);
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ error: "An error occurred while fetching directions." });
  }
});

app.get("/driver/info", async (req, res) => {
  const { authorization } = req.headers;

  if (!verifyLoginHash(loginHashMap, authorization, new Date())) {
    res.status(401).send("User not logged in");
    return;
  }

  const { userId } = loginHashMap[authorization];

  try {
    const driverInfo = await getDriverInfo(connection, userId);
    res.send({
      status: "success",
      driverInfo,
    });
  } catch (error) {
    console.error("Error fetching driver information:", error);
    res.status(500).send({
      status: "error",
      message: "Internal server error",
    });
  }
});

//rideId: int
//riderId: int      Id belonging to the rider requesting to join
//acceptRider: boolean (0 or 1) that says if the driver wants to accept the rider
app.post("/rides/resolveRiderRequest", async (req, res) => {
  const { authorization } = req.headers;
  if (!verifyLoginHash(loginHashMap, authorization, new Date())) {
    res.status(401).send("User not logged in");
    return;
  }
  // const { userId } = loginHashMap[authorization];
  const { rideId, riderId, acceptRider } = req.body;
  try {
    let resp = await resolveRiderRequest(
      connection,
      rideId,
      riderId,
      acceptRider
    );
    res.send({
      status: "success",
      message: resp, //'Successfully added rider' or 'Ride is full'
    });
  } catch (error) {
    console.error("Error resolving rider request information:", error);
    res.status(500).send({
      status: "error",
      message: "Internal server error",
    });
  }
});

//rideId: int
app.post("/rides/sendRiderRequest", async (req, res) => {
  const { authorization } = req.headers;
  if (!verifyLoginHash(loginHashMap, authorization, new Date())) {
    res.status(401).send("User not logged in");
    return;
  }

  const { userId } = loginHashMap[authorization];
  const { rideId, riderStartPoint } = req.body;
  const rideStartPoint = (await getRideStartPoint(connection, rideId))[0][
    "start_point"
  ];
  try {
    const resp = await sendRiderRequest(
      connection,
      userId,
      rideId,
      rideStartPoint,
      riderStartPoint
    );
    res.send({
      status: "success",
      message: resp, // Will send 'Made request' or 'Preexisting user request' if duplication present
    });
  } catch (error) {
    console.error("Error sending rider request", error);
    res.status(500).send({
      status: "error",
      message: "Internal server error",
    });
  }
});

app.post("/rides/end", async (req, res) => {
  const { authorization } = req.headers;
  if (!verifyLoginHash(loginHashMap, authorization, new Date())) {
    res.status(401).send("User not logged in");
    return;
  }
  const { userId } = loginHashMap[authorization];
  const {rideId} = req.body
  try {
    const resp = await completeRide(connection, rideId);
    res.send({
      status: "success",
    });
  } catch (error) {
    console.error("Error ending ride", error);
    res.status(500).send({
      status: "error",
      message: "Internal server error",
    });
  }
})

// Content-type : multipart/form-data // I'm not too sure whats the formatting for this
app.post(
  "/driver/info",
  upload.fields([
    { name: "driverPhoto", maxCount: 1 },
    { name: "inspectionForm", maxCount: 1 },
  ]),
  async (req, res) => {
    const { authorization } = req.headers;

    if (!verifyLoginHash(loginHashMap, authorization, new Date())) {
      res.status(401).send("User not logged in");
      return;
    }

    const { userId } = loginHashMap[authorization];

    const {
      carColor,
      carMake,
      carModel,
      carYear,
      seatCount,
      insurance,
      licensePlate,
      license,
      residencyState,
    } = req.body;

    const driverPhoto = req.files["driverPhoto"][0].buffer;
    const inspectionForm = req.files["inspectionForm"][0].buffer;

    try {
      const driverInfo = await createDriverInfo(
        connection,
        userId,
        carMake,
        carModel,
        licensePlate,
        license,
        carYear,
        seatCount,
        carColor,
        driverPhoto,
        insurance,
        residencyState,
        inspectionForm
      );
      res.send({
        status: "success",
      });
    } catch (error) {
      console.error("Error fetching driver information:", error);
      res.status(500).send({
        status: "error",
        message: "Internal server error",
      });
    }
  }
);


app.get('/account/info', async (req, res) => {
    const { authorization } = req.headers;
    if (!verifyLoginHash(loginHashMap, authorization, new Date())) {
      res.status(401).send("User not logged in");
      return;
    }
    const { userId } = loginHashMap[authorization];
  try {
    const accountInfo = await getAccountInfo(connection, userId);
    res.send({
      status: "success",
      accountInfo,
    });
  } catch (error) {
    console.error("Erro fetching account information", error);
    res.status(500).send({
      status: "error",
      message: "Internal server error",
    });
  }
});

app.post('/rides/start', async (req,res) => {
  const { authorization } = req.headers;
  if (!verifyLoginHash(loginHashMap, authorization, new Date())) {
    res.status(401).send("User not logged in");
    return;
  }
//   console.log("AUTHORIZATION:", authorization);
  const { rideId } = req.body
  const { userId } = loginHashMap[authorization]
  try {
    const message = await markRideAsActive(connection, userId, rideId)
    res.send({
      status: 'success',
      message
    })
  } catch (error) {
    console.error("Error starting ride", error);
    res.status(500).send({
      status: "error",
      message,
    });
  }
})


//  Gets current active ride where the logged in user is a driver
app.get('/rides/active', async (req, res) => {
  const { authorization } = req.headers;
  if (!verifyLoginHash(loginHashMap, authorization, new Date())) {
    res.status(401).send("User not logged in");
    return;
  }
//   console.log("AUTHORIZATION:", authorization);
    const { userId } = loginHashMap[authorization];

  let rideId = await grabActiveRide(connection, userId)
  if (rideId.length) {
    rideId = rideId[0]['ride_id']
  } else{
    res.send({
      status: 'success',
      riders: [],
      ride: []
    })
    return
  }


  //  Get the riders and their start points     getRequestingRidersByRid
  let ridersData = await getAcceptedRidersByRide(connection, rideId)
  let rideData = await getPendingRideByRide(connection, rideId)

  // //  Remove Pending/accepted rides from ride_requests and move to completed_rides_by_rider

  // console.log("RIDER:", ridersData, rideData)
    // Send the rider startPoints, and the destination for the ride
  res.send({
      status: 'success',
      riders: ridersData,
      ride: rideData
  })

  if (!verifyLoginHash(loginHashMap, authorization, new Date())) {
    res.status(401).send("User not logged in");
    return;
  }
});


  

app.post("/rides/approved", async (req, res) => {
  const { authorization } = req.headers;
  if (!verifyLoginHash(loginHashMap, authorization, new Date())) {
    res.status(401).send("User not logged in");
    return;
  }
//   console.log("AUTHORIZATION:", authorization);
  const { userId } = loginHashMap[authorization];
  const rider_id = userId;
  try {
    const resp = await getPendingRideStatus(connection, rider_id);
    res.send({
      status: "success",
      message: resp,
    });
  } catch (error) {
    console.error("Error fetching ride status", error);
    res.status(500).send({
      status: "error",
      message: "Internal server error",
    });
  }
});

app.delete('/rides/remove', async (req,res) => {
    const { authorization } = req.headers;
    if (!verifyLoginHash(loginHashMap, authorization, new Date())) {
      res.status(401).send("User not logged in");
      return;
    }
  //   console.log("AUTHORIZATION:", authorization);
    const { userId } = loginHashMap[authorization];
    const { rideId } = req.body

    await deletePendingRide(connection, rideId, userId)
    await deletePendingRiders(connection, rideId)
    res.send({
        status: 'success'
    })
})

app.get('/rides/active', async (req, res) => {
  const { authorization } = req.headers;
  if (!verifyLoginHash(loginHashMap, authorization, new Date())) {
    res.status(401).send("User not logged in");
    return;
  }
//   console.log("AUTHORIZATION:", authorization);
  const { userId } = loginHashMap[authorization];

  let rideId = (await grabActiveRide(connection, userId))[0]['ride_id']


  //  Get the riders and their start points     getRequestingRidersByRid
  let ridersData = await getAcceptedRidersByRide(connection, rideId)
  let rideData = await getPendingRideByRide(connection, rideId)

  // //  Remove Pending/accepted rides from ride_requests and move to completed_rides_by_rider

  // console.log("RIDER:", ridersData, rideData)
    // Send the rider startPoints, and the destination for the ride
  res.send({
      status: 'success',
      riders: ridersData,
      ride: rideData
  })
})

app.post('/rides/pickup', async (req, res) => {
  const { authorization } = req.headers;
  if (!verifyLoginHash(loginHashMap, authorization, new Date())) {
    res.status(401).send("User not logged in");
    return;
  }
  // console.log("AUTHORIZATION:", authorization);
  //const { userId } = loginHashMap[authorization];
  const { rideId, riderId } = req.body;
  try {
    const resp = await riderPickedUp(connection, rideId, riderId);
    res.send({
      status: "success",
    });
  } catch (error) {
    console.error("Error updating rider pickup status", error);
    res.status(500).send({
      status: "error",
      message: "Internal server error",
    });
  }
})

app.get('/account/verifyToken', (req, res) => {
  const { authorization } = req.headers;
  if (!verifyLoginHash(loginHashMap, authorization, new Date())) {
    res.status(401).send("User not logged in");
    return;
  }
  // console.log("AUTHORIZATION:", authorization);
  const { userId } = loginHashMap[authorization];

  res.send({
    status: 'success',
    userId
  })
})

app.get('/account/rideAwaitingPickup', async (req, res) => {
  const { authorization } = req.headers;
  if (!verifyLoginHash(loginHashMap, authorization, new Date())) {
    res.status(401).send("User not logged in");
    return;
  }
  // console.log("AUTHORIZATION:", authorization);
  const { userId } = loginHashMap[authorization];

  let rides = await ridesAwaitingPickup(connection, userId)
  res.send({
    status: 'success',
    rides: rides
  })

})

app.post("/rides/riderRequestRemoval", async (req, res) => {
  const { authorization } = req.headers;
  if (!verifyLoginHash(loginHashMap, authorization, new Date())) {
    res.status(401).send("User not logged in");
    return;
  }
  const { userId } = loginHashMap[authorization];
  const { rideId } = req.body
  try {
    const resp = await removeRiderRequest(connection, userId, rideId);
    res.send({
      status: "success",
    });
  } catch (error) {
    console.error("Error removing rider from ride", error);
    res.status(500).send({
      status: "error",
      message: "Internal server error",
    });
  }
});


app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});

