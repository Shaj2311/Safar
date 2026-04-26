const BASE_URL = '/api';

export const extractRideIdFromPayload = (payload) => {
    const candidateKeys = ['id', 'ride_id', 'rideId', 'trip_id', 'tripId', 'request_id', 'requestId'];
    const queue = [payload];
    const visited = new Set();

    while (queue.length > 0) {
        const current = queue.shift();

        if (current === null || current === undefined) {
            continue;
        }

        if (typeof current === 'number' && Number.isFinite(current)) {
            return current;
        }

        if (typeof current === 'string') {
            const numericValue = Number(current);
            if (!Number.isNaN(numericValue) && Number.isFinite(numericValue)) {
                return numericValue;
            }
            continue;
        }

        if (typeof current !== 'object') {
            continue;
        }

        if (visited.has(current)) {
            continue;
        }
        visited.add(current);

        if (Array.isArray(current)) {
            for (const item of current) {
                queue.push(item);
            }
            continue;
        }

        for (const key of candidateKeys) {
            if (Object.prototype.hasOwnProperty.call(current, key)) {
                const value = current[key];
                const numericValue = Number(value);
                if (!Number.isNaN(numericValue) && Number.isFinite(numericValue)) {
                    return numericValue;
                }
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

export const findActiveRideId = async () => {
    try {
        const sessionKey = localStorage.getItem('sessionKey');
        if (!sessionKey) {
            return null;
        }

        const endpoints = [
            `${BASE_URL}/rides/?sessionKey=${sessionKey}`,
            `${BASE_URL}/rides?sessionKey=${sessionKey}`,
        ];

        for (const endpoint of endpoints) {
            try {
                const response = await fetch(endpoint, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                });

                if (!response.ok) {
                    continue;
                }

                const data = await response.json();
                const rideId = extractRideIdFromPayload(data);
                if (rideId) {
                    return rideId;
                }
            } catch (innerError) {
                console.warn('findActiveRideId endpoint failed:', endpoint, innerError);
            }
        }

        return null;
    } catch (error) {
        console.error('API Error: findActiveRideId', error);
        return null;
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

export const submitRideRating = async (rideId, rating) => {
    try {
        const sessionKey = localStorage.getItem('sessionKey');
        const url = new URL(`${BASE_URL}/rides/${rideId}/rate`, window.location.origin);
        if (sessionKey) {
            url.searchParams.append('sessionKey', sessionKey);
        }

        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ score: rating })
        });

        if (!response.ok) {
            throw new Error('Failed to submit rating');
        }

        return await response.json();
    } catch (error) {
        console.error("API Error: submitRideRating", error);
        throw error;
    }
};

export const getDriverProfile = async (driverId) => {
    try {
        const sessionKey = localStorage.getItem('sessionKey');
        const response = await fetch(`${BASE_URL}/users/${driverId}/profile?sessionKey=${sessionKey}`);
        
        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Failed to fetch driver profile (users profile). status=${response.status}, body=${errorText}`);
        }
        
        return await response.json();
    } catch (error) {
        console.error("API Error: getDriverProfile", error);
        throw error;
    }
};

export const getDriverProfileByAnyId = async (driverId) => {
    const sessionKey = localStorage.getItem('sessionKey');

    try {
        return await getDriverProfile(driverId);
    } catch (firstError) {
        try {
            const response = await fetch(`${BASE_URL}/drivers/me?sessionKey=${sessionKey}&id=${driverId}`);
            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`Fallback driver profile endpoint failed. status=${response.status}, body=${errorText}`);
            }
            return await response.json();
        } catch (secondError) {
            console.error('API Error: getDriverProfileByAnyId', { firstError, secondError, driverId });
            throw secondError;
        }
    }
};

export const updatePassengerProfile = async (profileData) => {
    try {
        const sessionKey = localStorage.getItem('sessionKey');
        const url = new URL(`${BASE_URL}/users/me/passenger`, window.location.origin);
        if (sessionKey) {
            url.searchParams.append('sessionKey', sessionKey);
        }

        const response = await fetch(url, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(profileData)
        });

        if (!response.ok) {
            throw new Error('Failed to update profile');
        }

        return await response.json();
    } catch (error) {
        console.error("API Error: updatePassengerProfile", error);
        throw error;
    }
};

export const getRideSummary = async (rideId) => {
    try {
        const sessionKey = localStorage.getItem('sessionKey');
        const response = await fetch(`${BASE_URL}/rides/${rideId}/summary?sessionKey=${sessionKey}`);
        if (!response.ok) {
            throw new Error('Failed to fetch ride summary');
        }
        return await response.json();
    } catch (error) {
        console.error("API Error: getRideSummary", error);
        throw error;
    }
};

const tryFetchJson = async (url) => {
    const response = await fetch(url);
    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`status=${response.status}, body=${errorText}`);
    }
    return await response.json();
};

export const getRideDetailsByAnyEndpoint = async (rideId) => {
    const sessionKey = localStorage.getItem('sessionKey');
    if (!sessionKey || !rideId) {
        return null;
    }

    const endpoints = [
        { name: 'historyRideDetails', url: `${BASE_URL}/history/rides/${rideId}?sessionKey=${sessionKey}` },
        { name: 'callDetails', url: `${BASE_URL}/call?sessionKey=${sessionKey}&id=${rideId}` },
    ];

    let hasAnyData = false;
    let mergedData = {};

    for (const endpoint of endpoints) {
        try {
            const data = await tryFetchJson(endpoint.url);
            if (data && typeof data === 'object' && Object.keys(data).length > 0) {
                hasAnyData = true;
                mergedData = { ...mergedData, ...data };
            }
        } catch (error) {
            console.warn(`getRideDetailsByAnyEndpoint: ${endpoint.name} failed`, error);
        }
    }

    return hasAnyData ? mergedData : null;
};

export const getRideDriverDetails = async (tripId) => {
    try {
        const sessionKey = localStorage.getItem('sessionKey');
        if (!tripId) {
            throw new Error('Trip id is required to fetch driver details');
        }

        if (!sessionKey) {
            throw new Error('Session key is required to fetch driver details');
        }

        const url = new URL(`${BASE_URL}/rides/${tripId}/driver`, window.location.origin);
        url.searchParams.append('sessionKey', sessionKey);

        const response = await fetch(url.toString());
        if (!response.ok) {
            throw new Error('Failed to fetch ride driver details');
        }
        return await response.json();
    } catch (error) {
        console.error("API Error: getRideDriverDetails", error);
        throw error;
    }
};

export const getRideLocation = async (tripId) => {
    try {
        const sessionKey = localStorage.getItem('sessionKey');
        if (!tripId) {
            throw new Error('Trip id is required to fetch ride location');
        }

        if (!sessionKey) {
            throw new Error('Session key is required to fetch ride location');
        }

        const url = new URL(`${BASE_URL}/rides/${tripId}/location`, window.location.origin);
        url.searchParams.append('sessionKey', sessionKey);

        const response = await fetch(url.toString());
        if (!response.ok) {
            throw new Error('Failed to fetch ride location');
        }

        return await response.json();
    } catch (error) {
        console.error("API Error: getRideLocation", error);
        throw error;
    }
};

export const getRidePaymentStatus = async (tripId) => {
    try {
        const sessionKey = localStorage.getItem('sessionKey');
        if (!tripId) {
            throw new Error('Trip id is required to fetch payment status');
        }

        if (!sessionKey) {
            throw new Error('Session key is required to fetch payment status');
        }

        const url = new URL(`${BASE_URL}/rides/${tripId}/paymentStatus`, window.location.origin);
        url.searchParams.append('sessionKey', sessionKey);

        const response = await fetch(url.toString());
        if (!response.ok) {
            throw new Error('Failed to fetch ride payment status');
        }

        return await response.json();
    } catch (error) {
        console.error("API Error: getRidePaymentStatus", error);
        throw error;
    }
};

