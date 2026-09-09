import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';

const getProfilePicUrl = (buihaLink) => {
    if (!buihaLink) return '';
    const match = buihaLink.match(/\/player\/(\d+)/);
    if (match && match[1]) {
        return `https://buiha.org.uk/assets/img/profile/15/player-${match[1]}.jpg`;
    }
    return '';
};

export default function PlayerManager() {
    const [players, setPlayers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [message, setMessage] = useState({ text: '', isError: false });

    const [newPlayer, setNewPlayer] = useState({ number: '', name: '', buihaLink: '' });

    const [editingPlayerId, setEditingPlayerId] = useState(null);
    const [editFormData, setEditFormData] = useState({});

    const navigate = useNavigate();
    const API_BASE = (import.meta.env.VITE_API_URL || 'https://newcastle-wildcats.onrender.com').replace(/\/$/, '');

    const fetchPlayers = async () => {
        try {
            const res = await fetch(`${API_BASE}/api/players`);
            if (!res.ok) throw new Error('Could not fetch players');
            const data = await res.json();
            setPlayers(data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPlayers();
    }, []);

    const handleAddPlayer = async (e) => {
        e.preventDefault();
        if (!newPlayer.name || !newPlayer.number) return;

        const payload = {
            ...newPlayer,
            profilePic: getProfilePicUrl(newPlayer.buihaLink)
        };

        const userInfo = JSON.parse(localStorage.getItem('userInfo'));

        try {
            const res = await fetch(`${API_BASE}/api/players`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${userInfo?.token}`
                },
                body: JSON.stringify(payload)
            });

            if (!res.ok) throw new Error('Failed to create member');

            setMessage({ text: 'Member successfully added!', isError: false });
            setNewPlayer({ number: '', name: '', buihaLink: '' });
            fetchPlayers();
        } catch (err) {
            setMessage({ text: err.message, isError: true });
        }
    };

    const startEditing = (player) => {
        setEditingPlayerId(player._id);
        setEditFormData({ ...player });
        setMessage({ text: '', isError: false });
    };

    const handleUpdatePlayer = async (playerId) => {
        if (!editFormData.name || !editFormData.number) return;

        const payload = {
            ...editFormData,
            profilePic: getProfilePicUrl(editFormData.buihaLink)
        };

        const userInfo = JSON.parse(localStorage.getItem('userInfo'));

        try {
            const res = await fetch(`${API_BASE}/api/players/${playerId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${userInfo?.token}`
                },
                body: JSON.stringify(payload)
            });

            if (!res.ok) throw new Error('Failed to update member');

            setMessage({ text: 'Member updated successfully!', isError: false });
            setEditingPlayerId(null);
            fetchPlayers();
        } catch (err) {
            setMessage({ text: err.message, isError: true });
        }
    };

    const handleDeletePlayer = async (playerId) => {
        if (!window.confirm('Are you sure you want to delete this member globally?')) return;

        const userInfo = JSON.parse(localStorage.getItem('userInfo'));
        try {
            const res = await fetch(`${API_BASE}/api/players/${playerId}`, {
                method: 'DELETE',
                headers: {
                    Authorization: `Bearer ${userInfo?.token}`
                }
            });

            if (!res.ok) throw new Error('Failed to delete member');
            fetchPlayers();
        } catch (err) {
            alert(err.message);
        }
    };

    const filteredPlayers = players.filter(p => {
        const q = searchQuery.toLowerCase();
        return p.name.toLowerCase().includes(q) || String(p.number).includes(q);
    });

    return (
        <div className="max-w-5xl mx-auto p-4 sm:p-6 font-sans">
            <div className="flex items-center justify-between gap-4 mb-6">
                <h1 className="text-lg sm:text-2xl font-bold font-wildcats text-wildcats-blue uppercase shrink-0">
                    Player Manager
                </h1>
                <button
                    onClick={() => navigate('/admin')}
                    className="px-3 py-1.5 sm:px-4 sm:py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold uppercase tracking-wider border border-gray-300 transition-colors cursor-pointer text-center shrink-0"
                >
                    &larr; Back to Dashboard
                </button>
            </div>

            {message.text && (
                <div className={`p-3 mb-6 text-sm font-semibold text-center sm:text-left ${message.isError ? 'bg-red-100 text-red-700 border border-red-300' : 'bg-green-100 text-green-700 border border-green-300'}`}>
                    {message.text}
                </div>
            )}

            <div className="bg-white border border-gray-200 shadow-md p-4 sm:p-6 mb-8">
                <form onSubmit={handleAddPlayer} className="bg-gray-50 p-4 border border-gray-200 mb-6 space-y-4">
                    <h3 className="text-xs font-bold uppercase text-gray-800 border-b pb-2">
                        Add New Member
                    </h3>

                    <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-end">
                        <div className="sm:col-span-2">
                            <label className="block text-[10px] font-bold uppercase text-gray-500 mb-1">Number</label>
                            <input
                                type="number"
                                required
                                value={newPlayer.number}
                                onChange={(e) => setNewPlayer({ ...newPlayer, number: e.target.value })}
                                className="w-full border border-gray-300 p-2 text-xs outline-none focus:border-wildcats-blue text-center font-bold bg-white"
                                placeholder="0"
                            />
                        </div>
                        <div className="sm:col-span-4">
                            <label className="block text-[10px] font-bold uppercase text-gray-500 mb-1">Player Name</label>
                            <input
                                type="text"
                                required
                                value={newPlayer.name}
                                onChange={(e) => setNewPlayer({ ...newPlayer, name: e.target.value })}
                                className="w-full border border-gray-300 p-2 text-xs outline-none focus:border-wildcats-blue font-bold uppercase bg-white"
                                placeholder="Enter Name"
                            />
                        </div>
                        <div className="sm:col-span-5">
                            <label className="block text-[10px] font-bold uppercase text-gray-500 mb-1">BUIHA Link</label>
                            <input
                                type="text"
                                placeholder="https://buiha.org/player/0000"
                                value={newPlayer.buihaLink}
                                onChange={(e) => setNewPlayer({ ...newPlayer, buihaLink: e.target.value })}
                                className="w-full border border-gray-300 p-2 text-xs outline-none focus:border-wildcats-blue bg-white"
                            />
                        </div>
                        <div className="sm:col-span-1">
                            <button
                                type="submit"
                                className="w-full py-2 bg-wildcats-red hover:bg-red-700 text-white text-xs font-bold uppercase transition-colors cursor-pointer h-[34px]"
                            >
                                Add
                            </button>
                        </div>
                    </div>
                </form>

                <div className="space-y-4">
                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 border-b border-gray-200 pb-3">
                        <h3 className="text-xs font-bold uppercase text-gray-800">
                            All Members ({filteredPlayers.length})
                        </h3>
                        <div className="w-full sm:w-72">
                            <input
                                type="text"
                                placeholder="Search by name or number"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full border border-gray-300 p-1.5 text-xs outline-none focus:border-wildcats-blue uppercase bg-white font-semibold"
                            />
                        </div>
                    </div>

                    {loading ? (
                        <p className="text-xs text-gray-400 italic">Loading members...</p>
                    ) : filteredPlayers.length === 0 ? (
                        <p className="text-xs text-gray-400 italic bg-gray-50 p-6 text-center border border-dashed border-gray-200">
                            No members found.
                        </p>
                    ) : (
                        <div className="space-y-2 max-h-[420px] overflow-y-auto pr-1">
                            {filteredPlayers.map((player) => {
                                const isEditing = editingPlayerId === player._id;

                                if (isEditing) {
                                    return (
                                        <div key={player._id} className="bg-blue-50 border-2 border-wildcats-blue p-3 space-y-3">
                                            <div className="grid grid-cols-1 sm:grid-cols-12 gap-2 items-end">
                                                <div className="sm:col-span-2">
                                                    <label className="block text-[9px] font-bold uppercase text-gray-500 mb-0.5">Number</label>
                                                    <input
                                                        type="number"
                                                        value={editFormData.number}
                                                        onChange={(e) => setEditFormData({ ...editFormData, number: e.target.value })}
                                                        className="w-full border border-gray-300 p-1.5 text-xs bg-white text-center font-bold outline-none"
                                                    />
                                                </div>
                                                <div className="sm:col-span-4">
                                                    <label className="block text-[9px] font-bold uppercase text-gray-500 mb-0.5">Name</label>
                                                    <input
                                                        type="text"
                                                        value={editFormData.name}
                                                        onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
                                                        className="w-full border border-gray-300 p-1.5 text-xs bg-white font-bold uppercase outline-none"
                                                    />
                                                </div>
                                                <div className="sm:col-span-6">
                                                    <label className="block text-[9px] font-bold uppercase text-gray-500 mb-0.5">BUIHA Link</label>
                                                    <input
                                                        type="text"
                                                        value={editFormData.buihaLink || ''}
                                                        onChange={(e) => setEditFormData({ ...editFormData, buihaLink: e.target.value })}
                                                        className="w-full border border-gray-300 p-1.5 text-xs bg-white outline-none"
                                                    />
                                                </div>
                                            </div>
                                            <div className="flex justify-end gap-2 pt-1">
                                                <button
                                                    type="button"
                                                    onClick={() => setEditingPlayerId(null)}
                                                    className="px-3 py-1 bg-white border border-gray-300 text-gray-700 text-xs font-bold uppercase cursor-pointer"
                                                >
                                                    Cancel
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => handleUpdatePlayer(player._id)}
                                                    className="px-3 py-1 bg-green-600 hover:bg-green-700 text-white text-xs font-bold uppercase cursor-pointer"
                                                >
                                                    Save
                                                </button>
                                            </div>
                                        </div>
                                    );
                                }

                                return (
                                    <div key={player._id} className="flex flex-col sm:flex-row items-start sm:items-center justify-between bg-white border border-gray-200 p-3 gap-2 shadow-xs">
                                        <div className="flex items-center gap-3.5">
                                            {player.profilePic ? (
                                                <img src={player.profilePic} alt="" className="w-10 h-10 object-cover rounded-full bg-gray-100 border border-gray-200 shrink-0" />
                                            ) : (
                                                <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center text-xs font-bold text-gray-500 border border-gray-200 shrink-0">
                                                    #{player.number}
                                                </div>
                                            )}
                                            <div>
                                                <div className="flex items-center gap-2">
                                                    <span className="text-xs font-bold text-wildcats-red">#{player.number}</span>
                                                    <span className="text-xs font-bold text-gray-900 uppercase">{player.name}</span>
                                                </div>
                                                <span className="text-[10px] text-gray-400 truncate block max-w-[250px] sm:max-w-[400px]">
                                                    {player.buihaLink || 'No BUIHA profile link'}
                                                </span>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2 self-end sm:self-auto">
                                            <button
                                                type="button"
                                                onClick={() => startEditing(player)}
                                                className="text-xs text-wildcats-blue hover:text-blue-800 font-bold uppercase px-3 py-1.5 bg-blue-50 hover:bg-blue-100 transition-colors cursor-pointer"
                                            >
                                                Edit
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => handleDeletePlayer(player._id)}
                                                className="text-xs text-red-600 hover:text-red-800 font-bold uppercase px-3 py-1.5 bg-red-50 hover:bg-red-100 transition-colors cursor-pointer"
                                            >
                                                Delete
                                            </button>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}