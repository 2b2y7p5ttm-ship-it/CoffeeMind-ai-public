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
import Account from '@/pages/account';
import Admin from '@/pages/admin';
import NotFound from '@/pages/not-found';
import { BottomNav } from '@/components/BottomNav';
import { AuthProvider } from '@/contexts/AuthContext';
import { CloudSyncBridge } from '@/components/CloudSyncBridge';
import { ThemeProvider } from '@/contexts/ThemeContext';
import { PageTransition } from '@/components/PageTransition';
import { LanguageProvider } from '@/contexts/LanguageContext';

const queryClient = new QueryClient();

function App() {
  return (
    <LanguageProvider>
    <ThemeProvider>
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
      <TooltipProvider>
        <CloudSyncBridge />
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, '')}>
          <div className="min-h-[100dvh] bg-[hsl(var(--app-canvas))] text-foreground flex justify-center transition-colors duration-500">
            <div className="iphone-shell w-full max-w-[430px] relative min-h-[100dvh] bg-background sm:border-x sm:border-white/[0.04] sm:shadow-[0_0_80px_rgba(0,0,0,0.8)]">
              <PageTransition>
              <Switch>
                <Route path="/" component={Home} />
                <Route path="/add" component={AddTasting} />
                <Route path="/tasting/:id/edit" component={AddTasting} />
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
                <Route path="/account" component={Account} />
                <Route path="/admin" component={Admin} />
                <Route component={NotFound} />
              </Switch>
              </PageTransition>
              <BottomNav />
            </div>
          </div>
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
    </ThemeProvider>
    </LanguageProvider>
  );
}

export default App;
