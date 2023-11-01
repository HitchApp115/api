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

const login = (connection, username, password) => {
    return connection.query(`SELECT user_id from account WHERE username='${username}' AND password='${password}'`)
}

module.exports = {
    createAccount,
    login
}