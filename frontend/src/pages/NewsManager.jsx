import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';

export default function NewsManager() {
    const navigate = useNavigate();
    const [articles, setArticles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [savingId, setSavingId] = useState(null);
    const [uploadingId, setUploadingId] = useState(null);
    const [editingArticleId, setEditingArticleId] = useState(null);
    const [statusMessage, setStatusMessage] = useState({ text: '', isError: false });

    const API_BASE = (import.meta.env.VITE_API_URL || 'https://newcastle-wildcats.onrender.com').replace(/\/$/, '');

    useEffect(() => {
        fetchArticles();
    }, [API_BASE]);

    const fetchArticles = async () => {
        try {
            const res = await fetch(`${API_BASE}/api/news`);
            if (res.ok) {
                const data = await res.json();
                setArticles(Array.isArray(data) ? data : []);
            }
        } catch (err) {
            console.error('Error fetching articles:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleCreateArticle = async () => {
        const today = new Date().toISOString().split('T')[0];
        const newArticle = {
            title: 'New Match Report / Story',
            author: 'Newcastle Wildcats',
            date: today,
            image: '',
            description: '',
            content: ''
        };

        const userInfo = JSON.parse(localStorage.getItem('userInfo'));

        try {
            const res = await fetch(`${API_BASE}/api/news`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${userInfo?.token}`
                },
                body: JSON.stringify(newArticle)
            });
            if (!res.ok) throw new Error('Failed to create article');
            const created = await res.json();
            setArticles([created, ...articles]);
            setEditingArticleId(created._id);
            setStatusMessage({ text: 'Article successfully created', isError: false });
        } catch (err) {
            setStatusMessage({ text: err.message, isError: true });
        }
    };

    const handleUpdateField = (id, field, value) => {
        setArticles(articles.map(art => art._id === id ? { ...art, [field]: value } : art));
    };

    const handleSaveArticle = async (article) => {
        setSavingId(article._id);
        const userInfo = JSON.parse(localStorage.getItem('userInfo'));

        try {
            const res = await fetch(`${API_BASE}/api/news/${article._id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${userInfo?.token}`
                },
                body: JSON.stringify(article)
            });
            if (!res.ok) throw new Error('Failed to save article to database');

            setStatusMessage({ text: 'Article successfully saved.', isError: false });
            setEditingArticleId(null);
            fetchArticles();
        } catch (err) {
            setStatusMessage({ text: err.message, isError: true });
        } finally {
            setSavingId(null);
        }
    };

    const handleImageUpload = async (id, e) => {
        const file = e.target.files[0];
        if (!file) return;

        const formData = new FormData();
        formData.append('image', file);

        setUploadingId(id);

        try {
            const res = await fetch(`${API_BASE}/api/upload`, {
                method: 'POST',
                body: formData,
            });
            if (!res.ok) throw new Error('Upload failed');
            const data = await res.json();

            setArticles(articles.map(art => art._id === id ? { ...art, image: data.url } : art));
        } catch (err) {
            console.error('Image upload error:', err);
            alert('Failed to upload image');
        } finally {
            setUploadingId(null);
        }
    };

    const handleRemoveImage = (id) => {
        setArticles(articles.map(art => art._id === id ? { ...art, image: '' } : art));
    };

    const handleDeleteArticle = async (id) => {
        if (!window.confirm('Are you sure you want to delete this news article from the database?')) return;

        const userInfo = JSON.parse(localStorage.getItem('userInfo'));
        try {
            const res = await fetch(`${API_BASE}/api/news/${id}`, {
                method: 'DELETE',
                headers: {
                    Authorization: `Bearer ${userInfo?.token}`
                }
            });
            if (!res.ok) throw new Error('Failed to delete article');
            setArticles(articles.filter(art => art._id !== id));
        } catch (err) {
            alert(err.message);
        }
    };

    if (loading) {
        return (
            <div className="max-w-5xl mx-auto p-6 font-sans text-center text-gray-400 font-bold uppercase tracking-widest py-12">
                Loading News Manager...
            </div>
        );
    }

    return (
        <div className="max-w-5xl mx-auto p-4 sm:p-6 font-sans">
            <div className="flex items-center justify-between gap-2 mb-6">
                <h1 className="text-sm min-[380px]:text-base sm:text-2xl font-bold font-wildcats text-wildcats-blue uppercase shrink truncate">
                    News Manager
                </h1>
                <div className="flex items-center gap-2 shrink-0">
                    <button
                        onClick={handleCreateArticle}
                        className="px-3 py-1.5 sm:px-4 sm:py-2 bg-green-600 hover:bg-green-700 text-white text-[10px] min-[380px]:text-[11px] sm:text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer text-center whitespace-nowrap shadow-xs"
                    >
                        + Add Article
                    </button>
                    <button
                        onClick={() => navigate('/admin')}
                        className="px-2.5 py-1.5 sm:px-4 sm:py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-[10px] min-[380px]:text-[11px] sm:text-xs font-bold uppercase tracking-wider border border-gray-300 transition-colors cursor-pointer text-center whitespace-nowrap shadow-xs"
                    >
                        &larr; Back to Dashboard
                    </button>
                </div>
            </div>

            {statusMessage.text && (
                <div className={`p-3 mb-6 text-sm font-semibold text-center sm:text-left ${statusMessage.isError ? 'bg-red-100 text-red-700 border border-red-300' : 'bg-green-100 text-green-700 border border-green-300'}`}>
                    {statusMessage.text}
                </div>
            )}

            {articles.length === 0 ? (
                <div className="bg-white border border-gray-200 p-8 text-center text-gray-500 text-xs font-bold uppercase tracking-wider shadow-md">
                    No news articles posted yet. Click "+ Add Article" to write your first story!
                </div>
            ) : (
                <div className="space-y-4">
                    {articles.map((article) => {
                        const isEditing = editingArticleId === article._id;

                        if (!isEditing) {
                            return (
                                <div key={article._id} className="flex items-center justify-between bg-white border border-gray-200 p-4 shadow-xs">
                                    <div className="min-w-0 pr-4">
                                        <div className="flex items-center gap-3 text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">
                                            <span>{article.date}</span>
                                            <span>•</span>
                                            <span>{article.author || 'Newcastle Wildcats'}</span>
                                        </div>
                                        <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wide truncate">
                                            {article.title || 'Untitled Article'}
                                        </h3>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setEditingArticleId(article._id);
                                            setStatusMessage({ text: '', isError: false });
                                        }}
                                        className="px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-wildcats-blue text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer shrink-0"
                                    >
                                        Edit
                                    </button>
                                </div>
                            );
                        }

                        return (
                            <div key={article._id} className="bg-white border-2 border-wildcats-blue p-4 sm:p-6 space-y-4 shadow-md">
                                <div className="flex items-center justify-between border-b border-gray-200 pb-2">
                                    <span className="text-xs font-bold text-wildcats-blue uppercase tracking-widest">
                                        Editing Article
                                    </span>
                                    <button
                                        type="button"
                                        onClick={() => setEditingArticleId(null)}
                                        className="text-xs font-bold text-gray-500 hover:text-gray-700 uppercase"
                                    >
                                        Close
                                    </button>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
                                    <div className="sm:col-span-6">
                                        <label className="block text-[10px] font-bold uppercase text-gray-500 mb-1">Headline / Title</label>
                                        <input
                                            type="text"
                                            value={article.title}
                                            onChange={(e) => handleUpdateField(article._id, 'title', e.target.value)}
                                            className="w-full border border-gray-300 p-2 text-xs outline-none focus:border-wildcats-blue font-bold bg-white"
                                        />
                                    </div>
                                    <div className="sm:col-span-3">
                                        <label className="block text-[10px] font-bold uppercase text-gray-500 mb-1">Author</label>
                                        <input
                                            type="text"
                                            value={article.author}
                                            onChange={(e) => handleUpdateField(article._id, 'author', e.target.value)}
                                            className="w-full border border-gray-300 p-2 text-xs outline-none focus:border-wildcats-blue font-bold bg-white"
                                        />
                                    </div>
                                    <div className="sm:col-span-3">
                                        <label className="block text-[10px] font-bold uppercase text-gray-500 mb-1">Date</label>
                                        <input
                                            type="date"
                                            value={article.date}
                                            onChange={(e) => handleUpdateField(article._id, 'date', e.target.value)}
                                            className="w-full border border-gray-300 p-2 text-xs outline-none focus:border-wildcats-blue font-bold bg-white"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-[10px] font-bold uppercase text-gray-500 mb-1">Hero Image Banner</label>
                                    <div className="flex items-center gap-3">
                                        {article.image && (
                                            <img
                                                src={article.image}
                                                alt=""
                                                className="w-16 h-10 object-cover border border-gray-300 shrink-0 shadow-xs bg-white"
                                            />
                                        )}
                                        <div className="w-full flex items-center gap-2">
                                            <input
                                                type="file"
                                                accept="image/*"
                                                onChange={(e) => handleImageUpload(article._id, e)}
                                                className="w-full text-xs text-gray-500 file:mr-4 file:py-1.5 file:px-3 file:border-0 file:text-[10px] file:font-bold file:uppercase file:tracking-wider file:bg-gray-100 file:text-gray-700 hover:file:bg-gray-200 cursor-pointer"
                                            />
                                            {article.image && (
                                                <button
                                                    type="button"
                                                    onClick={() => handleRemoveImage(article._id)}
                                                    className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider border border-red-200 text-red-600 bg-red-50 hover:bg-red-100 transition-colors cursor-pointer whitespace-nowrap shrink-0 shadow-xs"
                                                >
                                                    Remove
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                    {uploadingId === article._id && (
                                        <span className="text-[10px] font-bold text-wildcats-blue uppercase tracking-wider mt-1 block">Uploading to Cloudinary...</span>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-[10px] font-bold uppercase text-gray-500 mb-1">Short Description (Preview)</label>
                                    <textarea
                                        value={article.description || ''}
                                        onChange={(e) => handleUpdateField(article._id, 'description', e.target.value)}
                                        rows="2"
                                        placeholder="Brief summary shown on news cards..."
                                        className="w-full border border-gray-300 p-2 text-xs outline-none focus:border-wildcats-blue font-semibold bg-white resize-y"
                                    />
                                </div>

                                <div>
                                    <label className="block text-[10px] font-bold uppercase text-gray-500 mb-1">Main Body Content</label>
                                    <textarea
                                        value={article.content}
                                        onChange={(e) => handleUpdateField(article._id, 'content', e.target.value)}
                                        rows="6"
                                        placeholder="Full article details and match report..."
                                        className="w-full border border-gray-300 p-2 text-xs outline-none focus:border-wildcats-blue font-semibold bg-white resize-y"
                                    />
                                </div>

                                <div className="flex items-center justify-between pt-2 border-t border-gray-200">
                                    <button
                                        type="button"
                                        onClick={() => handleDeleteArticle(article._id)}
                                        className="text-xs text-red-600 hover:text-red-800 font-bold uppercase px-3 py-1.5 bg-red-50 hover:bg-red-100 transition-colors cursor-pointer shadow-xs"
                                    >
                                        Delete
                                    </button>
                                    <div className="flex items-center gap-2">
                                        <button
                                            type="button"
                                            onClick={() => setEditingArticleId(null)}
                                            className="px-3 py-1.5 bg-white border border-gray-300 text-gray-700 text-xs font-bold uppercase tracking-wider cursor-pointer"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => handleSaveArticle(article)}
                                            disabled={savingId === article._id}
                                            className="px-4 py-1.5 bg-green-600 hover:bg-green-700 text-white text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer shadow-xs disabled:opacity-50"
                                        >
                                            {savingId === article._id ? 'Saving...' : 'Save Changes'}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}