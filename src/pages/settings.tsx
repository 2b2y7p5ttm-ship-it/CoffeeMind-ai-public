import { useState } from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight, Moon, Sun, Monitor, Download, Trash2, Info, User, Smartphone, ShieldCheck, Share2, Sparkles, Cloud, BarChart3 } from 'lucide-react';
import { useLocation } from 'wouter';
import { useProfile } from '@/hooks/useProfile';
import { useTastings } from '@/hooks/useTastings';
import { useBooks } from '@/hooks/useBooks';
import { Input } from '@/components/ui/input';
import { useAdminAccess } from '@/hooks/useAdminAccess';
import { useTheme, type ThemeMode } from '@/contexts/ThemeContext';

// ─── Settings Row ─────────────────────────────────────────────────────────────

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

// ─── Settings Page ────────────────────────────────────────────────────────────

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

  return (
    <div className="min-h-full bg-background">
      {/* Header */}
      <header className="flex items-center gap-3 px-4 pt-14 pb-6">
        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={() => setLocation('/profile')}
          className="w-9 h-9 rounded-full bg-card/60 border border-white/[0.07] flex items-center justify-center text-muted-foreground"
        >
          <ChevronLeft size={20} />
        </motion.button>
        <h1 className="font-serif text-[1.6rem] font-medium text-foreground">Settings</h1>
      </header>

      <div className="px-4 space-y-5 pb-16">

        {/* Profile */}
        <Section title="Profile">
          {editingName ? (
            <div className="flex items-center gap-3 px-4 py-3.5">
              <div className="w-9 h-9 rounded-xl bg-white/[0.06] border border-white/[0.06] flex items-center justify-center flex-shrink-0">
                <User size={16} className="text-muted-foreground" />
              </div>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSaveName()}
                placeholder="Your name"
                className="flex-1 h-9 bg-background border-border text-sm"
                autoFocus
              />
              <button
                onClick={handleSaveName}
                className="px-3 h-9 bg-primary text-primary-foreground rounded-full text-[13px] font-semibold"
              >
                Save
              </button>
            </div>
          ) : (
            <Row
              icon={User}
              label={profile.name}
              sublabel="Tap to change your name"
              onClick={() => setEditingName(true)}
            />
          )}
        </Section>

        {/* Cloud account */}
        <Section title="Cloud">
          <Row
            icon={Cloud}
            label="Аккаунт и синхронизация"
            sublabel="Вход, перенос локальных данных и облачное хранение"
            onClick={() => setLocation('/account')}
          />
        </Section>

        {isAdmin && (
          <Section title="Owner">
            <Row
              icon={BarChart3}
              label="Панель владельца"
              sublabel="Пользователи, регистрации и активность CoffeeMind"
              onClick={() => setLocation('/admin')}
            />
          </Section>
        )}

        {/* Appearance */}
        <Section title="Оформление">
          <div className="p-3">
            <div className="grid grid-cols-3 gap-2">
              {([
                ['light', Sun, 'Светлая'],
                ['dark', Moon, 'Тёмная'],
                ['system', Monitor, 'Система'],
              ] as [ThemeMode, React.ElementType, string][]).map(([value, Icon, label]) => {
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


        {/* Public launch */}
        <Section title="Public Launch">
          <Row
            icon={Sparkles}
            label="Добро пожаловать"
            sublabel="Как работает публичная версия CoffeeMind"
            onClick={() => setLocation('/welcome')}
          />
          <Row
            icon={Share2}
            label="Поделиться приложением"
            sublabel="Скопировать ссылку для друзей и первых пользователей"
            onClick={() => setLocation('/share')}
          />
        </Section>

        {/* Installation */}
        <Section title="iPhone">
          <Row
            icon={Smartphone}
            label="Установить CoffeeMind"
            sublabel="Android, iPhone и PWA-режим"
            onClick={() => setLocation('/install')}
          />
        </Section>

        {/* Data */}
        <Section title="Data">
          <Row
            icon={ShieldCheck}
            label="Data Vault"
            sublabel="Backup, restore and protect your journal"
            onClick={() => setLocation('/backup')}
          />
          <Row
            icon={Download}
            label="Quick Export"
            sublabel={`${tastings.length} дегустаций · ${books.length} книг · JSON`}
            onClick={handleExport}
          />
        </Section>

        {/* Danger zone */}
        <Section title="Danger Zone">
          {showClearConfirm ? (
            <div className="px-4 py-4 space-y-3">
              <p className="text-[13px] text-foreground font-medium">
                Delete all {tastings.length} tastings? This cannot be undone.
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => setShowClearConfirm(false)}
                  className="flex-1 h-10 bg-white/[0.06] text-foreground rounded-xl text-[13px] font-medium"
                >
                  Cancel
                </button>
                <motion.button
                  whileTap={{ scale: 0.96 }}
                  onClick={handleClear}
                  className="flex-1 h-10 bg-red-900/80 text-red-200 rounded-xl text-[13px] font-semibold border border-red-800/50"
                >
                  Delete All
                </motion.button>
              </div>
            </div>
          ) : (
            <Row
              icon={Trash2}
              label="Clear All Data"
              sublabel="Permanently delete tastings and book ratings"
              onClick={() => setShowClearConfirm(true)}
              destructive
            />
          )}
        </Section>

        {/* About */}
        <Section title="About">
          <Row
            icon={Info}
            label="CoffeeMind AI"
            sublabel="v2.1 · Share-ready local journals + book ratings"
            right={<span className="text-[11px] text-muted-foreground/40">v2.1</span>}
          />
        </Section>

      </div>
    </div>
  );
}
