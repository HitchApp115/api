// Install required packages:
// npm install mysql mocha chai

const mysql = require('mysql');
const chai = require('chai');
const expect = chai.expect;

// MySQL configuration
const dbConfig = {
  host: '35.185.226.18',
  user: 'member',
  password: 'slugs',
  database: 'Hitch_Database',
};

const connection = mysql.createPool(dbConfig);
const {createAccount, login, pollCompletedRidesByRider, pollCompletedRidesByDriver, 
getNearbyRides, createDriverInfo, getNumRiders,
completeRide, removeRiderRequest, markRideAsActive, grabActiveRide,
getCreatedRidesByDriver, getRequestingRidersByRid, getRideStartPoint,
getAccountInfo, getPendingRideStatus, resolveRiderRequest, sendRiderRequest,
getAcceptedRidersByRide, deletePendingRiders, getPendingRideByRide, deletePendingRide, 
riderPickedUp, ridesAwaitingPickup, createNewRide} = require('../api/database_functions/queries');


  describe('*createAccount function*', () => {
    it('attempt to create an account into the database', (done) => {
        // Test data
        const testUserId = 100;
        const testUsername = 'aofilan3';
        const testEmail = 'aofilan3@ucsc.edu';
        const testPassword = 'hello';
        const testPhone = '7063986078';
        const testFirstName = 'Andrei ';
        const testLastName = 'Ofilan';

        createAccount(connection, testUserId, testUsername, testEmail, 
          testPassword, testPhone, testFirstName, testLastName, (err, result) => {
            // Check for errors
            if (err) {
                // Fail the test if there is an error
                done(err);
            } else {
                // Print the result
                console.log('Given Response:', result);

                // Done with the test
                done();
            }
        });
    });
});

  describe('*login function*', () => {
    it('should retrieve user_id without errors', (done) => {

        // Test data
        const testUsername = 'aofilan3';
        const testPassword = 'hello';

        // Call the login function
        login(connection, testUsername, testPassword)
            .then((result) => {
                // Print the result
                console.log('Given Response', result);

                // Done with the test
                done();
            })
            .catch((err) => {
                // Print the error
                console.error('Given Error:', err);

                // Done with the test
                done();
            });
    });
});

describe('*GetAccountInfo function*', () => {
  it('should show account info without errors', (done) => {
    // Test data
    const testuserid = 100;

    getAccountInfo(connection, testuserid)
      .then((result) => {
      // Print the result
      console.log('Given Response', result);

      // Done with the test
      done();
    })
    .catch((err) => {
      // Print the error
      console.error('Given Error:', err);

      // Done with the test
      done();
    });
  });
}); 


describe('*create Driver Info function*', () => {
  it('attempt to create a new driver into the database', (done) => {
      // Test data
      const testdriverId = 100;
      const testCarmodel = '3201';
      const testlicensePlate = '12345';
      const testlicense = '98722';
      const testcarMake = 'BMW';
      const testcarYear = '2017 ';
      const testseatCount = '5';
      const testcarColor = 'brown';
      const driverPicture = '';
      const insurance = '5678';
      const residency = 'C9 ';
      const inspectionForm = '';

      
      // Use await to wait for the asynchronous operation to complete
      createDriverInfo(connection, testdriverId, testCarmodel,
        testlicensePlate, testlicense, testcarMake, testcarYear, testseatCount,
        testcarColor, driverPicture, insurance, residency,inspectionForm)
  
      .then((result) => {
        // Print the result
        console.log('Given Response:', result);

        // Done with the test
        done();
      })
      .catch((err) => {
        // Print the error
        console.error('Given Error:', err);

        // Fail the test if an error occurs
        done(err);
      });
  });
});

describe('*createNewRide function*', () => {
  it('should create a new ride in the database', async () => {
    // Test data
    const testRideId = 2;
    const testDriverId = 100;
    const testStartPoint = 'Point A';
    const testDriverDest = 'Point B';
    const testRiders = 3;
    const testCostPerRider = 10;
    const testPickupDist = 5;
    const testRideStartTime = new Date(); // Assuming ride start time is a Date object

    try {
      const result = await createNewRide(connection, testRideId, testDriverId, testStartPoint,
        testDriverDest, testRiders,testCostPerRider, testPickupDist, testRideStartTime);

      // Print the result
      console.log('Given Response:', result);

      // You can add assertions here if needed

    } catch (err) {
      // Print the error
      console.error('Given Error:', err);

      // Fail the test if an error occurs
      throw err;
    }
  });
});



