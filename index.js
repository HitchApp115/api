const express = require('express');
const {connection, connect, close } = require('./database_functions/connect')
const { createAccount, login } = require('./database_functions/queries')

const randomId = () => {
    return Math.floor(Math.random() * 10000000);
}

const passwordSalt = (pass) => {
    return pass
}

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

connect(connection)

app.post('/account/create', async (req, res) => {
  const { username, email, password, phone } = req.body
  let resp = createAccount(connection, randomId(), username, email, passwordSalt(password), phone)
  console.log(resp)
  res.send('success')
});

app.post('/account/login', (req, res) => {
    const { username, password, phone } = req.body
    login( connection, username, passwordSalt(password) )
    res.send('success')
  });

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});

