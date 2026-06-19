'use client';

import { useState, useEffect } from 'react';
import { BibleBook } from '@/lib/bible';

interface BookBrowserModalProps {
  isOpen: boolean;
  onClose: () => void;
  books: BibleBook[];
  /** Currently selected book, used to highlight it when reopening */
  selectedBookId: string;
  /** Called with the chosen book + chapter; the modal closes afterward */
  onSelect: (bookId: string, chapter: number) => void;
}

export default function BookBrowserModal({
  isOpen,
  onClose,
  books,
  selectedBookId,
  onSelect,
}: BookBrowserModalProps) {
  // The book whose chapters are being shown. null = show the book list.
  const [browseBook, setBrowseBook] = useState<BibleBook | null>(null);

  // Reset to the book list each time the modal opens
  useEffect(() => {
    if (isOpen) setBrowseBook(null);
  }, [isOpen]);

  // Close on Escape
  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (browseBook) setBrowseBook(null);
        else onClose();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isOpen, browseBook, onClose]);

  if (!isOpen) return null;

  // First 39 books are the Old Testament, the rest are the New Testament
  const oldTestament = books.slice(0, 39);
  const newTestament = books.slice(39);

  const renderBookGroup = (title: string, group: BibleBook[]) => (
    <div className="mb-4">
      <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
        {title}
      </h3>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-1.5">
        {group.map((book) => (
          <button
            key={book.id}
            onClick={() => setBrowseBook(book)}
            className={`px-2 py-2 rounded text-sm text-left transition ${
              book.id === selectedBookId
                ? 'bg-blue-500 text-white hover:bg-blue-600'
                : 'bg-gray-100 text-gray-800 hover:bg-blue-100'
            }`}
          >
            <span className="block font-medium leading-tight">{book.name}</span>
            {book.nameChinese && (
              <span className="block text-xs opacity-75 leading-tight">{book.nameChinese}</span>
            )}
          </button>
        ))}
      </div>
    </div>
  );

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-lg shadow-2xl w-[92vw] max-w-4xl h-[85vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-300 bg-gray-50">
          <div className="flex items-center gap-2 min-w-0">
            {browseBook && (
              <button
                onClick={() => setBrowseBook(null)}
                className="text-blue-600 hover:text-blue-800 text-sm font-medium whitespace-nowrap"
              >
                ← Books
              </button>
            )}
            <h2 className="text-lg font-semibold text-gray-800 truncate">
              {browseBook
                ? `${browseBook.name} — Select Chapter`
                : 'Browse Books'}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-2xl leading-none px-2"
            aria-label="Close"
          >
            ×
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-4 py-3">
          {browseBook ? (
            // Chapter grid
            <div className="grid grid-cols-5 sm:grid-cols-8 md:grid-cols-10 gap-1.5">
              {Array.from({ length: browseBook.chapters }, (_, i) => i + 1).map((chapter) => (
                <button
                  key={chapter}
                  onClick={() => {
                    onSelect(browseBook.id, chapter);
                    onClose();
                  }}
                  className="aspect-square flex items-center justify-center rounded text-sm font-medium bg-gray-100 text-gray-800 hover:bg-blue-500 hover:text-white transition"
                >
                  {chapter}
                </button>
              ))}
            </div>
          ) : (
            // Book list
            <>
              {renderBookGroup('Old Testament', oldTestament)}
              {renderBookGroup('New Testament', newTestament)}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
