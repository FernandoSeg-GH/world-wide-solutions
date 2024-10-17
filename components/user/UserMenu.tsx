"use client"

import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { HomeIcon, PlusIcon } from "@radix-ui/react-icons"
import { signIn, signOut, useSession } from "next-auth/react"
import { BiUserCircle } from "react-icons/bi"
import { HiDocument } from "react-icons/hi"
import { MdClose } from "react-icons/md"
import { Skeleton } from "../ui/skeleton"
import { useRouter } from "next/navigation"
import { useAppContext } from "../../context/AppProvider"
import { cn } from "@/lib/utils"

export default function UserMenu() {

    const { data: session, status } = useSession();
    const router = useRouter()
    if (status === "loading") return <Skeleton className="w-24 h-10" />

    if (!session) return <Button className="bg-black/70 hover:bg-black dark:bg-gray-300 dark:hover:bg-gray-100" onClick={() => router.push("/auth/sign-in")}>Sign In</Button>;

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                    <Avatar className="h-8 w-8">
                        <AvatarFallback>
                            <BiUserCircle className="h-6 w-6" />
                        </AvatarFallback>
                    </Avatar>
                </Button>
            </DropdownMenuTrigger>
            {session ? <DropdownMenuContent className="w-56" align="end" forceMount>
                <h2 className="border-b mb-1 p-2 text-sm">
                    Welcome <span className="capitalize">{session.user.username}</span>!
                </h2>
                <DropdownMenuItem>
                    <a href="/dashboard" className="flex w-full items-center">
                        <HomeIcon className="mr-2" />Dashboard
                    </a>
                </DropdownMenuItem>
                <DropdownMenuItem>
                    <a href="#" className="flex w-full items-center">
                        <PlusIcon className="mr-2" /> Create Form
                    </a>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                    <Button variant="ghost" className="flex w-full justify-start p-1 items-center hover:bg-red-50" onClick={() => signOut({ callbackUrl: 'https://world-wide-solutions.vercel.app/auth/sign-in' })}>
                        <MdClose className="mr-2" /> Logout
                    </Button>
                </DropdownMenuItem>
            </DropdownMenuContent>
                : null}
        </DropdownMenu>
    )
}