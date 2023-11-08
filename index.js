const express = require('express');
const axios = require('axios');

const fs = require('fs')
const {connection, connect, close } = require('./database_functions/connect')
const { createAccount, login, pollCompletedRides } = require('./database_functions/queries')
const {
    randomId, 
    loginHash, 
    passwordSalt, 
    verifyLoginHash 
} = require('./helpers')

const loginHashMap = JSON.parse(fs.readFileSync('logins.json')) // new Map()

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

connect(connection)

app.post('/account/create', async (req, res) => {
  const { username, email, password, phone } = req.body
  let resp = createAccount(connection, randomId(), username, email, passwordSalt(username, password), phone)
  console.log(resp)
  res.send({status: 'success'})
});

app.get('/account/login', async (req, res) => {
    const { username, password } = req.query
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

app.get('/directions', async (req, res) => {
    try {
      const { origin, destination } = req.query;
  
      if (!origin || !destination) {
        return res.status(400).json({ error: 'Both origin and destination are required.' });
      }
  
      // Make a request to the Google Maps Directions API
      const response = await axios.get('https://maps.googleapis.com/maps/api/directions/json', {
        params: {
          origin,
          destination,
          key: "AIzaSyDP9-25-Nle5WIbfouhwceH0Egiw8KgShA",
        },
      });
  
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

