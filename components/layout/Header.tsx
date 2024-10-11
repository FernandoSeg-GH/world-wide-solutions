"use client"
import { Search, Zap } from "lucide-react"
import { Input } from "@/components/ui/input"
// import {
//     Breadcrumb,
//     BreadcrumbItem,
//     BreadcrumbLink,
//     BreadcrumbList,
//     BreadcrumbPage,
//     BreadcrumbSeparator,
// } from "@/components/ui/breadcrumb"
import ThemeSwitcher from "../ThemeSwitcher"
import UserMenu from "../user/UserMenu"
import { useSession } from "next-auth/react"
import { useAppContext } from "../context/AppContext"
import { cn } from "@/lib/utils"

// interface Breadcrumb {
//     label: string
//     href?: string
// }

interface HeaderProps {
    // breadcrumbs?: Breadcrumb[]
}

export function Header({ }: HeaderProps) {
    // const { data: session } = useSession();
    const { data, actions } = useAppContext();
    const { godMode, form, submissions, loading: formLoading, loading, forms } = data;
    // const { fetchForms } = actions;

    // useEffect(() => {
    //     if (session?.user?.businessId) {
    //         fetchForms(session.user.businessId);
    //     }
    // }, [session, fetchForms]);
    return (
        <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-background px-4 sm:static sm:h-auto sm:border-0 sm:bg-transparent sm:px-6">
            {/* {breadcrumbs &&
                <Breadcrumb className="hidden md:flex">
                    <BreadcrumbList>
                        {breadcrumbs.map((crumb, index) => (
                            <BreadcrumbItem key={index}>
                                {index === breadcrumbs.length - 1 ? (
                                    <BreadcrumbPage>{crumb.label}</BreadcrumbPage>
                                ) : (
                                    <div>
                                        <BreadcrumbLink asChild>
                                            <Link href={crumb.href || "#"}>{crumb.label}</Link>
                                        </BreadcrumbLink>
                                        <BreadcrumbSeparator />
                                    </div>
                                )}
                            </BreadcrumbItem>
                        ))}
                    </BreadcrumbList>
                </Breadcrumb>
            } */}
            <div className="relative ml-auto flex-1 md:grow-0">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                    type="search"
                    placeholder="Search..."
                    className="w-full rounded-lg bg-background pl-8 md:w-[200px] lg:w-[336px]"
                />
            </div>
            {godMode && <div className={cn(godMode && "bg-yellow-400 rounded-full p-1 shadow-2xl")}><Zap width={22} height={22} /></div>}
            <div className="flex gap-4 items-center">
                <ThemeSwitcher />
                <UserMenu />

            </div>
        </header>
    )
}