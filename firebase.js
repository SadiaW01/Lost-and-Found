// Using localStorage instead of Firebase for simplicity

const db = {
    // Save an item
    async addItem(item) {
        const items = this.getAllItems();
        item.id = Date.now();
        item.timestamp = new Date().toISOString();
        items.push(item);
        localStorage.setItem('lostFoundItems', JSON.stringify(items));
        return item.id;
    },

    // Get all items
    getAllItems() {
        const data = localStorage.getItem('lostFoundItems');
        return data ? JSON.parse(data) : [];
    },

    // Delete an item
    deleteItem(id) {
        const items = this.getAllItems().filter(item => item.id !== id);
        localStorage.setItem('lostFoundItems', JSON.stringify(items));
    },

    // Get item by ID
    getItem(id) {
        const items = this.getAllItems();
        return items.find(item => item.id === id);
    },

    // Save a message
    async sendMessage(itemId, message) {
        const messages = this.getMessages();
        message.id = Date.now();
        message.itemId = itemId;
        message.timestamp = new Date().toISOString();
        messages.push(message);
        localStorage.setItem('lostFoundMessages', JSON.stringify(messages));
    },

    // Get all messages
    getMessages() {
        const data = localStorage.getItem('lostFoundMessages');
        return data ? JSON.parse(data) : [];
    },

    // Get messages for a specific item
    getMessagesForItem(itemId) {
        return this.getMessages().filter(m => m.itemId === itemId);
    },

    // Notifications
    getNotifications() {
        const data = localStorage.getItem('lostFoundNotifications');
        return data ? JSON.parse(data) : [];
    },

    addNotification(notification) {
        const notifications = this.getNotifications();
        notification.id = Date.now();
        notification.timestamp = new Date().toISOString();
        notification.read = false;
        notifications.unshift(notification);
        localStorage.setItem('lostFoundNotifications', JSON.stringify(notifications));
    },

    getUnreadCount() {
        return this.getNotifications().filter(n => !n.read).length;
    },

    markAllAsRead() {
        const notifications = this.getNotifications().map(n => ({...n, read: true}));
        localStorage.setItem('lostFoundNotifications', JSON.stringify(notifications));
    }
};

const storage = {
    // Store image as base64 (for small images)
    async uploadImage(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result);
            reader.onerror = reject;
            reader.readAsDataURL(file);
        });
    }
};

window.db = db;
window.storage = storage;
