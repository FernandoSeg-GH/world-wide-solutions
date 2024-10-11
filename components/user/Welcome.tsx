"use client"
import { useSession } from 'next-auth/react';
import React from 'react'
import Spinner from '../ui/spinner';

type Props = {}

function Welcome({ }: Props) {

    const { data: session, status } = useSession();

    if (status === "loading") return <Spinner />;

    if (!session) return <div>You are not logged in</div>;

    return (
        <div className='my-6 w-full border-b pb-2'>
            {status === "authenticated" && session.user && (
                <div>
                    <h1 className="text-2xl font-bold">
                        Welcome <span className="capitalize">{session.user.username}</span>!
                    </h1>
                    <p className='text-xl leading-7'>This is your personal dashboard. You may follow up and check on the submitted infromation for your current case.</p>
                </div>
            )}
            {status !== "authenticated" && (
                <h1 className="text-2xl font-bold">Please sign in to continue.</h1>
            )}
        </div>
    )
}

export default Welcome