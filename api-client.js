// Frontend API Configuration
// Point to backend server

const API_URL = 'http://localhost:5000/api';

let token = localStorage.getItem('authToken');

// ===== AUTHENTICATION =====

async function register(name, email, password, phone) {
    try {
        const response = await fetch(`${API_URL}/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, email, password, phone })
        });
        const data = await response.json();
        if (data.token) {
            localStorage.setItem('authToken', data.token);
            localStorage.setItem('currentUser', JSON.stringify(data.user));
            token = data.token;
        }
        return data;
    } catch (error) {
        console.error('Register error:', error);
    }
}

async function login(email, password) {
    try {
        const response = await fetch(`${API_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });
        const data = await response.json();
        if (data.token) {
            localStorage.setItem('authToken', data.token);
            localStorage.setItem('currentUser', JSON.stringify(data.user));
            token = data.token;
        }
        return data;
    } catch (error) {
        console.error('Login error:', error);
    }
}

function logout() {
    localStorage.removeItem('authToken');
    localStorage.removeItem('currentUser');
    token = null;
}

// ===== ITEMS =====

async function createItem(itemData) {
    try {
        const response = await fetch(`${API_URL}/items`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(itemData)
        });
        return await response.json();
    } catch (error) {
        console.error('Create item error:', error);
    }
}

async function getAllItems(filters = {}) {
    try {
        let url = `${API_URL}/items`;
        const params = new URLSearchParams(filters);
        if (Object.keys(filters).length > 0) {
            url += '?' + params.toString();
        }
        const response = await fetch(url);
        return await response.json();
    } catch (error) {
        console.error('Get items error:', error);
        return [];
    }
}

async function getItem(itemId) {
    try {
        const response = await fetch(`${API_URL}/items/${itemId}`);
        return await response.json();
    } catch (error) {
        console.error('Get item error:', error);
    }
}

async function deleteItem(itemId) {
    try {
        const response = await fetch(`${API_URL}/items/${itemId}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` }
        });
        return await response.json();
    } catch (error) {
        console.error('Delete item error:', error);
    }
}

async function updateItemStatus(itemId, status) {
    try {
        const response = await fetch(`${API_URL}/items/${itemId}/status`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ status })
        });
        return await response.json();
    } catch (error) {
        console.error('Update status error:', error);
    }
}

// ===== MESSAGES =====

async function sendMessage(itemId, senderName, senderContact, message) {
    try {
        const response = await fetch(`${API_URL}/messages`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ itemId, senderName, senderContact, message })
        });
        return await response.json();
    } catch (error) {
        console.error('Send message error:', error);
    }
}

async function getItemMessages(itemId) {
    try {
        const response = await fetch(`${API_URL}/messages/item/${itemId}`);
        return await response.json();
    } catch (error) {
        console.error('Get messages error:', error);
        return [];
    }
}

async function markMessageAsRead(messageId) {
    try {
        const response = await fetch(`${API_URL}/messages/${messageId}/read`, {
            method: 'PUT'
        });
        return await response.json();
    } catch (error) {
        console.error('Mark as read error:', error);
    }
}

async function getUnreadCount() {
    try {
        const response = await fetch(`${API_URL}/messages/unread/count`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await response.json();
        return data.unreadCount || 0;
    } catch (error) {
        console.error('Get unread count error:', error);
        return 0;
    }
}

// Export functions for use in script.js
window.api = {
    register,
    login,
    logout,
    createItem,
    getAllItems,
    getItem,
    deleteItem,
    updateItemStatus,
    sendMessage,
    getItemMessages,
    markMessageAsRead,
    getUnreadCount
};
