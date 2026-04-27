const BASE_URL = '/api';

export const extractRideIdFromPayload = (payload) => {
    const candidateKeys = ['id', 'ride_id', 'rideId', 'trip_id', 'tripId', 'request_id', 'requestId'];
    const queue = [payload];
    const visited = new Set();

    while (queue.length > 0) {
        const current = queue.shift();

        if (current === null || current === undefined) continue;

        if (typeof current === 'number' && Number.isFinite(current)) return current;

        if (typeof current === 'string') {
            const numericValue = Number(current);
            if (!Number.isNaN(numericValue) && Number.isFinite(numericValue)) return numericValue;
            continue;
        }

        if (typeof current !== 'object' || visited.has(current)) continue;
        visited.add(current);

        if (Array.isArray(current)) {
            for (const item of current) queue.push(item);
            continue;
        }

        for (const key of candidateKeys) {
            if (Object.prototype.hasOwnProperty.call(current, key)) {
                const numericValue = Number(current[key]);
                if (!Number.isNaN(numericValue) && Number.isFinite(numericValue)) return numericValue;
            }
        }

        for (const value of Object.values(current)) {
            if (typeof value === 'object' || typeof value === 'number' || typeof value === 'string') {
                queue.push(value);
            }
        }
    }
    return null;
};

export const loginRequest = async (credentials) => {
    try {
        const response = await fetch(`${BASE_URL}/auth/login/passenger`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(credentials),
        });
        
        if (!response.ok) throw new Error('Login failed');
        
        const data = await response.json();
        const token = data.sessionKey || data.session_key || data.token;
        
        if (token) localStorage.setItem('sessionKey', token);
        return data;
    } catch (error) {
        console.error("Login failed:", error);
        throw error;
    }
};

export const signupPassenger = async (userData) => {
    try {
        const response = await fetch(`${BASE_URL}/auth/signup/passenger`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(userData),
        });
        
        if (!response.ok) throw new Error('Signup failed');
        return await response.json();
    } catch (error) {
        console.error("Signup failed:", error);
        throw error;
    }
};

export const getNearbyDrivers = async (location) => {
    return new Promise((resolve) => setTimeout(() => resolve({ drivers: [] }), 1000));
};

export const createRideRequest = async (rideDetails) => {
    try {
        const sessionKey = localStorage.getItem('sessionKey');
        const url = new URL(`${BASE_URL}/rides/`, window.location.origin);
        if (sessionKey) url.searchParams.append('sessionKey', sessionKey);

        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(rideDetails),
        });

        if (!response.ok) throw new Error('Request failed');
        return await response.json();
    } catch (error) {
        console.error("Ride request failed:", error);
        throw error;
    }
};

export const getRideStatus = async (rideId) => {
    try {
        const sessionKey = localStorage.getItem('sessionKey');
        const response = await fetch(`${BASE_URL}/rides/${rideId}?sessionKey=${sessionKey}`);
        if (!response.ok) throw new Error('Status fetch failed');
        return await response.json();
    } catch (error) {
        console.error("Status check failed:", error);
        throw error;
    }
};

export const findActiveRideId = async () => {
    try {
        const sessionKey = localStorage.getItem('sessionKey');
        if (!sessionKey) return null;

        const endpoints = [
            `${BASE_URL}/rides/?sessionKey=${sessionKey}`,
            `${BASE_URL}/rides?sessionKey=${sessionKey}`,
        ];

        for (const endpoint of endpoints) {
            try {
                const response = await fetch(endpoint);
                if (!response.ok) continue;

                const data = await response.json();
                const rideId = extractRideIdFromPayload(data);
                if (rideId) return rideId;
            } catch (e) {}
        }
        return null;
    } catch (error) {
        return null;
    }
};

export const cancelRideRequest = async (rideId) => {
    try {
        const sessionKey = localStorage.getItem('sessionKey');
        const url = new URL(`${BASE_URL}/rides/${rideId}/cancel`, window.location.origin);
        if (sessionKey) url.searchParams.append('sessionKey', sessionKey);

        const response = await fetch(url, { method: 'PATCH' });
        if (!response.ok) throw new Error('Cancellation failed');
        return await response.json();
    } catch (error) {
        console.error("Cancel failed:", error);
        throw error;
    }
};