describe('*pollCompletedRides by Rider function*', () => {
  it('should poll completed rides by rider without errors', (done) => {
    // Test data
    const userId = 100;

    // Call the pollCompletedRides function
    pollCompletedRidesByRider(connection, userId)
      .then((result) => {
      // Print the result
      console.log('Given Response', result);

      // Done with the test
      done();
    })
    .catch((err) => {
      // Print the error
      console.error('Given Error:', err);

      // Done with the test
      done();
    });
  });
}); 

describe('*pollCompletedRides by Driver function*', () => {
  it('should poll completed rides by Driver without errors', (done) => {
    // Test data
    const userId = 100;

    // Call the pollCompletedRides function
    pollCompletedRidesByDriver(connection, userId)
      .then((result) => {
      // Print the result
      console.log('Given Response', result);

      // Done with the test
      done();
    })
    .catch((err) => {
      // Print the error
      console.error('Given Error:', err);

      // Done with the test
      done();
    });
  });
}); 


describe('*Get Nearby Rides function*', () => {
  it('should be able to find nearby rides without errors', (done) => {
    // Test data
    const userstart_point = ('Point A',8);
    const userend_point = ('Point B', 4);
    const user_maxdist = 2
    const maxPrice = 8.00;

    getNearbyRides(connection, userstart_point, userend_point, user_maxdist, maxPrice,)
      .then((result) => {
      // Print the result
      console.log('Given Response', result);

      // Done with the test
      done();
    })
    .catch((err) => {
      // Print the error
      console.error('Given Error:', err);

      // Done with the test
      done();
    });
  });
});



describe('*Accepting Ride by Ride function*', () => {
  it('should show acccepted rides without errors', (done) => {
    // Test data
    const testrideid = 2;

    getAcceptedRidersByRide(connection, testrideid)
      .then((result) => {
      // Print the result
      console.log('Given Response', result);

      // Done with the test
      done();
    })
    .catch((err) => {
      // Print the error
      console.error('Given Error:', err);

      // Done with the test
      done();
    });
  });
}); 


describe('*Get Pending Ride Status function*', () => {
  it('should show pending ride status without errors', (done) => {
    // Test data
    const testrideid = 2;

    getPendingRideStatus(connection, testrideid)
      .then((result) => {
      // Print the result
      console.log('Given Response', result);

      // Done with the test
      done();
    })
    .catch((err) => {
      // Print the error
      console.error('Given Error:', err);

      // Done with the test
      done();
    });
  });
}); 


describe('*Pending Ride by Ride function*', () => {
  it('should show pending rides without errors', (done) => {
    // Test data
    const testrideid = 2;

    getPendingRideByRide(connection, testrideid)
      .then((result) => {
      // Print the result
      console.log('Given Response', result);

      // Done with the test
      done();
    })
    .catch((err) => {
      // Print the error
      console.error('Given Error:', err);

      // Done with the test
      done();
    });
  });
}); 

describe('*SendRiderRequest function*', () => {
  it('should show pending rides without errors', (done) => {
    // Test data
    const testrideid = 2;
    const testuserid = 50;
    const testridestartpoint = 35;
    const testriderstartpoint = 50;
  
    sendRiderRequest(connection, testuserid, testrideid, testridestartpoint, 
      testriderstartpoint, testriderstartpoint)
      .then((result) => {
      // Print the result
      console.log('Given Response', result);

      // Done with the test
      done();
    })
    .catch((err) => {
      // Print the error
      console.error('Given Error:', err);

      // Done with the test
      done();
    });
  });
}); 

describe('*Get Ride Start Point function*', () => {
  it('should show ride start points without errors', (done) => {
    // Test data
    const testrideid = 2;

    getRideStartPoint(connection, testrideid)
      .then((result) => {
      // Print the result
      console.log('Given Response', result);

      // Done with the test
      done();
    })
    .catch((err) => {
      // Print the error
      console.error('Given Error:', err);

      // Done with the test
      done();
    });
  });
}); 

