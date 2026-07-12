import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { BookOpen, ChevronLeft, Coffee, Library, Pencil, Plus, Save, Star, Trash2, Users } from 'lucide-react';
import { useLocation } from 'wouter';
import { emptyBookDraft, BookDraft, BookRating, ReadingStatus, useBooks } from '@/hooks/useBooks';
import { useTastings } from '@/hooks/useTastings';

function statusLabel(status: ReadingStatus) {
  switch (status) {
    case 'want': return 'Хочу прочитать';
    case 'reading': return 'Читаю';
    case 'finished': return 'Прочитано';
  }
}

function formatDate(value: string) {
  try {
    return new Intl.DateTimeFormat('ru-RU', { day: 'numeric', month: 'short' }).format(new Date(value));
  } catch {
    return value;
  }
}

export default function Books() {
  const [, setLocation] = useLocation();
  const { books, addBook, updateBook, deleteBook } = useBooks();
  const { tastings } = useTastings();
  const [draft, setDraft] = useState<BookDraft>(emptyBookDraft);
  const [showForm, setShowForm] = useState(false);
  const [editingBookId, setEditingBookId] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState('');

  const average = useMemo(() => {
    if (!books.length) return '—';
    return (books.reduce((sum, book) => sum + book.rating, 0) / books.length).toFixed(1);
  }, [books]);

  const canSave = draft.title.trim().length > 1;

  const save = () => {
    if (!canSave || isSaving) return;

    setIsSaving(true);
    setSaveError('');

    try {
      if (editingBookId) {
        updateBook(editingBookId, draft);
      } else {
        addBook(draft);
      }
      setDraft(emptyBookDraft);
      setEditingBookId(null);
      setShowForm(false);
    } catch (error) {
      console.error('Failed to save book:', error);
      setSaveError('Не удалось сохранить книгу. Попробуй ещё раз.');
    } finally {
      setIsSaving(false);
    }
  };

  const chooseCoffee = (id: string) => {
    const tasting = tastings.find((item) => item.id === id);
    setDraft({
      ...draft,
      pairedCoffeeId: id,
      pairedCoffeeName: tasting?.coffeeName || '',
    });
  };

  const startAdd = () => {
    setDraft(emptyBookDraft);
    setEditingBookId(null);
    setSaveError('');
    setShowForm(true);
  };

  const startEdit = (book: BookRating) => {
    const { id: _id, createdAt: _createdAt, ...editable } = book;
    setDraft({ ...emptyBookDraft, ...editable });
    setEditingBookId(book.id);
    setSaveError('');
    setShowForm(true);
    window.setTimeout(() => window.scrollTo({ top: 0, behavior: 'smooth' }), 0);
  };

  const cancelForm = () => {
    setDraft(emptyBookDraft);
    setEditingBookId(null);
    setSaveError('');
    setShowForm(false);
  };

  return (
    <div className="min-h-full bg-background pb-28">
      <header className="px-4 iphone-safe-top pb-5">
        <button
          onClick={() => setLocation('/')}
          className="w-10 h-10 mb-5 rounded-full bg-card/60 border border-white/[0.08] flex items-center justify-center text-muted-foreground"
          aria-label="Назад"
        >
          <ChevronLeft size={20} />
        </button>

        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <div className="inline-flex items-center gap-2 bg-primary/10 text-primary border border-primary/20 rounded-full px-3 py-1.5 mb-4">
            <BookOpen size={14} />
            <span className="text-[10px] uppercase tracking-widest font-bold">Book Ratings</span>
          </div>
          <h1 className="font-serif text-[2.35rem] leading-[0.95] text-foreground mb-3">Книжный журнал</h1>
          <p className="text-muted-foreground text-[14px] leading-relaxed">
            Оценивай книги, фиксируй настроение и связывай чтение с кофе. Без сценариев к роликам — только личный журнал вкуса и чтения.
          </p>
        </motion.div>
      </header>

      <main className="px-4 space-y-4">
        <section className="grid grid-cols-3 gap-3">
          <Metric label="книг" value={books.length} />
          <Metric label="средний балл" value={average} />
          <Metric label="с кофе" value={books.filter((book) => book.pairedCoffeeName).length} />
        </section>

        <section className="rounded-[26px] bg-primary/[0.08] border border-primary/20 p-5">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-full bg-primary/10 border border-primary/20 text-primary flex items-center justify-center flex-shrink-0">
              <Users size={18} />
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-widest text-primary font-bold mb-2">Для других пользователей</p>
              <p className="text-[14px] text-foreground leading-relaxed">
                Когда ты поделишься ссылкой, у каждого человека будет свой локальный журнал дегустаций и книг на его устройстве. Твои записи не смешиваются с чужими.
              </p>
            </div>
          </div>
        </section>

        {showForm ? (
          <section className="rounded-[28px] bg-card/70 border border-white/[0.07] p-5 space-y-4">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-[10px] uppercase tracking-widest text-primary font-bold">{editingBookId ? 'Редактирование' : 'Новая запись'}</p>
                <h2 className="font-serif text-[1.45rem] text-foreground mt-1">{editingBookId ? 'Изменить книгу' : 'Добавить книгу'}</h2>
              </div>
              {editingBookId && (
                <span className="text-[10px] uppercase tracking-widest text-muted-foreground/45">Изменения сохранятся в карточке</span>
              )}
            </div>
            <BookField label="Название" value={draft.title} placeholder="Человек недостойный" onChange={(title) => setDraft({ ...draft, title })} />
            <BookField label="Автор" value={draft.author} placeholder="Осаму Дадзай" onChange={(author) => setDraft({ ...draft, author })} />

            <label className="block">
              <span className="text-[10px] uppercase tracking-widest text-muted-foreground/45 font-bold mb-2 block">Статус</span>
              <div className="grid grid-cols-3 gap-2">
                {(['want', 'reading', 'finished'] as ReadingStatus[]).map((status) => (
                  <button
                    key={status}
                    onClick={() => setDraft({ ...draft, status })}
                    className={`h-11 rounded-full text-[11px] font-semibold border ${draft.status === status ? 'bg-primary text-primary-foreground border-primary' : 'bg-background/65 border-white/[0.08] text-muted-foreground'}`}
                  >
                    {statusLabel(status)}
                  </button>
                ))}
              </div>
            </label>

            <label className="block">
              <span className="text-[10px] uppercase tracking-widest text-muted-foreground/45 font-bold mb-2 flex justify-between">
                Оценка <b className="text-primary">{draft.rating}/10</b>
              </span>
              <input
                type="range"
                min={1}
                max={10}
                value={draft.rating}
                onChange={(e) => setDraft({ ...draft, rating: Number(e.target.value) })}
                className="w-full accent-primary"
              />
            </label>

            <BookField label="Настроение" value={draft.mood} placeholder="мрачное, исповедальное, хрупкое" onChange={(mood) => setDraft({ ...draft, mood })} />
            <BookField label="Цитата / мысль" value={draft.quote} placeholder="Короткая мысль, которая осталась после чтения" onChange={(quote) => setDraft({ ...draft, quote })} />

            {tastings.length > 0 && (
              <label className="block">
                <span className="text-[10px] uppercase tracking-widest text-muted-foreground/45 font-bold mb-2 block">Связать с кофе</span>
                <select
                  value={draft.pairedCoffeeId || ''}
                  onChange={(e) => chooseCoffee(e.target.value)}
                  className="h-12 w-full rounded-[18px] bg-background/70 border border-white/[0.08] px-4 text-[16px] outline-none focus:border-primary/50"
                >
                  <option value="">Не связывать</option>
                  {tastings.map((tasting) => (
                    <option key={tasting.id} value={tasting.id}>{tasting.coffeeName}</option>
                  ))}
                </select>
              </label>
            )}

            <label className="block">
              <span className="text-[10px] uppercase tracking-widest text-muted-foreground/45 font-bold mb-2 block">Заметки</span>
              <textarea
                value={draft.notes}
                onChange={(e) => setDraft({ ...draft, notes: e.target.value })}
                placeholder="Что осталось после книги? Какой кофе подошел бы к этому настроению?"
                className="min-h-[110px] w-full rounded-[20px] bg-background/70 border border-white/[0.08] px-4 py-3 text-[16px] outline-none focus:border-primary/50 resize-none"
              />
            </label>

            {saveError && (
              <p role="alert" className="text-[12px] text-red-400 text-center">{saveError}</p>
            )}

            <div className="grid grid-cols-2 gap-3">
              <button onClick={cancelForm} className="h-12 rounded-full bg-white/[0.06] border border-white/[0.08] text-foreground text-[13px] font-semibold">Отмена</button>
              <button onClick={save} disabled={!canSave || isSaving} className="h-12 rounded-full bg-primary disabled:bg-muted disabled:text-muted-foreground text-primary-foreground text-[13px] font-semibold flex items-center justify-center gap-2">
                <Save size={15} />
                {isSaving ? 'Сохраняем…' : editingBookId ? 'Сохранить изменения' : 'Сохранить'}
              </button>
            </div>
          </section>
        ) : (
          <button
            onClick={startAdd}
            className="w-full h-14 rounded-full bg-primary text-primary-foreground text-[14px] font-bold flex items-center justify-center gap-2 shadow-[0_16px_36px_rgba(217,163,95,0.28)]"
          >
            <Plus size={18} />
            Добавить книгу
          </button>
        )}

        <section className="space-y-3 pt-2">
          <div className="flex items-center justify-between">
            <p className="text-[10px] uppercase tracking-widest text-muted-foreground/50 font-bold">Книги · {books.length}</p>
            <Library size={15} className="text-primary/80" />
          </div>

          {books.length === 0 ? (
            <div className="rounded-[26px] bg-card/45 border border-white/[0.06] p-5 text-center">
              <p className="text-[14px] text-muted-foreground leading-relaxed">
                Добавь первую книгу. Позже здесь появится личная библиотека чтения и вкусовых пар.
              </p>
            </div>
          ) : (
            books.map((book) => (
              <BookCard
                key={book.id}
                book={book}
                onEdit={() => startEdit(book)}
                onDelete={() => {
                  if (window.confirm('Удалить эту книгу?')) deleteBook(book.id);
                }}
                onToggleFavorite={() => updateBook(book.id, { favorite: !book.favorite })}
              />
            ))
          )}
        </section>
      </main>
    </div>
  );
}

