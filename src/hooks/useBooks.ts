import { useLocalStorage } from './useLocalStorage';

export type ReadingStatus = 'want' | 'reading' | 'finished';

export interface BookRating {
  id: string;
  createdAt: string;
  updatedAt?: string;
  title: string;
  author: string;
  status: ReadingStatus;
  rating: number;
  mood: string;
  quote: string;
  notes: string;
  pairedCoffeeId?: string;
  pairedCoffeeName?: string;
  favorite?: boolean;
}

export type BookDraft = Omit<BookRating, 'id' | 'createdAt'>;

function createBookId(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }

  return `book-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

export const emptyBookDraft: BookDraft = {
  title: '',
  author: '',
  status: 'finished',
  rating: 8,
  mood: '',
  quote: '',
  notes: '',
  pairedCoffeeId: '',
  pairedCoffeeName: '',
  favorite: false,
};

export function useBooks() {
  const [books, setBooks] = useLocalStorage<BookRating[]>('coffeemind_book_ratings', []);

  const addBook = (draft: BookDraft) => {
    const book: BookRating = {
      ...draft,
      id: createBookId(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setBooks((prev) => [book, ...prev]);
    return book;
  };

  const updateBook = (id: string, patch: Partial<BookRating>) => {
    setBooks((prev) => prev.map((book) => (book.id === id ? { ...book, ...patch, updatedAt: new Date().toISOString() } : book)));
  };

  const deleteBook = (id: string) => {
    setBooks((prev) => prev.filter((book) => book.id !== id));
  };

  return { books, addBook, updateBook, deleteBook };
}
