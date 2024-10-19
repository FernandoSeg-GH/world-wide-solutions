import React from 'react'

type Props = {
    title: string | React.ReactNode
    subtitle?: string | React.ReactNode
}

function SectionHeader({ title, subtitle }: Props) {


    return (
        <div className='w-full'>
            <div>
                <h1 className="text-2xl font-bold">
                    {title}
                </h1>
                <p className='text-lg 2xl:text-xl leading-7'>{subtitle}</p>
            </div>
        </div>
    )
}

export default SectionHeader