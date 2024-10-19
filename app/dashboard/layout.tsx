import { Sidebar } from '@/components/layout/Sidebar'
import AppSidebar from '@/components/layout/sidebar/AppSidebar'
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar'
import React from 'react'

type Props = {
    children: React.ReactNode
}

const DashboardLayout = ({ children }: Props) => {
    return (
        <SidebarProvider>
            <SidebarInset>
                <main>{children}</main>
            </SidebarInset>
        </SidebarProvider>

    )
}

export default DashboardLayout