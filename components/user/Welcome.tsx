"use client"
import { useSession } from 'next-auth/react';
import React from 'react'

type Props = {}

function Welcome({ }: Props) {

    const { data: session, status } = useSession();

    if (status === "loading") return <div>Loading...</div>;

    if (!session) return <div>You are not logged in</div>;
    return (
        <div> {status === "authenticated" && session.user && (
            <h1 className="text-2xl font-bold mb-4">
                Welcome <span className="capitalize">{session.user.username}</span>!
            </h1>
        )}
            {/* If not authenticated, prompt to sign in */}
            {status !== "authenticated" && (
                <h1 className="text-2xl font-bold mb-4">Please sign in to continue.</h1>
            )}</div>
    )
}

export default Welcome