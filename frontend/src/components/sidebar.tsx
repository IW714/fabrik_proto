import {
    Sidebar,
    SidebarContent,
    SidebarGroup,
    SidebarGroupContent,
    SidebarGroupLabel,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
  } from "@/components/ui/sidebar"
import { Home, Search, Settings } from "lucide-react"

const items = [
    { 
        title: "Home",
        url: "#",
        icon: Home,
    },
    { 
        title: "Search", 
        url: "#",
        icon: Search,
    },
    { 
        title: "Settings", 
        url: "#",
        icon: Settings,
    }
]

const AppSidebar = () => {
    return (
        <Sidebar className="w-64 flex-shrink-0 bg-white border-r">
            <SidebarContent>
            <SidebarGroup>
                <SidebarGroupLabel>Fabrik</SidebarGroupLabel>
                <SidebarGroupContent>
                    <SidebarMenu>
                    {items.map((item) => (
                        <SidebarMenuItem key={item.title}>
                        <SidebarMenuButton asChild>
                            <a href={item.url}>
                            <item.icon />
                            <span>{item.title}</span>
                            </a>
                        </SidebarMenuButton>
                        </SidebarMenuItem>
                    ))}
                    </SidebarMenu>
                </SidebarGroupContent>
                </SidebarGroup>
            </SidebarContent>
        </Sidebar>
    )
}

export default AppSidebar