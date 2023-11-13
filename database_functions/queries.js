const createAccount = (connection, userid, username, email, password, phone, callback) => {
    connection.query(
        `INSERT INTO account (user_id, username, email, password, phone_num) VALUES (?, ?, ?, ?, ?)`,
        [userid, username, email, password, phone],
        (err, resp) => {
            if (err) {
                if (err.code === 'ER_DUP_ENTRY') {
                    // Check the error message for the column causing the duplicate entry
                    if (err.message.includes('email')) {
                        callback({ status: 'error', message: 'Duplicate email entry error' }, null);
                    } else if (err.message.includes('phone_num')) {
                        callback({ status: 'error', message: 'Duplicate phone entry error' }, null);
                    } else {
                        // Other duplicate entry error, call the callback with a generic message
                        callback({ status: 'error', message: 'Duplicate entry error' }, null);
                    }
                } else {
                    // Other error, call the callback with an error status
                    callback({ status: 'error', message: err.message }, null);
                }
            } else {
                // No error, call the callback with a success status
                callback(null, { status: 'success', response: resp });
            }
        }
    );
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