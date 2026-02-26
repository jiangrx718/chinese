import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import '../styles/BookDetail.css';

interface Book {
  book_id: string;
  title: string;
  icon: string;
}

const BookDetail: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [book, setBook] = useState<Book | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 移除父容器的 margin 和 padding
    const appContent = document.querySelector('.app-content');
    if (appContent) {
      (appContent as HTMLElement).style.margin = '0';
      (appContent as HTMLElement).style.padding = '0';
      (appContent as HTMLElement).style.background = 'transparent';
      (appContent as HTMLElement).style.maxWidth = 'none';
      (appContent as HTMLElement).style.minHeight = '100vh';
      (appContent as HTMLElement).style.borderRadius = '0';
      (appContent as HTMLElement).style.boxShadow = 'none';
    }

    // 组件卸载时恢复样式
    return () => {
      if (appContent) {
        (appContent as HTMLElement).style.margin = '';
        (appContent as HTMLElement).style.padding = '';
        (appContent as HTMLElement).style.background = '';
        (appContent as HTMLElement).style.maxWidth = '';
        (appContent as HTMLElement).style.minHeight = '';
        (appContent as HTMLElement).style.borderRadius = '';
        (appContent as HTMLElement).style.boxShadow = '';
      }
    };
  }, []);

  useEffect(() => {
    if (!id) return;
    fetchBookDetail(decodeURIComponent(id));
  }, [id]);

  const fetchBookDetail = async (bookId: string) => {
    setLoading(true);
    try {
      // 如果有专门的详情接口，可以在这里调用
      // 目前从 localStorage 或之前的列表中获取
      const cachedBooks = sessionStorage.getItem('booksList');
      if (cachedBooks) {
        const books = JSON.parse(cachedBooks) as Book[];
        const foundBook = books.find((b) => b.book_id === bookId);
        if (foundBook) {
          setBook(foundBook);
          setLoading(false);
          return;
        }
      }

      // 如果缓存中没有，重新获取当前页面的书籍列表
      // 这里可以根据需要调用专门的详情接口
      setLoading(false);
    } catch (error) {
      console.error('Failed to fetch book detail:', error);
      setLoading(false);
    }
  };

  const handlePlay = () => {
    if (!id) return;
    navigate(`/reader/${encodeURIComponent(id)}`);
  };

  const handleBack = () => {
    navigate(-1);
  };

  if (loading) {
    return (
      <div className="bookdetail-root">
        <div className="bookdetail-loading">加载中...</div>
      </div>
    );
  }

  if (!book) {
    return (
      <div className="bookdetail-root">
        <div className="bookdetail-empty">未找到书籍信息</div>
      </div>
    );
  }

  return (
    <div className="bookdetail-root">
      <button className="bookdetail-back" onClick={handleBack}>
        返回
      </button>

      <div className="bookdetail-container">
        <div className="bookdetail-cover-wrapper">
          <img
            src={book.icon}
            alt={book.title}
            className="bookdetail-cover"
          />
        </div>

        <div className="bookdetail-info">
          <h1 className="bookdetail-title">{book.title}</h1>
        </div>

        <button className="bookdetail-play-btn" onClick={handlePlay}>
          开始阅读
        </button>
      </div>
    </div>
  );
};

export default BookDetail;
