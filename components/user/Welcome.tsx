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
        <div className='w-full px-4'>
            {status === "authenticated" && session.user && (
                <div>
                    <h1 className="text-2xl font-bold">
                        Welcome <span className="capitalize">{session.user.username}</span>!
                    </h1>
                    <p className='text-lg 2xl:text-xl leading-7'>This is your personal dashboard. Follow up and check on your activity.</p>
                </div>
            )}
            {status !== "authenticated" && (
                <h1 className="text-2xl font-bold">Please sign in to continue.</h1>
            )}
        </div>
    )
}

export default Welcome