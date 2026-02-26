import React, { useEffect, useRef, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import '../styles/Reader.css';

interface BookPage {
  position: number;
  pic: string;
  mp3: string;
}

interface BookPagesResponse {
  code: number;
  msg: string;
  data: {
    count: number;
    list: BookPage[];
  };
}

const BookReader: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const bookId = id ? decodeURIComponent(id) : '';
  const [pages, setPages] = useState<BookPage[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [autoPlay, setAutoPlay] = useState(true);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const touchStartX = useRef<number | null>(null);

  useEffect(() => {
    if (bookId) {
      fetchBookPages(bookId);
    }
  }, [bookId]);

  const fetchBookPages = async (id: string) => {
    setLoading(true);
    try {
      const response = await fetch(`http://wechat.58haha.com/api/info/list?book_id=${id}`);
      const result: BookPagesResponse = await response.json();

      if (result.code === 0 && result.data.list) {
        setPages(result.data.list);
        setLoading(false);
      } else {
        console.error('Failed to fetch book pages:', result.msg);
        setLoading(false);
      }
    } catch (error) {
      console.error('Failed to fetch book pages:', error);
      setLoading(false);
    }
  };

  useEffect(() => {
    playFor(currentIndex);
    return () => {
      if (audioRef.current) {
        try {
          audioRef.current.onended = null;
          audioRef.current.pause();
        } catch (e) {}
        audioRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentIndex]);

  const playFor = (index: number) => {
    if (index < 0 || index >= pages.length) return;

    if (audioRef.current) {
      try {
        audioRef.current.onended = null;
        audioRef.current.pause();
      } catch (e) {}
      audioRef.current = null;
    }

    const mp3Url = pages[index].mp3;
    if (mp3Url) {
      const audio = new Audio(mp3Url);
      audioRef.current = audio;
      audio.play().catch(() => {});

      audio.onended = () => {
        if (autoPlay) {
          // 如果是最后一页，读完后返回 BookDetail 页面
          if (currentIndex === pages.length - 1) {
            navigate(-1);
          } else {
            goTo(index + 1);
          }
        }
      };
    }
  };

  const goTo = (index: number) => {
    if (index < 0) index = 0;
    if (index >= pages.length) index = pages.length - 1;
    setCurrentIndex(index);
  };

  const onNext = () => {
    if (currentIndex === pages.length - 1) {
      navigate(-1);
    } else {
      goTo(currentIndex + 1);
    }
  };

  const onPrev = () => {
    goTo(currentIndex - 1);
  };

  const onToggleAuto = () => {
    setAutoPlay((v) => !v);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current == null) return;
    const dx = e.changedTouches[0].clientX - touchStartX.current;
    touchStartX.current = null;
    if (Math.abs(dx) < 30) return;
    if (dx < 0) onNext(); else onPrev();
  };

  const handleBack = () => {
    navigate(-1);
  };

  if (loading) {
    return <div className="reader-empty">加载中...</div>;
  }

  if (pages.length === 0) {
    return <div className="reader-empty">暂无内容</div>;
  }

  const currentPage = pages[currentIndex];

  return (
    <div className="reader-root" onTouchStart={handleTouchStart} onTouchEnd={handleTouchEnd}>
      <button className="reader-back-btn" onClick={handleBack}>
        返回
      </button>

      <div className="reader-stage">
        <img src={currentPage.pic} alt={`page-${currentPage.position}`} className="reader-image" />
      </div>

      <div className="reader-controls">
        <button className="reader-btn" onClick={onPrev}>上一页</button>
        <div className="reader-info">{currentIndex + 1} / {pages.length}</div>
        <button className="reader-btn" onClick={onNext}>下一页</button>
      </div>

      <div className="reader-actions">
        <label className="reader-toggle">
          <input type="checkbox" checked={autoPlay} onChange={onToggleAuto} /> 自动翻页（等待音频结束）
        </label>
      </div>
    </div>
  );
};

export default BookReader;
