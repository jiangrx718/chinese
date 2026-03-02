import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/BookList.css';
import { apiFetch } from '../utils/http';
import { API_BASE_URL } from '../config';

const PAGE_SIZE = 15;

interface Category {
  category_id: string;
  name: string;
}

interface Book {
  book_id: string;
  title: string;
  icon: string;
}

interface ApiResponse<T> {
  code: number;
  msg: string;
  data: T;
}

const BookList: React.FC = () => {
  const navigate = useNavigate();
  const [categories, setCategories] = useState<Category[]>([]);
  const [books, setBooks] = useState<Book[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [page, setPage] = useState(1);
  const [filter, setFilter] = useState<string | 'all'>('all');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    fetchBooks();
  }, [filter, page]);

  const fetchCategories = async () => {
    try {
      const res = await apiFetch(`${API_BASE_URL}/api/book/category`, {
        method: 'GET',
        params: { type: 'chinese' },
        sign: true,
      });
      const data: ApiResponse<{ count: number; list: Category[] }> = await res.json();
      if (data.code === 0) {
        setCategories(data.data.list);
      }
    } catch (error) {
      console.error('Failed to fetch categories:', error);
    }
  };

  const fetchBooks = async () => {
    setLoading(true);
    try {
      const offset = (page - 1) * PAGE_SIZE;
      const params: Record<string, string | number | boolean> = { limit: PAGE_SIZE, offset };
      if (filter !== 'all') {
        params.category_id = filter;
      }
      const res = await apiFetch(`${API_BASE_URL}/api/picture/list`, {
        method: 'GET',
        params,
      });
      const data: ApiResponse<{ count: number; list: Book[] }> = await res.json();
      if (data.code === 0) {
        setBooks(data.data.list);
        setTotalCount(data.data.count);
        sessionStorage.setItem('booksList', JSON.stringify(data.data.list));
      }
    } catch (error) {
      console.error('Failed to fetch books:', error);
    } finally {
      setLoading(false);
    }
  };

  const onClickBook = (id: string) => {
    navigate(`/book/${encodeURIComponent(id)}`);
  };

  const goPage = (p: number) => {
    const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE));
    if (p < 1) return;
    if (p > totalPages) return;
    setPage(p);
  };

  const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE));

  const handleFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    if (value === 'all') {
      setFilter('all');
    } else {
      setFilter(value);
    }
    setPage(1);
  };

  return (
    <div className="booklist-root">
      <div className="booklist-header">
        <h2>中文绘本馆</h2>
        <div className="booklist-actions">
          <select value={filter} onChange={handleFilterChange}>
            <option value="all">全部</option>
            {categories.map((c) => (
              <option key={c.category_id} value={c.category_id}>{c.name}</option>
            ))}
          </select>
        </div>
      </div>

      {loading ? (
        <div className="booklist-loading">加载中...</div>
      ) : (
        <>
          <div className="booklist-grid">
            {books.map((b) => (
              <div className="book-card" key={b.book_id}>
                <div className="book-cover" style={{backgroundImage: `url(${b.icon})`}} onClick={() => onClickBook(b.book_id)} />
                <div className="book-title" onClick={() => onClickBook(b.book_id)}>{b.title}</div>
              </div>
            ))}
          </div>

          <div className="booklist-pager">
            <button onClick={()=>goPage(page-1)} disabled={page<=1}>上一页</button>
            <span>{page} / {totalPages}</span>
            <button onClick={()=>goPage(page+1)} disabled={page>=totalPages}>下一页</button>
          </div>
        </>
      )}
    </div>
  );
};

export default BookList;
