"use client"
import React from 'react'
import { useRouter } from 'next/navigation'

type Props = {
    title: string | React.ReactNode
    subtitle?: string | React.ReactNode
    buttons?: React.ReactNode
}

function SectionHeader({ title, subtitle, buttons }: Props) {
    const router = useRouter()


    return (
        <div className='flex items-center justify-between w-full text-black dark:text-white'>
            <div className='w-full'>
                <h1 className="text-2xl font-bold">
                    {title}
                </h1>
                <p className='text-lg 2xl:text-xl leading-7'>{subtitle}</p>
            </div>
            {buttons}
        </div>
    )
}

export default SectionHeader