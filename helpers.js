const crypto = require('crypto')

const randomId = () => {
    return Math.floor(Math.random() * 10000000);
}

const loginHash = (username, time) => {
    const hash = crypto.createHash('sha256');
    hash.update(username + time);
    return hash.digest('hex');  
}

const passwordSalt = (username, password) => {
    const hash = crypto.createHash('sha256');
    hash.update(password)
    hash.update(username)
    return hash.digest('hex')
}

const verifyLoginHash = (loginHashMap, loginToken, currentDate) => {
    return new Date(loginHashMap[loginToken]?.expiry) >= currentDate
}

const getRoutesJSON = async (origin, destination) => {
    const response = await axios.get('https://maps.googleapis.com/maps/api/directions/json', {
        params: {
          origin,
          destination,
          key: "AIzaSyDP9-25-Nle5WIbfouhwceH0Egiw8KgShA",
        },
      });

      return response;
}

module.exports = {
    randomId,
    loginHash,
    passwordSalt,
    verifyLoginHash
}