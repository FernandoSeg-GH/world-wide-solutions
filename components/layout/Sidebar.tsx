import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Menu, Package2 } from "lucide-react"
import { cn } from "@/lib/utils"

interface SidebarItem {
    icon: React.ElementType
    label: string
    href: string
    isActive: boolean
}

interface SidebarProps {
    isExpanded: boolean
    setIsExpanded: (value: boolean) => void
    sidebarItems: SidebarItem[]
}

export function Sidebar({ isExpanded, setIsExpanded, sidebarItems }: SidebarProps) {
    return (
        <aside
            className={`fixed inset-y-0 left-0 z-10 flex flex-col border-r bg-background transition-all duration-300 ${isExpanded ? "w-64" : "w-14"
                }`}
        >
            <div className="flex h-14 items-center justify-between px-2">
                {isExpanded &&
                    <Link
                        href="#"
                        className={cn(
                            'flex items-center gap-2 font-semibold transition-all duration-300 ease-in-out',
                            isExpanded ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-4 pointer-events-none'
                        )}
                    >
                        <Package2 className="h-6 w-6" />
                        <h1
                            className={
                                cn("whitespace-nowrap",
                                    isExpanded ? 'block opacity-100 translate-x-0' :
                                        'hidden opacity-0 -translate-x-4 pointer-events-none')}
                        >
                            Vinci Suite

                        </h1>
                    </Link>
                }
                <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => setIsExpanded(!isExpanded)}
                >
                    <Menu className="h-4 w-4" />
                    <span className="sr-only">Toggle sidebar</span>
                </Button>
            </div>
            <nav className="flex flex-col gap-4 px-2 py-4">
                <TooltipProvider>
                    {sidebarItems.map((item) => (
                        <Tooltip key={item.label}>
                            <TooltipTrigger asChild>
                                <Link
                                    href={item.href}
                                    className={`flex h-9 items-center rounded-lg ${item.isActive ? "bg-accent text-accent-foreground" : "text-muted-foreground"
                                        } transition-colors hover:text-foreground ${isExpanded ? "px-3" : "justify-center"
                                        }`}
                                >
                                    {item.icon && <item.icon className="h-5 w-5" />}
                                    {isExpanded && <span className="ml-2">{item.label}</span>}
                                </Link>
                            </TooltipTrigger>
                            <TooltipContent side="right">{item.label}</TooltipContent>
                        </Tooltip>
                    ))}
                </TooltipProvider>
            </nav>
        </aside>
    )
}