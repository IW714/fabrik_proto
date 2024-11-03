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
import { Home, FileImage } from "lucide-react"
import { Link } from "react-router-dom"

const items = [
    { 
        title: "Home",
        url: "/home",
        icon: Home,
    },
    { 
        title: "Saved Images", 
        url: "/home/saved",
        icon: FileImage,
    },
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
                            <Link to={item.url} className="flex items-center space-x-2">
                                <item.icon />
                                <span>{item.title}</span>
                            </Link>
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