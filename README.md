# Design Document for Web Application

## Table of Contents
1. [Introduction](#introduction)
2. [System Overview](#system-overview)
3. [Architectural Design](#architectural-design)
4. [Detailed Design](#detailed-design)
   - [4.1 connect.js](#41-connectjs)
   - [4.2 queries.js](#42-queriesjs)
   - [4.3 helpers.js](#43-helpersjs)
   - [4.4 index.js](#44-indexjs)
5. [Security Considerations](#security-considerations)
6. [Future Enhancements](#future-enhancements)

## Introduction
- **Purpose**: Provide documentation for the web application's backend structure.
- **Scope**: This document covers the backend components of the web application.

## System Overview
The web application's backend is structured into modules handling database connections, query executions, helper functions, and the main server setup. The system is designed to support a ride-sharing service.

## Architectural Design
The architecture follows a modular approach with separate files for database connections (`connect.js`), query definitions (`queries.js`), utility functions (`helpers.js`), and the main application logic (`index.js`).

## Detailed Design

### 4.1 connect.js
This module establishes and manages connections to the database. It exports functions to connect to and disconnect from the database.

### 4.2 queries.js
Defines SQL queries for various operations related to account management and ride handling. It includes functions like `createAccount`, `login`, and `pollCompletedRides`.

### 4.3 helpers.js
Contains utility functions like `randomId`, `loginHash`, and `verifyLoginHash` that support various backend processes including authentication and data manipulation.

### 4.4 index.js
The main server file using Express.js. It handles HTTP requests, integrates middleware for request parsing, and routes requests to appropriate handlers based on the URL and HTTP method.

## Security Considerations
- Implement proper authentication and authorization checks.
- Secure database connections and protect against SQL injection.
- Ensure sensitive data is encrypted and securely managed.

## Future Enhancements
- Expand the API to support additional features like ride tracking, payment processing, and user feedback.
- Implement more robust error handling and logging mechanisms.
- Enhance security measures and conduct thorough security audits.

## Detailed Design: index.js Endpoints

### Account Creation - POST `/account/create`
- **Purpose**: To create a new user account.
- **Inputs**: Username, email, password, phone, first name, last name.
- **Response**: Status of account creation.

### Account Logout - POST `/account/logout`
- **Purpose**: To log out a user.
- **Inputs**: Authorization token.
- **Response**: Success status.

### Account Login - POST `/account/login`
- **Purpose**: To authenticate a user and create a session.
- **Inputs**: Username, password.
- **Response**: Login token and status.

### View Completed Rides - GET `/rides/completed`
- **Purpose**: To retrieve completed rides for a user.
- **Inputs**: Authorization token.
- **Response**: List of completed rides.

### Create a Ride - POST `/rides/create`
- **Purpose**: To allow a user to create a new ride.
- **Inputs**: Ride details (start point, end point, riders, cost, etc.).
- **Response**: Details of the created ride.

### View Nearby Rides - GET `/rides/view`
- **Purpose**: To retrieve nearby ride options.
- **Inputs**: Start point, maximum price.
- **Response**: List of nearby rides.

### View Pending Rides - GET `/rides/pending`
- **Purpose**: To show rides pending approval by the driver.
- **Inputs**: Authorization token.
- **Response**: List of pending rides and requesting riders.

[...]

### Get Active Rides - GET `/rides/active`
- **Purpose**: To retrieve active rides for a user.
- **Inputs**: Authorization token.
- **Response**: Details of the active ride.

### Approve Rider Requests - POST `/rides/resolveRiderRequest`
- **Purpose**: To allow drivers to approve or reject rider requests.
- **Inputs**: Ride ID, rider ID, decision to accept rider.
- **Response**: Status of the rider request resolution.

### Approve Rider Requests - POST `/rides/sendRiderRequest`
- **Purpose**: To allow riders to send a request to joing a ride.
- **Inputs**: Ride ID, rider ID, decision to accept rider.
- **Response**: Status of the rider request resolution.


### Get Account Information - GET `/account/info`
- **Purpose**: To retrieve account information of a user.
- **Inputs**: Authorization token.
- **Response**: User account information.

### Start the Ride - POST `/rides/start`
- **Purpose**: To start the ride of the routse.
- **Inputs**: Authorization token/ rideId.
- **Response**: sucesss, message

### Cancel rides - DELTE `/rides/remove`
- **Purpose**: To cancel a pending ride before it is active
- **Inputs**: Authorization token/ rideId.
- **Response**: sucess

### Confirm Pickup - POST `/rides/pickup`
- **Purpose**: To confirm you were picked up from your ride
- **Inputs**: Authorization token/ rideId.
- **Response**: sucess

### Verify Token - GET `/account/verifyToken`
- **Purpose**: To confirm you were picked up from your ride
- **Inputs**: Authorization token/ rideId.
- **Response**: sucess

### Verify if Ride is active - GET `/account/rideAwaitingPickup`
- **Purpose**: To confirm you were picked up from your ride
- **Inputs**: Authorization token.
- **Response**: sucess, rides

### Cancel Ride on passengers part - Post `/rides/riderRequestRemoval`
- **Purpose**: To confirm you were picked up from your ride
- **Inputs**: Authorization token.
- **Response**: sucess, rides


### End the Ride As Rider - POST `/rides/end`
- **Purpose**: To retrieve account information of a user.
- **Inputs**: Authorization toke/ rideID
- **Response**: ends the ride on the driver side