export const submitRideRating = async (rideId, rating) => {
    try {
        const sessionKey = localStorage.getItem('sessionKey');
        const url = new URL(`${BASE_URL}/rides/${rideId}/rate`, window.location.origin);
        if (sessionKey) url.searchParams.append('sessionKey', sessionKey);

        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ score: rating })
        });

        if (!response.ok) throw new Error('Rating failed');
        return await response.json();
    } catch (error) {
        console.error("Rating submission failed:", error);
        throw error;
    }
};

export const getDriverProfile = async (driverId) => {
    try {
        const sessionKey = localStorage.getItem('sessionKey');
        const response = await fetch(`${BASE_URL}/users/${driverId}/profile?sessionKey=${sessionKey}`);
        if (!response.ok) throw new Error('Profile fetch failed');
        return await response.json();
    } catch (error) {
        console.error("Driver profile error:", error);
        throw error;
    }
};

export const getDriverProfileByAnyId = async (driverId) => {
    const sessionKey = localStorage.getItem('sessionKey');
    try {
        return await getDriverProfile(driverId);
    } catch (e) {
        try {
            const response = await fetch(`${BASE_URL}/drivers/me?sessionKey=${sessionKey}&id=${driverId}`);
            if (!response.ok) throw new Error('Fallback failed');
            return await response.json();
        } catch (err) {
            throw err;
        }
    }
};

export const updatePassengerProfile = async (profileData) => {
    try {
        const sessionKey = localStorage.getItem('sessionKey');
        const url = new URL(`${BASE_URL}/users/me/passenger`, window.location.origin);
        if (sessionKey) url.searchParams.append('sessionKey', sessionKey);

        const response = await fetch(url, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(profileData)
        });

        if (!response.ok) throw new Error('Profile update failed');
        return await response.json();
    } catch (error) {
        console.error("Profile update error:", error);
        throw error;
    }
};

export const getRideSummary = async (rideId) => {
    try {
        const sessionKey = localStorage.getItem('sessionKey');
        const response = await fetch(`${BASE_URL}/rides/${rideId}/summary?sessionKey=${sessionKey}`);
        if (!response.ok) throw new Error('Summary fetch failed');
        return await response.json();
    } catch (error) {
        console.error("Ride summary error:", error);
        throw error;
    }
};

export const getRideDetailsByAnyEndpoint = async (rideId) => {
    const sessionKey = localStorage.getItem('sessionKey');
    if (!sessionKey || !rideId) return null;

    const endpoints = [
        `${BASE_URL}/history/rides/${rideId}?sessionKey=${sessionKey}`,
        `${BASE_URL}/call?sessionKey=${sessionKey}&id=${rideId}`,
    ];

    let mergedData = {};
    for (const url of endpoints) {
        try {
            const response = await fetch(url);
            if (!response.ok) continue;
            const data = await response.json();
            if (data) mergedData = { ...mergedData, ...data };
        } catch (e) {}
    }
    return Object.keys(mergedData).length > 0 ? mergedData : null;
};

export const getRideDriverDetails = async (tripId) => {
    try {
        const sessionKey = localStorage.getItem('sessionKey');
        const url = new URL(`${BASE_URL}/rides/${tripId}/driver`, window.location.origin);
        url.searchParams.append('sessionKey', sessionKey);

        const response = await fetch(url.toString());
        if (!response.ok) throw new Error('Driver details failed');
        return await response.json();
    } catch (error) {
        console.error("Ride driver details error:", error);
        throw error;
    }
};

export const getRideLocation = async (tripId) => {
    try {
        const sessionKey = localStorage.getItem('sessionKey');
        const url = new URL(`${BASE_URL}/rides/${tripId}/location`, window.location.origin);
        url.searchParams.append('sessionKey', sessionKey);

        const response = await fetch(url.toString());
        if (!response.ok) throw new Error('Location fetch failed');
        return await response.json();
    } catch (error) {
        console.error("Ride location error:", error);
        throw error;
    }
};

export const getRidePaymentStatus = async (tripId) => {
    try {
        const sessionKey = localStorage.getItem('sessionKey');
        const url = new URL(`${BASE_URL}/rides/${tripId}/paymentStatus`, window.location.origin);
        url.searchParams.append('sessionKey', sessionKey);

        const response = await fetch(url.toString());
        if (!response.ok) throw new Error('Payment status failed');
        return await response.json();
    } catch (error) {
        console.error("Ride payment status error:", error);
        throw error;
    }
};
