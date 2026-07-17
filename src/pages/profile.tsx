import { useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Link, useLocation } from 'wouter';
import { AlertCircle, Award, Brain, Check, CheckCircle2, ChevronRight, Cloud, CloudOff, Coffee, Edit2, Flame, Globe, Loader2, LogIn, LogOut, Mail, Settings, Star, Trophy, X } from 'lucide-react';
import { useProfile } from '@/hooks/useProfile';
import { useTastings, Tasting } from '@/hooks/useTastings';
import { Input } from '@/components/ui/input';
import { FLAVOR_WHEEL } from '@/lib/coffeeUtils';
import { fillSectionCopy, useSectionCopy } from '@/lib/sectionI18n';
import { canonicalizeCountry } from '@/lib/coffeeReferenceI18n';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { resolveDisplayName } from '@/lib/profileIdentity';
import { useCloudSync } from '@/hooks/useCloudSync';
import { useAchievements } from '@/hooks/useAchievements';

function getInitials(name: string): string {
  return name.split(' ').map((word) => word[0]).join('').toUpperCase().slice(0, 2);
}

function calcStreak(tastings: { createdAt: string }[]): number {
  if (!tastings.length) return 0;
  const days = [...new Set(tastings.map((tasting) => tasting.createdAt.slice(0, 10)))].sort().reverse();
  const today = new Date().toISOString().slice(0, 10);
  const yesterday = new Date(Date.now() - 86_400_000).toISOString().slice(0, 10);
  if (days[0] !== today && days[0] !== yesterday) return 0;
  let streak = 0;
  let expected = days[0];
  for (const day of days) {
    if (day === expected) {
      streak += 1;
      const date = new Date(`${expected}T12:00:00Z`);
      date.setDate(date.getDate() - 1);
      expected = date.toISOString().slice(0, 10);
    } else {
      break;
    }
  }
  return streak;
}

function getProcessing(tasting: Tasting): string {
  return tasting.processing || tasting.process || '';
}

function getBrewMethod(tasting: Tasting): string {
  return tasting.brewMethod || tasting.brewingMethod || '';
}

function getDescriptors(tasting: Tasting): string[] {
  return [
    ...(tasting.topThreeDescriptors || []),
    ...(tasting.additionalDescriptors || []),
    ...(tasting.flavorDescriptors || []),
  ].filter(Boolean);
}

type TasteFamilyId = 'fruit' | 'chocolate' | 'nuts' | 'floral' | 'citrus' | 'sweet' | 'spice' | 'tea';

const TASTE_DNA: Array<{ id: TasteFamilyId; emoji: string; keywords: string[] }> = [
  { id: 'fruit', emoji: '🍓', keywords: [...FLAVOR_WHEEL.Fruity, 'ягод', 'фрукт', 'клубник', 'малин', 'черник', 'вишн', 'персик', 'манго'] },
  { id: 'chocolate', emoji: '🍫', keywords: [...FLAVOR_WHEEL.Chocolatey, 'Chocolate', 'Cacao', 'шоколад', 'какао'] },
  { id: 'nuts', emoji: '🌰', keywords: [...FLAVOR_WHEEL.Nutty, 'орех', 'фундук', 'миндаль'] },
  { id: 'floral', emoji: '🌸', keywords: [...FLAVOR_WHEEL.Floral, 'цвет', 'жасмин', 'роза', 'лаванда'] },
  { id: 'citrus', emoji: '🍋', keywords: ['Lemon', 'Orange', 'Lime', 'Grapefruit', 'Lemon Zest', 'Citrus', 'лимон', 'апельсин', 'лайм', 'грейпфрут', 'цитрус'] },
  { id: 'sweet', emoji: '🍯', keywords: [...FLAVOR_WHEEL.Sweet, 'слад', 'мёд', 'мед', 'карамель', 'сахар'] },
  { id: 'spice', emoji: '🟤', keywords: [...FLAVOR_WHEEL.Spice, 'спец', 'кориц', 'кардамон', 'гвоздик'] },
  { id: 'tea', emoji: '🍵', keywords: [...FLAVOR_WHEEL.Herbal, 'Tea', 'чай', 'бергамот', 'улун'] },
];

function normalize(value: string): string {
  return value.toLocaleLowerCase().trim();
}

