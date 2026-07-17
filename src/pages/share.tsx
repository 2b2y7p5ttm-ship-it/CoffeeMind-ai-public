import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import {
  BookOpen,
  Check,
  ChevronLeft,
  Cloud,
  Coffee,
  Copy,
  Database,
  ExternalLink,
  Link as LinkIcon,
  Share2,
  Smartphone,
  Users,
} from 'lucide-react';
import { useLocation } from 'wouter';
import { useSystemCopy } from '@/lib/systemI18n';

function getPublicUrl() {
  return window.location.origin + window.location.pathname.replace(/\/?$/, '/');
}

function InfoCard({ icon: Icon, title, text }: { icon: React.ElementType; title: string; text: string }) {
  return (
    <div className="rounded-[24px] bg-card/65 border border-white/[0.07] p-4 flex gap-3">
      <div className="w-10 h-10 rounded-full bg-primary/10 border border-primary/20 text-primary flex items-center justify-center flex-shrink-0">
        <Icon size={18} />
      </div>
      <div>
        <h3 className="text-[15px] font-semibold text-foreground mb-1">{title}</h3>
        <p className="text-[13px] text-muted-foreground leading-relaxed">{text}</p>
      </div>
    </div>
  );
}

export default function ShareApp() {
  const [, setLocation] = useLocation();
  const { copy } = useSystemCopy();
  const c = copy.share;
  const [copied, setCopied] = useState(false);
  const publicUrl = useMemo(() => getPublicUrl(), []);
  const cardIcons = [Users, Coffee, BookOpen, Cloud, Smartphone, Database];

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(publicUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      setCopied(false);
    }
  };

  const nativeShare = async () => {
    if (!navigator.share) {
      await copyLink();
      return;
    }

    try {
      await navigator.share({
        title: 'CoffeeMind AI',
        text: c.nativeText,
        url: publicUrl,
      });
    } catch {
      // The user closed the native share sheet.
    }
  };

  return (
    <div className="min-h-full bg-background pb-10">
      <header className="px-4 iphone-safe-top pb-5">
        <button
          onClick={() => setLocation('/')}
          className="w-10 h-10 mb-5 rounded-full bg-card/60 border border-white/[0.08] flex items-center justify-center text-muted-foreground"
          aria-label={c.back}
        >
          <ChevronLeft size={20} />
        </button>

        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
          <div className="inline-flex items-center gap-2 bg-primary/10 text-primary border border-primary/20 rounded-full px-3 py-1.5 mb-4">
            <Share2 size={14} />
            <span className="text-[10px] uppercase tracking-widest font-bold">{c.badge}</span>
          </div>
          <h1 className="font-serif text-[2.45rem] leading-[0.95] text-foreground mb-3">{c.title}</h1>
          <p className="text-muted-foreground text-[14px] leading-relaxed">{c.subtitle}</p>
        </motion.div>
      </header>

      <main className="px-4 space-y-4">
        <section className="rounded-[30px] bg-primary/[0.085] border border-primary/20 p-5">
          <div className="flex items-start gap-3 mb-4">
            <div className="w-11 h-11 rounded-full bg-primary/10 border border-primary/20 text-primary flex items-center justify-center flex-shrink-0">
              <LinkIcon size={19} />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-[10px] uppercase tracking-widest text-primary font-bold mb-2">{c.publicLink}</p>
              <p className="text-[13px] text-foreground/90 leading-relaxed break-all">{publicUrl}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <button onClick={copyLink} className="h-12 rounded-full bg-primary text-primary-foreground text-[13px] font-bold flex items-center justify-center gap-2">
              {copied ? <Check size={16} /> : <Copy size={16} />}
              {copied ? c.copied : c.copy}
            </button>
            <button onClick={nativeShare} className="h-12 rounded-full bg-white/[0.06] border border-white/[0.08] text-foreground text-[13px] font-semibold flex items-center justify-center gap-2">
              <ExternalLink size={16} />
              {c.share}
            </button>
          </div>
        </section>

        {c.cards.map((card, index) => (
          <InfoCard
            key={card.title}
            icon={cardIcons[index]}
            title={card.title}
            text={card.text}
          />
        ))}
      </main>
    </div>
  );
}
