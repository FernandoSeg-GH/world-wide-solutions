// components/notifications/UserNotifications.tsx
"use client";

import React, { useState, useEffect } from "react";
import SectionHeader from '@/components/layout/navbar/SectionHeader';
import Inbox from '@/components/notifications/inbox/Inbox';
import { Card } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';

interface Notification {
    id: number;
    message: string;
    date: string;
    isNew: boolean;
}

const UserNotifications: React.FC = () => {
    const [notifications, setNotifications] = useState<Notification[]>([]);

    // useEffect(() => {
    //     // Fetch notifications from API or initialize as needed
    //     setNotifications([
    //         {
    //             id: 1,
    //             message: 'Welcome to the platform!',
    //             date: '2024-10-19',
    //             isNew: false
    //         },
    //         {
    //             id: 2,
    //             message: 'Your case id #213903 is being reviewed. We will notify you on the coming steps',
    //             date: '2024-10-20',
    //             isNew: true
    //         },
    //     ]);
    // }, []);

    return (
        <div>
            <SectionHeader title="Notification Center" subtitle="Stay up to date with your record and case." />
            <Separator className='my-2' />
            <div className='my-6'>
                <Inbox />
                {/* Optional: Display notifications if needed */}
                {/* <Separator className='my-2' />
                {notifications.map((notification) => (
                    <Card key={notification.id} className="mb-2 flex items-center justify-between p-4">
                        <div>
                            <p>{notification.message}</p>
                            <span className="text-sm text-gray-500">{notification.date}</span>
                        </div>
                        {notification.isNew && (
                            <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                        )}
                    </Card>
                ))} */}
            </div>
        </div>
    );
};

export default UserNotifications;
