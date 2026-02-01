
import { Sidebar } from '@/components/layout/Sidebar';
import { Header } from '@/components/layout/Header';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen bg-background overflow-hidden font-sans">
      <Sidebar />
      
      <div className="flex-1 flex flex-col lg:pl-64 transition-all duration-300">
        <Header />
        
        <main className="flex-1 overflow-y-auto p-6 lg:p-8 bg-muted/20">
          <div className="max-w-7xl mx-auto space-y-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
