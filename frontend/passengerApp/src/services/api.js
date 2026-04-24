const BASE_URL = '/api';

export const loginRequest = async (credentials) => {
    try {
        const response = await fetch(`${BASE_URL}/auth/login/passenger`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(credentials), // API ko sirf name aur password chahiye
        });
        
        if (!response.ok) {
            throw new Error('Login failed');
        }
        
        const data = await response.json();
        if (data.sessionKey) {
            localStorage.setItem('sessionKey', data.sessionKey);
        }
        return data;
    } catch (error) {
        console.error("API Error: loginRequest", error);
        throw error;
    }
};

export const signupPassenger = async (userData) => {
    try {
        const response = await fetch(`${BASE_URL}/auth/signup/passenger`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(userData), // Naya user bananay ke liye ye details zaroori hain
        });
        
        if (!response.ok) {
            throw new Error('Signup failed');
        }
        
        return await response.json();
    } catch (error) {
        console.error("API Error: signupPassenger", error);
        throw error;
    }
};
export const getNearbyDrivers = async (location) => {
    console.log("Mock API: getNearbyDrivers triggered with location", location);
    // Abhi asal endpoint nahi hai, is liye yeh mock function rakha hai taake app crash na ho
    return new Promise((resolve) => setTimeout(() => resolve({ drivers: [] }), 1000));
};

export const createRideRequest = async (rideDetails) => {
    try {
        const sessionKey = localStorage.getItem('sessionKey');
        const url = new URL(`${BASE_URL}/rides/`, window.location.origin);
        if (sessionKey) {
            url.searchParams.append('sessionKey', sessionKey);
        }

        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(rideDetails), // Ride start aur drop location coordinates
        });

        if (!response.ok) {
            throw new Error('Failed to request ride');
        }

        return await response.json();
    } catch (error) {
        console.error("API Error: createRideRequest", error);
        throw error;
    }
};

export const getRideStatus = async (rideId) => {
    try {
        const sessionKey = localStorage.getItem('sessionKey');
        const response = await fetch(`${BASE_URL}/rides/${rideId}?sessionKey=${sessionKey}`);
        if (!response.ok) {
            throw new Error('Failed to fetch ride status');
        }
        return await response.json();
    } catch (error) {
        console.error("API Error: getRideStatus", error);
        throw error;
    }
};

export const cancelRideRequest = async (rideId) => {
    try {
        const sessionKey = localStorage.getItem('sessionKey');
        const url = new URL(`${BASE_URL}/rides/${rideId}/cancel`, window.location.origin);
        if (sessionKey) {
            url.searchParams.append('sessionKey', sessionKey);
        }

        const response = await fetch(url, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
            }
        });

        if (!response.ok) {
            throw new Error('Failed to cancel ride');
        }

        return await response.json();
    } catch (error) {
        console.error("API Error: cancelRideRequest", error);
        throw error;
    }
};
