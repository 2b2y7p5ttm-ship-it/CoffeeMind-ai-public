import { useMemo, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowDownToLine, ArrowUpFromLine, CheckCircle2, ChevronLeft, Copy, Database, FileJson, RefreshCcw, ShieldCheck, UploadCloud } from 'lucide-react';
import { useLocation } from 'wouter';
import { useTastings } from '@/hooks/useTastings';
import { useProfile } from '@/hooks/useProfile';
import { useBooks } from '@/hooks/useBooks';

const BACKUP_VERSION = '2.2';
const TASTINGS_KEY = 'coffee_journal_tastings';
const PROFILE_KEY = 'coffee_journal_profile';
const BOOKS_KEY = 'coffeemind_book_ratings';

interface BackupPayload {
  app: 'CoffeeMind AI';
  version: string;
  exportedAt: string;
  deviceNote: string;
  data: {
    tastings: unknown[];
    profile: unknown;
    books: unknown[];
  };
}

function downloadJson(payload: BackupPayload) {
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `coffeemind-backup-${new Date().toISOString().slice(0, 10)}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

function readJsonFile(file: File): Promise<BackupPayload> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const parsed = JSON.parse(String(reader.result));
        if (!parsed?.data || !Array.isArray(parsed.data.tastings)) {
          reject(new Error('Файл не похож на резервную копию CoffeeMind.'));
          return;
        }
        resolve(parsed as BackupPayload);
      } catch {
        reject(new Error('Не удалось прочитать JSON-файл.'));
      }
    };
    reader.onerror = () => reject(new Error('Не удалось открыть файл.'));
    reader.readAsText(file);
  });
}

function formatDate(value: string) {
  try {
    return new Intl.DateTimeFormat('ru-RU', {
      day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit',
    }).format(new Date(value));
  } catch {
    return value;
  }
}

export default function Backup() {
  const [, setLocation] = useLocation();
  const { tastings } = useTastings();
  const { profile } = useProfile();
  const { books } = useBooks();
  const fileRef = useRef<HTMLInputElement>(null);
  const [status, setStatus] = useState<string>('');
  const [importPreview, setImportPreview] = useState<BackupPayload | null>(null);

  const payload = useMemo<BackupPayload>(() => ({
    app: 'CoffeeMind AI',
    version: BACKUP_VERSION,
    exportedAt: new Date().toISOString(),
    deviceNote: 'Данные экспортированы из localStorage этого устройства.',
    data: {
      tastings,
      profile,
      books,
    },
  }), [tastings, profile, books]);

  const summary = [
    { label: 'дегустаций', value: tastings.length },
    { label: 'книг', value: books.length },
    { label: 'профиль', value: profile.name || '—' },
  ];

  const handleExport = async () => {
    downloadJson(payload);
    setStatus('Резервная копия создана. Сохрани JSON в iCloud Drive или Файлы.');
  };

  const handleCopySummary = async () => {
    const text = [
      'CoffeeMind AI backup summary',
      `Tastings: ${tastings.length}`,
      `Books: ${books.length}`,
      `Profile: ${profile.name}`,
      `Exported: ${payload.exportedAt}`,
    ].join('\n');
    try {
      await navigator.clipboard.writeText(text);
      setStatus('Сводка скопирована.');
    } catch {
      setStatus('Не удалось скопировать сводку в этом браузере.');
    }
  };

  const handleFile = async (file?: File) => {
    if (!file) return;
    try {
      const parsed = await readJsonFile(file);
      setImportPreview(parsed);
      setStatus('Файл прочитан. Проверь данные и нажми “Восстановить”.');
    } catch (error) {
      setImportPreview(null);
      setStatus(error instanceof Error ? error.message : 'Ошибка импорта.');
    }
  };

  const restoreBackup = () => {
    if (!importPreview) return;
    localStorage.setItem(TASTINGS_KEY, JSON.stringify(importPreview.data.tastings || []));
    localStorage.setItem(PROFILE_KEY, JSON.stringify(importPreview.data.profile || profile));
    localStorage.setItem(BOOKS_KEY, JSON.stringify(importPreview.data.books || []));
    setStatus('Данные восстановлены. Приложение обновится сейчас.');
    setTimeout(() => window.location.assign('/'), 500);
  };

  return (
    <div className="min-h-full bg-background pb-10">
      <header className="px-4 iphone-safe-top pb-5">
        <button
          onClick={() => setLocation('/settings')}
          className="w-10 h-10 mb-5 rounded-full bg-card/60 border border-white/[0.08] flex items-center justify-center text-muted-foreground"
          aria-label="Назад"
        >
          <ChevronLeft size={20} />
        </button>

        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <div className="inline-flex items-center gap-2 bg-primary/10 text-primary border border-primary/20 rounded-full px-3 py-1.5 mb-4">
            <ShieldCheck size={14} />
            <span className="text-[10px] uppercase tracking-widest font-bold">Data Vault</span>
          </div>
          <h1 className="font-serif text-[2.25rem] leading-[0.95] text-foreground mb-3">Резервная копия вкуса</h1>
          <p className="text-muted-foreground text-[14px] leading-relaxed">
            CoffeeMind хранит данные на устройстве. Перед реальными дегустациями сделай backup, чтобы не потерять журнал, Taste DNA и книжные оценки.
          </p>
        </motion.div>
      </header>

      <main className="px-4 space-y-4">
        <section className="rounded-[28px] bg-card/70 border border-white/[0.07] p-5">
          <p className="text-[10px] uppercase tracking-widest text-muted-foreground/50 font-bold mb-4">Внутри backup</p>
          <div className="grid grid-cols-3 gap-3">
            {summary.map((item) => (
              <div key={item.label} className="rounded-[20px] bg-background/60 border border-white/[0.06] p-4 min-h-[86px] flex flex-col justify-between">
                <span className="font-serif text-[1.45rem] text-primary leading-none break-words">{item.value}</span>
                <span className="text-[10px] uppercase tracking-widest text-muted-foreground/45 font-bold">{item.label}</span>
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-[28px] bg-primary/[0.08] border border-primary/20 p-5 space-y-3">
          <div className="flex items-start gap-3 mb-2">
            <div className="w-11 h-11 rounded-full bg-primary/10 border border-primary/20 text-primary flex items-center justify-center flex-shrink-0">
              <ArrowDownToLine size={20} />
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-widest text-primary font-bold mb-2">Экспорт</p>
              <p className="text-[14px] text-foreground leading-relaxed">Скачай JSON-файл и сохрани его в iCloud Drive, Файлы или Telegram “Избранное”.</p>
            </div>
          </div>
          <button onClick={handleExport} className="w-full h-12 rounded-full bg-primary text-primary-foreground text-[13px] font-semibold flex items-center justify-center gap-2">
            <FileJson size={16} />
            Скачать резервную копию
          </button>
          <button onClick={handleCopySummary} className="w-full h-11 rounded-full bg-white/[0.06] border border-white/[0.08] text-foreground text-[13px] font-semibold flex items-center justify-center gap-2">
            <Copy size={15} />
            Скопировать сводку
          </button>
        </section>

        <section className="rounded-[28px] bg-card/70 border border-white/[0.07] p-5 space-y-3">
          <div className="flex items-start gap-3 mb-2">
            <div className="w-11 h-11 rounded-full bg-white/[0.06] border border-white/[0.08] text-primary flex items-center justify-center flex-shrink-0">
              <ArrowUpFromLine size={20} />
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-widest text-primary font-bold mb-2">Импорт</p>
              <p className="text-[14px] text-muted-foreground leading-relaxed">Восстанови журнал из JSON-файла CoffeeMind. Текущие данные будут заменены.</p>
            </div>
          </div>

          <input
            ref={fileRef}
            type="file"
            accept="application/json,.json"
            className="hidden"
            onChange={(event) => handleFile(event.target.files?.[0])}
          />
          <button onClick={() => fileRef.current?.click()} className="w-full h-12 rounded-full bg-white/[0.06] border border-white/[0.08] text-foreground text-[13px] font-semibold flex items-center justify-center gap-2">
            <UploadCloud size={16} />
            Выбрать JSON-файл
          </button>

          {importPreview && (
            <div className="rounded-[22px] bg-background/65 border border-white/[0.06] p-4 space-y-3">
              <div className="flex items-start gap-3">
                <CheckCircle2 size={18} className="text-emerald-300 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-[13px] font-semibold text-foreground">Файл готов к восстановлению</p>
                  <p className="text-[12px] text-muted-foreground mt-1 leading-relaxed">
                    {importPreview.data.tastings?.length || 0} дегустаций · {importPreview.data.books?.length || 0} книг · экспорт: {formatDate(importPreview.exportedAt)}
                  </p>
                </div>
              </div>
              <button onClick={restoreBackup} className="w-full h-11 rounded-full bg-primary text-primary-foreground text-[13px] font-semibold flex items-center justify-center gap-2">
                <RefreshCcw size={15} />
                Восстановить данные
              </button>
            </div>
          )}
        </section>

        <section className="rounded-[28px] bg-card/40 border border-white/[0.05] p-5 flex gap-3">
          <Database size={18} className="text-primary flex-shrink-0 mt-0.5" />
          <p className="text-[12px] text-muted-foreground leading-relaxed">
            В этой версии backup работает локально. Полная облачная синхронизация с аккаунтом — следующий большой этап после стабильного iPhone-приложения.
          </p>
        </section>

        {status && (
          <p className="text-[12px] text-primary/90 text-center leading-relaxed px-5">{status}</p>
        )}
      </main>
    </div>
  );
}
