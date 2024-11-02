// "use client";

// import React, { useEffect } from "react";
// import {
//     Sidebar,
//     SidebarContent,
//     SidebarGroup,
//     SidebarGroupLabel,
//     SidebarMenu,
//     SidebarMenuItem,
//     SidebarMenuButton,
//     SidebarSeparator,
//     SidebarHeader,
//     SidebarFooter,
//     SidebarTrigger,
// } from "@/components/ui/sidebar";
// import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
// import { getSidebarItems, SidebarItem } from "./SidebarItems";
// import { Menu as MenuIcon } from "lucide-react";
// import { cn } from "@/lib/utils";
// import { useAppContext } from "@/context/AppProvider";
// import Logo from "@/components/Logo";
// import Image from "next/image";
// import { useLayout } from "@/hooks/layout/useLayout";
// import { useFormState } from "@/hooks/forms/useFormState";
// import { useSession } from "next-auth/react";

// interface AppSidebarProps { }

// export function AppSidebar({ }: AppSidebarProps) {
//     const { actions, data } = useAppContext();
//     const { switchSection } = actions
//     const { currentSection, godMode, isExpanded, forms } = data;
//     const sidebarItems: SidebarItem[] = getSidebarItems(godMode);
//     const { data: session } = useSession()
//     const { fetchAllForms, fetchFormsByBusinessId } = useFormState()

//     return (
//         <Sidebar collapsible="icon">
//             <SidebarHeader>
//                 <div className="flex items-center justify-between px-4 py-2">
//                     <Image
//                         width={50}
//                         height={50}
//                         // blurData={blurData}
//                         src={`/assets/vws.png`}
//                         alt={"Vinci"}
//                         priority
//                         sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 30vw"
//                         className="object-cover rounded-t-xl"
//                     />
//                     <SidebarTrigger />
//                 </div>
//             </SidebarHeader>
//             <SidebarContent>
//                 <SidebarGroup>
//                     <SidebarGroupLabel>Application</SidebarGroupLabel>
//                     <SidebarMenu>
//                         <TooltipProvider>
//                             {sidebarItems.map((item) => (
//                                 <Tooltip key={item.label}>
//                                     <TooltipTrigger asChild>
//                                         <SidebarMenuItem>
//                                             <SidebarMenuButton
//                                                 asChild
//                                                 isActive={currentSection === item.label}
//                                                 onClick={() => switchSection(item.label)}
//                                             >
//                                                 <a className={cn("flex items-center w-full")}>
//                                                     <item.icon className="h-5 w-5" />
//                                                     <span className="ml-3">{item.label}</span>
//                                                 </a>
//                                             </SidebarMenuButton>
//                                         </SidebarMenuItem>
//                                     </TooltipTrigger>
//                                     {!isExpanded && (
//                                         <TooltipContent side="right">{item.label}</TooltipContent>
//                                     )}
//                                 </Tooltip>
//                             ))}
//                         </TooltipProvider>
//                     </SidebarMenu>
//                 </SidebarGroup>
//             </SidebarContent>
//             <SidebarFooter className="p-4">
//                 <p>Welcome <span className="capitalize">{session?.user.name}</span></p>
//             </SidebarFooter>
//         </Sidebar>
//     );
// }

// export default AppSidebar;
import React from 'react'

type Props = {}

const AppSidebar = (props: Props) => {
    return (
        <div>AppSidebar</div>
    )
}

export default AppSidebar