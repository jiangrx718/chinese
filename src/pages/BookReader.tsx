import React, { useEffect, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
import '../styles/Reader.css';

import type { PageItem as DataPageItem } from '../utils/bookData';
type PageItem = {
  image?: string;
  audio?: string;
  path?: string;
};

// preload all assets under 10846 (including subfolders)
const modules = import.meta.glob('/10846/**/*.{jpg,png,jpeg,webp,mp3}', { eager: true });

const importAllForBook = (bookId?: string): PageItem[] => {
  const images: PageItem[] = [];
  Object.keys(modules).forEach((k) => {
    const m: any = (modules as any)[k];
    const url = m && m.default ? m.default : undefined;
    if (!url) return;
    if (bookId) {
      if (!k.includes(`/${bookId}/`)) return;
    }
    const ext = k.split('.').pop()!.toLowerCase();
    if (['jpg','jpeg','png','webp'].includes(ext)) {
      images.push({ image: url, path: k });
    }
  });
  images.sort((a,b)=> (a.path||'').localeCompare(b.path||'', undefined, {numeric:true}));
  return images;
};

const BookReader: React.FC = () => {
  const { id } = useParams();
  const bookId = id ? decodeURIComponent(id) : undefined;
  const pages = importAllForBook(bookId);
  const [index, setIndex] = useState(0);
  const [autoPlay, setAutoPlay] = useState(true);
  const [rotated, setRotated] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const touchStartX = useRef<number | null>(null);

  useEffect(() => {
    // when component mounts, start playing first page if exists
    playFor(index);
    // handle rotation/landscape-on-mobile requirement
    const updateRotate = () => {
      const isPortrait = window.innerWidth < window.innerHeight;
      setRotated(isPortrait);
      if (isPortrait) {
        document.body.style.overflow = 'hidden';
      } else {
        document.body.style.overflow = '';
      }
    };
    updateRotate();
    window.addEventListener('resize', updateRotate);
    window.addEventListener('orientationchange', updateRotate);
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
      document.body.style.overflow = '';
      window.removeEventListener('resize', updateRotate);
      window.removeEventListener('orientationchange', updateRotate);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    // when index changes by any means, play its audio
    playFor(index);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [index]);

  const playFor = (i: number) => {
    if (i < 0 || i >= pages.length) return;
    if (audioRef.current) {
      try { audioRef.current.onended = null; audioRef.current.pause(); } catch (e) {}
      audioRef.current = null;
    }
    const src = pages[i].audio;
    if (src) {
      const a = new Audio(src);
      audioRef.current = a;
      a.play().catch(() => {});
      a.onended = () => {
        if (autoPlay) {
          goTo(i + 1);
        }
      };
    }
  };

  const goTo = (i: number) => {
    if (i < 0) i = 0;
    if (i >= pages.length) i = pages.length - 1;
    setIndex(i);
  };

  const onNext = () => {
    goTo(index + 1);
  };

  const onPrev = () => {
    goTo(index - 1);
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

  if (pages.length === 0) {
    return <div className="reader-empty">未发现 10846 目录下的图片资源</div>;
  }

  return (
    <div className={`reader-root ${rotated ? 'landscape-rotated' : ''}`} onTouchStart={handleTouchStart} onTouchEnd={handleTouchEnd}>
      <div className="reader-stage">
        <img src={pages[index].image} alt={`page-${index + 1}`} className="reader-image" />
      </div>

      <div className="reader-controls">
        <button className="reader-btn" onClick={onPrev}>上一页</button>
        <div className="reader-info">{index + 1} / {pages.length}</div>
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
