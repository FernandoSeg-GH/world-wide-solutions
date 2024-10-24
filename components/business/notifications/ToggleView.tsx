"use client";
import React from 'react';
import { Switch } from '@/components/ui/switch'; // Adjust import as needed

interface ToggleViewProps {
    onToggle: (isAdmin: boolean) => void;
}

const ToggleView: React.FC<ToggleViewProps> = ({ onToggle }) => {
    const [isAdmin, setIsAdmin] = React.useState(false);

    const handleToggle = () => {
        setIsAdmin((prev) => {
            onToggle(!prev);
            return !prev;
        });
    };

    return (
        <div className="flex items-center">
            <span className="mr-2">User View</span>
            <Switch checked={isAdmin} onCheckedChange={handleToggle} />
            <span className="ml-2">Admin View</span>
        </div>
    );
};

export default ToggleView;
