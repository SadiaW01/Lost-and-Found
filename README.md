# Lost & Found Web App

A simple web application for students to post lost and found items, built with HTML, CSS, JavaScript, and Firebase.

## Features

- Add lost or found items with title, description, category, location, contact info, and image
- View all items separated by lost and found
- Search items by name
- Filter by category and type
- Contact owners directly

## Setup Instructions

1. **Create a Firebase Project:**
   - Go to [Firebase Console](https://console.firebase.google.com/)
   - Create a new project
   - Enable Firestore Database
   - Enable Firebase Storage

2. **Get Firebase Config:**
   - In your Firebase project settings, find the web app config
   - Copy the config object

3. **Update the Code:**
   - Open `index.html`
   - Replace the `firebaseConfig` object with your actual config

4. **Deploy or Run Locally:**
   - For local development, open `index.html` in a browser
   - For production, deploy to Firebase Hosting or any static host

## Firebase Rules

Make sure to set up Firestore and Storage rules to allow reads and writes. For development, you can use:

### Firestore Rules:
```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if true;
    }
  }
}
```

### Storage Rules:
```
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /{allPaths=**} {
      allow read, write: if true;
    }
  }
}
```

**Note:** For production, implement proper authentication and security rules.

## File Structure

- `index.html` - Main HTML file
- `styles.css` - CSS styles
- `script.js` - JavaScript logic
- `README.md` - This file

## Usage

1. Click "Add Item" to post a new lost or found item
2. Fill in the form and upload an image if available
3. Click "View Items" to see all posts
4. Use search and filters to find specific items
5. Click "Contact" to get the owner's contact info