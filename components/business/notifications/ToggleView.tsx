"use client"
import { Switch } from '@/components/ui/switch';
import { useState } from 'react';


interface ToggleViewProps {
    onToggle: (isAdmin: boolean) => void;
}

const ToggleView: React.FC<ToggleViewProps> = ({ onToggle }) => {
    const [isAdmin, setIsAdmin] = useState(false);

    const handleToggle = () => {
        setIsAdmin((prev) => !prev);
        onToggle(!isAdmin);
    };

    return (
        <div className="flex items-center space-x-2">
            <span>User View</span>
            <Switch checked={isAdmin} onChange={handleToggle} />
            <span>Admin View</span>
        </div>
    );
};

export default ToggleView;
