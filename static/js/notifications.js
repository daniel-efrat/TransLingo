let notificationTimeout;

function showNotification(message, type = 'success') {
    console.log('Showing notification:', message, type);
    const notifications = document.getElementsByClassName('global-notification');
    if (notifications.length === 0) {
        console.error('Notification elements not found');
        return;
    }
    
    // Update all notification elements
    Array.from(notifications).forEach(notification => {
        notification.textContent = message;
        notification.className = `global-notification notification ${type}`;
        notification.style.display = 'block';
    });

    // Clear any existing timeout before setting a new one
    if (notificationTimeout) {
        clearTimeout(notificationTimeout);
    }

    notificationTimeout = setTimeout(() => {
        Array.from(notifications).forEach(notification => {
            notification.style.display = 'none';
        });
    }, 5000);
}