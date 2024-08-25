let notificationTimeouts = {};

function showNotification(message, type = 'success', context = 'global') {
    console.log('Showing notification:', message, type, context);
    const notificationId = `notification-${context}`;
    let notification = document.getElementById(notificationId);

    if (!notification) {
        notification = document.createElement('div');
        notification.id = notificationId;
        notification.className = `notification ${type}`;
        notification.style.position = 'fixed';
        notification.style.top = '20px';
        notification.style.right = '20px';
        notification.style.padding = '10px';
        notification.style.borderRadius = '5px';
        notification.style.zIndex = '1000';
        document.body.appendChild(notification);
    }

    notification.textContent = message;
    notification.className = `notification ${type}`;

    if (type === 'success') {
        notification.style.backgroundColor = '#4CAF50';
        notification.style.color = 'white';
    } else if (type === 'error') {
        notification.style.backgroundColor = '#f44336';
        notification.style.color = 'white';
    } else {
        notification.style.backgroundColor = '#2196F3';
        notification.style.color = 'white';
    }

    notification.style.display = 'block';

    // Clear any existing timeout for this context
    if (notificationTimeouts[context]) {
        clearTimeout(notificationTimeouts[context]);
    }

    notificationTimeouts[context] = setTimeout(() => {
        notification.style.display = 'none';
    }, 5000);
}