# Safar
<img width="1377" height="768" alt="safarBanner" src="https://github.com/user-attachments/assets/0ced4761-5bd6-4d41-8d21-126da5b51257" />
A ride hailing application that connects drivers with passengers with features like real-time matchmaking and live location tracking

## Tools and Frameworks
**Database**: PostgreSQL<br>
**Backend**: FastAPI, Pydantic and AsyncPG<br>
**Frontend**: React+Vite<br>
**Containerization**: Docker<br>
**Deployment**: Google Cloud Hosting, Kubernetes<br>

## Features and Details
### Applications
Safar consists of 3 applications: a driver app, a passenger app and an admin panel.
### Async Backend
This project features a fully asynchronous backend. All API calls are handled asynchronously. Database connections are taken by service handlers from a connection pool when needed, and returned once the job is complete. Database queries are also executed asynchronously.<br>
### Session Handling
This application also implements session handling; a user is signed out of the platform after 1 hour of signing in, and services cannot be accessed without a valid session key. This is done in order to prevent unauthorized access to data.<br>
### Google Maps
Safar features Google maps API integration for location fetching and tracking, to provide a simple and intuitive experience to users.


## API Documentation
You can view full API documentation at http://34.31.187.1:8000/redoc

## Try It Out
Try out the passenger app [here](http://safarpassenger.syedhaiderali.com)<br>
Try out the admin panel [here](http://34.133.245.222)

## Local Testing
To run this project locally, do the following:
```
git clone https://github.com/Shaj2311/Safar
cd Safar
docker compose up -d --build
```
Then, visit the following to view their respective applications
| URL | Application |
|----|----|
| http://localhost:5173 | Passenger Application|
| http://localhost:5174 | Admin Panel|
| http://localhost:5175 | Driver Application|
