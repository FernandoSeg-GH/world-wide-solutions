import Logo from '@/components/Logo'
import ThemeSwitcher from '@/components/ThemeSwitcher'
import { UserButton } from '@clerk/nextjs'
import React from 'react'

type Props = {
    children: React.ReactNode
}

const Layout = ({ children }: Props) => {
    return (
        <div className='flex flex-col min-h-screen min-wfull bg-background max-h-screen'>
            <nav className='flex justify-between items-center border-b border-border h-[60px] px-4 py-2'>
                <Logo />
                <div className='flex gap-4 items-center'>
                    <ThemeSwitcher />
                    <UserButton />
                </div>
            </nav>
            <main className='flex w-full flex-grow'>
                {children}
            </main>
        </div>
    )
}

export default Layout