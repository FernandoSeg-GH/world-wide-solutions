// Sidebar.tsx

"use client";

import React, { useCallback, useEffect, useState } from "react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { ChevronLeft, ChevronsRight, ChevronRight } from "lucide-react";
import { useAppContext } from "@/context/AppProvider";
import { cn } from "@/lib/utils";
import Logo from "@/components/Logo";
import { useFormState } from "@/hooks/forms/useFormState";
import { useSession } from "next-auth/react";
import { getSidebarItems, SidebarItem } from "./SidebarItems";
import { Badge } from "@/components/ui/badge"; // Import Badge component
import { useMessagesContext } from "@/context/MessagesContext"; // Import the context hook
import { Button } from "@/components/ui/button";
import { debounce } from "lodash";

interface SidebarProps {
    isExpanded: boolean;
    setIsExpanded: (value: boolean) => void;
}

export function Sidebar({ isExpanded, setIsExpanded }: SidebarProps) {
    const { actions: layoutState, data, selectors } = useAppContext();
    const { switchSection } = layoutState;
    const { currentSection, godMode } = data;
    const { forms, fetchFormsByBusinessId } = useFormState();
    const { data: session } = useSession();
    const { setForm } = selectors;
    const [openSubmenus, setOpenSubmenus] = useState<Set<string>>(new Set());

    const { fetchConversations, conversations, totalUnread, markAllMessagesAsRead } = useMessagesContext(); // Use the context

    // useEffect(() => {
    //     if (session?.user.businessId && session.user.role.id !== 1) {
    //         fetchFormsByBusinessId(session.user.businessId);
    //     }
    // }, [session?.user.businessId, fetchFormsByBusinessId, session?.user.role.id]);

    const sidebarItems: SidebarItem[] = getSidebarItems(godMode, forms, session?.user.role.id);


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
                {
                    isExpanded ? <Logo url="https://vinci-space-nest.nyc3.cdn.digitaloceanspaces.com/vinci-space-nest/business_id_2/branding/Logotipo-1.png" width={160} className="" /> : <Logo url="https://vinci-space-nest.nyc3.cdn.digitaloceanspaces.com/vinci-space-nest/business_id_2/branding/IsoVW-1.png" width={25} className="" />
                }
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
                                            currentSection === item.label || item.subItems?.some(sub => currentSection === sub.label)
                                                ? "bg-accent text-accent-foreground"
                                                : "text-white/80",
                                            isExpanded ? "px-3 py-2" : "justify-center py-2"
                                        )}
                                        aria-haspopup={item.subItems ? "true" : undefined}
                                        aria-expanded={item.subItems ? openSubmenus.has(item.label) : undefined}
                                    >
                                        {item.icon &&
                                            React.createElement(item.icon, {
                                                className: cn(
                                                    "h-5 w-5",
                                                    isExpanded
                                                        ? "text-current"
                                                        : (item.label === "Messages" ? "text-gray-400 animate-pulse animation-delay-400" : "text-primary-500")
                                                ),
                                            })
                                        }
                                        {isExpanded && (
                                            <span className="ml-2 whitespace-nowrap">
                                                {item.label}
                                            </span>
                                        )}
                                        {/* Display Badge if the item is Messages */}

                                        {isExpanded && item.label === "Messages" && totalUnread > 0 && (
                                            <Badge
                                                className="ml-auto cursor-pointer"
                                            // onClick={(e) => {
                                            //     e.stopPropagation(); // Prevent triggering the button's onClick
                                            //     markAllMessagesAsRead(); // Mark all messages as read
                                            // }}
                                            >
                                                {totalUnread}
                                            </Badge>
                                        )}


                                        {isExpanded && item.subItems && item.subItems.length > 0 && (
                                            <span className="ml-auto">
                                                {openSubmenus.has(item.label) ? <ChevronLeft /> : <ChevronRight />}
                                            </span>
                                        )}
                                    </button>
                                    {item.subItems && isExpanded && openSubmenus.has(item.label) && (
                                        <div className="ml-6 mt-1 flex flex-col gap-1">
                                            {item.subItems.map((subItem) => (
                                                <Tooltip key={subItem.label}>
                                                    <TooltipTrigger asChild>
                                                        <button
                                                            onClick={(event: React.MouseEvent<HTMLButtonElement>) => {
                                                                event.stopPropagation();
                                                                const selectedForm = forms.find((form) => form.name === subItem.label);
                                                                if (selectedForm) {
                                                                    setForm(selectedForm);
                                                                    switchSection('Form');
                                                                }
                                                            }}
                                                            className={cn(
                                                                "flex items-center rounded-lg transition-colors hover:text-white w-full",
                                                                currentSection === subItem.label
                                                                    ? "bg-accent text-accent-foreground"
                                                                    : "text-white/60",
                                                                isExpanded ? "px-3 py-2" : "justify-center py-2"
                                                            )}
                                                        >
                                                            {subItem.icon && (
                                                                React.createElement(subItem.icon, {
                                                                    className: "h-5 w-5",
                                                                })
                                                            )}
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
                                <TooltipContent side="right">
                                    {item.label}
                                </TooltipContent>
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