function calcTasteDna(tastings: Tasting[]) {
  const descriptors = tastings.flatMap(getDescriptors).map(normalize);
  return TASTE_DNA.map((family) => {
    const hits = descriptors.filter((descriptor) =>
      family.keywords.some((keyword) => descriptor.includes(normalize(keyword))),
    ).length;
    return { ...family, hits };
  }).sort((a, b) => b.hits - a.hits);
}

type LevelId = 'curiousSipper' | 'homeBrewer' | 'enthusiast' | 'specialtyDrinker' | 'connoisseur' | 'qGraderCandidate' | 'masterTaster';

const LEVELS: Array<{ id: LevelId; min: number; emoji: string; next: number | null }> = [
  { id: 'curiousSipper', min: 0, emoji: '🌱', next: 5 },
  { id: 'homeBrewer', min: 5, emoji: '☕', next: 15 },
  { id: 'enthusiast', min: 15, emoji: '🌿', next: 30 },
  { id: 'specialtyDrinker', min: 30, emoji: '⚗️', next: 60 },
  { id: 'connoisseur', min: 60, emoji: '🏆', next: 100 },
  { id: 'qGraderCandidate', min: 100, emoji: '🎓', next: 200 },
  { id: 'masterTaster', min: 200, emoji: '👑', next: null },
];

function getLevel(count: number) {
  return [...LEVELS].reverse().find((level) => count >= level.min) ?? LEVELS[0];
}


