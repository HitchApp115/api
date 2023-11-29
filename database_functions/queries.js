//connection: MYSQL instance
//userID: int
//username: string
//email: string
//password: string
//phone: int
//callback:???
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
const getNumRiders = async(ride_id) => {
    
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
            `Select * from pending_active_rides WHERE pickup_dist > GET_DIST(?, ?, start_point) AND cost_per_rider <= ?`,
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
const createNewRide = async (connection, ride_id, driver_id, start_point, driver_dest, riders, cost_per_rider, pickup_dist) => {
    return new Promise((resolve) => {
        // Ignoring requesting_rider because it should be handled by requested_rides table
        connection.query(
           `INSERT INTO pending_active_rides 
                (ride_id, driver_id, start_point, driver_dest, riders, cost_per_rider, pickup_dist) 
                VALUES 
                (?, ?, ?, ?, ?, ?, ?)`,
             [ride_id, driver_id, start_point, driver_dest, riders, cost_per_rider, pickup_dist],
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
//licensePlate: string
//license: ???
//carYear: int
//seatCount: int
//carColor: ???
//driverPicture: ???
//insurance: ???
//residency: string
//inspectionForm: ???
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

//remove request from the database
//if acceptRider is TRUE: assign the rider to the ride, then decriment the number of seats in the active ride

async function resolveRiderRequest(connection, rideID, riderID, acceptRider) {
    return new Promise((resolve, reject) => {
        if (acceptRider) {
            connection.query(
                'CALL ProcessRideRequest(?, ?)',
                [rideID, riderID],
                (err, resp) => {
                    if (err) {
                        console.error('Error:', err);
                        reject(err);
                    } else {
                        console.log('Response:', resp);
                        resolve(resp);
                    }
                }
            );
        } else {
            connection.query(
                'DELETE TABLE ride_requests WHERE rideID == ? AND riderID == ?',
                [rideID, riderID],
                (err, resp) => {
                    console.log('err:', err)
                    console.log('resp:', resp)
                    resolve(resp)
                }
            )
        }
    });
}

module.exports = {
    createAccount,
    login,
    pollCompletedRides,
    getNearbyRides,
    createNewRide,
    createDriverInfo,
    resolveRiderRequest
}