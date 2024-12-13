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
import ThemeSwitcher from "@/components/ThemeSwitcher"
import UserMenu from "@/components/users/UserMenu"
import { useAppContext } from "@/context/AppProvider"
import { cn } from "@/lib/utils"

// interface Breadcrumb {
//     label: string
//     href?: string
// }

interface HeaderProps {
    // breadcrumbs?: Breadcrumb[]
    currentSection: string
    submit?: boolean
    isExpanded: boolean
}

export function Header({ currentSection, isExpanded }: HeaderProps) {
    // const { data: session } = useSession();
    const { data } = useAppContext();
    const { godMode } = data;
    // const { fetchForms } = actions;

    // useEffect(() => {
    //     if (session?.user?.businessId) {
    //         fetchForms(session.user.businessId);
    //     }
    // }, [session, fetchForms]);
    return (
        <header className="fixed top-0 right-0 z-10 flex h-14 items-center gap-4 bg-lightBlue-foreground dark:bg-card-dark shadow-md px-4 w-full">
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
            <h2 className="font-bold text-2xl sr-only hidden">{currentSection}</h2>
            <div className="relative ml-auto flex-1 md:grow-0">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                    type="search"
                    placeholder="Search..."
                    className="w-full rounded-lg bg-background pl-8 md:w-[200px] lg:w-[336px]"
                />
            </div>
            {godMode && (
                <div
                    className={cn(
                        godMode && "bg-gradient-to-r from-yellow-400 via-yellow-500 to-orange-400 rounded-full p-1 shadow-lg border-yellow-300 border-2"
                    )}
                    style={{
                        backgroundImage: "linear-gradient(135deg, #FFD700 25%, #FFA500 50%, #FFFACD 75%)",
                        boxShadow: "0px 4px 6px rgba(255, 165, 0, 0.4), inset 0px 2px 4px rgba(255, 255, 255, 0.3)"
                    }}
                >
                    <Zap width={18} height={18} className="text-yellow-800" />
                </div>
            )}

            <div className="flex gap-4 items-center">
                {/* <ThemeSwitcher /> */}
                <UserMenu />

            </div>
        </header>
    )
}