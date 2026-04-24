const BASE_URL = 'http://localhost:8000';

export const loginRequest = async (credentials) => {
    try {
        const response = await fetch(`${BASE_URL}/auth/login/passenger`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(credentials), // expects { name, password }
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

export const getNearbyDrivers = async (location) => {
    console.log("Mock API: getNearbyDrivers triggered with location", location);
    // Left as mock since no exact matching endpoint in the spec for fetching nearby drivers
    return new Promise((resolve) => setTimeout(() => resolve({ drivers: [] }), 1000));
};

export const createRideRequest = async (rideDetails) => {
    try {
        const sessionKey = localStorage.getItem('sessionKey');
        const url = new URL(`${BASE_URL}/rides/`);
        if (sessionKey) {
            url.searchParams.append('sessionKey', sessionKey);
        }

        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(rideDetails), // expects { pickup_x, pickup_y, dropoff_x, dropoff_y }
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
