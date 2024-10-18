"use client"
import { useState } from 'react';
import ToggleView from './ToggleView';
import AdminNotifications from './AdminNotifications';
import UserNotifications from './UserNotifications';

const Notifications: React.FC = () => {
    const [isAdmin, setIsAdmin] = useState(false);

    return (
        <div className="container mx-auto p-4">
            <ToggleView onToggle={setIsAdmin} />
            <div className="mt-6">
                {isAdmin ? <AdminNotifications /> : <UserNotifications />}
            </div>
        </div>
    );
};

export default Notifications;
