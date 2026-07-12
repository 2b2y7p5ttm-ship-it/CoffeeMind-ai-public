import { useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'wouter';
import { Edit2, Check, Settings, Star, Flame, Globe, Coffee, Brain } from 'lucide-react';
import { useProfile } from '@/hooks/useProfile';
import { useTastings, Tasting } from '@/hooks/useTastings';
import { Input } from '@/components/ui/input';
import { FLAVOR_WHEEL } from '@/lib/coffeeUtils';

// ─── Helpers ─────────────────────────────────────────────────────────────────

function getInitials(name: string): string {
  return name.split(' ').map((w) => w[0]).join('').toUpperCase().slice(0, 2);
}

function calcStreak(tastings: { createdAt: string }[]): number {
  if (!tastings.length) return 0;
  const days = [...new Set(tastings.map((t) => t.createdAt.slice(0, 10)))].sort().reverse();
  const today = new Date().toISOString().slice(0, 10);
  const yesterday = new Date(Date.now() - 86_400_000).toISOString().slice(0, 10);
  if (days[0] !== today && days[0] !== yesterday) return 0;
  let streak = 0;
  let expected = days[0];
  for (const day of days) {
    if (day === expected) {
      streak++;
      const d = new Date(expected + 'T12:00:00Z');
      d.setDate(d.getDate() - 1);
      expected = d.toISOString().slice(0, 10);
    } else break;
  }
  return streak;
}

function getProcessing(t: Tasting): string {
  return t.processing || t.process || '';
}

function getBrewMethod(t: Tasting): string {
  return t.brewMethod || t.brewingMethod || '';
}

function getDescriptors(t: Tasting): string[] {
  return [
    ...(t.topThreeDescriptors || []),
    ...(t.additionalDescriptors || []),
    ...(t.flavorDescriptors || []),
  ].filter(Boolean);
}

const TASTE_DNA = [
  { label: 'Ягоды и фрукты', emoji: '🍓', keywords: [...FLAVOR_WHEEL.Fruity] },
  { label: 'Шоколад', emoji: '🍫', keywords: [...FLAVOR_WHEEL.Chocolatey, 'Chocolate', 'Cacao'] },
  { label: 'Орехи', emoji: '🌰', keywords: [...FLAVOR_WHEEL.Nutty] },
  { label: 'Цветы', emoji: '🌸', keywords: [...FLAVOR_WHEEL.Floral] },
  { label: 'Цитрус', emoji: '🍋', keywords: ['Lemon', 'Orange', 'Lime', 'Grapefruit', 'Lemon Zest', 'Citrus'] },
  { label: 'Сладость', emoji: '🍯', keywords: [...FLAVOR_WHEEL.Sweet] },
  { label: 'Специи', emoji: '🟤', keywords: [...FLAVOR_WHEEL.Spice] },
  { label: 'Чайность', emoji: '🍵', keywords: [...FLAVOR_WHEEL.Herbal, 'Tea'] },
];

function normalize(value: string): string {
  return value.toLowerCase().trim();
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

// ─── Coffee Levels ────────────────────────────────────────────────────────────

const LEVELS = [
  { min: 0,   title: 'Curious Sipper',    emoji: '🌱', next: 5   },
  { min: 5,   title: 'Home Brewer',       emoji: '☕', next: 15  },
  { min: 15,  title: 'Enthusiast',        emoji: '🌿', next: 30  },
  { min: 30,  title: 'Specialty Drinker', emoji: '⚗️', next: 60  },
  { min: 60,  title: 'Connoisseur',       emoji: '🏆', next: 100 },
  { min: 100, title: 'Q-Grader Candidate',emoji: '🎓', next: 200 },
  { min: 200, title: 'Master Taster',     emoji: '👑', next: null },
];

function getLevel(count: number) {
  return [...LEVELS].reverse().find((l) => count >= l.min) ?? LEVELS[0];
}

// ─── Achievements ─────────────────────────────────────────────────────────────

const ACHIEVEMENTS = [
  { id: 'first',   icon: '☕', title: 'First Sip',      desc: 'Logged first tasting',        check: (t: Tasting[]) => t.length >= 1 },
  { id: 'five',    icon: '🌱', title: 'Getting Started', desc: '5 tastings logged',           check: (t: Tasting[]) => t.length >= 5 },
  { id: 'world',   icon: '🌍', title: 'World Explorer',  desc: 'Tasted from 5+ countries',   check: (t: Tasting[]) => new Set(t.filter((x) => x.country).map((x) => x.country)).size >= 5 },
  { id: 'high',    icon: '⭐', title: 'Excellence',      desc: 'Scored a 90+ cup',            check: (t: Tasting[]) => t.some((x) => x.overallScore >= 90) },
  { id: 'perfect', icon: '💎', title: 'Perfectionist',   desc: 'Scored a 95+ cup',            check: (t: Tasting[]) => t.some((x) => x.overallScore >= 95) },
  { id: 'method',  icon: '⚗️', title: 'Method Master',   desc: 'Tried 4+ brewing methods',   check: (t: Tasting[]) => new Set(t.map(getBrewMethod).filter(Boolean)).size >= 4 },
  { id: 'natural', icon: '🫐', title: 'Naturalist',      desc: '3+ Natural processed coffees', check: (t: Tasting[]) => t.filter((x) => getProcessing(x) === 'Natural').length >= 3 },
  { id: '100',     icon: '💯', title: 'Century Club',    desc: '100 tastings logged',         check: (t: Tasting[]) => t.length >= 100 },
];

// ─── Profile Page ─────────────────────────────────────────────────────────────

export default function Profile() {
  const { profile, setProfile } = useProfile();
  const { tastings } = useTastings();
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(profile.name);

  const handleSave = () => {
    if (name.trim()) setProfile({ ...profile, name: name.trim() });
    else setName(profile.name);
    setIsEditing(false);
  };

  const count = tastings.length;
  const level = getLevel(count);
  const streak = calcStreak(tastings);
  const levelProgress = level.next ? ((count - level.min) / (level.next - level.min)) * 100 : 100;
  const qGraderPct = Math.min((count / 100) * 100, 100);

  const favTasting = tastings.length
    ? [...tastings].sort((a, b) => b.overallScore - a.overallScore)[0]
    : null;

  const uniqueCountries = new Set(tastings.filter((t) => t.country).map((t) => t.country)).size;
  const avgScore = count
    ? (tastings.reduce((s, t) => s + t.overallScore, 0) / count).toFixed(1)
    : '—';
  const tasteDna = calcTasteDna(tastings);
  const maxTasteHits = Math.max(...tasteDna.map((item) => item.hits), 1);
  const dominantTaste = tasteDna.find((item) => item.hits > 0);

  const unlocked = ACHIEVEMENTS.filter((a) => a.check(tastings));

  return (
    <div className="px-4 iphone-safe-top pb-28 min-h-full">

      {/* ── Settings shortcut ──────────────────────────────────────────── */}
      <div className="flex justify-end mb-4">
        <Link href="/settings">
          <motion.button
            whileTap={{ scale: 0.9 }}
            className="w-9 h-9 rounded-full bg-card/60 border border-white/[0.07] flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
          >
            <Settings size={16} />
          </motion.button>
        </Link>
      </div>

      {/* ── Avatar + Name ───────────────────────────────────────────────── */}
      <div className="flex flex-col items-center mb-8">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="w-24 h-24 rounded-full flex items-center justify-center font-bold text-2xl text-primary-foreground shadow-[0_0_40px_rgba(217,163,95,0.2)] mb-4 relative"
          style={{ background: `radial-gradient(circle at 35% 35%, ${profile.avatarColor || '#D9A35F'}cc, ${profile.avatarColor || '#D9A35F'})` }}
        >
          {getInitials(profile.name)}
          {/* Level badge */}
          <div className="absolute -bottom-1 -right-1 bg-card border border-white/10 rounded-full w-9 h-9 flex items-center justify-center text-lg shadow-lg">
            {level.emoji}
          </div>
        </motion.div>

        {isEditing ? (
          <div className="flex items-center gap-2 max-w-[240px]">
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="text-center font-serif text-xl h-10 bg-card border-border focus-visible:ring-primary"
              autoFocus
              onKeyDown={(e) => e.key === 'Enter' && handleSave()}
            />
            <button
              onClick={handleSave}
              className="w-10 h-10 flex-shrink-0 bg-primary text-primary-foreground rounded-full flex items-center justify-center"
            >
              <Check size={16} />
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <h1 className="font-serif text-[1.9rem] font-medium text-foreground">
              {profile.name}
            </h1>
            <button
              onClick={() => setIsEditing(true)}
              className="text-muted-foreground hover:text-primary transition-colors p-1"
              data-testid="btn-edit-profile"
            >
              <Edit2 size={14} />
            </button>
          </div>
        )}

        <p className="text-muted-foreground text-[13px] mt-1 font-medium">{level.title}</p>
      </div>

      {/* ── Level progress card ─────────────────────────────────────────── */}
      <div className="bg-card/60 border border-white/[0.06] rounded-[24px] p-5 mb-4">
        <div className="flex items-start justify-between mb-3">
          <div>
            <p className="text-[10px] uppercase tracking-widest font-semibold text-muted-foreground/50">
              Coffee Level
            </p>
            <p className="font-serif text-xl font-medium text-primary mt-1">{level.title}</p>
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
            {count - level.min} / {level.next - level.min} tastings to <strong className="text-muted-foreground">{LEVELS[LEVELS.indexOf(level) + 1]?.title}</strong>
          </p>
        ) : (
          <p className="text-[11px] text-primary font-medium">Maximum level achieved 🏆</p>
        )}
      </div>

      {/* ── Quick stats row ─────────────────────────────────────────────── */}
      <div className="grid grid-cols-3 gap-3 mb-4">
        {[
          { icon: Coffee, label: 'Tastings', value: count },
          { icon: Globe, label: 'Countries', value: uniqueCountries },
          { icon: Star, label: 'Avg Score', value: avgScore },
        ].map(({ icon: Icon, label, value }) => (
          <div
            key={label}
            className="bg-card/60 border border-white/[0.06] rounded-2xl px-3 py-4 flex flex-col items-center gap-1.5"
          >
            <Icon size={16} className="text-primary/70" />
            <span className="font-serif text-xl text-primary">{value}</span>
            <span className="text-[9px] uppercase tracking-widest text-muted-foreground/50 font-semibold">
              {label}
            </span>
          </div>
        ))}
      </div>

      {/* ── Taste DNA ──────────────────────────────────────────────────── */}
      <div className="bg-card/60 border border-white/[0.06] rounded-[24px] p-5 mb-4">
        <div className="flex items-start justify-between gap-4 mb-5">
          <div>
            <p className="text-[10px] uppercase tracking-widest font-semibold text-muted-foreground/50">
              Taste DNA
            </p>
            <p className="font-serif text-xl font-medium text-foreground mt-1">Портрет вкуса</p>
          </div>
          <div className="w-10 h-10 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center">
            <Brain size={18} className="text-primary" />
          </div>
        </div>

        <div className="space-y-3">
          {tasteDna.slice(0, 6).map((family) => {
            const pct = family.hits > 0 ? Math.max((family.hits / maxTasteHits) * 100, 12) : 4;
            return (
              <div key={family.label}>
                <div className="flex justify-between items-center text-[12px] mb-1.5">
                  <span className="text-foreground font-medium">
                    <span className="mr-1.5">{family.emoji}</span>
                    {family.label}
                  </span>
                  <span className="text-muted-foreground/60">{family.hits}</span>
                </div>
                <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-gradient-to-r from-primary/60 to-primary rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${pct}%` }}
                    transition={{ delay: 0.15, type: 'spring', stiffness: 180 }}
                  />
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-5 bg-primary/[0.07] border border-primary/20 rounded-2xl p-4">
          <p className="text-[11px] uppercase tracking-widest text-primary font-bold mb-2">AI наблюдение</p>
          <p className="text-[13px] leading-relaxed text-muted-foreground">
            {dominantTaste
              ? `Сейчас чаще всего проявляется семья "${dominantTaste.label}". На следующих дегустациях попробуй специально искать слабые зоны, например цветы, чайность или специи.`
              : 'Добавляй дескрипторы в дегустации, и CoffeeMind начнет собирать твою персональную карту вкуса.'}
          </p>
        </div>
      </div>

      {/* ── Streak ──────────────────────────────────────────────────────── */}
      <div className="bg-card/60 border border-white/[0.06] rounded-[24px] p-5 mb-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-orange-950/60 border border-orange-800/30 flex items-center justify-center">
            <Flame size={18} className="text-orange-400 fill-orange-400" />
          </div>
          <div>
            <p className="font-medium text-foreground text-[15px]">Daily Streak</p>
            <p className="text-[11px] text-muted-foreground/60">
              {streak > 0 ? 'Keep it going!' : 'Log today to start a streak'}
            </p>
          </div>
        </div>
        <div className="text-right">
          <span className="font-serif text-3xl text-orange-400">{streak}</span>
          <p className="text-[9px] text-muted-foreground/50 uppercase tracking-wide font-semibold">days</p>
        </div>
      </div>

      {/* ── Q-Grader progress ──────────────────────────────────────────── */}
      <div className="bg-card/60 border border-white/[0.06] rounded-[24px] p-5 mb-4">
        <div className="flex items-center justify-between mb-3">
          <div>
            <p className="text-[10px] uppercase tracking-widest font-semibold text-muted-foreground/50">
              Q-Grader Journey
            </p>
            <p className="text-[13px] text-foreground mt-1">
              {count} of 100 reference tastings
            </p>
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

      {/* ── Favorite coffee ─────────────────────────────────────────────── */}
      {favTasting && (
        <div className="bg-card/60 border border-white/[0.06] rounded-[24px] p-5 mb-4 relative overflow-hidden">
          <div className="absolute top-3 right-4 text-5xl opacity-8">🏆</div>
          <p className="text-[10px] uppercase tracking-widest font-semibold text-muted-foreground/50 mb-3">
            Highest Rated
          </p>
          <h3 className="font-serif text-xl font-medium text-foreground">{favTasting.coffeeName}</h3>
          {favTasting.roaster && (
            <p className="text-[13px] text-muted-foreground mt-0.5">{favTasting.roaster}</p>
          )}
          <div className="flex items-end gap-2 mt-3">
            <span className="font-serif text-3xl text-primary leading-none">{favTasting.overallScore}</span>
            <span className="text-[10px] text-muted-foreground/50 uppercase tracking-widest mb-0.5">pts</span>
          </div>
        </div>
      )}

      {/* ── Achievements ────────────────────────────────────────────────── */}
      <div>
        <p className="text-[10px] uppercase tracking-widest font-semibold text-muted-foreground/50 mb-3">
          Achievements
          {unlocked.length > 0 && (
            <span className="ml-2 text-primary">{unlocked.length}/{ACHIEVEMENTS.length}</span>
          )}
        </p>
        <div className="grid grid-cols-4 gap-2.5">
          {ACHIEVEMENTS.map((a) => {
            const isUnlocked = a.check(tastings);
            return (
              <motion.div
                key={a.id}
                whileTap={isUnlocked ? { scale: 0.95 } : undefined}
                className={`flex flex-col items-center gap-1.5 p-3 rounded-2xl border text-center ${
                  isUnlocked
                    ? 'bg-card/80 border-white/[0.08]'
                    : 'bg-card/20 border-white/[0.03] opacity-35'
                }`}
              >
                <span className="text-2xl">{a.icon}</span>
                <span className="text-[9px] font-semibold text-foreground/80 leading-tight">{a.title}</span>
              </motion.div>
            );
          })}
        </div>
      </div>

      <div className="mt-10 text-center">
        <p className="text-[10px] text-muted-foreground/25 font-medium tracking-widest uppercase">
          CoffeeMind AI · v1.3
        </p>
      </div>
    </div>
  );
}