describe('*Resolve Rider Request function*', () => {
  it('should resolve rider request without errors', (done) => {
    // Test data
    const testrideid = 2;
    const testriderid = 50;

    resolveRiderRequest(connection, testrideid, testriderid)
      .then((result) => {
      // Print the result
      console.log('Given Response', result);

      // Done with the test
      done();
    })
    .catch((err) => {
      // Print the error
      console.error('Given Error:', err);

      // Done with the test
      done();
    });
  });
}); 


describe('*Get Created Rides by Driver function*', () => {
  it('should show created rides by driver without errors', (done) => {
    // Test data
    const testdriverid = 100;

    getCreatedRidesByDriver(connection, testdriverid)
      .then((result) => {
      // Print the result
      console.log('Given Response', result);

      // Done with the test
      done();
    })
    .catch((err) => {
      // Print the error
      console.error('Given Error:', err);

      // Done with the test
      done();
    });
  });
}); 

describe('*Get Requesting Riders by R_ID function*', () => {
  it('should show requesting riders without errors', (done) => {
    // Test data
    const testrideid = 2;

    getRequestingRidersByRid(connection, testrideid)
      .then((result) => {
      // Print the result
      console.log('Given Response', result);

      // Done with the test
      done();
    })
    .catch((err) => {
      // Print the error
      console.error('Given Error:', err);

      // Done with the test
      done();
    });
  });
}); 

describe('*Mark Rider as Active function*', () => {
  it('should mark rider as active without errors', (done) => {
    // Test data
    const testuserid = 100;
    const testrideid = 2;

    markRideAsActive(connection, testuserid, testrideid)
      .then((result) => {
      // Print the result
      console.log('Given Response', result);

      // Done with the test
      done();
    })
    .catch((err) => {
      // Print the error
      console.error('Given Error:', err);

      // Done with the test
      done();
    });
  });
}); 

describe('grabActiveRide function', () => {
  it('should grab active rides without errors', (done) => {
    // Test data
    const testdriverid = 100;

    grabActiveRide(connection, testdriverid)
      .then((result) => {
      // Print the result
      console.log('Given Response', result);

      // Done with the test
      done();
    })
    .catch((err) => {
      // Print the error
      console.error('Given Error:', err);

      // Done with the test
      done();
    });
  });
}); 

describe('*Remove Rider function*', () => {
  it('should remove rider request without errors', (done) => {
    // Test data
    const testuserid = 100;
    const testrideid = 1;

    removeRiderRequest(connection, testuserid, testrideid)
      .then((result) => {
      // Print the result
      console.log('Given Response', result);

      // Done with the test
      done();
    })
    .catch((err) => {
      // Print the error
      console.error('Given Error:', err);

      // Done with the test
      done();
    });
  });
}); 

describe('*riderPickedUp function*', () => {
  it('should count the amount of riders picked without errors', (done) => {
    // Test data
    const testrideid = 1;

    riderPickedUp(connection, testrideid)
      .then((result) => {
      // Print the result
      console.log('Given Response', result);

      // Done with the test
      done();
    })
    .catch((err) => {
      // Print the error
      console.error('Given Error:', err);

      // Done with the test
      done();
    });
  });
}); 

describe('*ridesAwaitingPickup function*', () => {
  it('should count the amount of rides waiting without errors', (done) => {
    // Test data
    const testrideid = 1;

    ridesAwaitingPickup(connection, testrideid)
      .then((result) => {
      // Print the result
      console.log('Given Response', result);

      // Done with the test
      done();
    })
    .catch((err) => {
      // Print the error
      console.error('Given Error:', err);

      // Done with the test
      done();
    });
  });
}); 

describe('*complete rider function*', () => {
  it('should complete ride without errors', (done) => {
    // Test data
    const testrideid = 2;

    completeRide(connection, testrideid)
      .then((result) => {
      // Print the result
      console.log('Given Response', result);

      // Done with the test
      done();
    })
    .catch((err) => {
      // Print the error
      console.error('Given Error:', err);

      // Done with the test
      done();
    });
  });
}); 


