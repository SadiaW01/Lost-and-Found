// script.js
// No imports needed - using localStorage via firebase.js

document.addEventListener('DOMContentLoaded', () => {
    const addItemBtn = document.getElementById('addItemBtn');
    const viewItemsBtn = document.getElementById('viewItemsBtn');
    const addItemSection = document.getElementById('addItemSection');
    const viewItemsSection = document.getElementById('viewItemsSection');
    const addItemForm = document.getElementById('addItemForm');
    const searchInput = document.getElementById('search');
    const filterCategory = document.getElementById('filterCategory');
    const filterType = document.getElementById('filterType');
    const lostItemsContainer = document.querySelector('#lostItems .items');
    const foundItemsContainer = document.querySelector('#foundItems .items');
    const useLocationBtn = document.getElementById('useLocationBtn');

    // Navigation
    addItemBtn.addEventListener('click', () => {
        addItemSection.classList.add('active');
        viewItemsSection.classList.remove('active');
    });

    viewItemsBtn.addEventListener('click', () => {
        viewItemsSection.classList.add('active');
        addItemSection.classList.remove('active');
        loadItems();
    });

    // Add Item Form
    addItemForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const title = document.getElementById('title').value;
        const description = document.getElementById('description').value;
        const category = document.getElementById('category').value;
        const location = document.getElementById('location').value;
        const contact = document.getElementById('contact').value;
        const type = document.getElementById('type').value;
        const imageFile = document.getElementById('image').files[0];

        let imageUrl = '';
        if (imageFile) {
            imageUrl = await window.storage.uploadImage(imageFile);
        }

        try {
            await window.db.addItem({
                title,
                description,
                category,
                location,
                contact,
                type,
                imageUrl
            });
            alert('Item added successfully!');
            addItemForm.reset();
        } catch (error) {
            console.error('Error adding item: ', error);
            alert('Error adding item. Please try again.');
        }
    });

    // Use Current Location
    useLocationBtn.addEventListener('click', () => {
        if (!navigator.geolocation) {
            alert('Geolocation is not supported by your browser');
            return;
        }

        useLocationBtn.textContent = '⏳ Getting location...';
        
        navigator.geolocation.getCurrentPosition(
            async (position) => {
                const { latitude, longitude } = position.coords;
                
                // Reverse geocoding to get address
                try {
                    const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`);
                    const data = await response.json();
                    const address = data.display_name || `${latitude}, ${longitude}`;
                    document.getElementById('location').value = address;
                    useLocationBtn.textContent = '📍 Use My Location';
                } catch {
                    document.getElementById('location').value = `${latitude}, ${longitude}`;
                    useLocationBtn.textContent = '📍 Use My Location';
                }
            },
            (error) => {
                alert('Unable to get location. Please enter manually.');
                useLocationBtn.textContent = '📍 Use My Location';
            }
        );
    });

    // Load Items
    async function loadItems() {
        lostItemsContainer.innerHTML = '';
        foundItemsContainer.innerHTML = '';

        try {
            const items = window.db.getAllItems();
            // Sort by timestamp descending
            items.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
            
            items.forEach((item) => {
                const itemElement = createItemElement(item);
                if (item.type === 'lost') {
                    lostItemsContainer.appendChild(itemElement);
                } else {
                    foundItemsContainer.appendChild(itemElement);
                }
            });
        } catch (error) {
            console.error('Error loading items: ', error);
        }
    }

    function createItemElement(item) {
        const div = document.createElement('div');
        div.className = 'item';
        div.dataset.id = item.id;
        div.innerHTML = `
            <h4>${item.title}</h4>
            <p><strong>Description:</strong> ${item.description}</p>
            <p><strong>Category:</strong> ${item.category}</p>
            <p><strong>Location:</strong> ${item.location}</p>
            ${item.imageUrl ? `<img src="${item.imageUrl}" alt="${item.title}">` : ''}
            <div class="item-buttons">
                <button class="contact-btn" onclick="openContactModal(${item.id})">📬 Contact</button>
                <button class="view-messages-btn" onclick="viewMessages(${item.id})">📩 View Messages</button>
                <button class="delete-btn" onclick="deleteItem(${item.id})">Delete</button>
            </div>
        `;
        return div;
    }

    // Contact Modal
    const contactModal = document.getElementById('contactModal');
    const messagesModal = document.getElementById('messagesModal');
    const notificationsModal = document.getElementById('notificationsModal');
    const closeModalBtns = document.querySelectorAll('.close-modal');
    let currentItemId = null;

    closeModalBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            contactModal.style.display = 'none';
            messagesModal.style.display = 'none';
            notificationsModal.style.display = 'none';
        });
    });

    // Close modal when clicking outside
    window.addEventListener('click', (e) => {
        if (e.target === contactModal) {
            contactModal.style.display = 'none';
        }
        if (e.target === messagesModal) {
            messagesModal.style.display = 'none';
        }
        if (e.target === notificationsModal) {
            notificationsModal.style.display = 'none';
        }
    });

    window.openContactModal = function(itemId) {
        currentItemId = itemId;
        const item = window.db.getItem(itemId);
        document.getElementById('modalItemTitle').textContent = `Contact for: ${item.title}`;
        contactModal.style.display = 'block';
    };

    // Send Message
    document.getElementById('messageForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        const senderName = document.getElementById('senderName').value;
        const senderContact = document.getElementById('senderContact').value;
        const message = document.getElementById('message').value;

        const item = window.db.getItem(currentItemId);

        await window.db.sendMessage(currentItemId, {
            senderName,
            senderContact,
            message
        });

        // Add notification for the item owner
        if (item) {
            window.db.addNotification({
                type: 'message',
                itemTitle: item.title,
                from: senderName,
                contact: senderContact,
                message: message
            });
        }

        // Update notification count
        updateNotificationCount();

        alert('Message sent successfully!');
        contactModal.style.display = 'none';
        document.getElementById('messageForm').reset();
    });

    // Update notification count
    function updateNotificationCount() {
        const count = window.db.getUnreadCount();
        const badge = document.getElementById('notificationCount');
        badge.textContent = count;
        badge.style.display = count > 0 ? 'block' : 'none';
    }

    // Show notifications
    window.showNotifications = function() {
        const notifications = window.db.getNotifications();
        const notificationsList = document.getElementById('notificationsList');
        
        if (notifications.length === 0) {
            notificationsList.innerHTML = '<p>No notifications yet.</p>';
        } else {
            notificationsList.innerHTML = notifications.map(n => `
                <div class="notification-item ${n.read ? '' : 'unread'}">
                    <p><strong>📬 New message</strong> for "${n.itemTitle}"</p>
                    <p><strong>From:</strong> ${n.from}</p>
                    <p><strong>Contact:</strong> ${n.contact}</p>
                    <p><strong>Message:</strong> ${n.message}</p>
                    <p><small>${new Date(n.timestamp).toLocaleString()}</small></p>
                </div>
            `).join('');
        }
        
        // Mark as read
        window.db.markAllAsRead();
        updateNotificationCount();
        
        notificationsModal.style.display = 'block';
    };

    // Initialize notification count on page load
    updateNotificationCount();

    // View Messages
    window.viewMessages = function(itemId) {
        const messages = window.db.getMessagesForItem(itemId);
        const messagesList = document.getElementById('messagesList');
        
        if (messages.length === 0) {
            messagesList.innerHTML = '<p>No messages yet.</p>';
        } else {
            messagesList.innerHTML = messages.map(m => `
                <div class="message-item">
                    <p><strong>From:</strong> ${m.senderName}</p>
                    <p><strong>Contact:</strong> ${m.senderContact}</p>
                    <p><strong>Message:</strong> ${m.message}</p>
                    <p><small>${new Date(m.timestamp).toLocaleString()}</small></p>
                </div>
            `).join('');
        }
        
        messagesModal.style.display = 'block';
    };

    window.contact = function(contactInfo) {
        alert(`Contact Info: ${contactInfo}`);
    };

    window.deleteItem = function(id) {
        if (confirm('Are you sure you want to delete this item?')) {
            window.db.deleteItem(id);
            loadItems();
        }
    };

    // Search and Filter
    searchInput.addEventListener('input', filterItems);
    filterCategory.addEventListener('change', filterItems);
    filterType.addEventListener('change', filterItems);

    function filterItems() {
        const searchTerm = searchInput.value.toLowerCase();
        const categoryFilter = filterCategory.value;
        const typeFilter = filterType.value;

        const allItems = document.querySelectorAll('.item');
        allItems.forEach(item => {
            const title = item.querySelector('h4').textContent.toLowerCase();
            const category = item.querySelector('p:nth-child(3)').textContent.replace('Category: ', '').toLowerCase();
            const type = item.closest('#lostItems, #foundItems').id === 'lostItems' ? 'lost' : 'found';

            const matchesSearch = title.includes(searchTerm);
            const matchesCategory = !categoryFilter || category === categoryFilter.toLowerCase();
            const matchesType = !typeFilter || type === typeFilter;

            if (matchesSearch && matchesCategory && matchesType) {
                item.style.display = 'block';
            } else {
                item.style.display = 'none';
            }
        });
    }
});