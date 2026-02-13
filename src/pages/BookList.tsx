import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getBooks } from '../utils/bookData';
import '../styles/BookList.css';

const PAGE_SIZE = 15;

const BookList: React.FC = () => {
  const navigate = useNavigate();
  const books = useMemo(() => getBooks(), []);
  const [page, setPage] = useState(1);
  const [filter, setFilter] = useState('all');

  const categories = useMemo(() => {
    const set = new Set<string>();
    books.forEach((b) => { if (b.category) set.add(b.category); });
    return ['全部', ...Array.from(set).sort((a,b)=>a.localeCompare(b, undefined, {numeric:true}))];
  }, [books]);

  const filtered = books.filter((b) => filter === 'all' || b.category === filter);
  const total = filtered.length;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  const current = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const onClickBook = (id: string) => {
    navigate(`/book/${encodeURIComponent(id)}`);
  };

  const goPage = (p: number) => {
    if (p < 1) p = 1;
    if (p > totalPages) p = totalPages;
    setPage(p);
    // switch to first page when filter changes handled elsewhere
  };

  return (
    <div className="booklist-root">
      <div className="booklist-header">
        <h2>绘本馆</h2>
        <div className="booklist-actions">
          <select value={filter} onChange={(e)=>{ setFilter(e.target.value); setPage(1); }}>
            {categories.map((c) => (
              <option key={c} value={c === '全部' ? 'all' : c}>{c}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="booklist-grid">
        {current.map((b) => (
          <div className="book-card" key={b.id}>
            <div className="book-cover" style={{backgroundImage: `url(${b.cover})`}} onClick={() => onClickBook(b.id)} />
            <div className="book-title" onClick={() => onClickBook(b.id)}>{b.title}</div>
          </div>
        ))}
      </div>

      <div className="booklist-pager">
        <button onClick={()=>goPage(page-1)} disabled={page<=1}>上一页</button>
        <span>{page} / {totalPages}</span>
        <button onClick={()=>goPage(page+1)} disabled={page>=totalPages}>下一页</button>
      </div>
    </div>
  );
};

export default BookList;
