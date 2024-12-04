"use client";

import React from 'react';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';

interface ToggleViewProps {
    onToggle: (isAdmin: boolean) => void;
}

const ToggleView: React.FC<ToggleViewProps> = ({ onToggle }) => {
    const [isAdmin, setIsAdmin] = React.useState(false);

    const handleToggle = (checked: boolean) => {
        setIsAdmin(checked);
        onToggle(checked);
    };

    return (
        <div className="flex items-center space-x-2">
            <Label htmlFor="toggle-admin" className="text-sm font-medium">
                User View
            </Label>
            <Switch id="toggle-admin" checked={isAdmin} onCheckedChange={handleToggle} />
            <Label htmlFor="toggle-admin" className="text-sm font-medium">
                Admin View
            </Label>
        </div>
    );
};

export default ToggleView;