export default function Profile() {
  const [, setLocation] = useLocation();
  const { profile, setProfile } = useProfile();
  const { tastings } = useTastings();
  const { user, loading: authLoading, signOut, updateDisplayName } = useAuth();
  const { status: syncStatus, lastError: syncError } = useCloudSync();
  const { language } = useLanguage();
  const { copy } = useSectionCopy();
  const profileCopy = copy.profile;
  const achievementCopy = copy.achievements;
  const displayName = useMemo(() => resolveDisplayName({
    profileName: profile.name,
    metadataName: typeof user?.user_metadata?.name === 'string' ? user.user_metadata.name : '',
    email: user?.email,
    language,
    authenticated: Boolean(user),
  }), [language, profile.name, user]);
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(displayName);
  const [saveState, setSaveState] = useState<'idle' | 'saving' | 'success' | 'error'>('idle');
  const [saveMessage, setSaveMessage] = useState('');
  const [showSignOutConfirm, setShowSignOutConfirm] = useState(false);
  const [signOutBusy, setSignOutBusy] = useState(false);
  const [signOutError, setSignOutError] = useState('');

  useEffect(() => {
    if (!isEditing) setName(displayName);
  }, [displayName, isEditing]);

  const closeEditor = () => {
    setName(displayName);
    setIsEditing(false);
    setSaveState('idle');
    setSaveMessage('');
  };

  const handleSave = async () => {
    const nextName = name.replace(/\s+/g, ' ').trim();
    if (!nextName) {
      setSaveState('error');
      setSaveMessage(profileCopy.nicknameRequired);
      return;
    }

    setSaveState('saving');
    setSaveMessage('');
    setProfile((current) => ({ ...current, name: nextName }));

    try {
      if (user) await updateDisplayName(nextName);
      setSaveState('success');
      setSaveMessage(user ? profileCopy.nicknameSaved : profileCopy.nicknameSavedDevice);
      setIsEditing(false);
    } catch (error) {
      console.warn('Unable to sync profile name:', error);
      setSaveState('error');
      setSaveMessage(user ? profileCopy.nicknameSavedLocal : profileCopy.nicknameSaveFailed);
      setIsEditing(false);
    }
  };

  const handleSignOut = async () => {
    setSignOutBusy(true);
    setSignOutError('');
    try {
      await signOut();
      setShowSignOutConfirm(false);
    } catch (error) {
      console.warn('Unable to sign out:', error);
      setSignOutError(profileCopy.signOutFailed);
    } finally {
      setSignOutBusy(false);
    }
  };

  const syncLabel = syncStatus === 'synced'
    ? profileCopy.synced
    : syncStatus === 'syncing' || syncStatus === 'loading'
      ? profileCopy.syncing
      : syncStatus === 'error'
        ? profileCopy.syncError
        : profileCopy.localMode;

  const count = tastings.length;
  const level = getLevel(count);
  const levelTitle = profileCopy.levels[level.id];
  const nextLevel = LEVELS[LEVELS.indexOf(level) + 1];
  const nextLevelTitle = nextLevel ? profileCopy.levels[nextLevel.id] : '';
  const streak = calcStreak(tastings);
  const levelProgress = level.next ? ((count - level.min) / (level.next - level.min)) * 100 : 100;
  const qGraderPct = Math.min((count / 100) * 100, 100);

  const favTasting = tastings.length
    ? [...tastings].sort((a, b) => b.overallScore - a.overallScore)[0]
    : null;

  const uniqueCountries = new Set(tastings.filter((tasting) => tasting.country).map((tasting) => canonicalizeCountry(tasting.country))).size;
  const avgScore = count
    ? (tastings.reduce((sum, tasting) => sum + tasting.overallScore, 0) / count).toFixed(1)
    : '—';
  const tasteDna = calcTasteDna(tastings);
  const maxTasteHits = Math.max(...tasteDna.map((item) => item.hits), 1);
  const dominantTaste = tasteDna.find((item) => item.hits > 0);
  const { achievements, unlockedCount, totalCount, totalPoints } = useAchievements();

  return (
    <div className="px-4 iphone-safe-top pb-28 min-h-full">
      <div className="flex justify-end mb-4">
        <Link href="/settings">
          <motion.button
            whileTap={{ scale: 0.9 }}
            aria-label={profileCopy.settings}
            className="w-9 h-9 rounded-full bg-card/60 border border-white/[0.07] flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
          >
            <Settings size={16} />
          </motion.button>
        </Link>
      </div>

      <div className="flex flex-col items-center mb-6">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="w-24 h-24 rounded-full flex items-center justify-center font-bold text-2xl text-primary-foreground shadow-[0_0_40px_rgba(217,163,95,0.2)] mb-4 relative"
          style={{ background: `radial-gradient(circle at 35% 35%, ${profile.avatarColor || '#D9A35F'}cc, ${profile.avatarColor || '#D9A35F'})` }}
        >
          {getInitials(displayName)}
          <div
            className={`absolute top-1 left-1 w-3.5 h-3.5 rounded-full border-2 border-background ${
              user
                ? syncStatus === 'error' ? 'bg-red-400' : syncStatus === 'synced' ? 'bg-emerald-400' : 'bg-amber-400'
                : 'bg-muted-foreground/50'
            }`}
            aria-hidden="true"
          />
          <div className="absolute -bottom-1 -right-1 bg-card border border-white/10 rounded-full w-9 h-9 flex items-center justify-center text-lg shadow-lg">
            {level.emoji}
          </div>
        </motion.div>

        {isEditing ? (
          <div className="w-full max-w-[320px]">
            <label className="text-[10px] uppercase tracking-widest text-muted-foreground/50 font-semibold mb-1.5 block text-center">
              {profileCopy.nicknameLabel}
            </label>
            <div className="flex items-center gap-2">
              <Input
                value={name}
                onChange={(event) => setName(event.target.value)}
                placeholder={profileCopy.nicknamePlaceholder}
                maxLength={50}
                disabled={saveState === 'saving'}
                className="text-center font-serif text-xl h-11 bg-card border-border focus-visible:ring-primary rounded-2xl"
                autoFocus
                onKeyDown={(event) => {
                  if (event.key === 'Enter') void handleSave();
                  if (event.key === 'Escape') closeEditor();
                }}
              />
              <button
                onClick={() => void handleSave()}
                disabled={saveState === 'saving'}
                aria-label={profileCopy.saveName}
                className="w-11 h-11 flex-shrink-0 bg-primary text-primary-foreground rounded-full flex items-center justify-center disabled:opacity-50"
              >
                {saveState === 'saving' ? <Loader2 size={16} className="animate-spin" /> : <Check size={16} />}
              </button>
              <button
                onClick={closeEditor}
                disabled={saveState === 'saving'}
                aria-label={profileCopy.cancelEditing}
                className="w-11 h-11 flex-shrink-0 bg-card border border-white/[0.07] text-muted-foreground rounded-full flex items-center justify-center disabled:opacity-50"
              >
                <X size={16} />
              </button>
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-2 max-w-full">
            <h1 className="font-serif text-[1.9rem] font-medium text-foreground text-center break-words">{displayName}</h1>
            <button
              onClick={() => {
                setSaveState('idle');
                setSaveMessage('');
                setIsEditing(true);
              }}
              aria-label={profileCopy.editName}
              className="text-muted-foreground hover:text-primary transition-colors p-1 flex-shrink-0"
              data-testid="btn-edit-profile"
            >
              <Edit2 size={14} />
            </button>
          </div>
        )}

        <p className="text-muted-foreground text-[13px] mt-1 font-medium">{levelTitle}</p>
        <AnimatePresence mode="wait">
          {saveMessage && (
            <motion.div
              key={`${saveState}-${saveMessage}`}
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              className={`mt-3 flex items-center gap-1.5 text-[11px] ${saveState === 'error' ? 'text-amber-400' : 'text-emerald-400'}`}
            >
              {saveState === 'error' ? <AlertCircle size={13} /> : <CheckCircle2 size={13} />}
              <span>{saveMessage}</span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <section className="bg-card/60 border border-white/[0.06] rounded-[24px] p-5 mb-4">
        <div className="flex items-center justify-between gap-3 mb-4">
          <div>
            <p className="text-[10px] uppercase tracking-widest font-semibold text-muted-foreground/50">{profileCopy.accountTitle}</p>
            <p className="font-serif text-lg font-medium text-foreground mt-1">
              {authLoading ? profileCopy.accountLoading : user ? profileCopy.accountConnected : profileCopy.accountLocal}
            </p>
          </div>
          <div className={`w-10 h-10 rounded-full border flex items-center justify-center ${
            user
              ? syncStatus === 'error' ? 'bg-red-500/10 border-red-500/20' : 'bg-emerald-500/10 border-emerald-500/20'
              : 'bg-muted/50 border-white/[0.06]'
          }`}>
            {authLoading
              ? <Loader2 size={18} className="animate-spin text-primary" />
              : user
                ? syncStatus === 'error' ? <CloudOff size={18} className="text-red-400" /> : <Cloud size={18} className="text-emerald-400" />
                : <CloudOff size={18} className="text-muted-foreground" />}
          </div>
        </div>

        {authLoading ? (
          <div className="space-y-2">
            <div className="h-4 w-2/3 rounded-full bg-muted animate-pulse" />
            <div className="h-3 w-full rounded-full bg-muted/70 animate-pulse" />
          </div>
        ) : user ? (
          <>
            <div className="flex items-center gap-3 rounded-2xl bg-background/50 border border-white/[0.05] p-3 mb-3">
              <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center flex-shrink-0">
                <Mail size={17} className="text-primary" />
              </div>
              <div className="min-w-0">
                <p className="text-[10px] uppercase tracking-wider text-muted-foreground/50">{profileCopy.emailLabel}</p>
                <p className="text-[13px] text-foreground truncate mt-0.5">{user.email}</p>
              </div>
            </div>

            <div className="flex items-start gap-2.5 mb-4">
              {syncStatus === 'error'
                ? <AlertCircle size={16} className="text-red-400 mt-0.5 flex-shrink-0" />
                : syncStatus === 'synced'
                  ? <CheckCircle2 size={16} className="text-emerald-400 mt-0.5 flex-shrink-0" />
                  : <Loader2 size={16} className="text-primary mt-0.5 flex-shrink-0 animate-spin" />}
              <div className="min-w-0">
                <p className={`text-[12px] font-semibold ${syncStatus === 'error' ? 'text-red-400' : 'text-foreground'}`}>{syncLabel}</p>
                <p className="text-[11px] text-muted-foreground leading-relaxed mt-0.5">{profileCopy.connectedDescription}</p>
                {syncStatus === 'error' && syncError && (
                  <details className="mt-2">
                    <summary className="text-[10px] text-red-400 cursor-pointer">{profileCopy.cloudErrorDetails}</summary>
                    <p className="text-[10px] text-muted-foreground mt-1 break-words">{syncError}</p>
                  </details>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => setLocation('/account')}
                className="h-11 rounded-2xl bg-primary/10 border border-primary/20 text-primary text-[12px] font-semibold"
              >
                {profileCopy.manageAccount}
              </button>
              <button
                onClick={() => {
                  setSignOutError('');
                  setShowSignOutConfirm(true);
                }}
                className="h-11 rounded-2xl bg-white/[0.04] border border-white/[0.07] text-foreground text-[12px] font-semibold flex items-center justify-center gap-1.5"
              >
                <LogOut size={14} />
                {profileCopy.signOut}
              </button>
            </div>
          </>
        ) : (
          <>
            <p className="text-[12px] text-muted-foreground leading-relaxed mb-4">
              {profileCopy.localDescription}
            </p>
            <button
              onClick={() => setLocation('/account?mode=login')}
              className="w-full h-11 rounded-2xl bg-primary text-primary-foreground text-[12px] font-bold flex items-center justify-center gap-2"
            >
              <LogIn size={15} />
              {profileCopy.signIn}
            </button>
          </>
        )}
      </section>

      <div className="bg-card/60 border border-white/[0.06] rounded-[24px] p-5 mb-4">
        <div className="flex items-start justify-between mb-3">
          <div>
            <p className="text-[10px] uppercase tracking-widest font-semibold text-muted-foreground/50">{profileCopy.coffeeLevel}</p>
            <p className="font-serif text-xl font-medium text-primary mt-1">{levelTitle}</p>
          </div>
          <span className="text-3xl">{level.emoji}</span>
        </div>
        <div className="h-2 bg-muted rounded-full overflow-hidden mb-2">
          <motion.div
            className="h-full bg-gradient-to-r from-primary/60 to-primary rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${levelProgress}%` }}
            transition={{ delay: 0.3, type: 'spring', stiffness: 180 }}
          />
        </div>
        {level.next ? (
          <p className="text-[11px] text-muted-foreground/60">
            {fillSectionCopy(profileCopy.tastingsToNext, {
              current: count - level.min,
              total: level.next - level.min,
              next: nextLevelTitle,
            })}
          </p>
        ) : (
          <p className="text-[11px] text-primary font-medium">{profileCopy.maxLevel}</p>
        )}
      </div>

      <div className="grid grid-cols-3 gap-3 mb-4">
        {[
          { icon: Coffee, label: profileCopy.tastings, value: count },
          { icon: Globe, label: profileCopy.countries, value: uniqueCountries },
          { icon: Star, label: profileCopy.averageScore, value: avgScore },
        ].map(({ icon: Icon, label, value }) => (
          <div key={label} className="bg-card/60 border border-white/[0.06] rounded-2xl px-3 py-4 flex flex-col items-center gap-1.5">
            <Icon size={16} className="text-primary/70" />
            <span className="font-serif text-xl text-primary">{value}</span>
            <span className="text-[9px] uppercase tracking-widest text-muted-foreground/50 font-semibold">{label}</span>
          </div>
        ))}
      </div>

      <div className="bg-card/60 border border-white/[0.06] rounded-[24px] p-5 mb-4">
        <div className="flex items-start justify-between gap-4 mb-5">
          <div>
            <p className="text-[10px] uppercase tracking-widest font-semibold text-muted-foreground/50">{profileCopy.tasteDna}</p>
            <p className="font-serif text-xl font-medium text-foreground mt-1">{profileCopy.tastePortrait}</p>
          </div>
          <div className="w-10 h-10 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center">
            <Brain size={18} className="text-primary" />
          </div>
        </div>

        <div className="space-y-3">
          {tasteDna.slice(0, 6).map((family) => {
            const percentage = family.hits > 0 ? Math.max((family.hits / maxTasteHits) * 100, 12) : 4;
            return (
              <div key={family.id}>
                <div className="flex justify-between items-center text-[12px] mb-1.5">
                  <span className="text-foreground font-medium">
                    <span className="mr-1.5">{family.emoji}</span>
                    {profileCopy.tasteFamilies[family.id]}
                  </span>
                  <span className="text-muted-foreground/60">{family.hits}</span>
                </div>
                <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-gradient-to-r from-primary/60 to-primary rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${percentage}%` }}
                    transition={{ delay: 0.15, type: 'spring', stiffness: 180 }}
                  />
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-5 bg-primary/[0.07] border border-primary/20 rounded-2xl p-4">
          <p className="text-[11px] uppercase tracking-widest text-primary font-bold mb-2">{profileCopy.aiObservation}</p>
          <p className="text-[13px] leading-relaxed text-muted-foreground">
            {dominantTaste
              ? fillSectionCopy(profileCopy.dominantObservation, { family: profileCopy.tasteFamilies[dominantTaste.id] })
              : profileCopy.emptyObservation}
          </p>
        </div>
      </div>

      <div className="bg-card/60 border border-white/[0.06] rounded-[24px] p-5 mb-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-orange-950/60 border border-orange-800/30 flex items-center justify-center">
            <Flame size={18} className="text-orange-400 fill-orange-400" />
          </div>
          <div>
            <p className="font-medium text-foreground text-[15px]">{profileCopy.dailyStreak}</p>
            <p className="text-[11px] text-muted-foreground/60">{streak > 0 ? profileCopy.keepGoing : profileCopy.startStreak}</p>
          </div>
        </div>
        <div className="text-right">
          <span className="font-serif text-3xl text-orange-400">{streak}</span>
          <p className="text-[9px] text-muted-foreground/50 uppercase tracking-wide font-semibold">{profileCopy.days}</p>
        </div>
      </div>

      <div className="bg-card/60 border border-white/[0.06] rounded-[24px] p-5 mb-4">
        <div className="flex items-center justify-between mb-3">
          <div>
            <p className="text-[10px] uppercase tracking-widest font-semibold text-muted-foreground/50">{profileCopy.qJourney}</p>
            <p className="text-[13px] text-foreground mt-1">{fillSectionCopy(profileCopy.referenceTastings, { count })}</p>
          </div>
          <span className="font-serif text-2xl text-primary">{Math.round(qGraderPct)}%</span>
        </div>
        <div className="h-2 bg-muted rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-emerald-600/60 to-emerald-400 rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${qGraderPct}%` }}
            transition={{ delay: 0.4, type: 'spring', stiffness: 180 }}
          />
        </div>
      </div>

      {favTasting && (
        <div className="bg-card/60 border border-white/[0.06] rounded-[24px] p-5 mb-4 relative overflow-hidden">
          <div className="absolute top-3 right-4 text-5xl opacity-8">🏆</div>
          <p className="text-[10px] uppercase tracking-widest font-semibold text-muted-foreground/50 mb-3">{profileCopy.highestRated}</p>
          <h3 className="font-serif text-xl font-medium text-foreground">{favTasting.coffeeName}</h3>
          {favTasting.roaster && <p className="text-[13px] text-muted-foreground mt-0.5">{favTasting.roaster}</p>}
          <div className="flex items-end gap-2 mt-3">
            <span className="font-serif text-3xl text-primary leading-none">{favTasting.overallScore}</span>
            <span className="text-[10px] text-muted-foreground/50 uppercase tracking-widest mb-0.5">{profileCopy.pointsShort}</span>
          </div>
        </div>
      )}

      <section>
        <div className="flex items-center justify-between gap-3 mb-3">
          <p className="text-[10px] uppercase tracking-widest font-semibold text-muted-foreground/50">
            {profileCopy.achievements}
            <span className="ml-2 text-primary">{unlockedCount}/{totalCount}</span>
          </p>
          <Link href="/achievements">
            <motion.span whileTap={{ scale: 0.96 }} className="inline-flex items-center gap-1 text-[10px] font-semibold text-primary">
              {achievementCopy.viewAll}
              <ChevronRight size={13} />
            </motion.span>
          </Link>
        </div>

        <Link href="/achievements">
          <motion.div
            whileTap={{ scale: 0.985 }}
            className="relative overflow-hidden rounded-[24px] bg-card/65 border border-white/[0.06] p-4"
          >
            <div className="absolute -right-5 -top-8 text-[86px] opacity-[0.05]">🏆</div>
            <div className="relative flex items-center justify-between gap-4 mb-4">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-2xl bg-primary/12 border border-primary/22 grid place-items-center">
                  <Trophy size={19} className="text-primary" />
                </div>
                <div>
                  <p className="font-serif text-lg font-semibold text-foreground">{achievementCopy.summaryTitle}</p>
                  <p className="text-[10px] text-muted-foreground mt-0.5">{unlockedCount} / {totalCount} · {achievementCopy.unlocked}</p>
                </div>
              </div>
              <div className="text-right">
                <div className="inline-flex items-center gap-1 text-primary font-bold text-sm">
                  <Award size={14} />
                  {totalPoints}
                </div>
                <p className="text-[9px] uppercase tracking-widest text-muted-foreground/50 mt-0.5">{achievementCopy.points}</p>
              </div>
            </div>

            <div className="grid grid-cols-4 gap-2.5 relative">
              {achievements.slice(0, 4).map((achievement) => {
                const itemCopy = achievementCopy.items[achievement.id];
                return (
                  <div
                    key={achievement.id}
                    title={itemCopy.description}
                    className={`flex flex-col items-center gap-1.5 p-2.5 rounded-2xl border text-center ${
                      achievement.unlocked
                        ? 'bg-primary/[0.07] border-primary/18'
                        : 'bg-card/20 border-white/[0.03] opacity-35 grayscale'
                    }`}
                  >
                    <span className="text-2xl">{achievement.icon}</span>
                    <span className="text-[9px] font-semibold text-foreground/80 leading-tight line-clamp-2">{itemCopy.title}</span>
                  </div>
                );
              })}
            </div>
          </motion.div>
        </Link>
      </section>

      <div className="mt-10 text-center">
        <p className="text-[10px] text-muted-foreground/25 font-medium tracking-widest uppercase">CoffeeMind AI · v1.5</p>
      </div>

      <AnimatePresence>
        {showSignOutConfirm && (
          <motion.div
            className="fixed inset-0 z-[120] bg-black/65 backdrop-blur-sm flex items-end justify-center px-4 pb-[calc(env(safe-area-inset-bottom)+20px)]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => !signOutBusy && setShowSignOutConfirm(false)}
          >
            <motion.div
              role="dialog"
              aria-modal="true"
              aria-labelledby="profile-sign-out-title"
              initial={{ opacity: 0, y: 32, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 24, scale: 0.98 }}
              transition={{ type: 'spring', damping: 26, stiffness: 300 }}
              onClick={(event) => event.stopPropagation()}
              className="relative w-full max-w-[398px] rounded-[28px] bg-card border border-white/[0.08] p-5 shadow-[0_24px_80px_rgba(0,0,0,0.45)]"
            >
              <div className="flex items-start gap-3">
                <div className="w-11 h-11 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center flex-shrink-0">
                  <LogOut size={19} className="text-red-400" />
                </div>
                <div className="min-w-0 pr-8">
                  <h2 id="profile-sign-out-title" className="font-serif text-xl font-medium text-foreground">{profileCopy.signOutTitle}</h2>
                  <p className="text-[12px] text-muted-foreground leading-relaxed mt-1.5">{profileCopy.signOutDescription}</p>
                </div>
                <button
                  onClick={() => setShowSignOutConfirm(false)}
                  disabled={signOutBusy}
                  aria-label={profileCopy.cancel}
                  className="absolute right-7 top-7 w-8 h-8 rounded-full bg-white/[0.05] text-muted-foreground flex items-center justify-center disabled:opacity-50"
                >
                  <X size={15} />
                </button>
              </div>

              {signOutError && (
                <div className="mt-4 rounded-2xl bg-red-500/10 border border-red-500/20 px-3 py-2.5 flex items-center gap-2 text-[11px] text-red-400">
                  <AlertCircle size={14} className="flex-shrink-0" />
                  <span>{signOutError}</span>
                </div>
              )}

              <div className="grid grid-cols-2 gap-2 mt-5">
                <button
                  onClick={() => setShowSignOutConfirm(false)}
                  disabled={signOutBusy}
                  className="h-12 rounded-2xl bg-white/[0.05] border border-white/[0.07] text-foreground text-[13px] font-semibold disabled:opacity-50"
                >
                  {profileCopy.cancel}
                </button>
                <button
                  onClick={() => void handleSignOut()}
                  disabled={signOutBusy}
                  className="h-12 rounded-2xl bg-red-500 text-white text-[13px] font-bold flex items-center justify-center gap-2 disabled:opacity-60"
                >
                  {signOutBusy ? <Loader2 size={16} className="animate-spin" /> : <LogOut size={16} />}
                  {signOutBusy ? profileCopy.signingOut : profileCopy.confirmSignOut}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
