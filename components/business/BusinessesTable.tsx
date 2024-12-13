'use client';

import React, { useEffect, useState } from 'react';
import { useAppContext } from '@/context/AppProvider';
import { useRouter } from 'next/navigation';
import { Business } from '@/types';
import { Button } from '@/components/ui/button';
import Spinner from '../ui/spinner';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { FaLinkedin, FaInstagram, FaFacebook, FaTwitter, FaYoutube, FaTiktok } from 'react-icons/fa';
import { AlertDialog, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '../ui/alert-dialog';
import EditBusinessForm from './EditBusinessForm';

export default function BusinessesTable() {
    const { data, actions } = useAppContext();
    const { businesses, loading, godMode } = data;
    const { getAllBusinesses, deleteBusiness } = actions;
    const [selectedBusinessId, setSelectedBusinessId] = useState<number | null>(null);

    const router = useRouter();

    // useEffect(() => {
    //     getAllBusinesses();
    //     // eslint-disable-next-line react-hooks/exhaustive-deps
    // }, []);

    const handleEdit = (businessId: number) => {
        router.push(`/edit-business?businessId=${businessId}`);
    };

    const handleDelete = async (businessId: number) => {
        const confirmed = confirm("Are you sure you want to delete this business? This action cannot be undone.");
        // if (confirmed) {
        //     const success = await deleteBusiness(businessId);
        //     if (success) {
        //         getAllBusinesses();
        //     }
        // }
    };

    if (!godMode) {
        return null;
    }

    if (loading) {
        return <div className="flex items-center justify-center w-screen h-screen">
            <Spinner />
        </div>;;
    }

    return (
        <div className="p-4 rounded-lg shadow">
            <h2 className="text-xl font-bold mb-4">Businesses</h2>
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>ID</TableHead>
                        <TableHead>Name</TableHead>
                        <TableHead>Domain</TableHead>
                        <TableHead className='text-center whitespace-nowrap'>Subscription</TableHead>
                        <TableHead className='text-center'>Phone</TableHead>
                        <TableHead className='text-center'>Email</TableHead>
                        <TableHead className='text-left'>Description</TableHead>
                        <TableHead className='text-center'>Social Links</TableHead>
                        <TableHead className='text-center'>Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {businesses.map((business: Business) => (
                        <TableRow key={business.id}>
                            <TableCell className="text-center whitespace-nowrap">{business.id}</TableCell>
                            <TableCell className="whitespace-nowrap">{business.name}</TableCell>
                            <TableCell className="whitespace-nowrap">{business.domain}</TableCell>
                            <TableCell className="whitespace-nowrap text-center">{business.subscriptionPlanName}</TableCell>
                            <TableCell className="whitespace-nowrap">{business.phone}</TableCell>
                            <TableCell className="whitespace-nowrap text-center">{business.businessEmail}</TableCell>
                            <TableCell className="whitespace-nowrap max-w-[320px] truncate">{business.description}</TableCell>
                            <TableCell className="whitespace-nowrap">
                                <div className="flex space-x-2">
                                    <TooltipProvider>
                                        {business.url_linkedin && (
                                            <Tooltip>
                                                <TooltipTrigger asChild>
                                                    <a href={business.url_linkedin} target="_blank" rel="noopener noreferrer">
                                                        <FaLinkedin className="text-blue-500 hover:text-blue-700" size={18} />
                                                    </a>
                                                </TooltipTrigger>
                                                <TooltipContent>LinkedIn</TooltipContent>
                                            </Tooltip>
                                        )}
                                        {business.url_instagram && (
                                            <Tooltip>
                                                <TooltipTrigger asChild>
                                                    <a href={business.url_instagram} target="_blank" rel="noopener noreferrer">
                                                        <FaInstagram className="text-pink-500 hover:text-pink-700" size={18} />
                                                    </a>
                                                </TooltipTrigger>
                                                <TooltipContent>Instagram</TooltipContent>
                                            </Tooltip>
                                        )}
                                        {business.url_facebook && (
                                            <Tooltip>
                                                <TooltipTrigger asChild>
                                                    <a href={business.url_facebook} target="_blank" rel="noopener noreferrer">
                                                        <FaFacebook className="text-blue-700 hover:text-blue-900" size={18} />
                                                    </a>
                                                </TooltipTrigger>
                                                <TooltipContent>Facebook</TooltipContent>
                                            </Tooltip>
                                        )}
                                        {business.url_twitter && (
                                            <Tooltip>
                                                <TooltipTrigger asChild>
                                                    <a href={business.url_twitter} target="_blank" rel="noopener noreferrer">
                                                        <FaTwitter className="text-blue-400 hover:text-blue-600" size={18} />
                                                    </a>
                                                </TooltipTrigger>
                                                <TooltipContent>X</TooltipContent>
                                            </Tooltip>
                                        )}
                                        {business.url_tiktok && (
                                            <Tooltip>
                                                <TooltipTrigger asChild>
                                                    <a href={business.url_tiktok} target="_blank" rel="noopener noreferrer">
                                                        <FaTiktok className="text-black hover:text-gray-700" size={18} />
                                                    </a>
                                                </TooltipTrigger>
                                                <TooltipContent>TikTok</TooltipContent>
                                            </Tooltip>
                                        )}
                                        {business.url_youtube && (
                                            <Tooltip>
                                                <TooltipTrigger asChild>
                                                    <a href={business.url_youtube} target="_blank" rel="noopener noreferrer">
                                                        <FaYoutube className="text-red-500 hover:text-red-700" size={18} />
                                                    </a>
                                                </TooltipTrigger>
                                                <TooltipContent>YouTube</TooltipContent>
                                            </Tooltip>
                                        )}
                                    </TooltipProvider>
                                </div>
                            </TableCell>
                            <TableCell className="whitespace-nowrap">
                                <div className="flex space-x-2">
                                    <AlertDialog>
                                        <AlertDialogTrigger asChild>
                                            <Button size="sm" onClick={() => setSelectedBusinessId(business.id)}>
                                                Edit
                                            </Button>
                                        </AlertDialogTrigger>
                                        <AlertDialogContent>
                                            <AlertDialogHeader>
                                                <AlertDialogTitle>Edit Business</AlertDialogTitle>
                                                <AlertDialogDescription>
                                                    Make changes to the business information below.
                                                </AlertDialogDescription>
                                            </AlertDialogHeader>
                                            <EditBusinessForm businessId={selectedBusinessId} />
                                            <AlertDialogFooter>
                                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                            </AlertDialogFooter>
                                        </AlertDialogContent>
                                    </AlertDialog>
                                    <Button size="sm" variant="destructive" onClick={() => handleDelete(business.id)}>Delete</Button>
                                </div>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    );
}
