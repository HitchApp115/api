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

module.exports = {
    randomId,
    loginHash,
    passwordSalt,
    verifyLoginHash
}