'use client';

import { useEffect, useState } from 'react';
import Spinner from './ui/spinner';

interface User {
    id: number;
    username: string;
    email: string;
    lastLoginAt: string;
    isActive: boolean;
}

const UsersList = () => {
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const response = await fetch('/api/users', {
                    method: 'GET',
                });

                if (!response.ok) {
                    throw new Error('Failed to fetch users');
                }

                const data = await response.json();
                setUsers(data);
            } catch (err: any) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchUsers();
    }, []);

    if (loading) return <div className="flex items-center justify-center w-screen h-screen">
        <Spinner />
    </div>;;
    if (error) return <div>Error: {error}</div>;

    return (
        <div>
            <h2>Users List</h2>
            <ul>
                {users.map((user) => (
                    <li key={user.id}>
                        <p>Username: {user.username}</p>
                        <p>Email: {user.email}</p>
                        <p>Last Login: {new Date(user.lastLoginAt).toLocaleString()}</p>
                        <p>Status: {user.isActive ? 'Active' : 'Inactive'}</p>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default UsersList;
