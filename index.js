const express = require('express');
const axios = require('axios');
const fs = require('fs')
const multer = require('multer')

const {connection, connect, close } = require('./database_functions/connect')
const { 
    createAccount, 
    login, 
    pollCompletedRides,
    getNearbyRides,
    createNewRide,
    createDriverInfo,
    resolveRiderRequest,
    sendRiderRequest,
    getNumRiders
 } = require('./database_functions/queries')
const {
    randomId, 
    loginHash, 
    passwordSalt, 
    verifyLoginHash,
    getRoutesJSON
} = require('./helpers')
const loginHashMap = JSON.parse(fs.readFileSync('logins.json')) // new Map()

const app = express();
const port = process.env.PORT || 3000;
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

connect(connection)

app.post('/account/create', async (req, res) => {
  const { username, email, password, phone } = req.body;

  createAccount(connection, randomId(), username, email, passwordSalt(username, password), phone, (err, result) => {
      if (err) {
          // Handle the error case
          res.status(400).send(err);
      } else {
          // Handle the success case
          res.status(200).send(result);
      }
  });
});

app.post('/account/logout', (req, res) => {
    const { authorization } = req.headers
    if (!verifyLoginHash(loginHashMap, authorization, new Date())){
        res
            .status(401)
            .send("User not logged in")
        return
    }
    delete loginHashMap[authorization]
    fs.writeFileSync('logins.json', JSON.stringify(loginHashMap))
    res.send({status: 'success'})

})

app.post('/account/login', async (req, res) => {
    const { username, password } = req.body
    const resp = await login( connection, username, passwordSalt(username, password) )

    if (!resp.length){
        res
            .status(400)
            .send("Account not found")
        return
    }

    const userId = resp[0]['user_id']

    const now = new Date()
    const loginToken = loginHash(username, now.toISOString())

    const expiry = new Date()
    expiry.setDate(now.getDate() + 1)
    
    //loginHashMap.set(loginToken, {username, userId, expiry: expiry.toISOString()})
    loginHashMap[loginToken] = {username, userId, expiry: expiry.toISOString()}
    fs.writeFileSync('logins.json', JSON.stringify(loginHashMap))
    res.send({status: 'success', loginToken})
  });

app.get('/rides/completed', (req, res) => {
    const { authorization } = req.headers
    if (!verifyLoginHash(loginHashMap, authorization, new Date())){
        res
            .status(401)
            .send("User not logged in")
        return
    }

    //const { userId } = loginHashMap.get(authorization)
    const {userId} = loginHashMap[authorization]
    const rides =  pollCompletedRides(connection, userId)

    res.send({
        status: 'success',
        rides
    })

})

app.post('/rides/create', async (req, res) => {
    const { authorization } = req.headers
    if (!verifyLoginHash(loginHashMap, authorization, new Date())){
        res
            .status(401)
            .send("User not logged in")
        return
    }

    //const { userId } = loginHashMap.get(authorization)
    const {userId} = loginHashMap[authorization]
    const rideId = randomId()
    const { startPoint, destination, riders, costPerRider, pickUpDistance } = req.body

    const [startPointLat, startPointLong] = [startPoint.latitude, startPoint.longitude]
    const [endPointLat, endPointLong] = [destination.latitude, destination.longitude]
    
    let response = await createNewRide(connection, rideId, userId, `StartPoint:${startPointLat}:${startPointLong}`, `EndPoint:${endPointLat}:${endPointLong}`, riders, costPerRider, pickUpDistance)
    res.send({
        status: 'success',
        rideId, userId, start: `StartPoint:${startPointLat}:${startPointLong}`, end: `EndPoint:${endPointLat}:${endPointLong}`, riders, costPerRider, pickUpDistance,
        sql: response
    })

})
//startPoint: string in Name:Lat,Lon
//maxPrice: float
app.get('/rides/view', async(req, res) => {
  const {startPoint} = req.body
  const {maxPrice} = req.body
  let resp = await getNearbyRides(connection, startPoint, maxPrice)
  console.log(resp)
  res.send({
    status: 'success'
  })
})

