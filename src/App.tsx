import { useEffect } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Route, Switch, Router as WouterRouter } from 'wouter';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';

import Home from '@/pages/home';
import AddTasting from '@/pages/add-tasting';
import TastingDetail from '@/pages/tasting-detail';
import Coach from '@/pages/coach';
import Stats from '@/pages/stats';
import Books from '@/pages/books';
import Profile from '@/pages/profile';
import Settings from '@/pages/settings';
import Install from '@/pages/install';
import Welcome from '@/pages/welcome';
import ShareApp from '@/pages/share';
import Backup from '@/pages/backup';
import NotFound from '@/pages/not-found';
import { BottomNav } from '@/components/BottomNav';

const queryClient = new QueryClient();

function App() {
  useEffect(() => {
    document.documentElement.classList.add('dark');
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, '')}>
          <div className="min-h-[100dvh] bg-black text-foreground flex justify-center">
            <div className="iphone-shell w-full max-w-[430px] relative min-h-[100dvh] bg-background overflow-x-hidden sm:border-x sm:border-white/[0.04] sm:shadow-[0_0_80px_rgba(0,0,0,0.8)]">
              <Switch>
                <Route path="/" component={Home} />
                <Route path="/add" component={AddTasting} />
                <Route path="/tasting/:id" component={TastingDetail} />
                <Route path="/coach/:id" component={Coach} />
                <Route path="/stats" component={Stats} />
                <Route path="/books" component={Books} />
                <Route path="/profile" component={Profile} />
                <Route path="/settings" component={Settings} />
                <Route path="/install" component={Install} />
                <Route path="/welcome" component={Welcome} />
                <Route path="/share" component={ShareApp} />
                <Route path="/backup" component={Backup} />
                <Route component={NotFound} />
              </Switch>
              <BottomNav />
            </div>
          </div>
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