function Metric({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-[20px] bg-card/60 border border-white/[0.07] p-4 min-h-[88px] flex flex-col justify-between">
      <span className="font-serif text-[1.5rem] text-primary leading-none">{value}</span>
      <span className="text-[10px] uppercase tracking-widest text-muted-foreground/45 font-bold">{label}</span>
    </div>
  );
}

function BookField({ label, value, placeholder, onChange }: { label: string; value: string; placeholder?: string; onChange: (value: string) => void }) {
  return (
    <label className="block">
      <span className="text-[10px] uppercase tracking-widest text-muted-foreground/45 font-bold mb-2 block">{label}</span>
      <input
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className="h-12 w-full rounded-[18px] bg-background/70 border border-white/[0.08] px-4 text-[16px] outline-none focus:border-primary/50"
      />
    </label>
  );
}

function BookCard({ book, onEdit, onDelete, onToggleFavorite }: { book: BookRating; onEdit: () => void; onDelete: () => void; onToggleFavorite: () => void }) {
  return (
    <article className="rounded-[28px] bg-card/70 border border-white/[0.07] overflow-hidden">
      <div className="p-5">
        <div className="flex items-start justify-between gap-3 mb-4">
          <div>
            <p className="text-[10px] uppercase tracking-widest text-primary font-bold mb-1">{statusLabel(book.status)} · {formatDate(book.createdAt)}</p>
            <h3 className="font-serif text-[1.6rem] leading-tight text-foreground">{book.title}</h3>
            <p className="text-[13px] text-muted-foreground mt-1">{book.author || 'Автор не указан'}</p>
          </div>
          <button onClick={onToggleFavorite} className="w-10 h-10 rounded-full bg-background/60 border border-white/[0.08] flex items-center justify-center text-primary">
            <Star size={17} fill={book.favorite ? 'currentColor' : 'none'} />
          </button>
        </div>

        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="rounded-[18px] bg-background/60 border border-white/[0.06] p-3">
            <p className="text-[10px] uppercase tracking-widest text-muted-foreground/45 font-bold mb-1">Оценка</p>
            <p className="font-serif text-[1.7rem] text-primary leading-none">{book.rating}/10</p>
          </div>
          <div className="rounded-[18px] bg-background/60 border border-white/[0.06] p-3">
            <p className="text-[10px] uppercase tracking-widest text-muted-foreground/45 font-bold mb-1">Кофе</p>
            <p className="text-[13px] text-foreground line-clamp-2">{book.pairedCoffeeName || 'Не связан'}</p>
          </div>
        </div>

        {book.mood && <p className="text-[13px] text-primary/90 mb-3">Настроение: {book.mood}</p>}
        {book.quote && <p className="text-[13px] text-foreground/90 leading-relaxed italic mb-3">“{book.quote}”</p>}
        {book.notes && <p className="text-[13px] text-muted-foreground leading-relaxed">{book.notes}</p>}

        <div className="flex items-center justify-between mt-5 pt-4 border-t border-white/[0.06]">
          <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
            <Coffee size={14} className="text-primary/70" />
            Личный журнал
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={onEdit}
              className="w-9 h-9 rounded-full bg-primary/10 border border-primary/20 text-primary flex items-center justify-center"
              aria-label="Редактировать книгу"
            >
              <Pencil size={15} />
            </button>
            <button onClick={onDelete} className="w-9 h-9 rounded-full bg-red-950/35 border border-red-800/30 text-red-300 flex items-center justify-center" aria-label="Удалить книгу">
              <Trash2 size={15} />
            </button>
          </div>
        </div>
      </div>
    </article>
  );
}
