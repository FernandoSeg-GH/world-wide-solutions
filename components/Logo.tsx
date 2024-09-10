import Link from 'next/link'
import React from 'react'

const Logo = () => {
    return (
        <Link href={"/"} className='font-bold text-3xl hover:cursor-pointer'>
            World Wide Solutions
        </Link>
    )
}

export default Logo