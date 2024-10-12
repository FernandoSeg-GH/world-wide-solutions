'use client';
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Menu } from "lucide-react";
import { FaHome, FaBusinessTime, FaRobot, FaListAlt, FaClipboardList, FaBell } from 'react-icons/fa';
import { useAppContext } from "@/context/AppProvider";
import React from 'react';
import { cn } from "@/lib/utils";

interface SidebarProps {
    isExpanded: boolean;
    setIsExpanded: (value: boolean) => void;
}

export interface SidebarItem {
    icon: React.ElementType;
    label: string;
}

export const getSidebarItems = (godMode: boolean): SidebarItem[] => {
    const sidebarItems: SidebarItem[] = [
        {
            icon: FaHome,
            label: "Dashboard",
        },
        {
            icon: FaListAlt,
            label: "Forms",
        },
        {
            icon: FaClipboardList,
            label: "Submissions",
        },
        {
            icon: FaBell,
            label: "Notifications",
        },
    ];

    if (godMode) {
        sidebarItems.push(
            {
                icon: FaBusinessTime,
                label: "Businesses",
            },
            {
                icon: FaRobot,
                label: "AI Characters",
            }
        );
    }

    return sidebarItems;
};

export function Sidebar({ isExpanded, setIsExpanded }: SidebarProps) {
    const { actions: layoutState, data } = useAppContext();
    const { switchSection } = layoutState;
    const { currentSection, godMode } = data;
    const sidebarItems = getSidebarItems(godMode);

    return (
        <aside className={`fixed inset-y-0 left-0 z-10 flex flex-col border-r bg-background transition-all duration-300 ${isExpanded ? "w-64" : "w-14"}`}>
            <div className="flex h-14 items-center justify-between px-2">

                <h1 className={cn("text-lg font-semibold whitespace-nowrap hidden", isExpanded && "block")}>Vinci Suite</h1>

                <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-10"
                    onClick={() => setIsExpanded(!isExpanded)}
                >
                    <Menu className="h-4 w-4" />
                </Button>
            </div>
            <nav className="flex flex-col gap-4 px-2 py-4">
                <TooltipProvider>
                    {sidebarItems.map((item) => (
                        <Tooltip key={item.label}>
                            <TooltipTrigger asChild>
                                <button
                                    onClick={() => switchSection(item.label)}
                                    className={cn(
                                        "flex h-9 items-center rounded-lg transition-colors hover:text-foreground trasition-all ease-out",
                                        currentSection === item.label ? "bg-accent text-accent-foreground" : "text-muted-foreground",
                                        isExpanded ? "px-3" : "justify-center"
                                    )}
                                >
                                    {/* Correct icon rendering */}
                                    {item.icon && React.createElement(item.icon, { className: "h-5 w-5" })}
                                    <span className={cn("ml-2 whitespace-nowrap hidden", isExpanded && "block")}>{item.label}</span>
                                </button>
                            </TooltipTrigger>
                            <TooltipContent side="right">{item.label}</TooltipContent>
                        </Tooltip>
                    ))}
                </TooltipProvider>
            </nav>
        </aside>
    );
}
