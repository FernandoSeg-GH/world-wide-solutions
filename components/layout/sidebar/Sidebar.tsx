import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import {
    ChevronLeft,
    ChevronsRight,
    ChevronRight,
    BookText,
    DnaIcon,
    CircleDashed,
    NotebookTabs,
    Users2,
    CaptionsIcon,
    Folders,
    MailCheck,
} from "lucide-react";
import {
    FaHome,
    FaBusinessTime,
    FaRobot,
    FaBell,
} from "react-icons/fa";
import { useAppContext } from "@/context/AppProvider";
import { cn } from "@/lib/utils";
import Logo from "@/components/Logo";
import { Form } from "@/types";
import { useFormState } from "@/hooks/forms/useFormState";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

interface SidebarProps {
    isExpanded: boolean;
    setIsExpanded: (value: boolean) => void;
}

export interface SidebarItem {
    icon: React.ElementType;
    label: string;
    subItems?: SidebarItem[];
}

export const getSidebarItems = (godMode: boolean, forms: Form[], roleId?: number): SidebarItem[] => {
    const sidebarItems: SidebarItem[] = [
        {
            icon: FaHome,
            label: "Dashboard",
        },
        {
            icon: BookText,
            label: "Forms",
            ...(roleId !== 1 && forms?.length > 0 ? {
                subItems: forms.map((form) => ({
                    icon: CircleDashed,
                    label: form.name,
                }))
            } : {}),
        },
        {
            icon: Folders,
            label: "Submissions",
        },
        {
            icon: FaBell,
            label: "Notifications",
        },
        {
            icon: MailCheck,
            label: "Messages",
        },
    ];

    // if (roleId === 1) {
    //     sidebarItems.push(
    //         {
    //             icon: CaptionsIcon,
    //             label: "My Submissions",
    //         }
    //     )
    // }
    if (roleId === 2 || roleId === 3 || roleId === 4) {
        sidebarItems.push(
            {
                icon: NotebookTabs,
                label: "All Forms",
            },
            {
                icon: Users2,
                label: "Users",
            }
        )
    }
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
    const { actions: layoutState, data, selectors } = useAppContext();
    const { switchSection } = layoutState;
    const { currentSection, godMode } = data;
    const { forms, fetchFormsByBusinessId } = useFormState();
    const { data: session } = useSession();
    const { setForm } = selectors;
    const [openSubmenus, setOpenSubmenus] = useState<Set<string>>(new Set());

    useEffect(() => {
        if (session?.user.businessId) {
            fetchFormsByBusinessId(session.user.businessId);
        }
    }, [session?.user.businessId, fetchFormsByBusinessId]);

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
                "fixed inset-y-0 left-0 z-10 flex flex-col border-r bg-background transition-all duration-300",
                isExpanded ? "w-64" : "w-14"
            )}
        >
            <div onClick={(event: React.MouseEvent<HTMLDivElement>) => event.stopPropagation()}>
                {
                    isExpanded ? <Logo url="/assets/vws-hor.png" width={160} className="" /> : <Logo url="/assets/vws.png" width={25} className="" />
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
                                                : "text-muted-foreground",
                                            isExpanded ? "px-3 py-2" : "justify-center py-2"
                                        )}
                                        aria-haspopup={item.subItems ? "true" : undefined}
                                        aria-expanded={item.subItems ? openSubmenus.has(item.label) : undefined}
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
                                                                    switchSection('FormDetail');
                                                                }
                                                            }}
                                                            className={cn(
                                                                "flex items-center rounded-lg transition-colors hover:text-foreground w-full",
                                                                currentSection === subItem.label
                                                                    ? "bg-accent text-accent-foreground"
                                                                    : "text-muted-foreground",
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
export default Sidebar