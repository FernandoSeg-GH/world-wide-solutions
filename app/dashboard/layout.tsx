import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar'
import React from 'react'

type Props = {
    children: React.ReactNode
}

const DashboardLayout = ({ children }: Props) => {
    return (
        <SidebarProvider>
            <SidebarInset>
                <main className='h-full'>{children}</main>
            </SidebarInset>
        </SidebarProvider>

    )
}

export default DashboardLayout