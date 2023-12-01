//connection: MYSQL instance
//userID: int
//username: string
//email: string
//password: string
//phone: int
//callback: string
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
           `SELECT * from completed_rides_by_rider WHERE rider_id=?`,
             [userId],
             (err, resp) => {
                console.log('err:', err)
                console.log('resp:', resp)
                resolve(resp)
            }
        )
    })
}

//need functions to get individual columns from the table
const getNumRiders = async(connection, ride_id) => {
    return new Promise((resolve) => {
        connection.query(
            `SELECT riders FROM pending_active_rides WHERE ride_id = ?`,
            [ride_id],
            (err, resp) => {
                console.log('err:', err)
                console.log('resp:', resp)
                resolve(resp)
            }
        )
    })
}

//connection: MYSQL instance
//user_point: string in format Name:Lat,Lon
//maxPrice: double
const getNearbyRides = async(connection, user_point, maxPrice) => {
    //split the user_point to get the name, lattitude and longigtude
    let latLon = user_point.split(":")[1] //this is probably slow
    let ar = latLon.split(",")
    let userLat = ar[0]
    let userLon = ar[1]

    return new Promise((resolve) => {
        //filter database for pickup_dist AND cost_per_rider, TBD to refactor
        connection.query(
            `SELECT * FROM pending_active_rides WHERE pickup_dist > GET_DIST(?, ?, start_point) AND cost_per_rider <= ?`,
            [userLat, userLon, maxPrice],
            (err, resp) => {
                console.log('err:', err)
                console.log('resp:', resp)
                resolve(resp)
            }
        )
    })
}

//ride_id: int
//driver_id: int
//start_point: string in format Name:Lat,Lon
//driver_dest: string in format Name:Lat,Lon
//riders: int
//cost_per_rider: double
//pickup_dist: double
const createNewRide = async (connection, ride_id, driver_id, start_point, driver_dest, riders, cost_per_rider, pickup_dist, rideStartTime) => {
    return new Promise((resolve) => {
        // Ignoring requesting_rider because it should be handled by requested_rides table
        connection.query(
           `INSERT INTO pending_active_rides 
                (ride_id, driver_id, start_point, driver_dest, maximum_riders, cost_per_rider, pickup_dist, ride_start_time) 
                VALUES 
                (?, ?, ?, ?, ?, ?, ?, ?)`,
             [ride_id, driver_id, start_point, driver_dest, riders, cost_per_rider, pickup_dist, rideStartTime],
             (err, resp) => {
                console.log('err:', err)
                console.log('resp:', resp)
                resolve(resp)
            }
        )
    })
}

//connection: MYSQL instance
//driver_id: int
//carMake: string
//carModel: string
//licensePlate: string
//license: string
//carYear: int
//seatCount: int
//carColor: string
//driverPicture: file
//insurance: file
//residency: string
//inspectionForm: file
async function createDriverInfo(connection, driver_id, carMake, carModel, licensePlate, license, carYear, seatCount, carColor, driverPicture, insurance, residency, inspectionForm) {
    return new Promise((resolve) => {
        connection.query(
            `INSERT INTO driver_info 
            (driver_id, car_model, license_plate, license, car_make ,car_year, seat_count, car_color, driver_picture, insurance, residency, inspection_form) 
            VALUES 
            (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [driver_id, carModel, licensePlate, license, carMake, carYear, seatCount, carColor, driverPicture, insurance, residency, inspectionForm],
            (err, resp) => {
                console.log('err:', err);
                console.log('resp:', resp);
                resolve(resp);
            }
        );
    });
}

//connection: MYSQL instance
//userId: int
//rideId: int
async function sendRiderRequest(connection, userId, rideId) {
    return new Promise((resolve) => {
        connection.query(
            `INSERT INTO ride_requests (rider_id, ride_id) 
            VALUES(?, ?)`,
            [userId, rideId],
            (err, resp) => {
                console.log('err:', err);
                console.log('resp:', resp);
                if (err && err.code === 'ER_DUP_ENTRY') {
                    const errorCode = err.code;
                    console.log('Error:', errorCode);
                    resolve('Preexisting user request');
                } else {
                resolve("Made request");
                }
            }
        );
    });
}


//remove request from the database
//if acceptRider is TRUE: assign the rider to the ride, then decrement the number of seats in the active ride

//connection: MYSQL instance
//rideId: int
//riderId: int
//acceptRider: boolean (0 or 1)
async function resolveRiderRequest(connection, rideId, riderId, acceptRider) {
    return new Promise((resolve) => {
        if (acceptRider) {
            connection.query(
                'CALL ProcessRideRequest(?, ?)',
                [rideId, riderId],
                (err, resp) => {
                    console.log('err:', err)
                    console.log('resp:', resp);
                    resolve(resp[0][0].result);
                });
            } else {
            connection.query(
                'DELETE FROM ride_requests WHERE ride_id = ? AND rider_id = ?',
                [rideId, riderId],
                (err, resp) => {
                    console.log('err:', err)
                    console.log('resp:', resp)
                    resolve("Removed request")
                }
            )
        }
    });
}

const getCreatedRidesByDriver = (connection, driverId) => {
    return new Promise((resolve) => {
        connection.query(
            'SELECT ride_id, start_point, driver_dest, accepted_riders, maximum_riders, ride_start_time, pickup_dist FROM pending_active_rides WHERE driver_id=?',
            [driverId], 
            (err, resp) => {
                console.log(err, resp)
                resolve(resp)
            }
        )
    })
}

module.exports = {
    createAccount,
    login,
    pollCompletedRides,
    getNearbyRides,
    createNewRide,
    createDriverInfo,
    resolveRiderRequest,
    sendRiderRequest,
    getNumRiders,
    getCreatedRidesByDriver
}