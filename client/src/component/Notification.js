import React, { useEffect } from 'react';
import '../App.css'; // Import the CSS file for styling

const Notification = ({ message, onClose }) => {
    useEffect(() => {
        const timer = setTimeout(onClose, 3000);
        return () => clearTimeout(timer);
    }, [onClose]);

    return (
        <div className="notification-popup">
            {message}
        </div>
    );
};

export default Notification;
