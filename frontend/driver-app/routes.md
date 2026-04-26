### �� Authentication
- **POST** /auth/signup/passenger - Signuppassenger
- **POST** /auth/login/passenger - Loginpassenger
- **POST** /auth/signup/driver - Signupdriver
- **POST** /auth/login/driver - Logindriver
- **POST** /auth/signup/staff - Signupstaff
- **POST** /auth/signup/admin - Signupadmin
- **POST** /auth/signup/superadmin - Signupsuperadmin
- **POST** /auth/login/staff - Loginstaff

### 👤 User Profiles
- **PATCH** /users/me/passenger - Updatepassengerprofile
- **PATCH** /users/me/driver - Updatedriverprofile
- **PATCH** /users/me/vehicle - Updatevehicle
- **GET** /users/{userId}/profile - Viewdriverprofile
- **GET** /users/{userId}/ratings - Viewdriverratings

### 🗺️ Rides
- **POST** /rides/ - Requestride
- **PATCH** /rides/{id}/cancel - Cancelride
- **GET** /rides/{id} - Getridestatus
- **PATCH** /rides/{id}/accept - Acceptriderequest
- **POST** /rides/{id}/location - Updatelocation
- **PATCH** /rides/{id}/start - Startride
- **PATCH** /rides/{id}/end - Endride
- **POST** /rides/{id}/confirm-payment - Confirmpayment
- **GET** /rides/{id}/summary - Getcompletedridesummary
- **POST** /rides/{id}/rate - Ratedriver

### 🚗 Drivers
- **GET** /drivers/me - Getdriverprofile
- **GET** /drivers/incomingRequests - Checkincomingrequests
- **GET** /drivers/incomingRequests/{id} - Getriderequestdetails

### 📌 Trip History
- **GET** /history/summary - Viewearnings
- **GET** /history/rides - Getpasttrips
- **GET** /history/rides/{id} - Getpasttripdetails

### 📌 Communications & Tracking
- **POST** /chats/{id}/messages - Sendmessage
- **GET** /chats/{id}/messages - Receivemessages
- **GET** /call - Call
- **GET** /public/track/{encryptedRideId} - Getpublicridedetails

### 📌 Admin
- **PATCH** /admin/tickets/escalated/{id}/resolve - Resolveescalatedticket
- **DELETE** /admin/passengers/{id} - Deletepassenger
- **DELETE** /admin/drivers/{id} - Deletedriver
- **POST** /admin/drivers - Admincreatedriver

### 📌 Support Staff
- **POST** /support/tickets - Createticket
- **POST** /support/tickets/{id}/escalate - Escalateticket

### 📌 Super Admin
- **POST** /super/staff - Supercreatestaff
- **DELETE** /super/passengers/{id} - Superdeletepassenger
- **DELETE** /super/drivers/{id} - Superdeletedriver
- **DELETE** /super/staff/{id} - Superdeletestaff
- **GET** /super/stats - Getsystemstats

### 📌 Staff
- **GET** /staff/rides - Staffviewrides
- **GET** /staff/rides/{id} - Staffviewridedetails
- **GET** /staff/tickets - Viewalltickets
- **GET** /staff/tickets/{id} - Viewticketdetails
- **DELETE** /staff/tickets/{id} - Deleteticket
- **PATCH** /staff/tickets/{id} - Editticketdetails
- **PATCH** /staff/tickets/{id}/resolve - Resolveticket
- **GET** /staff/passengers/call - Staffcallpassenger
- **GET** /staff/drivers/call - Staffcalldriver
- **GET** /staff/passengers - Viewallpassengers
- **GET** /staff/passengers/{id} - Viewpassengerdetails
- **GET** /staff/drivers - Viewalldrivers
- **GET** /staff/drivers/{id} - Viewdriverdetails

### 📌 Other
- **GET** / - Root

