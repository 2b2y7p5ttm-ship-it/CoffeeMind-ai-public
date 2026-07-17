import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  BarChart3,
  ChevronLeft,
  ChevronRight,
  Cloud,
  Download,
  Info,
  Languages,
  Monitor,
  Moon,
  Share2,
  ShieldCheck,
  Smartphone,
  Sparkles,
  Sun,
  Trash2,
  User,
} from 'lucide-react';
import { useLocation } from 'wouter';
import { useProfile } from '@/hooks/useProfile';
import { useTastings } from '@/hooks/useTastings';
import { useBooks } from '@/hooks/useBooks';
import { Input } from '@/components/ui/input';
import { useAdminAccess } from '@/hooks/useAdminAccess';
import { useTheme, type ThemeMode } from '@/contexts/ThemeContext';
import { useLanguage, type LanguageMode } from '@/contexts/LanguageContext';

function Row({
  icon: Icon,
  label,
  sublabel,
  right,
  onClick,
  destructive = false,
}: {
  icon: React.ElementType;
  label: string;
  sublabel?: string;
  right?: React.ReactNode;
  onClick?: () => void;
  destructive?: boolean;
}) {
  return (
    <motion.button
      onClick={onClick}
      whileTap={onClick ? { scale: 0.98 } : undefined}
      className={`w-full flex items-center gap-4 px-4 py-3.5 transition-colors ${onClick ? 'hover:bg-white/[0.03] cursor-pointer' : 'cursor-default'}`}
    >
      <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${destructive ? 'bg-red-950/60 border border-red-800/30' : 'bg-white/[0.06] border border-white/[0.06]'}`}>
        <Icon size={16} className={destructive ? 'text-red-400' : 'text-muted-foreground'} />
      </div>
      <div className="flex-1 text-left">
        <p className={`text-[14px] font-medium ${destructive ? 'text-red-400' : 'text-foreground'}`}>{label}</p>
        {sublabel && <p className="text-[11px] text-muted-foreground/60 mt-0.5">{sublabel}</p>}
      </div>
      {right ?? (onClick && <ChevronRight size={15} className="text-muted-foreground/40" />)}
    </motion.button>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="text-[10px] uppercase tracking-widest font-semibold text-muted-foreground/40 px-5 mb-1">
        {title}
      </p>
      <div className="bg-card/60 border border-white/[0.06] rounded-[20px] overflow-hidden divide-y divide-white/[0.04]">
        {children}
      </div>
    </div>
  );
}

export default function Settings() {
  const [, setLocation] = useLocation();
  const { profile, setProfile } = useProfile();
  const { tastings } = useTastings();
  const { books } = useBooks();
  const [editingName, setEditingName] = useState(false);
  const [name, setName] = useState(profile.name);
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const { isAdmin } = useAdminAccess();
  const { mode, setMode } = useTheme();
  const { mode: languageMode, setMode: setLanguageMode, t } = useLanguage();

  const handleSaveName = () => {
    if (name.trim()) setProfile({ ...profile, name: name.trim() });
    else setName(profile.name);
    setEditingName(false);
  };

  const handleExport = () => {
    const data = {
      tastings,
      profile,
      books,
      exportedAt: new Date().toISOString(),
      version: '2.4',
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `coffeemind-ai-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleClear = () => {
    localStorage.removeItem('coffee_journal_tastings');
    localStorage.removeItem('coffee_journal_profile');
    localStorage.removeItem('coffeemind_book_ratings');
    window.location.reload();
  };

  const themeOptions: [ThemeMode, React.ElementType, string][] = [
    ['light', Sun, t('common.light')],
    ['dark', Moon, t('common.dark')],
    ['system', Monitor, t('common.system')],
  ];

  const languageOptions: [LanguageMode, string, string][] = [
    ['system', 'A', t('common.automatic')],
    ['ru', 'RU', t('common.russian')],
    ['en', 'EN', t('common.english')],
  ];

  return (
    <div className="min-h-full bg-background">
      <header className="flex items-center gap-3 px-4 pt-14 pb-6">
        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={() => setLocation('/profile')}
          className="w-9 h-9 rounded-full bg-card/60 border border-white/[0.07] flex items-center justify-center text-muted-foreground"
          aria-label={t('common.back')}
        >
          <ChevronLeft size={20} />
        </motion.button>
        <h1 className="font-serif text-[1.6rem] font-medium text-foreground">{t('settings.title')}</h1>
      </header>

      <div className="px-4 space-y-5 pb-16">
        <Section title={t('settings.profile')}>
          {editingName ? (
            <div className="flex items-center gap-3 px-4 py-3.5">
              <div className="w-9 h-9 rounded-xl bg-white/[0.06] border border-white/[0.06] flex items-center justify-center flex-shrink-0">
                <User size={16} className="text-muted-foreground" />
              </div>
              <Input
                value={name}
                onChange={(event) => setName(event.target.value)}
                onKeyDown={(event) => event.key === 'Enter' && handleSaveName()}
                placeholder={t('settings.yourName')}
                className="flex-1 h-9 bg-background border-border text-sm"
                autoFocus
              />
              <button
                onClick={handleSaveName}
                className="px-3 h-9 bg-primary text-primary-foreground rounded-full text-[13px] font-semibold"
              >
                {t('common.save')}
              </button>
            </div>
          ) : (
            <Row
              icon={User}
              label={profile.name}
              sublabel={t('settings.tapName')}
              onClick={() => setEditingName(true)}
            />
          )}
        </Section>

        <Section title={t('settings.cloud')}>
          <Row
            icon={Cloud}
            label={t('settings.cloudAccount')}
            sublabel={t('settings.cloudAccountText')}
            onClick={() => setLocation('/account')}
          />
        </Section>

        {isAdmin && (
          <Section title={t('settings.owner')}>
            <Row
              icon={BarChart3}
              label={t('settings.ownerPanel')}
              sublabel={t('settings.ownerPanelText')}
              onClick={() => setLocation('/admin')}
            />
          </Section>
        )}

        <Section title={t('settings.appearance')}>
          <div className="p-3">
            <div className="grid grid-cols-3 gap-2">
              {themeOptions.map(([value, Icon, label]) => {
                const active = mode === value;
                return (
                  <motion.button
                    key={value}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setMode(value)}
                    className={`rounded-2xl border px-2 py-3 transition-all ${active ? 'border-primary bg-primary/12 text-primary shadow-[0_10px_30px_hsl(var(--primary)/0.12)]' : 'border-border bg-background/55 text-muted-foreground'}`}
                  >
                    <Icon size={18} className="mx-auto" />
                    <span className="mt-2 block text-[10px] font-semibold">{label}</span>
                  </motion.button>
                );
              })}
            </div>
          </div>
        </Section>

        <Section title={t('settings.language')}>
          <div className="p-3">
            <div className="flex items-center gap-3 px-2 pb-3">
              <div className="w-9 h-9 rounded-xl bg-white/[0.06] border border-white/[0.06] flex items-center justify-center">
                <Languages size={17} className="text-muted-foreground" />
              </div>
              <p className="text-[11px] text-muted-foreground/65">{t('settings.languageText')}</p>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {languageOptions.map(([value, badge, label]) => {
                const active = languageMode === value;
                return (
                  <motion.button
                    key={value}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setLanguageMode(value)}
                    className={`min-w-0 rounded-2xl border px-1.5 py-3 transition-all ${active ? 'border-primary bg-primary/12 text-primary shadow-[0_10px_30px_hsl(var(--primary)/0.12)]' : 'border-border bg-background/55 text-muted-foreground'}`}
                  >
                    <span className="mx-auto flex h-6 w-7 items-center justify-center rounded-lg bg-current/10 text-[9px] font-black">{badge}</span>
                    <span className="mt-2 block truncate text-[9px] font-semibold">{label}</span>
                  </motion.button>
                );
              })}
            </div>
          </div>
        </Section>

        <Section title={t('settings.publicLaunch')}>
          <Row
            icon={Sparkles}
            label={t('settings.welcome')}
            sublabel={t('settings.welcomeText')}
            onClick={() => setLocation('/welcome')}
          />
          <Row
            icon={Share2}
            label={t('settings.share')}
            sublabel={t('settings.shareText')}
            onClick={() => setLocation('/share')}
          />
        </Section>

        <Section title={t('settings.installation')}>
          <Row
            icon={Smartphone}
            label={t('settings.install')}
            sublabel={t('settings.installText')}
            onClick={() => setLocation('/install')}
          />
        </Section>

        <Section title={t('settings.data')}>
          <Row
            icon={ShieldCheck}
            label={t('settings.dataVault')}
            sublabel={t('settings.dataVaultText')}
            onClick={() => setLocation('/backup')}
          />
          <Row
            icon={Download}
            label={t('settings.quickExport')}
            sublabel={t('settings.exportSummary', { tastings: tastings.length, books: books.length })}
            onClick={handleExport}
          />
        </Section>

        <Section title={t('settings.danger')}>
          {showClearConfirm ? (
            <div className="px-4 py-4 space-y-3">
              <p className="text-[13px] text-foreground font-medium">
                {t('settings.deleteQuestion', { count: tastings.length })}
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => setShowClearConfirm(false)}
                  className="flex-1 h-10 bg-white/[0.06] text-foreground rounded-xl text-[13px] font-medium"
                >
                  {t('common.cancel')}
                </button>
                <motion.button
                  whileTap={{ scale: 0.96 }}
                  onClick={handleClear}
                  className="flex-1 h-10 bg-red-900/80 text-red-200 rounded-xl text-[13px] font-semibold border border-red-800/50"
                >
                  {t('settings.deleteAll')}
                </motion.button>
              </div>
            </div>
          ) : (
            <Row
              icon={Trash2}
              label={t('settings.clearAll')}
              sublabel={t('settings.clearAllText')}
              onClick={() => setShowClearConfirm(true)}
              destructive
            />
          )}
        </Section>

        <Section title={t('settings.about')}>
          <Row
            icon={Info}
            label="CoffeeMind AI"
            sublabel={t('settings.aboutText')}
            right={<span className="text-[11px] text-muted-foreground/40">v2.1</span>}
          />
        </Section>
      </div>
    </div>
  );
}
