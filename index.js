const express = require('express');
const axios = require('axios');

const fs = require('fs')
const {connection, connect, close } = require('./database_functions/connect')
const { createAccount, login, pollCompletedRides, createNewRide, getNearbyRides } = require('./database_functions/queries')
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

app.get('/rides/create', async (req, res) => {
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
    
    let resp = await createNewRide(connection, rideId, userId, startPoint, destination, riders, costPerRider, pickUpDistance)
    console.log( resp )
    res.send({
        status: 'success',
    })

})

app.get('/rides/view', async(req, res) => {
  const {startPoint} = req.body

  let resp = await getNearbyRides(connection, startPoint)
  console.log(resp)
  res.sent({
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


app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});

