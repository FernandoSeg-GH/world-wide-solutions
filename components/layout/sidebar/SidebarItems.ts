import { FaHome, FaBusinessTime, FaRobot } from "react-icons/fa";
import {
  BookText,
  CircleDashed,
  Folders,
  MailCheck,
  NotebookTabs,
  Users2,
  DnaIcon,
  Logs,
} from "lucide-react";
import { Form } from "@/types";

export interface SidebarItem {
  icon: React.ElementType;
  label: string;
  subItems?: SidebarItem[];
}

export const getSidebarItems = (
  godMode: boolean,
  forms: Form[],
  roleId?: number
): SidebarItem[] => {
  const commonItems: SidebarItem[] = [
    {
      icon: FaHome,
      label: "Dashboard",
    },
    {
      icon: BookText,
      label: "Claim Reports",
    },
    // {
    //   icon: BookText,
    //   label: "Forms",
    //   ...(roleId !== 1 && forms?.length > 0
    //     ? {
    //         subItems: forms.map((form) => ({
    //           icon: CircleDashed,
    //           label: form.name,
    //         })),
    //       }
    //     : {}),
    // },

    // {
    //   icon: Folders,
    //   label: "Submissions",
    // },
    {
      icon: MailCheck,
      label: "Messages",
    },
  ];

  // Role-specific sidebar items
  const roleItems: { [key: number]: SidebarItem[] } = {
    // 1: [
    //   // Specific items for user role 1
    //   {
    //     icon: Folders,
    //     label: "My Submissions",
    //   },
    // ],
    2: [
      // Specific items for user roles 2 & 3
      {
        icon: NotebookTabs,
        label: "All Forms",
      },
      {
        icon: Users2,
        label: "Users",
      },
    ],
    3: [
      // Role 3 (same as role 2 in this case)
      // {
      //   icon: NotebookTabs,
      //   label: "All Forms",
      // },
      // {
      //   icon: BookText,
      //   label: "Forms",
      //   ...(roleId !== 1 && forms?.length > 0
      //     ? {
      //         subItems: forms.map((form) => ({
      //           icon: CircleDashed,
      //           label: form.name,
      //         })),
      //       }
      //     : {}),
      // },
      {
        icon: Logs,
        label: "Logs",
      },
      {
        icon: Users2,
        label: "Users",
      },
    ],
    4: [
      {
        icon: NotebookTabs,
        label: "All Forms",
      },
      {
        icon: Users2,
        label: "Users",
      },
      {
        icon: BookText,
        label: "Forms",
        ...(roleId !== 1 && forms?.length > 0
          ? {
              subItems: forms.map((form) => ({
                icon: CircleDashed,
                label: form.name,
              })),
            }
          : {}),
      },
    ],
  };

  const godModeItems: SidebarItem[] = [
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
    },
  ];

  return [
    ...commonItems,
    ...(roleId ? roleItems[roleId] || [] : []),
    ...(godMode ? godModeItems : []),
  ];
};
