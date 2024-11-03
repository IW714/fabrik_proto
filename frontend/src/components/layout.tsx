import AppSideBar from './Sidebar';
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { Outlet } from 'react-router-dom';


export default function Layout() {
  return (
    <SidebarProvider>
       <div className="flex">
        <AppSideBar />

        <div className="flex-1 flex flex-col">
          <header className="flex items-center p-4 rounded-md">
            <SidebarTrigger className="mr-4" />
            <h1 className="text-lg font-semibold">Fabrik</h1>
          </header>

          <main className="flex-1 p-4 overflow-auto">
            <Outlet />
          </main>
        </div>
      </div>
    </SidebarProvider>
  )
}