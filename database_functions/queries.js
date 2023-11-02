const createAccount = (connection, userid, username, email, password, phone) => {
    return connection.query(
        `INSERT INTO account (user_id, username, email, password, phone_num) VALUES  (?, ?, ?, ?, ?)`,
         [userid, username, email, password, phone],
         (err, resp) => {
            console.log('err:', err)
            console.log('resp:', resp)
         }
        )
}

const login = async (connection, username, password) => {
    return new Promise((resolve) => {
        connection.query(
            `SELECT user_id from account WHERE username=? AND password=?`,
             [username, password],
             (err, resp) => {
                console.log('err:', err)
                console.log('resp:', resp)
                resolve(resp)
            }
        )
    })
}

const pollCompletedRides = async (connection, userId) => {
    return new Promise((resolve) => {
        connection.query(
           ``,
             [userId],
             (err, resp) => {
                console.log('err:', err)
                console.log('resp:', resp)
                resolve(resp)
            }
        )
    })
}

module.exports = {
    createAccount,
    login,
    pollCompletedRides
}