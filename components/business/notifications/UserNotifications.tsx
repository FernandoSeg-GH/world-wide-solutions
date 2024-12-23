"use client";

import React, { useState, useEffect } from "react";
import SectionHeader from '@/components/layout/navbar/SectionHeader';
import Inbox from '@/components/notifications/inbox/Inbox';
import { Separator } from '@/components/ui/separator';

interface Notification {
    id: number;
    message: string;
    date: string;
    isNew: boolean;
}

const UserNotifications: React.FC = () => {
    return (
        <div>
            <SectionHeader title="Notification Center" subtitle="Stay up to date with your record and case." />
            <Separator className='my-2' />
            <div className='my-6'>
                <Inbox />
            </div>
        </div>
    );
};

export default UserNotifications;
