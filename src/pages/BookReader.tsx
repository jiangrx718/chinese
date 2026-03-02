import React, { useEffect, useRef, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import '../styles/Reader.css';
import { apiFetch } from '../utils/http';
import { API_BASE_URL } from '../config';

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
  const [rotated, setRotated] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const touchStartX = useRef<number | null>(null);

  useEffect(() => {
    if (bookId) {
      fetchBookPages(bookId);
    }
  }, [bookId]);

  useEffect(() => {
    type MQL = MediaQueryList & {
      addListener?: (listener: (this: MediaQueryList, ev: MediaQueryListEvent) => void) => void;
      removeListener?: (listener: (this: MediaQueryList, ev: MediaQueryListEvent) => void) => void;
    };
    const mm = window.matchMedia('(orientation: portrait)') as MQL;
    const update = () => {
      setRotated(mm.matches);
    };
    update();
    if (typeof mm.addEventListener === 'function') {
      mm.addEventListener('change', update);
    } else if (typeof mm.addListener === 'function') {
      mm.addListener(update);
    }
    const lock = async () => {
      try {
        type ScreenOrientationLike = {
          lock?: (orientation: 'landscape' | 'portrait' | 'landscape-primary' | 'landscape-secondary' | 'portrait-primary' | 'portrait-secondary') => Promise<void>;
          unlock?: () => void;
        };
        const o = (screen as Screen & { orientation?: unknown }).orientation as ScreenOrientationLike | undefined;
        await o?.lock?.('landscape');
      } catch (err) {
        console.warn('orientation lock failed', err);
      }
    };
    lock();
    return () => {
      try {
        type ScreenOrientationLike = {
          lock?: (orientation: 'landscape' | 'portrait' | 'landscape-primary' | 'landscape-secondary' | 'portrait-primary' | 'portrait-secondary') => Promise<void>;
          unlock?: () => void;
        };
        const o = (screen as Screen & { orientation?: unknown }).orientation as ScreenOrientationLike | undefined;
        o?.unlock?.();
      } catch (err) {
        console.warn('orientation unlock failed', err);
      }
      if (typeof mm.removeEventListener === 'function') {
        mm.removeEventListener('change', update);
      } else if (typeof mm.removeListener === 'function') {
        mm.removeListener(update);
      }
    };
  }, []);

  const fetchBookPages = async (id: string) => {
    setLoading(true);
    try {
      const response = await apiFetch(`${API_BASE_URL}/api/info/list`, {
        method: 'GET',
        params: { book_id: id },
      });
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
    // 页面数据加载完成后，播放第一页音频
    if (pages.length > 0) {
      playFor(currentIndex);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pages]);

  // 卸载时清理音频
  useEffect(() => {
    return () => {
      if (audioRef.current) {
        try {
          audioRef.current.onended = null;
          audioRef.current.pause();
        } catch {
          void 0;
        }
        audioRef.current = null;
      }
    };
  }, []);

  const playFor = (index: number) => {
    if (index < 0 || index >= pages.length) return;

    if (audioRef.current) {
      try {
        audioRef.current.onended = null;
        audioRef.current.pause();
      } catch {
        void 0;
      }
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
    // 在用户手势环境中直接触发播放，避免浏览器的自动播放限制
    playFor(index);
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
    <div className={`reader-root ${rotated ? 'landscape-rotated' : ''}`} onTouchStart={handleTouchStart} onTouchEnd={handleTouchEnd}>
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