describe('*Delete Pending Rides function*', () => {
  it('should delete Pending Rides without errors', (done) => {
    // Test data
    const testrideid = 2;

    deletePendingRiders(connection, testrideid)
      .then((result) => {
      // Print the result
      console.log('Given Response', result);

      // Done with the test
      done();
    })
    .catch((err) => {
      // Print the error
      console.error('Given Error:', err);

      // Done with the test
      done();
    });
  });
}); 


describe('*deletePendingRide function*', () => {
  it('should count the amount of rides waiting without errors', (done) => {
    // Test data
    const testrideid = 2;
    const testdriverid = 100;

    deletePendingRide(connection, testrideid, testdriverid)
      .then((result) => {
      // Print the result
      console.log('Given Response', result);

      // Done with the test
      done();
    })
    .catch((err) => {
      // Print the error
      console.error('Given Error:', err);

      // Done with the test
      done();
    });
  });
}); 


// ********************************************************************************* // 

const deleteAccount = (connection, userid) => {
  return new Promise((resolve, reject) => {
      connection.query(
          'DELETE FROM account WHERE user_id = ?',
          [userid],
          (err, resp) => {
              if (err) {
                  reject({ status: 'error', message: err.message });
              } else {
                  // Check if any rows were affected to determine success
                  if (resp.affectedRows > 0) {
                      resolve({ status: 'success', message: 'Account deleted successfully\n' });
                  } else {
                      reject({ status: 'error', message: 'Account not found\n' });
                  }
              }
          }
      );
  });
};

const deleteDriver = (connection, userid) => {
  return new Promise((resolve, reject) => {
      connection.query(
          'DELETE FROM driver_info WHERE driver_id = ?',
          [userid],
          (err, resp) => {
              if (err) {
                  reject({ status: 'error', message: err.message });
              } else {
                  // Check if any rows were affected to determine success
                  if (resp.affectedRows > 0) {
                      resolve({ status: 'success', message: 'Driver deleted successfully\n' });
                  } else {
                      reject({ status: 'error', message: 'Driver not found\n' });
                  }
              }
          }
      );
  });
};

const deleterides = (connection, userid) => {
  return new Promise((resolve, reject) => {
      connection.query(
          'DELETE FROM completed_rides WHERE driver_id = ?',
          [userid],
          (err, resp) => {
              if (err) {
                  reject({ status: 'error', message: err.message });
              } else {
                  // Check if any rows were affected to determine success
                  if (resp.affectedRows > 0) {
                      resolve({ status: 'success', message: 'Completed Ride deleted successfully\n' });
                  } else {
                      reject({ status: 'error', message: 'Completed Ride not found\n' });
                  }
              }
          }
      );
  });
};

describe('delete completed rides function', () => {
  it('should delete a driver from the database', async () => {
    // Test data
    const testdriverId = 100;

    try {
      const result = await deleterides(connection, testdriverId);
      // Print the result
      console.log('Given Response', result);
    } catch (err) {
      // Print the error
      console.error('Given Error:', err);
      // Fail the test if an error occurs
      throw err;
    }
  });
});

describe('deleteDriver function', () => {
  it('should delete a driver from the database', async () => {
    // Test data
    const testdriverId = 100;

    try {
      const result = await deleteDriver(connection, testdriverId);
      // Print the result
      console.log('Given Response', result);
    } catch (err) {
      // Print the error
      console.error('Given Error:', err);
      // Fail the test if an error occurs
      throw err;
    }
  });
});

describe('deleteAccount function', () => {
  it('should delete an account from the database', async () => {
      // Test data
      const testUserId = 100;

      try {
          const result = await deleteAccount(connection, testUserId);
          // Print the result
          console.log('Given Response', result);
      } catch (err) {
          // Print the error
          console.error('Given Error:', err);
          // Fail the test if an error occurs
          throw err;
      } finally {
          // Close the connection after the test
          connection.end();
      }
  });
}); 

after((done) => {
  connection.end((err) => {
    if (err) {
      console.error('Error closing the connection pool:', err);
    } else {
      console.log('Connection pool closed successfully.');
    }
    done();
  });
});
