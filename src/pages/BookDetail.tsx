import React from 'react';
import { useParams } from 'react-router-dom';
import BookReader from './BookReader';

const BookDetail: React.FC = () => {
  const { id } = useParams();
  if (!id) return <div>无效的绘本 ID</div>;
  return <BookReader bookId={decodeURIComponent(id)} />;
};

export default BookDetail;
