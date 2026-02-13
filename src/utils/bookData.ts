// 临时的书籍数据加载器，未来可替换为接口请求
type Book = {
  id: string;
  title: string;
  cover?: string;
  category?: string;
};

type PageItem = {
  image?: string;
  audio?: string;
  path?: string;
};

// 使用 Vite 的 glob 预抓取 10846 下的所有资源（包括子目录）
const modules = import.meta.glob('/10846/**/*.{jpg,png,jpeg,webp,mp3}', { eager: true });

export function getBooks(): Book[] {
  const byFolder: Record<string, { images: string[] }> = {};
  Object.keys(modules).forEach((k) => {
    const m: any = (modules as any)[k];
    const url = m && m.default ? m.default : undefined;
    if (!url) return;
    // path like /10846/bookA/cover.jpg
    const parts = k.split('/').filter(Boolean);
    // parts: ["10846", "bookA", "cover.jpg"]
    if (parts.length < 2) return;
    const folder = parts[1];
    byFolder[folder] = byFolder[folder] || { images: [] };
    byFolder[folder].images.push(url);
  });

  const books: Book[] = Object.keys(byFolder).map((folder) => {
    const images = byFolder[folder].images;
    // derive a prettier title and a mock category from folder name
    const title = folder.replace(/[_-]+/g, ' ');
    const category = folder.split(/[_-]+/)[0] || '默认';
    return { id: folder, title, cover: images[0], category };
  }).sort((a,b)=>a.title.localeCompare(b.title, undefined, {numeric:true}));

  return books;
}

export function getBookAssets(bookId: string): PageItem[] {
  const pages: PageItem[] = [];
  Object.keys(modules).forEach((k) => {
    if (!k.includes(`/${bookId}/`)) return;
    const m: any = (modules as any)[k];
    const url = m && m.default ? m.default : undefined;
    if (!url) return;
    const ext = k.split('.').pop()!.toLowerCase();
    if (['jpg','jpeg','png','webp'].includes(ext)) {
      pages.push({ image: url, path: k });
    }
  });
  // natural sort by path
  pages.sort((a,b)=> (a.path||'').localeCompare(b.path||'', undefined, {numeric:true}));
  return pages;
}

export type { Book, PageItem };