app.get('/directions', async (req, res) => {
    try {
      const { origin, destination } = req.query;
  
      if (!origin || !destination) {
        return res.status(400).json({ error: 'Both origin and destination are required.' });
      }
  
      // Make a request to the Google Maps Directions API
      const response = getRoutesJSON(origin, destination)
  
      // Extract and send the response from Google Maps API to the client
      res.json(response.data);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'An error occurred while fetching directions.' });
    }
});



app.get('/driver/info', async (req, res) => {
    const { authorization } = req.headers;

    
  if (!verifyLoginHash(loginHashMap, authorization, new Date())) {
      res.status(401).send("User not logged in");
      return;
  }

  const { userId } = loginHashMap[authorization];

  try {
      const driverInfo = await getDriverInfo(connection, userId);
      res.send({
          status: 'success',
          driverInfo
      });
  } catch (error) {
      console.error('Error fetching driver information:', error);
      res.status(500).send({
          status: 'error',
          message: 'Internal server error'
      });
  }
})

//rideId: int
//riderId: int      Id belonging to the rider requesting to join
//acceptRider: boolean (0 or 1) that says if the driver wants to accept the rider
app.post('/rides/resolveRiderRequest', async (req, res) =>  {
    const { authorization } = req.headers
    if (!verifyLoginHash(loginHashMap, authorization, new Date())){
        res
            .status(401)
            .send("User not logged in")
        return
    }

    const { rideId, riderId, acceptRider } = req.body
    try {
        let resp = await resolveRiderRequest(connection, rideId, riderId, acceptRider)
        res.send({
            status: 'success',
            message: resp //'Successfully added rider' or 'Ride is full'
        });
    } catch (error) {
        console.error('Error resolving rider request information:', error)
        res.status(500).send({
            status: 'error',
            message: 'Internal server error'
        });
    }
})

//rideId: int
app.post('/rides/sendRiderRequest', async (req, res) => {
    const { authorization } = req.headers
    if (!verifyLoginHash(loginHashMap, authorization, new Date())){
        res
            .status(401)
            .send("User not logged in")
        return
    }

    const {userId} = loginHashMap[authorization]
    const {rideId} = req.body
    try {
        const resp = await sendRiderRequest(connection, userId, rideId);
        res.send({
            status: 'success',
            message: resp // Will send 'Made request' or 'Preexisting user request' if duplication present
        });
    } catch (error) {
        console.error('Error sending rider request', error)
        res.status(500).send({
            status: 'error',
            message: 'Internal server error'
        });
    }
})

// Content-type : multipart/form-data // I'm not too sure whats the formatting for this 
app.post('/driver/info', upload.fields([{ name: 'driverPhoto', maxCount: 1 }, { name: 'inspectionForm', maxCount: 1 }]), async (req, res) => {
    const { authorization } = req.headers;

  if (!verifyLoginHash(loginHashMap, authorization, new Date())) {
      res.status(401).send("User not logged in");
      return;
  }

  const { userId } = loginHashMap[authorization];

  const { carColor, carMake, carModel, carYear, seatCount, insurance, licensePlate, license, residencyState} = req.body

  const driverPhoto = req.files['driverPhoto'][0].buffer;
  const inspectionForm = req.files['inspectionForm'][0].buffer;

  try {
      const driverInfo = await createDriverInfo(connection, userId, carMake, carModel, licensePlate, license, carYear, seatCount, carColor, driverPhoto, insurance, residencyState, inspectionForm);
      res.send({
          status: 'success'
      });
  } catch (error) {
      console.error('Error fetching driver information:', error);
      res.status(500).send({
          status: 'error',
          message: 'Internal server error'
      });
  }
})

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});

