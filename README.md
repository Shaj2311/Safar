# Safar
<img width="1377" height="768" alt="safarBanner" src="https://github.com/user-attachments/assets/0ced4761-5bd6-4d41-8d21-126da5b51257" />
A ride hailing application that connects drivers with passengers with features like real-time matchmaking and live location tracking

## Tools and Frameworks
*Database*: PostgreSQL
*Backend*: FastAPI, Pydantic and AsyncPG
*Frontend*: React+Vite
*Containerization*: Docker
*Deployment*: Google Cloud Hosting, Kubernetes

## Features and Details
Safar consists of 3 applications: a driver app, a passenger app and an admin panel.
This project features a fully asynchronous backend. All API calls are handled asynchronously. Database connections are taken by service handlers from a connection pool when needed, and returned once the job is complete. Database queries are also executed asynchronously.
This application also implements session handling; a user is signed out of the platform after 1 hour of signing in, and services cannot be accessed without a valid session key. This is done in order to prevent unauthorized access to data.
Safar features Google maps API integration for location fetching and tracking, to provide a simple and intuitive experience to users.


## API Documentation
You can view full API documentation at http://34.31.187.1:8000/redoc

## Try It Out
