import React from 'react';
import { useParams } from 'react-router-dom';
import NewsDetail from '../components/NewsDetail';

const NewsDetailPage = () => {
  const { slug } = useParams();

  return <NewsDetail slug={slug} />;
};

export default NewsDetailPage; 