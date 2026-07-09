import { useLocalStorage } from './useLocalStorage';

export type ReadingStatus = 'want' | 'reading' | 'finished';

export interface BookRating {
  id: string;
  createdAt: string;
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
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
    };
    setBooks((prev) => [book, ...prev]);
    return book;
  };

  const updateBook = (id: string, patch: Partial<BookRating>) => {
    setBooks((prev) => prev.map((book) => (book.id === id ? { ...book, ...patch } : book)));
  };

  const deleteBook = (id: string) => {
    setBooks((prev) => prev.filter((book) => book.id !== id));
  };

  return { books, addBook, updateBook, deleteBook };
}
