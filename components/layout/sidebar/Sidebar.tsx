"use client";

import React, { useCallback, useEffect, useState } from "react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { ChevronLeft, ChevronsRight, ChevronRight } from "lucide-react";
import { useAppContext } from "@/context/AppProvider";
import { cn } from "@/lib/utils";
import Logo from "@/components/Logo";
import { useSession } from "next-auth/react";
import { getSidebarItems, SidebarItem } from "./SidebarItems";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface SidebarProps {
    isExpanded: boolean;
    setIsExpanded: (value: boolean) => void;
}

export function Sidebar({ isExpanded, setIsExpanded }: SidebarProps) {
    const { actions: layoutState, data, selectors } = useAppContext();
    const { switchSection } = layoutState;
    const { currentSection, godMode } = data;
    const { data: session } = useSession();
    const [openSubmenus, setOpenSubmenus] = useState<Set<string>>(new Set());
    const [unreadLogsCount, setUnreadLogsCount] = useState<number>(0);

    const sidebarItems: SidebarItem[] = getSidebarItems(godMode, [], session?.user.role.id);

    // Fetch unread logs count
    const fetchUnreadLogsCount = useCallback(async () => {
        try {
            const response = await fetch("/api/logs");
            if (response.ok) {
                const { logs } = await response.json();
                const unreadCount = logs.filter((log: any) => !log.is_read).length;
                setUnreadLogsCount(unreadCount);
            }
        } catch (error) {
            console.error("Error fetching logs:", error);
        }
    }, []);

    useEffect(() => {
        fetchUnreadLogsCount();
    }, [fetchUnreadLogsCount]);

    const toggleSubmenu = (label: string) => {
        setOpenSubmenus((prev) => {
            const newSet = new Set(prev);
            if (newSet.has(label)) {
                newSet.delete(label);
            } else {
                newSet.add(label);
            }
            return newSet;
        });
    };

    return (
        <aside
            onClick={() => setIsExpanded(!isExpanded)}
            className={cn(
                "fixed inset-y-0 left-0 z-20 flex flex-col border-r bg-navyBlue dark:bg-indigo-950 transition-all duration-300 shadow",
                isExpanded ? "w-64" : "w-16"
            )}
        >
            <div onClick={(event: React.MouseEvent<HTMLDivElement>) => event.stopPropagation()}>
                {isExpanded ? (
                    <Logo
                        url="https://vinci-space-nest.nyc3.cdn.digitaloceanspaces.com/vinci-space-nest/business_id_2/branding/Logotipo-1.png"
                        width={160}
                    />
                ) : (
                    <Logo
                        url="https://vinci-space-nest.nyc3.cdn.digitaloceanspaces.com/vinci-space-nest/business_id_2/branding/IsoVW-1.png"
                        width={25}
                    />
                )}
            </div>
            <nav className="flex flex-col gap-4 px-2 py-4">
                <TooltipProvider>
                    {sidebarItems.map((item) => (
                        <Tooltip key={item.label}>
                            <TooltipTrigger asChild>
                                <div>
                                    <button
                                        onClick={(event: React.MouseEvent<HTMLButtonElement>) => {
                                            event.stopPropagation();
                                            if (item.subItems && item.subItems.length > 0) {
                                                toggleSubmenu(item.label);
                                            } else {
                                                switchSection(item.label);
                                            }
                                        }}
                                        className={cn(
                                            "flex items-center rounded-lg transition-colors hover:text-foreground w-full",
                                            currentSection === item.label ||
                                                item.subItems?.some((sub) => currentSection === sub.label)
                                                ? "bg-accent text-accent-foreground"
                                                : "text-white/80",
                                            isExpanded ? "px-3 py-2" : "justify-center py-2"
                                        )}
                                    >
                                        {item.icon &&
                                            React.createElement(item.icon, {
                                                className: "h-5 w-5 text-current",
                                            })}
                                        {isExpanded && (
                                            <span className="ml-2 whitespace-nowrap">{item.label}</span>
                                        )}

                                        {isExpanded && item.label === "Logs" && unreadLogsCount > 0 && (
                                            <Badge className="ml-auto bg-red-600 text-white">
                                                {unreadLogsCount}
                                            </Badge>
                                        )}

                                        {isExpanded && item.subItems && item.subItems.length > 0 && (
                                            <span className="ml-auto">
                                                {openSubmenus.has(item.label) ? (
                                                    <ChevronLeft />
                                                ) : (
                                                    <ChevronRight />
                                                )}
                                            </span>
                                        )}
                                    </button>
                                    {item.subItems &&
                                        isExpanded &&
                                        openSubmenus.has(item.label) && (
                                            <div className="ml-6 mt-1 flex flex-col gap-1">
                                                {item.subItems.map((subItem) => (
                                                    <Tooltip key={subItem.label}>
                                                        <TooltipTrigger asChild>
                                                            <button
                                                                onClick={(event: React.MouseEvent<HTMLButtonElement>) => {
                                                                    event.stopPropagation();
                                                                    switchSection(subItem.label);
                                                                }}
                                                                className={cn(
                                                                    "flex items-center rounded-lg transition-colors hover:text-white w-full",
                                                                    currentSection === subItem.label
                                                                        ? "bg-accent text-accent-foreground"
                                                                        : "text-white/60",
                                                                    isExpanded ? "px-3 py-2" : "justify-center py-2"
                                                                )}
                                                            >
                                                                {subItem.icon &&
                                                                    React.createElement(subItem.icon, {
                                                                        className: "h-5 w-5",
                                                                    })}
                                                                {isExpanded && (
                                                                    <span className="ml-2 whitespace-nowrap truncate text-ellipsis pr-2 text-sm">
                                                                        {subItem.label}
                                                                    </span>
                                                                )}
                                                            </button>
                                                        </TooltipTrigger>
                                                        {!isExpanded && (
                                                            <TooltipContent side="right">
                                                                {subItem.label}
                                                            </TooltipContent>
                                                        )}
                                                    </Tooltip>
                                                ))}
                                            </div>
                                        )}
                                </div>
                            </TooltipTrigger>
                            {!isExpanded && (
                                <TooltipContent side="right">{item.label}</TooltipContent>
                            )}
                        </Tooltip>
                    ))}
                </TooltipProvider>
            </nav>
            {isExpanded ? (
                <ChevronLeft
                    className="absolute bottom-2 right-4 cursor-pointer"
                    onClick={(event: React.MouseEvent<SVGSVGElement>) => {
                        event.stopPropagation();
                        setIsExpanded(false);
                    }}
                />
            ) : (
                <ChevronsRight
                    className="absolute bottom-2 right-4 cursor-pointer"
                    onClick={(event: React.MouseEvent<SVGSVGElement>) => {
                        event.stopPropagation();
                        setIsExpanded(true);
                    }}
                />
            )}
        </aside>
    );
}

export default Sidebar;
