import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router';

const DEFAULT_PROFILE_PIC = "https://buiha.org.uk/assets/img/profile/player-newcastle.jpg";

export default function CommitteeManager() {
    const navigate = useNavigate();
    const [committee, setCommittee] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [uploadingIndex, setUploadingIndex] = useState(null);
    const [statusMessage, setStatusMessage] = useState({ text: '', type: '' });

    const API_BASE = (import.meta.env.VITE_API_URL || 'https://newcastle-wildcats.onrender.com').replace(/\/$/, '');

    const saveTimeoutRef = useRef(null);

    useEffect(() => {
        const fetchCommittee = async () => {
            try {
                const res = await fetch(`${API_BASE}/api/committee`);
                if (res.ok) {
                    const data = await res.json();
                    if (Array.isArray(data) && data.length > 0) {
                        setCommittee(data);
                    } else {
                        setCommittee([
                            { role: "President", name: "", description: "", image: DEFAULT_PROFILE_PIC, instagram: "" },
                            { role: "Secretary", name: "", description: "", image: DEFAULT_PROFILE_PIC, instagram: "" },
                            { role: "Treasurer", name: "", description: "", image: DEFAULT_PROFILE_PIC, instagram: "" },
                            { role: "Sponsorship Officer", name: "", description: "", image: DEFAULT_PROFILE_PIC, instagram: "" },
                            { role: "Social Media Secretary", name: "", description: "", image: DEFAULT_PROFILE_PIC, instagram: "" },
                            { role: "Welfare Officer", name: "", description: "", image: DEFAULT_PROFILE_PIC, instagram: "" },
                            { role: "Kit Officer", name: "", description: "", image: DEFAULT_PROFILE_PIC, instagram: "" },
                            { role: "Transport Secretary", name: "", description: "", image: DEFAULT_PROFILE_PIC, instagram: "" },
                            { role: "Social Secretary", name: "", description: "", image: DEFAULT_PROFILE_PIC, instagram: "" },
                            { role: "Social Secretary", name: "", description: "", image: DEFAULT_PROFILE_PIC, instagram: "" },
                            { role: "Social Secretary", name: "", description: "", image: DEFAULT_PROFILE_PIC, instagram: "" }
                        ]);
                    }
                }
            } catch (err) {
                console.error('Error fetching committee:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchCommittee();
    }, [API_BASE]);

    const persistChanges = async (updatedData) => {
        setSaving(true);
        setStatusMessage({ text: 'Saving changes...', type: 'info' });
        try {
            const res = await fetch(`${API_BASE}/api/committee`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(updatedData)
            });
            if (!res.ok) throw new Error('Failed to save');
            setStatusMessage({ text: 'All changes saved automatically', type: 'success' });

            setTimeout(() => {
                setStatusMessage(prev => prev.type === 'success' ? { text: '', type: '' } : prev);
            }, 2000);
        } catch (err) {
            console.error('Autosave error:', err);
            setStatusMessage({ text: 'Error saving changes', type: 'error' });
        } finally {
            setSaving(false);
        }
    };

    const handleChange = (index, field, value) => {
        const updated = [...committee];
        updated[index][field] = value;
        setCommittee(updated);

        if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
        saveTimeoutRef.current = setTimeout(() => {
            persistChanges(updated);
        }, 500);
    };

    const handleImageUpload = async (index, e) => {
        const file = e.target.files[0];
        if (!file) return;

        const formData = new FormData();
        formData.append('image', file);

        setUploadingIndex(index);
        setStatusMessage({ text: 'Uploading image to Cloudinary...', type: 'info' });

        try {
            const res = await fetch(`${API_BASE}/api/upload`, {
                method: 'POST',
                body: formData,
            });
            if (!res.ok) throw new Error('Upload failed');
            const data = await res.json();

            const updated = [...committee];
            updated[index]['image'] = data.url;
            setCommittee(updated);

            await persistChanges(updated);
        } catch (err) {
            console.error('Image upload error:', err);
            setStatusMessage({ text: 'Failed to upload image.', type: 'error' });
        } finally {
            setUploadingIndex(null);
        }
    };

    const handleRemoveImage = async (index) => {
        const updated = [...committee];
        updated[index]['image'] = '';
        setCommittee(updated);
        await persistChanges(updated);
    };

    if (loading) {
        return (
            <div className="max-w-5xl mx-auto p-6 font-sans text-center text-gray-400 font-bold uppercase tracking-widest py-12">
                Loading Committee Data...
            </div>
        );
    }

    return (
        <div className="max-w-5xl mx-auto p-4 sm:p-6 font-sans space-y-6">
            <div className="flex items-center justify-between border-b border-gray-200 pb-4 gap-2">
                <div className="flex items-center gap-2 min-w-0 flex-1">
                    <h1 className="text-lg sm:text-xl md:text-2xl font-bold font-wildcats text-wildcats-blue uppercase tracking-wide truncate">
                        <span className="sm:hidden">Committee</span>
                        <span className="hidden sm:inline">Committee Manager</span>
                    </h1>
                    {statusMessage.text && (
                        <span className={`text-[8px] sm:text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 sm:px-2.5 sm:py-1 shrink-0 ${
                            statusMessage.type === 'success' ? 'bg-green-50 text-green-700 border border-green-200' :
                                statusMessage.type === 'error' ? 'bg-red-50 text-red-700 border border-red-200' :
                                    'bg-blue-50 text-wildcats-blue border border-blue-200 animate-pulse'
                        }`}>
                            {statusMessage.text}
                        </span>
                    )}
                </div>
                <button
                    onClick={() => navigate('/admin')}
                    className="px-3 py-1.5 sm:px-4 sm:py-2 text-[10px] sm:text-xs font-bold uppercase tracking-wider border border-gray-300 text-gray-700 bg-gray-50 hover:bg-gray-100 transition-colors cursor-pointer whitespace-nowrap shrink-0 shadow-xs"
                >
                    &larr; Back to Dashboard
                </button>
            </div>

            <div className="space-y-4">
                {committee.map((member, index) => (
                    <div key={index} className="bg-white border border-gray-200 p-4 space-y-3 shadow-xs">
                        <div className="flex items-center justify-between border-b border-gray-100 pb-2">
                            <span className="text-xs font-bold text-wildcats-blue uppercase tracking-widest">
                                Role: {member.role}
                            </span>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">Member Name</label>
                                <input
                                    type="text"
                                    value={member.name || ''}
                                    onChange={(e) => handleChange(index, 'name', e.target.value)}
                                    placeholder="Full Name"
                                    className="w-full border border-gray-300 px-3 py-2 text-xs font-semibold focus:border-wildcats-blue outline-hidden"
                                />
                            </div>

                            <div>
                                <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">Instagram Handle</label>
                                <input
                                    type="text"
                                    value={member.instagram || ''}
                                    onChange={(e) => handleChange(index, 'instagram', e.target.value)}
                                    placeholder="@username"
                                    className="w-full border border-gray-300 px-3 py-2 text-xs font-semibold focus:border-wildcats-blue outline-hidden"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">Profile Photo</label>
                            <div className="flex items-center gap-3">
                                <img
                                    src={member.image || DEFAULT_PROFILE_PIC}
                                    alt=""
                                    onError={(e) => { e.target.src = DEFAULT_PROFILE_PIC; }}
                                    className="w-10 h-10 object-cover rounded-full border border-gray-300 shrink-0"
                                />
                                <div className="w-full flex items-center gap-2">
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={(e) => handleImageUpload(index, e)}
                                        className="w-full text-xs text-gray-500 file:mr-4 file:py-1.5 file:px-3 file:border-0 file:text-[10px] file:font-bold file:uppercase file:tracking-wider file:bg-gray-100 file:text-gray-700 hover:file:bg-gray-200 cursor-pointer"
                                    />
                                    {member.image && member.image !== DEFAULT_PROFILE_PIC && (
                                        <button
                                            type="button"
                                            onClick={() => handleRemoveImage(index)}
                                            className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider border border-red-200 text-red-600 bg-red-50 hover:bg-red-100 transition-colors cursor-pointer whitespace-nowrap shrink-0 shadow-xs"
                                        >
                                            Remove
                                        </button>
                                    )}
                                </div>
                            </div>
                            {uploadingIndex === index && (
                                <span className="text-[10px] font-bold text-wildcats-blue uppercase tracking-wider mt-1 block">Uploading to Cloudinary...</span>
                            )}
                        </div>

                        <div>
                            <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">Description</label>
                            <textarea
                                value={member.description || ''}
                                onChange={(e) => handleChange(index, 'description', e.target.value)}
                                placeholder="Short description of responsibilities..."
                                rows="2"
                                className="w-full border border-gray-300 px-3 py-2 text-xs font-semibold focus:border-wildcats-blue outline-hidden resize-none"
                            />
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}