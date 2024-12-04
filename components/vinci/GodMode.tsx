import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { useState } from "react";

interface GodModeProps {
    isOpen: boolean;
    onConfirm: (selectedRole: string) => void;
    onCancel: () => void;
}

export function GodMode({ isOpen, onConfirm, onCancel }: GodModeProps) {
    const [role, setRole] = useState<string>("User");

    const handleRoleChange = (newRole: string) => {
        setRole(newRole);
    };

    const handleConfirm = () => {
        onConfirm(role);
    };

    return (
        <AlertDialog open={isOpen}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Activate God Mode</AlertDialogTitle>
                    <AlertDialogDescription>
                        This will allow you to simulate different user roles.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <div className="flex gap-4 mt-4">
                    <Button
                        variant={role === "Admin" ? "default" : "outline"}
                        onClick={() => handleRoleChange("Admin")}
                    >
                        Admin
                    </Button>
                    <Button
                        variant={role === "Manager" ? "default" : "outline"}
                        onClick={() => handleRoleChange("Manager")}
                    >
                        Manager
                    </Button>
                    <Button
                        variant={role === "User" ? "default" : "outline"}
                        onClick={() => handleRoleChange("User")}
                    >
                        User
                    </Button>
                    <Button
                        variant={role === "Superadmin" ? "default" : "outline"}
                        onClick={() => handleRoleChange("Superadmin")}
                    >
                        Superadmin
                    </Button>
                </div>
                <AlertDialogFooter>
                    <AlertDialogCancel onClick={onCancel}>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={handleConfirm}>Activate</AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}
