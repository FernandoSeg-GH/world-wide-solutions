// Sidebar.tsx

"use client";
import { Button } from "@/components/ui/button";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import {
    ArrowBigRightDash,
    BookText,
    ChevronLeft,
    ChevronRight,
    ChevronsRight,
    DnaIcon,
    NotebookPen,
} from "lucide-react";
import {
    FaHome,
    FaBusinessTime,
    FaRobot,
    FaBell,
} from "react-icons/fa";
import { useAppContext } from "@/context/AppProvider";
import React from "react";
import { cn } from "@/lib/utils";
import Logo from "@/components/Logo";

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
            icon: BookText,
            label: "Forms",
        },
        {
            icon: NotebookPen,
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
            },
            {
                icon: DnaIcon,
                label: "Vinci",
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
        <aside
            onClick={() => setIsExpanded(!isExpanded)}
            className={cn(
                "fixed inset-y-0 left-0 z-10 flex flex-col border-r bg-background transition-all duration-300",
                isExpanded ? "w-64" : "w-14"
            )}
        >
            <Logo onClick={(event: React.MouseEvent<HTMLDivElement>) => event.stopPropagation()} />
            {/* Remove the menu button if no longer needed */}
            {/* <div className={cn("flex items-center justify-end px-2 py-2", isExpanded && " absolute top-1 right-1")}>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onClick={() => setIsExpanded(!isExpanded)}
        >
          <Menu className="h-6 w-6" />
        </Button>
      </div> */}
            <nav className="flex flex-col gap-4 px-2 py-4">
                <TooltipProvider>
                    {sidebarItems.map((item) => (
                        <Tooltip key={item.label}>
                            <TooltipTrigger asChild>
                                <button
                                    onClick={(event) => {
                                        event.stopPropagation();
                                        switchSection(item.label);
                                    }}
                                    className={cn(
                                        "flex items-center rounded-lg transition-colors hover:text-foreground",
                                        currentSection === item.label
                                            ? "bg-accent text-accent-foreground"
                                            : "text-muted-foreground",
                                        isExpanded ? "px-3 py-2" : "justify-center py-2"
                                    )}
                                >
                                    {item.icon &&
                                        React.createElement(item.icon, {
                                            className: "h-5 w-5",
                                        })}
                                    {isExpanded && (
                                        <span className="ml-2 whitespace-nowrap">
                                            {item.label}
                                        </span>
                                    )}
                                </button>
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
            {isExpanded ? <ChevronLeft className="absolute bottom-2 right-4" /> : <ChevronsRight className="absolute bottom-2 right-4" />}
        </aside>
    );
}
