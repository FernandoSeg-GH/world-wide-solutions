'use client';
import React from 'react';
import { Order } from '@/types';

interface RecentOrdersProps {
    orders: Order[];
}

export const RecentOrders: React.FC<RecentOrdersProps> = ({ orders }) => {
    return (
        <div className="mt-8">
            <h2 className="text-lg font-semibold">Recent Orders</h2>
            {/* <Table className="mt-4">
                <TableHead>
                    <TableRow>
                        <TableCell>ID</TableCell>
                        <TableCell>Customer</TableCell>
                        <TableCell>Type</TableCell>
                        <TableCell>Status</TableCell>
                        <TableCell>Date</TableCell>
                        <TableCell>Amount</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {orders.map((order) => (
                        <TableRow key={order.id}>
                            <TableCell>{order.id}</TableCell>
                            <TableCell>
                                {order.customer.name}
                                <br />
                                <span className="text-sm text-gray-500">{order.customer.email}</span>
                            </TableCell>
                            <TableCell>{order.type}</TableCell>
                            <TableCell>
                                <span
                                    className={`px-2 py-1 text-xs rounded ${order.status === 'Fulfilled'
                                        ? 'bg-green-100 text-green-800'
                                        : order.status === 'Declined'
                                            ? 'bg-red-100 text-red-800'
                                            : 'bg-yellow-100 text-yellow-800'
                                        }`}
                                >
                                    {order.status}
                                </span>
                            </TableCell>
                            <TableCell>{order.date}</TableCell>
                            <TableCell>{order.amount}</TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table> */}
        </div>
    );
};
