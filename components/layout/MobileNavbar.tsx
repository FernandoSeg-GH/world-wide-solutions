"use client";
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Menu } from "lucide-react";
import { useAppContext } from "@/context/AppProvider";
import { cn } from "@/lib/utils";
import Logo from "../Logo";
import {
    FaHome,
    FaBusinessTime,
    FaRobot,
    FaBell,
} from "react-icons/fa";
import { BookText, DnaIcon, NotebookPen } from "lucide-react";

export interface NavbarItem {
    icon: React.ElementType;
    label: string;
}

export const getNavbarItems = (godMode: boolean): NavbarItem[] => {
    const navbarItems: NavbarItem[] = [
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
        navbarItems.push(
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

    return navbarItems;
};

export function MobileNavbar() {
    const { actions: layoutState, data } = useAppContext();
    const { switchSection } = layoutState;
    const { currentSection, godMode } = data;
    const navbarItems = getNavbarItems(godMode);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    const handleMenuToggle = () => {
        setMobileMenuOpen(!mobileMenuOpen);
    };

    return (
        <div>
            {/* Mobile Header */}
            <header className="fixed top-0 left-0 right-0 z-20 flex items-center justify-between bg-background p-4 shadow-md">
                <Logo />
                <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-10"
                    onClick={handleMenuToggle}
                >
                    <Menu className="h-6 w-6" />
                </Button>
            </header>

            {/* Overlay */}
            {mobileMenuOpen && (
                <div
                    className="fixed inset-0 z-10 bg-black opacity-50"
                    onClick={() => setMobileMenuOpen(false)}
                ></div>
            )}

            {/* Mobile Navbar */}
            <nav
                className={cn(
                    "fixed top-0 left-0 z-30 h-full w-64 bg-background transition-transform duration-300",
                    mobileMenuOpen ? "translate-x-0" : "-translate-x-full"
                )}
            >
                <div className="flex items-center justify-between px-4 py-4" onClick={handleMenuToggle}>
                    <Logo />
                </div>
                <div className="flex flex-col gap-2 px-2 py-4">
                    {navbarItems.map((item) => (
                        <button
                            key={item.label}
                            onClick={() => {
                                switchSection(item.label);
                                setMobileMenuOpen(false);
                            }}
                            className={cn(
                                "flex items-center rounded-lg px-3 py-2 transition-colors hover:text-foreground",
                                currentSection === item.label
                                    ? "bg-accent text-accent-foreground"
                                    : "text-muted-foreground"
                            )}
                        >
                            {item.icon &&
                                React.createElement(item.icon, {
                                    className: "h-6 w-6",
                                })}
                            <span className="ml-4">{item.label}</span>
                        </button>
                    ))}
                </div>
            </nav>
        </div>
    );
}
