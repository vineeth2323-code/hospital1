// DOM Elements
const navLinks = document.querySelectorAll('#main-nav a');
const pages = document.querySelectorAll('.page');
const loginBtn = document.getElementById('login-btn');
const registerBtn = document.getElementById('register-btn');
const loginModal = document.getElementById('login-modal');

// Sample data store (in a real app, this would be API calls to a backend)
const appData = {
  currentUser: null,
  users: [
    { id: 1, username: 'patient1', password: 'pass123', role: 'patient', name: 'John Doe' },
    { id: 2, username: 'doctor1', password: 'pass123', role: 'doctor', name: 'Dr. Smith' },
    { id: 3, username: 'lab1', password: 'pass123', role: 'lab', name: 'Lab Admin' },
    { id: 4, username: 'pharmacy1', password: 'pass123', role: 'pharmacy', name: 'Pharmacist' },
    { id: 5, username: 'billing1', password: 'pass123', role: 'billing', name: 'Billing Admin' }
  ],
  appointments: [],
  prescriptions: [],
  labTests: [],
  pharmacyStock: [],
  bills: [],
  notifications: []
};

// Initialize the application
document.addEventListener('DOMContentLoaded', () => {
  // Navigation between pages
  navLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const pageId = link.dataset.page;
      showPage(pageId);
      
      // Update active state
      navLinks.forEach(navLink => navLink.classList.remove('active'));
      link.classList.add('active');
    });
  });

  // Login/Register buttons
  loginBtn.addEventListener('click', showLoginModal);
  registerBtn.addEventListener('click', showRegisterModal);
});

function showPage(pageId) {
  // Hide all pages
  pages.forEach(page => page.classList.remove('active'));
  
  // Show selected page
  const pageToShow = document.getElementById(`${pageId}-page`);
  if (pageToShow) {
    pageToShow.classList.add('active');
    
    // Load specific page data if needed
    switch(pageId) {
      case 'patient':
        loadPatientData();
        break;
      case 'doctor':
        loadDoctorData();
        break;
      case 'lab':
        loadLabData();
        break;
      case 'pharmacy':
        loadPharmacyData();
        break;
      case 'billing':
        loadBillingData();
        break;
    }
  }
}

function showLoginModal() {
  // In a real app, this would show a proper login form
  alert('Login functionality would be implemented here');
  // For demo purposes, we'll just set a user
  appData.currentUser = appData.users[0]; // Patient user
}

function showRegisterModal() {
  alert('Registration functionality would be implemented here');
}

// Notification system
function sendNotification(from, to, message, type) {
  const notification = {
    id: Date.now(),
    from,
    to,
    message,
    type,
    timestamp: new Date(),
    read: false
  };
  
  appData.notifications.push(notification);
  console.log(`Notification sent: ${message}`);
  
  // In a real app, this would trigger UI updates or push notifications
  if (appData.currentUser && appData.currentUser.id === to) {
    showNotification(message);
  }
}

function showNotification(message) {
  // Create a notification element
  const notificationEl = document.createElement('div');
  notificationEl.className = 'notification';
  notificationEl.textContent = message;
  notificationEl.style.position = 'fixed';
  notificationEl.style.bottom = '20px';
  notificationEl.style.right = '20px';
  notificationEl.style.padding = '15px';
  notificationEl.style.backgroundColor = '#2ecc71';
  notificationEl.style.color = 'white';
  notificationEl.style.borderRadius = '5px';
  notificationEl.style.zIndex = '9999';
  notificationEl.style.boxShadow = '0 4px 8px rgba(0,0,0,0.2)';
  
  document.body.appendChild(notificationEl);
  
  // Remove after 5 seconds
  setTimeout(() => {
    notificationEl.style.opacity = '0';
    setTimeout(() => notificationEl.remove(), 500);
  }, 5000);
}
