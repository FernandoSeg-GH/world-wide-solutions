"use client"
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import React, { useEffect } from 'react'

type Props = {}

function Home({ }: Props) {
    const { data: session, status } = useSession();
    const router = useRouter()
    useEffect(() => {
        if (session) {
            router.push("/dashboard")
        } else router.push("/sign-in")
    }, [session])
    return (
        <div>Home</div>
    )
}

export default Home