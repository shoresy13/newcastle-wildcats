import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';

export default function News() {
    const navigate = useNavigate();
    const [articles, setArticles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedArticle, setSelectedArticle] = useState(null);

    const API_BASE = (import.meta.env.VITE_API_URL || 'https://newcastle-wildcats.onrender.com').replace(/\/$/, '');

    useEffect(() => {
        const fetchArticles = async () => {
            try {
                const res = await fetch(`${API_BASE}/api/news`);
                if (res.ok) {
                    const data = await res.json();
                    setArticles(Array.isArray(data) ? data : []);
                }
            } catch (err) {
                console.error('Error fetching news articles:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchArticles();
    }, [API_BASE]);

    const formatDate = (dateStr) => {
        if (!dateStr) return '';
        return dateStr.replace(/-/g, '/');
    };

    if (loading) {
        return (
            <div className="max-w-[1600px] mx-auto p-6 font-sans text-center text-gray-400 font-bold uppercase tracking-widest py-12">
                Loading News...
            </div>
        );
    }

    if (selectedArticle) {
        return (
            <div className="max-w-4xl mx-auto p-4 sm:p-6 font-sans">
                <article className="bg-white border border-gray-200 p-6 sm:p-8 space-y-6 shadow-sm relative">
                    <div className="flex items-center justify-between border-b border-gray-200 pb-4">
                        <div className="space-y-1">
                            <span className="text-xs font-bold uppercase tracking-widest text-wildcats-blue block">
                                {selectedArticle.author || 'Newcastle Wildcats'}
                            </span>
                            <span className="text-[11px] font-bold text-gray-400 uppercase tracking-widest block">
                                {formatDate(selectedArticle.date)}
                            </span>
                        </div>
                        <button
                            onClick={() => setSelectedArticle(null)}
                            className="px-3 py-1.5 sm:px-4 sm:py-2 text-[10px] sm:text-xs font-bold uppercase tracking-wider border border-gray-300 text-gray-700 bg-gray-50 hover:bg-gray-100 transition-colors cursor-pointer whitespace-nowrap shadow-xs"
                        >
                            &larr; Back to All News
                        </button>
                    </div>

                    <h1 className="text-xl sm:text-3xl font-bold font-wildcats text-gray-900 uppercase tracking-wide leading-tight">
                        {selectedArticle.title}
                    </h1>

                    {selectedArticle.image && (
                        <div className="w-full h-64 sm:h-96 overflow-hidden bg-gray-100 border border-gray-200 shadow-xs">
                            <img
                                src={selectedArticle.image}
                                alt={selectedArticle.title}
                                className="w-full h-full object-cover"
                            />
                        </div>
                    )}

                    {selectedArticle.description && (
                        <p className="text-sm sm:text-base font-semibold text-gray-700 italic border-l-4 border-wildcats-blue pl-4 py-1">
                            {selectedArticle.description}
                        </p>
                    )}

                    <div className="text-xs sm:text-sm text-gray-800 leading-relaxed whitespace-pre-wrap pt-4 border-t border-gray-100">
                        {selectedArticle.content}
                    </div>
                </article>
            </div>
        );
    }

    return (
        <div className="max-w-[1600px] mx-auto p-4 sm:p-6 font-sans space-y-8">
            <div className="flex items-center justify-between border-b border-gray-200 pb-3">
                <h1 className="text-xl sm:text-2xl font-bold font-wildcats text-wildcats-blue uppercase tracking-wide">
                    Club News
                </h1>
                <button
                    onClick={() => navigate('/')}
                    className="px-3 py-1.5 sm:px-4 sm:py-2 text-[10px] sm:text-xs font-bold uppercase tracking-wider border border-gray-300 text-gray-700 bg-gray-50 hover:bg-gray-100 transition-colors cursor-pointer whitespace-nowrap shadow-xs"
                >
                    &larr; Back to Home
                </button>
            </div>

            {articles.length === 0 ? (
                <div className="bg-white border border-gray-200 p-12 text-center text-gray-500 text-xs font-bold uppercase tracking-wider shadow-xs">
                    No news articles have been published yet. Check back soon for match updates!
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {articles.map((article) => (
                        <div
                            key={article._id}
                            onClick={() => setSelectedArticle(article)}
                            className="bg-white border border-gray-200 hover:border-wildcats-blue hover:shadow-md transition-all flex flex-col justify-between overflow-hidden cursor-pointer group"
                        >
                            <div>
                                {article.image && (
                                    <div className="w-full aspect-square overflow-hidden bg-gray-100 border-b border-gray-200">
                                        <img
                                            src={article.image}
                                            alt={article.title}
                                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                        />
                                    </div>
                                )}
                                <div className="p-5 space-y-3">
                                    <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-widest text-wildcats-blue">
                                        <span>{article.author || 'Newcastle Wildcats'}</span>
                                        <span className="text-gray-400">{formatDate(article.date)}</span>
                                    </div>
                                    <h2 className="text-base sm:text-lg font-bold text-gray-900 uppercase tracking-wide leading-snug group-hover:text-wildcats-blue transition-colors">
                                        {article.title}
                                    </h2>
                                    <p className="text-xs sm:text-sm text-gray-600 leading-relaxed line-clamp-3 pt-1 border-t border-gray-100">
                                        {article.description || article.content}
                                    </p>
                                </div>
                            </div>
                            <div className="px-5 pb-4 pt-1 flex items-center justify-end text-[10px] font-bold uppercase tracking-wider text-wildcats-blue">
                                Read Full Story &rarr;
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}