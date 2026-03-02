// src/services/api.js

const BASE_URL = '/api';

const HEADERS = {
    'Content-Type': 'application/json'
};

const handleResponse = async (response) => {
    const text = await response.text();
    let data;
    try {
        data = JSON.parse(text);
    } catch (err) {
        console.error("Non-JSON response received:", text);
        try {
            await fetch('http://localhost:25003', { method: 'POST', body: 'Non-JSON: Status ' + response.status + ' ' + text });
        } catch (e) { }
        throw new Error('API returned invalid JSON');
    }
    if (!response.ok) {
        const errorMsg = data.message || 'API request failed';
        try {
            await fetch('http://localhost:25003', { method: 'POST', body: 'Error: Status ' + response.status + ' ' + JSON.stringify(data) });
        } catch (e) { }
        throw new Error(errorMsg);
    }
    return data;
};

export const api = {
    // ---- Farmer APIs ----
    createFarmer: async (farmerData) => {
        const response = await fetch(`${BASE_URL}/farmer/create`, {
            method: 'POST',
            headers: HEADERS,
            body: JSON.stringify(farmerData)
        });
        return handleResponse(response);
    },
    getFarmer: async (email) => {
        const response = await fetch(`${BASE_URL}/farmer/get/${encodeURIComponent(email)}`, { headers: HEADERS });
        return handleResponse(response);
    },

    // ---- Service Provider APIs ----
    createServiceProvider: async (providerData) => {
        const response = await fetch(`${BASE_URL}/serviceProvider/create`, {
            method: 'POST',
            headers: HEADERS,
            body: JSON.stringify(providerData)
        });
        return handleResponse(response);
    },
    getServiceProvider: async (email) => {
        const response = await fetch(`${BASE_URL}/serviceProvider/get/${encodeURIComponent(email)}`, { headers: HEADERS });
        return handleResponse(response);
    },

    // ---- Community APIs ----
    createCommunity: async (communityData) => {
        const response = await fetch(`${BASE_URL}/createCommunity/`, {
            method: 'POST',
            headers: HEADERS,
            body: JSON.stringify(communityData)
        });
        return handleResponse(response);
    },
    addMemberToCommunity: async (communityId, role, userId) => {
        const response = await fetch(`${BASE_URL}/community/addMember/${userId}`, {
            method: 'PUT',
            headers: HEADERS,
            body: JSON.stringify({ communityId, role })
        });
        return handleResponse(response);
    },
    removeMemberFromCommunity: async (communityId, role, userId) => {
        const response = await fetch(`${BASE_URL}/community/removeMember/${userId}`, {
            method: 'DELETE',
            headers: HEADERS,
            body: JSON.stringify({ communityId, role })
        });
        return handleResponse(response);
    },
    getAllCommunities: async () => {
        const response = await fetch(`${BASE_URL}/dashboard/allCommunity/`, { headers: HEADERS });
        return handleResponse(response);
    },
    searchCommunities: async (searchTerm) => {
        const response = await fetch(`${BASE_URL}/dashboard/searchCommunity/?searchTerm=${encodeURIComponent(searchTerm)}`, { headers: HEADERS });
        return handleResponse(response);
    },
    getUserCommunities: async (userId, role) => {
        const response = await fetch(`${BASE_URL}/dashboard/getUserCommunity/${userId}`, {
            method: 'POST',
            headers: HEADERS,
            body: JSON.stringify({ role })
        });
        return handleResponse(response);
    },

    // ---- Content APIs ----
    createContent: async (contentData) => {
        const isFormData = contentData instanceof FormData || (contentData && typeof contentData.append === 'function');
        const options = {
            method: 'POST',
            body: isFormData ? contentData : JSON.stringify(contentData)
        };

        if (!isFormData) {
            options.headers = HEADERS;
        }

        const response = await fetch(`${BASE_URL}/content/createContent`, options);
        return handleResponse(response);
    },
    getCommunityContent: async (communityId) => {
        const response = await fetch(`${BASE_URL}/content/getCommunityContent`, {
            method: 'POST',
            headers: HEADERS,
            body: JSON.stringify({ communityId })
        });
        const data = await handleResponse(response);
        return data;
    },
    deleteContent: async (contentId) => {
        const response = await fetch(`${BASE_URL}/content/deleteContent`, {
            method: 'DELETE',
            headers: HEADERS,
            body: JSON.stringify({ contentId })
        });
        return handleResponse(response);
    },
    likeContent: async (contentId, userId) => {
        const response = await fetch(`${BASE_URL}/content/likeContent`, {
            method: 'POST',
            headers: HEADERS,
            body: JSON.stringify({ contentId, userId })
        });
        return handleResponse(response);
    },
    commentContent: async (communityId, contentId, creatorId, commentText) => {
        const response = await fetch(`${BASE_URL}/content/commentContent`, {
            method: 'POST',
            headers: HEADERS,
            body: JSON.stringify({
                communityId,
                contentId,
                creatorId,
                commentText,
                createdAt: new Date().toISOString()
            })
        });
        return handleResponse(response);
    },
    deleteComment: async (commentId) => {
        const response = await fetch(`${BASE_URL}/content/deleteComment`, {
            method: 'DELETE',
            headers: HEADERS,
            body: JSON.stringify({ commentId })
        });
        return handleResponse(response);
    },
    getContentComments: async (contentId) => {
        const response = await fetch(`${BASE_URL}/content/getContentComments/${contentId}`, {
            method: 'GET',
            headers: HEADERS
        });
        return handleResponse(response);
    },

    getAgriNews: async () => {
        try {
            const response = await fetch(`${BASE_URL}/news`, {
                method: 'GET',
                headers: HEADERS
            });
            return await handleResponse(response);
        } catch (error) {
            console.error("Backend News API Error (Falling back to mock data):", error);
            return {
                articles: [
                    {
                        title: "New Sustainable Farming Techniques Show 30% Yield Increase",
                        description: "Researchers have discovered a new crop rotation method that significantly improves soil health and water retention, leading to higher yields for small-scale farmers.",
                        url: "https://example.com/news/1",
                        image: "https://images.unsplash.com/photo-1592982537447-6f2a6a0c5c16?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
                        publishedAt: new Date().toISOString(),
                        source: { name: "AgriTech Daily" }
                    },
                    {
                        title: "Government Announces New Subsidies for Solar Water Pumps",
                        description: "In an effort to promote green energy in agriculture, a new subsidy program will cover up to 60% of the cost of solar-powered irrigation systems.",
                        url: "https://example.com/news/2",
                        image: "https://images.unsplash.com/photo-1523348837708-15d4a09cfac2?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
                        publishedAt: new Date(Date.now() - 86400000).toISOString(),
                        source: { name: "Rural Finance News" }
                    },
                    {
                        title: "Monsoon Forecast: Normal Rainfall Expected This Season",
                        description: "Meteorological departments anticipate a normal monsoon, bringing relief to farmers across the central and southern belts.",
                        url: "https://example.com/news/3",
                        image: "https://images.unsplash.com/photo-1560493676-04071c5f467b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
                        publishedAt: new Date(Date.now() - 172800000).toISOString(),
                        source: { name: "Weather Today" }
                    }
                ]
            };
        }
    }
};
