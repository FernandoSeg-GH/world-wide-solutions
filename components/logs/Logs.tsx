import React, { useState, useEffect } from 'react';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2 } from "lucide-react";
import SectionHeader from "@/components/layout/navbar/SectionHeader";
import { cn } from '@/lib/utils';

interface Log {
    id: number;
    log_type: string;
    comment: string;
    is_read: boolean;
    created_at: string;
    read_at: string | null;
}

const Logs: React.FC = () => {
    const [logs, setLogs] = useState<Log[]>([]);
    const [loading, setLoading] = useState<boolean>(true);

    const fetchLogs = async () => {
        setLoading(true);
        try {
            const response = await fetch('/api/logs');
            const data = await response.json();
            setLogs(data.logs);
        } catch (error) {
            console.error('Error fetching logs:', error);
        } finally {
            setLoading(false);
        }
    };

    const markAsRead = async (logId: number) => {
        try {
            const response = await fetch(`/api/logs/${logId}/mark-read`, {
                method: 'PATCH'
            });
            if (response.ok) {
                setLogs((prevLogs) =>
                    prevLogs.map((log) =>
                        log.id === logId ? { ...log, is_read: true, read_at: new Date().toISOString() } : log
                    )
                );
            } else {
                console.error('Error marking log as read:', response.statusText);
            }
        } catch (error) {
            console.error('Error marking log as read:', error);
        }
    };

    useEffect(() => {
        fetchLogs();
    }, []);

    return (
        <div className="w-full bg-white dark:bg-gray-800 p-6 rounded shadow-md">
            <SectionHeader title="Logs" subtitle="View the latest activities." />
            {loading ? (
                <div className="flex items-center justify-center h-20">Loading...</div>
            ) : (
                <Table className="w-full text-sm  rounded-lg">
                    <TableHeader>
                        <TableRow>
                            <TableHead className="w-1/6 text-center">Type</TableHead>
                            <TableHead className="w-1/3 text-left">Comment</TableHead>
                            <TableHead className="w-1/6 text-center">Created At</TableHead>
                            <TableHead className="w-1/6 text-center">Status</TableHead>
                            <TableHead className="w-1/6 text-center">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {logs.map((log) => (
                            <TableRow key={log.id} className="bg-white hover:bg-gray-100 dark:hover:bg-gray-700">
                                <TableCell className="text-center font-medium">
                                    <span className={cn(
                                        'px-3 py-1 rounded-full cursor-default mx-auto',
                                        log.log_type === 'new_user' && 'bg-blue-100 text-navyBlue',
                                        log.log_type === 'new_submission' && 'bg-green-100 text-green-600',
                                        log.log_type === 'submission_updated' && 'bg-yellow-100 text-yellow-600'
                                    )}>

                                        {
                                            log.log_type === 'new_user' ? 'New User' :
                                                log.log_type === 'new_submission' ? 'New Submission' :
                                                    log.log_type === 'submission_updated' ? 'Submission Update' :
                                                        'Unknown'
                                        }
                                    </span>
                                </TableCell>
                                <TableCell className="text-left text-gray-600 dark:text-gray-300">{log.comment}</TableCell>
                                <TableCell className="text-center text-gray-500 dark:text-gray-400">
                                    {new Date(log.created_at).toLocaleString()}
                                </TableCell>
                                <TableCell className="text-center flex items-center justify-center">
                                    {log.is_read ? (
                                        <Badge
                                            variant="outline"
                                            className="flex items-center justify-center gap-1 px-2 py-1 w-20 bg-green-50 dark:bg-green-900 text-green-600 dark:text-green-300 border-green-200 dark:border-green-800"
                                        >
                                            <CheckCircle2 className="w-4 h-4" />
                                            Read
                                        </Badge>
                                    ) : (
                                        <Badge
                                            variant="secondary"
                                            className="flex items-center justify-center gap-1 px-2 py-1 w-20 bg-red-50 dark:bg-red-900 text-red-600 dark:text-red-300 border-red-200 dark:border-red-800"
                                        >
                                            Unread
                                        </Badge>
                                    )}
                                </TableCell>
                                <TableCell className="text-center">
                                    {!log.is_read && (
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            className="px-4 py-1 border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300"
                                            onClick={() => markAsRead(log.id)}
                                        >
                                            Mark as Read
                                        </Button>
                                    )}
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            )}
        </div>
    );
};

export default Logs;
