const express = require('express');
const fs = require('fs')
const {connection, connect, close } = require('./database_functions/connect')
const { createAccount, login, pollCompletedRides } = require('./database_functions/queries')
const {
    randomId, 
    loginHash, 
    passwordSalt, 
    verifyLoginHash 
} = require('./helpers')

const {RoutesClient} = require('@googlemaps/routing').v2;
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

app.get('/rides/completed', async (req, res) => {
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


app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});


  
app.get('/directions', async (req, res) => {
    const routingClient = new RoutesClient({ apiKey: 'AIzaSyAzaxnuhcqrHyhCKGPsekHS-VC8lGqG7GY' });
    const origin=  {
        "address": "1800 Amphitheatre Parkway, Mountain View, CA 94043"
      }
    const destination= {
        "address": "Sloat Blvd &, Upper Great Hwy, San Francisco, CA 94132"
      }

    //let resp = axios.get('https://routes.googleapis.com/directions/v2:computeRoutes?key=AIzaSyAzaxnuhcqrHyhCKGPsekHS-VC8lGqG7GY')
  
      // Construct request for directions
      const response = await routingClient.computeRoutes({
        origin,
        destination,
        key: 'AIzaSyAzaxnuhcqrHyhCKGPsekHS-VC8lGqG7GY'
        //mode: 'driving', // You can set the travel mode (driving, walking, transit, etc.)
      });
  
      // Assuming the response structure has a json property containing the directions.
      console.log(response)
  });
