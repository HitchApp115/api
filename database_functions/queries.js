//connection: MYSQL instance
//userID: int
//username: string
//email: string
//password: string
//phone: int
//callback: string
const createAccount = (connection, userid, username, email, password, phone, first_name, last_name, callback) => {
    connection.query(
        `INSERT INTO account (user_id, username, email, password, phone_num, first_name, last_name) VALUES (?, ?, ?, ?, ?, ?, ?)`,
         [userid, username, email, password, phone, first_name, last_name],
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
    return new Promise((resolve) => {
        //filter database for pickup_dist AND cost_per_rider, TBD to refactor
        connection.query(
            `SELECT * FROM pending_active_rides WHERE pickup_dist > GET_DIST(?, start_point) AND cost_per_rider <= ?`,
            [user_point, maxPrice],
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
        connection.query(
            `SELECT * FROM pending_active_rides WHERE driver_id = ?`,
            [driver_id],
            (err, resp) => {
                if (err) {
                    console.error('Error checking for existing rides:', selectErr);
                    reject(selectErr);
                    return;
                }
                // If there is an existing ride, resolve the promise
                if (resp.length > 0) {
                    const existingRide = resp[0];
                    console.log(`There is already a ride with driver_id ${driver_id} in pending_active_rides. Existing ride_id: ${existingRide.ride_id}`);
                    resolve('Ride with the same driver_id already exists.');
                    return;
                }
            })
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
                return;
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
async function sendRiderRequest(connection, userId, rideId, rideStartPoint, riderStartPoint) {
    return new Promise((resolve) => {
            connection.query(
            `INSERT INTO ride_requests (rider_id, ride_id, distance, pickup_spot) 
            VALUES(?, ?, GET_DIST(?, ?), ?)`,
            [userId, rideId, rideStartPoint, riderStartPoint, riderStartPoint],
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

async function getRideStartPoint(connection, rideId) {
    return new Promise((resolve) => {
        connection.query(
            `SELECT start_point FROM pending_active_rides WHERE ride_id=?`,
            [rideId],
            (err, resp) => {
               resolve(resp)
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
            'SELECT ride_id, start_point, driver_dest, accepted_riders, maximum_riders, ride_start_time, pickup_dist FROM pending_active_rides WHERE driver_id=? AND is_active=0',
            [driverId], 
            (err, resp) => {
                resolve(resp)
            }
        )
    })
}

const getRequestingRidersByRid = (connection, rideId) => {
    return new Promise((resolve) => {
        connection.query(
            `SELECT 
            rr.rider_id,
            rr.distance,
            rr.pickup_spot,
            a.first_name,
            a.last_name,
            COALESCE(ar.average_rating, 'No rating') AS average_rating
        FROM 
            ride_requests rr
        LEFT JOIN 
            avg_rating ar ON rr.rider_id = ar.ratee_id
        LEFT JOIN
            account a ON rr.rider_id = a.user_id
        WHERE 
            rr.ride_id = ? AND rr.accepted=0`,
            [rideId], 
            (err, resp) => {
                console.log(err)
                resolve(resp)
            }
        )
    })
}

const getAcceptedRidersByRide = (connection, rideId) => {
    return new Promise((resolve) => {
        connection.query(
            `SELECT * FROM ride_requests WHERE ride_id = ? AND accepted=1`,
            [rideId], 
            (err, resp) => {
                console.log(err)
                resolve(resp)
            }
        )
    })
}

const getAccountInfo = (connection, userId) => {
    return new Promise((resolve) => {
        connection.query(
            `SELECT username, email, phone_num
            FROM account
            WHERE user_id = ?`,
            [userId],
            (err, resp) => {
                console.log(err);
                console.log(resp);
                resolve(resp);
            }
        );
    });
};

const getPendingRideStatus = (connection, rider_id) => {
    return new Promise((resolve) => {
        connection.query(
            'SELECT * FROM ride_requests WHERE rider_id = ?', 
            [rider_id], // Assuming rideId and riderId are the variables holding the IDs you want to query
            (err, resp) => {
                // console.log(err);
                // console.log("response ",resp[0]['accepted']);
                resolve(resp);
            }
          );
    });
};
    

const deletePendingRide = (connection, rideId, driverId) => {
    return new Promise((resolve, reject) => {
        connection.query(
            'DELETE from pending_active_rides WHERE ride_id=? AND driver_id=?', 
            [rideId, driverId], // Assuming rideId and riderId are the variables holding the IDs you want to query
            (err, resp) => {
                if (err){
                    reject("LLL")
                }
                resolve(resp);
            }
          );
    });
};
const deletePendingRiders = (connection, rideId) => {
    return new Promise((resolve, reject) => {
        connection.query(
            'DELETE from ride_requests WHERE ride_id=?', 
            [rideId], // Assuming rideId and riderId are the variables holding the IDs you want to query
            (err, resp) => {
                if (err){
                    reject("LLL")
                }
                resolve(resp);
            }
          );
    });
};

const getPendingRideByRide = (connection, rideId) => {
    return new Promise((resolve, reject) => {
        connection.query(
            'SELECT * from pending_active_rides WHERE ride_id=?', 
            [rideId], // Assuming rideId and riderId are the variables holding the IDs you want to query
            (err, resp) => {
                if (err){
                    reject("LLL")
                }
                resolve(resp);
            }
          );
    });
}

const markRideAsActive = (connection, rideId) => {
    return new Promise((resolve, reject) => {
        connection.query(
            'UPDATE pending_active_rides SET is_active=1 WHERE ride_id=?', 
            [rideId], // Assuming rideId and riderId are the variables holding the IDs you want to query
            (err, resp) => {
                if (err){
                    reject("LLL")
                }
                resolve(resp);
            }
          );
    });
}

const grabActiveRide = (connection, driverId) => {
    return new Promise((resolve, reject) => {
        connection.query(
            'SELECT ride_id from pending_active_rides WHERE driver_id=? AND is_active=1', 
            [driverId], // Assuming rideId and riderId are the variables holding the IDs you want to query
            (err, resp) => {
                if (err){
                    reject("LLL")
                }
                resolve(resp);
            }
          );
    });
}



const removeAcceptedRider = (connection, userId, rideId) => {
    return new Promise((resolve) => {
        connection.query(
            `CALL RemoveRiderFromAcceptedRequest(?,?)`,
            [userId, rideId],
            (err, resp) => {
                console.log(err);
                console.log(resp);
                resolve(resp);
            }
        );
    });
};

const removePendingRider = (connecion, userId, rideId) => {
    return new Promise((resolve) => {
        connecion.query(
            `CALL RemoveRiderFromPendingRequest(?,?)`,
            [userId, rideId],
            (err,resp) => {
                console.log(err);
                console.log(resp);
                resolve(resp);
            }
        );
    });
};

module.exports = {
    createAccount,
    login,
    pollCompletedRides,
    getNearbyRides,
    createNewRide,
    createDriverInfo,
    resolveRiderRequest,
    sendRiderRequest,
    removeAcceptedRider,
    removePendingRider,
    getNumRiders,
    getCreatedRidesByDriver,
    getRequestingRidersByRid,
    getRideStartPoint,
    getAccountInfo,
    getPendingRideStatus,
    deletePendingRide,
    deletePendingRiders,
    getAcceptedRidersByRide,
    getPendingRideByRide,
    markRideAsActive,
    grabActiveRide
}