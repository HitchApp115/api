# Testing Repo 

## Overview

- This is a testing repo for the query functionns that are used with the backend. The file works as whitebox testing, where specific inputs are put into the system to initiate responses from the backend and test if the functiosn work correctly.
- There is an index file used to run the main server for the connection between the database and the frontend, which was tested through curl functions and postman. There was no external file needed to test this file since we were able to test through those resources and directly from the app itself

## Design 

- This is the design of the testing code for the individual functions and the simulation ran through the code. This code was connected to database and directly references the functions created in the /api/database_functions/queries.js

### Describe Functions

#### Module Functions 
- When testing the individual functions, we used a describe it structure that labels and describes the test. 
- This then creates input for the set functions and then runs the functions, printing out the given response and throwing errors if shown. 

#### Delete Functions 
- To make sure this runs a simulation and does not add or affect the database, I created delete functions for all the accounts and rides made in the process. 
- Using functions helped make sure certain things worked, like foreign keys and making sure things were deleted before deleting the main key. For example, the user id in the account database is the main key, and we can not delete the account without deleting anything in the database that has a connected key to that id key. 

### Simulation 
- To make sure all the functions worked correctly, I ran a simulation that makes sure all the functions work in the order that they are supposed to. This allowed for all the functions to work properly and display the right returns. The order is displayed in this format
1) Create Driver Account
2) Create Rider Account
3) Check Login for Driver and Rider
4) Display Driver and Rider info
5) Create Driver Info connected to Driver Account
6) Display Created Rides by Driver
7) Display Ride Start Point
8) Delete Pending ride and recreate same ride by Driver
9) Grab Nearby Rides from the account of the Driver
10) Display pending ride by rid
11) Send Rider Request by the rider
12) Remove Request through the Driver then Resent Request by the rider
13) Display Requesting Riders by Ride_ID
14) Display Pending Ride Status 
15) Accept Request by Rider Through Driver
16) Display Accepted Rides by Ride ID
17) Mark Ride as Active to mimmick an actual Ride happening
18) Grab Active Ride as the Driver
19) Display the Rider is awaiting for pickup, then iniate the rider being picked up
20) Complete Ride
21) Poll Completed Rides through the Driver and Rider's account
22) Delete Completed Rides,
23) Delete Driver Info and Driver and Rider Account 
- Using this process and multiple describe functions allows for us to display the full ride process and make sure that every functions that makes this app run works the way that it should. 

