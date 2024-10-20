import React from "react";
import { FaHome, FaBusinessTime, FaRobot, FaBell } from "react-icons/fa";
import {
  BookText,
  Briefcase,
  DnaIcon,
  NotebookPen,
  Users2,
} from "lucide-react";

export interface SidebarItem {
  icon: React.ElementType;
  label: string;
}

export const getSidebarItems = (
  godMode?: boolean,
  roleId?: number
): SidebarItem[] => {
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
    {
      icon: FaBell,
      label: "Notifications",
    },
  ];

  if (roleId === 3 || roleId === 4) {
    sidebarItems.push({
      icon: Users2,
      label: "Users",
    });
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
