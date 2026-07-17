import { useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'wouter';
import { Edit2, Check, Settings, Star, Flame, Globe, Coffee, Brain } from 'lucide-react';
import { useProfile } from '@/hooks/useProfile';
import { useTastings, Tasting } from '@/hooks/useTastings';
import { Input } from '@/components/ui/input';
import { FLAVOR_WHEEL } from '@/lib/coffeeUtils';
import { fillSectionCopy, useSectionCopy } from '@/lib/sectionI18n';
import { canonicalizeCountry } from '@/lib/coffeeReferenceI18n';

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

type AchievementId = 'first' | 'five' | 'world' | 'high' | 'perfect' | 'method' | 'natural' | 'century';

const ACHIEVEMENTS: Array<{ id: AchievementId; icon: string; check: (tastings: Tasting[]) => boolean }> = [
  { id: 'first', icon: '☕', check: (tastings) => tastings.length >= 1 },
  { id: 'five', icon: '🌱', check: (tastings) => tastings.length >= 5 },
  { id: 'world', icon: '🌍', check: (tastings) => new Set(tastings.filter((item) => item.country).map((item) => canonicalizeCountry(item.country))).size >= 5 },
  { id: 'high', icon: '⭐', check: (tastings) => tastings.some((item) => item.overallScore >= 90) },
  { id: 'perfect', icon: '💎', check: (tastings) => tastings.some((item) => item.overallScore >= 95) },
  { id: 'method', icon: '⚗️', check: (tastings) => new Set(tastings.map(getBrewMethod).filter(Boolean)).size >= 4 },
  { id: 'natural', icon: '🫐', check: (tastings) => tastings.filter((item) => /natural|натурал/i.test(getProcessing(item))).length >= 3 },
  { id: 'century', icon: '💯', check: (tastings) => tastings.length >= 100 },
];

export default function Profile() {
  const { profile, setProfile } = useProfile();
  const { tastings } = useTastings();
  const { copy } = useSectionCopy();
  const profileCopy = copy.profile;
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(profile.name);

  const handleSave = () => {
    if (name.trim()) setProfile({ ...profile, name: name.trim() });
    else setName(profile.name);
    setIsEditing(false);
  };

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
  const unlocked = ACHIEVEMENTS.filter((achievement) => achievement.check(tastings));

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

      <div className="flex flex-col items-center mb-8">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="w-24 h-24 rounded-full flex items-center justify-center font-bold text-2xl text-primary-foreground shadow-[0_0_40px_rgba(217,163,95,0.2)] mb-4 relative"
          style={{ background: `radial-gradient(circle at 35% 35%, ${profile.avatarColor || '#D9A35F'}cc, ${profile.avatarColor || '#D9A35F'})` }}
        >
          {getInitials(profile.name)}
          <div className="absolute -bottom-1 -right-1 bg-card border border-white/10 rounded-full w-9 h-9 flex items-center justify-center text-lg shadow-lg">
            {level.emoji}
          </div>
        </motion.div>

        {isEditing ? (
          <div className="flex items-center gap-2 max-w-[240px]">
            <Input
              value={name}
              onChange={(event) => setName(event.target.value)}
              className="text-center font-serif text-xl h-10 bg-card border-border focus-visible:ring-primary"
              autoFocus
              onKeyDown={(event) => event.key === 'Enter' && handleSave()}
            />
            <button
              onClick={handleSave}
              aria-label={profileCopy.saveName}
              className="w-10 h-10 flex-shrink-0 bg-primary text-primary-foreground rounded-full flex items-center justify-center"
            >
              <Check size={16} />
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <h1 className="font-serif text-[1.9rem] font-medium text-foreground">{profile.name}</h1>
            <button
              onClick={() => setIsEditing(true)}
              aria-label={profileCopy.editName}
              className="text-muted-foreground hover:text-primary transition-colors p-1"
              data-testid="btn-edit-profile"
            >
              <Edit2 size={14} />
            </button>
          </div>
        )}

        <p className="text-muted-foreground text-[13px] mt-1 font-medium">{levelTitle}</p>
      </div>

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

      <div>
        <p className="text-[10px] uppercase tracking-widest font-semibold text-muted-foreground/50 mb-3">
          {profileCopy.achievements}
          {unlocked.length > 0 && <span className="ml-2 text-primary">{unlocked.length}/{ACHIEVEMENTS.length}</span>}
        </p>
        <div className="grid grid-cols-4 gap-2.5">
          {ACHIEVEMENTS.map((achievement) => {
            const isUnlocked = achievement.check(tastings);
            const achievementCopy = profileCopy.achievementsList[achievement.id];
            return (
              <motion.div
                key={achievement.id}
                title={achievementCopy.description}
                whileTap={isUnlocked ? { scale: 0.95 } : undefined}
                className={`flex flex-col items-center gap-1.5 p-3 rounded-2xl border text-center ${
                  isUnlocked
                    ? 'bg-card/80 border-white/[0.08]'
                    : 'bg-card/20 border-white/[0.03] opacity-35'
                }`}
              >
                <span className="text-2xl">{achievement.icon}</span>
                <span className="text-[9px] font-semibold text-foreground/80 leading-tight">{achievementCopy.title}</span>
              </motion.div>
            );
          })}
        </div>
      </div>

      <div className="mt-10 text-center">
        <p className="text-[10px] text-muted-foreground/25 font-medium tracking-widest uppercase">CoffeeMind AI · v1.3</p>
      </div>
    </div>
  );
}
