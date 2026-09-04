import React, { useState, useEffect, useRef } from 'react';
import { TEAMS } from '../utils/teams';
import { GAME_TYPES } from '../utils/gameTypes';

const SEASONS = ["2026/27", "2025/26"];

function TeamSelectDropdown({ label, labelColorClass, selectedIndex, onSelect }) {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const selectedTeam = TEAMS[selectedIndex];

    return (
        <div className="relative" ref={dropdownRef}>
            {label && (
                <label className={`block text-xs font-bold uppercase mb-1 ${labelColorClass}`}>
                    {label}
                </label>
            )}
            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className="w-full border p-2 text-sm bg-white flex items-center justify-between shadow-sm cursor-pointer focus:outline-none focus:border-wildcats-blue"
            >
                <div className="flex items-center gap-2.5">
                    {selectedTeam?.logo ? (
                        <img src={selectedTeam.logo} alt="" className="w-6 h-6 object-contain shrink-0" />
                    ) : (
                        <div className="w-6 h-6 bg-gray-200 rounded-full shrink-0" />
                    )}
                    <span className="font-semibold text-gray-800">
                        {selectedTeam?.name} ({selectedTeam?.shortName})
                    </span>
                </div>
                <span className="text-xs text-gray-400">▼</span>
            </button>

            {isOpen && (
                <div className="absolute z-30 mt-1 w-full bg-white border shadow-lg max-h-56 overflow-y-auto divide-y divide-gray-100">
                    {TEAMS.map((team, idx) => (
                        <div
                            key={team.shortName}
                            onClick={() => {
                                onSelect(idx);
                                setIsOpen(false);
                            }}
                            className={`flex items-center gap-2.5 p-2.5 text-sm cursor-pointer hover:bg-gray-100 transition-colors ${
                                idx === selectedIndex ? 'bg-blue-50 font-bold' : ''
                            }`}
                        >
                            {team.logo ? (
                                <img src={team.logo} alt="" className="w-6 h-6 object-contain shrink-0" />
                            ) : (
                                <div className="w-6 h-6 bg-gray-200 rounded-full shrink-0" />
                            )}
                            <span className="text-gray-800">
                                {team.name} ({team.shortName})
                            </span>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

export default function GameManager() {
    const [games, setGames] = useState([]);
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState({ text: '', isError: false });

    const [selectedSeasonFilter, setSelectedSeasonFilter] = useState(SEASONS[0]);

    const [homeClubIdx, setHomeClubIdx] = useState(0);
    const [homeTeamLetter, setHomeTeamLetter] = useState(TEAMS[0].teams[0]);

    const [awayClubIdx, setAwayClubIdx] = useState(1);
    const [awayTeamLetter, setAwayTeamLetter] = useState(TEAMS[1].teams[0]);

    const [formData, setFormData] = useState({
        date: '',
        time: '',
        season: SEASONS[0],
        gameType: GAME_TYPES[0],
        status: 'UPCOMING',
        venue: 'Whitley Bay Ice Rink',
        buihaLink: '',
        homeScore: 0,
        awayScore: 0,
    });

    const [editingGameId, setEditingGameId] = useState(null);
    const [editFormData, setEditFormData] = useState({});

    const API_BASE = (import.meta.env.VITE_API_URL || 'https://newcastle-wildcats.onrender.com').replace(/\/$/, '');

    const isFormPastDate = formData.date ? new Date(`${formData.date}T${formData.time || '00:00'}`) < new Date() : false;

    const groupedGameTypes = GAME_TYPES.reduce((acc, type) => {
        let category = 'General';
        if (type.startsWith('Cup Comp North')) category = 'Cup Comp North';
        else if (type.startsWith('Cup Comp South')) category = 'Cup Comp South';
        else if (type.startsWith('National Championships')) category = 'National Championships';

        if (!acc[category]) acc[category] = [];
        acc[category].push(type);
        return acc;
    }, {});

    const formatGameTypeLabel = (type) => {
        if (type.includes(' - ')) {
            return type.split(' - ').slice(1).join(' - ');
        }
        return type;
    };

    const fetchGames = async () => {
        try {
            const res = await fetch(`${API_BASE}/api/games`);
            if (!res.ok) throw new Error('Could not fetch games');
            const data = await res.json();
            setGames(data);
        } catch (err) {
            setMessage({ text: 'Failed to fetch games.', isError: true });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchGames();
    }, []);

    const handleHomeClubChange = (idx) => {
        setHomeClubIdx(idx);
        setHomeTeamLetter(TEAMS[idx].teams[0]);
    };

    const handleAwayClubChange = (idx) => {
        setAwayClubIdx(idx);
        setAwayTeamLetter(TEAMS[1].teams[0]);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage({ text: '', isError: false });

        const combinedDateTime = new Date(`${formData.date}T${formData.time}`);
        const selectedHome = TEAMS[homeClubIdx];
        const selectedAway = TEAMS[awayClubIdx];

        const payload = {
            date: combinedDateTime.toISOString(),
            season: formData.season,
            gameType: formData.gameType,
            status: isFormPastDate ? 'END' : formData.status,
            venue: formData.venue,
            buihaLink: formData.buihaLink,
            homeTeam: {
                name: `${selectedHome.name} ${homeTeamLetter}`,
                shortName: `${selectedHome.shortName}-${homeTeamLetter}`,
                logo: selectedHome.logo,
                teamLetter: homeTeamLetter,
                score: isFormPastDate ? Number(formData.homeScore) || 0 : 0
            },
            awayTeam: {
                name: `${selectedAway.name} ${awayTeamLetter}`,
                shortName: `${selectedAway.shortName}-${awayTeamLetter}`,
                logo: selectedAway.logo,
                teamLetter: awayTeamLetter,
                score: isFormPastDate ? Number(formData.awayScore) || 0 : 0
            }
        };

        const userInfo = JSON.parse(localStorage.getItem('userInfo'));

        try {
            const res = await fetch(`${API_BASE}/api/games`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${userInfo?.token}`
                },
                body: JSON.stringify(payload)
            });

            if (!res.ok) throw new Error('Failed to create game');

            setMessage({ text: 'Game successfully added!', isError: false });
            fetchGames();
            setFormData(prev => ({ ...prev, homeScore: 0, awayScore: 0, buihaLink: '' }));
        } catch (err) {
            setMessage({ text: err.message, isError: true });
        }
    };

    const handleUpdateGame = async (gameId, updatedFields) => {
        const userInfo = JSON.parse(localStorage.getItem('userInfo'));
        try {
            const res = await fetch(`${API_BASE}/api/games/${gameId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${userInfo?.token}`
                },
                body: JSON.stringify(updatedFields)
            });
            if (!res.ok) throw new Error('Failed to update game');
            fetchGames();
            setEditingGameId(null);
        } catch (err) {
            alert(err.message);
        }
    };

    const handleDeleteGame = async (gameId) => {
        if (!window.confirm('Are you sure you want to delete this fixture?')) return;

        const userInfo = JSON.parse(localStorage.getItem('userInfo'));
        try {
            const res = await fetch(`${API_BASE}/api/games/${gameId}`, {
                method: 'DELETE',
                headers: {
                    Authorization: `Bearer ${userInfo?.token}`
                }
            });
            if (!res.ok) throw new Error('Failed to delete game');
            fetchGames();
        } catch (err) {
            alert(err.message);
        }
    };

    const startEditing = (game) => {
        const d = new Date(game.date);
        const localDate = d.toISOString().split('T')[0];
        const localTime = d.toTimeString().slice(0, 5);

        const hIdx = TEAMS.findIndex(t => game.homeTeam.name.includes(t.name)) ?? 0;
        const aIdx = TEAMS.findIndex(t => game.awayTeam.name.includes(t.name)) ?? 1;

        setEditingGameId(game._id);
        setEditFormData({
            date: localDate,
            time: localTime,
            season: game.season || SEASONS[0],
            venue: game.venue,
            buihaLink: game.buihaLink || '',
            gameType: game.gameType,
            status: game.status === 'LIVE' ? 'UPCOMING' : game.status,
            homeClubIdx: hIdx >= 0 ? hIdx : 0,
            homeTeamLetter: game.homeTeam.teamLetter || 'A',
            awayClubIdx: aIdx >= 0 ? aIdx : 1,
            awayTeamLetter: game.awayTeam.teamLetter || 'A',
            homeScore: game.homeTeam.score,
            awayScore: game.awayTeam.score
        });
    };

    const saveEdit = (game) => {
        const combinedDateTime = new Date(`${editFormData.date}T${editFormData.time}`);
        const selectedHome = TEAMS[editFormData.homeClubIdx];
        const selectedAway = TEAMS[editFormData.awayClubIdx];

        handleUpdateGame(game._id, {
            date: combinedDateTime.toISOString(),
            season: editFormData.season,
            venue: editFormData.venue,
            buihaLink: editFormData.buihaLink,
            gameType: editFormData.gameType,
            status: editFormData.status,
            homeTeam: {
                name: `${selectedHome.name} ${editFormData.homeTeamLetter}`,
                shortName: `${selectedHome.shortName}-${editFormData.homeTeamLetter}`,
                logo: selectedHome.logo,
                teamLetter: editFormData.homeTeamLetter,
                score: Number(editFormData.homeScore) || 0
            },
            awayTeam: {
                name: `${selectedAway.name} ${editFormData.awayTeamLetter}`,
                shortName: `${selectedAway.shortName}-${editFormData.awayTeamLetter}`,
                logo: selectedAway.logo,
                teamLetter: editFormData.awayTeamLetter,
                score: Number(editFormData.awayScore) || 0
            }
        });
    };

    const filteredGames = games
        .filter(g => (g.season || '2026/27') === selectedSeasonFilter)
        .sort((a, b) => new Date(b.date) - new Date(a.date));

    return (
        <div className="max-w-5xl mx-auto p-4 sm:p-6 font-sans">
            <h1 className="text-2xl font-bold font-wildcats text-wildcats-blue uppercase mb-6">
                Game Manager
            </h1>

            {message.text && (
                <div className={`p-3 mb-6 text-sm font-semibold ${message.isError ? 'bg-red-100 text-red-700 border border-red-300' : 'bg-green-100 text-green-700 border border-green-300'}`}>
                    {message.text}
                </div>
            )}

            <div className="bg-white border border-gray-200 shadow-md p-6 mb-10">
                <h2 className="text-lg font-bold font-wildcats text-gray-800 uppercase tracking-wide border-b border-gray-200 pb-2 mb-4">
                    New Game Details
                </h2>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-6 gap-4">
                        <div>
                            <label className="block text-xs font-bold uppercase text-gray-600 mb-1">Season</label>
                            <select
                                value={formData.season}
                                onChange={(e) => setFormData({ ...formData, season: e.target.value })}
                                className="w-full border p-2 text-sm bg-white font-bold outline-none focus:border-wildcats-blue"
                            >
                                {SEASONS.map((s) => (
                                    <option key={s} value={s}>{s}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs font-bold uppercase text-gray-600 mb-1">Date</label>
                            <input
                                type="date"
                                required
                                value={formData.date}
                                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                                className="w-full border p-2 text-sm outline-none focus:border-wildcats-blue"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold uppercase text-gray-600 mb-1">Time</label>
                            <input
                                type="time"
                                required
                                value={formData.time}
                                onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                                className="w-full border p-2 text-sm outline-none focus:border-wildcats-blue"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold uppercase text-gray-600 mb-1">Game Type</label>
                            <select
                                value={formData.gameType}
                                onChange={(e) => setFormData({ ...formData, gameType: e.target.value })}
                                className="w-full border p-2 text-sm outline-none focus:border-wildcats-blue truncate"
                            >
                                {Object.entries(groupedGameTypes).map(([category, options]) => (
                                    <optgroup key={category} label={category}>
                                        {options.map((type) => (
                                            <option key={type} value={type}>
                                                {formatGameTypeLabel(type)}
                                            </option>
                                        ))}
                                    </optgroup>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs font-bold uppercase text-gray-600 mb-1">Venue</label>
                            <input
                                type="text"
                                required
                                value={formData.venue}
                                onChange={(e) => setFormData({ ...formData, venue: e.target.value })}
                                placeholder="Whitley Bay Ice Rink"
                                className="w-full border border-gray-300 p-2 text-sm outline-none focus:border-wildcats-blue"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold uppercase text-gray-600 mb-1">BUIHA Link</label>
                            <input
                                type="url"
                                value={formData.buihaLink}
                                onChange={(e) => setFormData({ ...formData, buihaLink: e.target.value })}
                                placeholder="https://buiha.org.uk/..."
                                className="w-full border border-gray-300 p-2 text-sm outline-none focus:border-wildcats-blue"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-gray-50 p-4 border border-gray-200">
                        <div className="space-y-3">
                            <TeamSelectDropdown
                                label="Home Team"
                                labelColorClass="text-wildcats-red"
                                selectedIndex={homeClubIdx}
                                onSelect={handleHomeClubChange}
                            />

                            <div className="flex gap-3">
                                <div className="flex-1">
                                    <label className="block text-[11px] font-bold text-gray-500 uppercase mb-1">Team</label>
                                    <select
                                        value={homeTeamLetter}
                                        onChange={(e) => setHomeTeamLetter(e.target.value)}
                                        className="w-full border border-gray-300 p-2 text-sm bg-white font-bold"
                                    >
                                        {TEAMS[homeClubIdx].teams.map((letter) => (
                                            <option key={letter} value={letter}>
                                                {letter}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                {isFormPastDate && (
                                    <div className="w-24">
                                        <label className="block text-[11px] font-bold text-wildcats-red uppercase mb-1">Score</label>
                                        <input
                                            type="number"
                                            min="0"
                                            value={formData.homeScore}
                                            onChange={(e) => setFormData({ ...formData, homeScore: e.target.value })}
                                            className="w-full border border-gray-300 bg-white p-2 text-center text-sm font-bold outline-none focus:border-wildcats-blue"
                                        />
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="space-y-3">
                            <TeamSelectDropdown
                                label="Away Team"
                                labelColorClass="text-wildcats-blue"
                                selectedIndex={awayClubIdx}
                                onSelect={handleAwayClubChange}
                            />

                            <div className="flex gap-3">
                                <div className="flex-1">
                                    <label className="block text-[11px] font-bold text-gray-500 uppercase mb-1">Team</label>
                                    <select
                                        value={awayTeamLetter}
                                        onChange={(e) => setAwayTeamLetter(e.target.value)}
                                        className="w-full border border-gray-300 p-2 text-sm bg-white font-bold"
                                    >
                                        {TEAMS[awayClubIdx].teams.map((letter) => (
                                            <option key={letter} value={letter}>
                                                {letter}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                {isFormPastDate && (
                                    <div className="w-24">
                                        <label className="block text-[11px] font-bold text-wildcats-blue uppercase mb-1">Score</label>
                                        <input
                                            type="number"
                                            min="0"
                                            value={formData.awayScore}
                                            onChange={(e) => setFormData({ ...formData, awayScore: e.target.value })}
                                            className="w-full border border-gray-300 bg-white p-2 text-center text-sm font-bold outline-none focus:border-wildcats-blue"
                                        />
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    <button
                        type="submit"
                        className="w-full bg-wildcats-red hover:bg-red-700 text-white font-bold font-wildcats py-2.5 uppercase tracking-wider text-xs transition-colors cursor-pointer"
                    >
                        Save Game
                    </button>
                </form>
            </div>

            <div className="bg-white border border-gray-200 shadow-md p-6">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between border-b border-gray-200 pb-3 mb-4 gap-3">
                    <h2 className="text-lg font-bold font-wildcats text-gray-800 uppercase tracking-wide">
                        Existing Fixtures
                    </h2>

                    <div className="flex flex-wrap gap-1 bg-gray-100 p-1 border border-gray-200">
                        {SEASONS.map((season) => (
                            <button
                                key={season}
                                type="button"
                                onClick={() => setSelectedSeasonFilter(season)}
                                className={`px-3 py-1 text-xs font-bold uppercase cursor-pointer transition-colors ${
                                    selectedSeasonFilter === season
                                        ? 'bg-wildcats-blue text-white shadow-xs'
                                        : 'text-gray-600 hover:text-gray-900'
                                }`}
                            >
                                {season}
                            </button>
                        ))}
                    </div>
                </div>

                {loading ? (
                    <p className="text-sm text-gray-500">Loading scheduled games...</p>
                ) : filteredGames.length === 0 ? (
                    <p className="text-sm text-gray-500 italic py-4 text-center">No fixtures found for the {selectedSeasonFilter} season.</p>
                ) : (
                    <div className="space-y-4">
                        {filteredGames.map((game) => {
                            const isEditing = editingGameId === game._id;
                            const isPastGame = new Date(editFormData.date || game.date) < new Date();

                            return (
                                <div
                                    key={game._id}
                                    className={`border rounded p-4 flex flex-col gap-4 transition-all shadow-sm ${
                                        isEditing ? 'border-wildcats-blue bg-blue-50/20' : 'border-gray-200 bg-gray-50'
                                    }`}
                                >
                                    {isEditing ? (
                                        <div className="space-y-4">
                                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-6 gap-3">
                                                <div>
                                                    <label className="block text-[10px] font-bold uppercase text-gray-500 mb-0.5">Season</label>
                                                    <select
                                                        value={editFormData.season}
                                                        onChange={(e) => setEditFormData({ ...editFormData, season: e.target.value })}
                                                        className="w-full border p-1.5 text-xs bg-white font-semibold"
                                                    >
                                                        {SEASONS.map(s => <option key={s} value={s}>{s}</option>)}
                                                    </select>
                                                </div>
                                                <div>
                                                    <label className="block text-[10px] font-bold uppercase text-gray-500 mb-0.5">Date</label>
                                                    <input
                                                        type="date"
                                                        value={editFormData.date}
                                                        onChange={(e) => setEditFormData({ ...editFormData, date: e.target.value })}
                                                        className="w-full border p-1.5 text-xs bg-white font-semibold"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-[10px] font-bold uppercase text-gray-500 mb-0.5">Time</label>
                                                    <input
                                                        type="time"
                                                        value={editFormData.time}
                                                        onChange={(e) => setEditFormData({ ...editFormData, time: e.target.value })}
                                                        className="w-full border p-1.5 text-xs bg-white font-semibold"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-[10px] font-bold uppercase text-gray-500 mb-0.5">Venue</label>
                                                    <input
                                                        type="text"
                                                        value={editFormData.venue}
                                                        onChange={(e) => setEditFormData({ ...editFormData, venue: e.target.value })}
                                                        className="w-full border p-1.5 text-xs bg-white font-semibold"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-[10px] font-bold uppercase text-gray-500 mb-0.5">BUIHA Link</label>
                                                    <input
                                                        type="url"
                                                        value={editFormData.buihaLink}
                                                        onChange={(e) => setEditFormData({ ...editFormData, buihaLink: e.target.value })}
                                                        className="w-full border p-1.5 text-xs bg-white font-semibold"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-[10px] font-bold uppercase text-gray-500 mb-0.5">Game Type</label>
                                                    <select
                                                        value={editFormData.gameType}
                                                        onChange={(e) => setEditFormData({ ...editFormData, gameType: e.target.value })}
                                                        className="w-full border p-1.5 text-xs bg-white font-semibold truncate"
                                                    >
                                                        {Object.entries(groupedGameTypes).map(([category, options]) => (
                                                            <optgroup key={category} label={category}>
                                                                {options.map((type) => (
                                                                    <option key={type} value={type}>
                                                                        {formatGameTypeLabel(type)}
                                                                    </option>
                                                                ))}
                                                            </optgroup>
                                                        ))}
                                                    </select>
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-white p-3 border border-gray-200 rounded">
                                                <div className="space-y-2">
                                                    <TeamSelectDropdown
                                                        label="Home Team"
                                                        labelColorClass="text-wildcats-red"
                                                        selectedIndex={editFormData.homeClubIdx}
                                                        onSelect={(idx) => {
                                                            setEditFormData({
                                                                ...editFormData,
                                                                homeClubIdx: idx,
                                                                homeTeamLetter: TEAMS[idx].teams[0]
                                                            });
                                                        }}
                                                    />
                                                    <div className="flex gap-2">
                                                        <div className="flex-1">
                                                            <span className="text-[10px] font-bold text-gray-500 uppercase">Team:</span>
                                                            <select
                                                                value={editFormData.homeTeamLetter}
                                                                onChange={(e) => setEditFormData({ ...editFormData, homeTeamLetter: e.target.value })}
                                                                className="w-full border p-1 text-xs font-bold bg-white rounded"
                                                            >
                                                                {TEAMS[editFormData.homeClubIdx]?.teams.map((l) => (
                                                                    <option key={l} value={l}>{l}</option>
                                                                ))}
                                                            </select>
                                                        </div>
                                                        {isPastGame && (
                                                            <div className="w-20">
                                                                <span className="text-[10px] font-bold text-wildcats-red uppercase">Score:</span>
                                                                <input
                                                                    type="number"
                                                                    value={editFormData.homeScore}
                                                                    onChange={(e) => setEditFormData({ ...editFormData, homeScore: e.target.value })}
                                                                    className="w-full border p-1 text-center text-xs font-bold bg-white rounded"
                                                                />
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>

                                                <div className="space-y-2">
                                                    <TeamSelectDropdown
                                                        label="Away Team"
                                                        labelColorClass="text-wildcats-blue"
                                                        selectedIndex={editFormData.awayClubIdx}
                                                        onSelect={(idx) => {
                                                            setEditFormData({
                                                                ...editFormData,
                                                                awayClubIdx: idx,
                                                                awayTeamLetter: TEAMS[idx].teams[0]
                                                            });
                                                        }}
                                                    />
                                                    <div className="flex gap-2">
                                                        <div className="flex-1">
                                                            <span className="text-[10px] font-bold text-gray-500 uppercase">Team:</span>
                                                            <select
                                                                value={editFormData.awayTeamLetter}
                                                                onChange={(e) => setEditFormData({ ...editFormData, awayTeamLetter: e.target.value })}
                                                                className="w-full border p-1 text-xs font-bold bg-white rounded"
                                                            >
                                                                {TEAMS[editFormData.awayClubIdx]?.teams.map((l) => (
                                                                    <option key={l} value={l}>{l}</option>
                                                                ))}
                                                            </select>
                                                        </div>
                                                        {isPastGame && (
                                                            <div className="w-20">
                                                                <span className="text-[10px] font-bold text-wildcats-blue uppercase">Score:</span>
                                                                <input
                                                                    type="number"
                                                                    value={editFormData.awayScore}
                                                                    onChange={(e) => setEditFormData({ ...editFormData, awayScore: e.target.value })}
                                                                    className="w-full border p-1 text-center text-xs font-bold bg-white rounded"
                                                                />
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="flex justify-between items-center bg-white p-3 border border-gray-200 rounded">
                                                <span className="text-xs text-gray-500 italic">
                                                    {isPastGame ? 'Past game editing mode' : 'Upcoming game mode'}
                                                </span>

                                                <select
                                                    value={editFormData.status}
                                                    onChange={(e) => setEditFormData({ ...editFormData, status: e.target.value })}
                                                    className="border p-1 text-xs font-bold uppercase bg-gray-50"
                                                >
                                                    <option value="UPCOMING">UPCOMING</option>
                                                    <option value="END">END</option>
                                                </select>
                                            </div>

                                            <div className="flex justify-end gap-2 pt-1">
                                                <button
                                                    onClick={() => setEditingGameId(null)}
                                                    className="px-3 py-1 bg-gray-200 hover:bg-gray-300 text-gray-700 text-xs font-bold uppercase rounded transition-colors cursor-pointer"
                                                >
                                                    Cancel
                                                </button>
                                                <button
                                                    onClick={() => saveEdit(game)}
                                                    className="px-3 py-1 bg-green-600 hover:bg-green-700 text-white text-xs font-bold uppercase rounded transition-colors cursor-pointer"
                                                >
                                                    Save Changes
                                                </button>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
                                            <div className="space-y-1.5">
                                                <div className="flex flex-wrap items-center gap-2 text-xs font-bold text-gray-800">
                                                    <span>{new Date(game.date).toLocaleDateString()}</span>
                                                    <span className="text-gray-300">|</span>
                                                    <span>{new Date(game.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                                    <span className="text-gray-300">|</span>
                                                    <span className="text-gray-600 font-semibold italic">{game.venue}</span>
                                                    {game.buihaLink && (
                                                        <>
                                                            <span className="text-gray-300">|</span>
                                                            <a href={game.buihaLink} target="_blank" rel="noreferrer" className="text-wildcats-blue underline hover:text-blue-700">
                                                                BUIHA Link
                                                            </a>
                                                        </>
                                                    )}
                                                </div>

                                                <div className="text-sm font-bold text-gray-900 flex items-center gap-2 pt-0.5">
                                                    <span>{game.homeTeam.name}</span>
                                                    <span className="text-xs text-gray-400 font-normal uppercase">vs</span>
                                                    <span>{game.awayTeam.name}</span>
                                                </div>

                                                <div className="text-[10px] text-wildcats-blue font-bold uppercase tracking-wider">
                                                    {game.gameType}
                                                </div>
                                            </div>

                                            <div className="flex flex-wrap items-center gap-3 bg-white p-2.5 border border-gray-200 rounded w-full lg:w-auto justify-between lg:justify-end">
                                                <div className="flex items-center gap-2">
                                                    {game.homeTeam.logo ? (
                                                        <img src={game.homeTeam.logo} alt="" className="w-6 h-6 object-contain" />
                                                    ) : (
                                                        <div className="w-6 h-6 bg-gray-200 rounded-full flex items-center justify-center text-[10px] font-bold">
                                                            {game.homeTeam.teamLetter}
                                                        </div>
                                                    )}
                                                    <span className="w-6 text-center font-bold text-sm text-gray-800">
                                                        {game.homeTeam.score}
                                                    </span>
                                                </div>

                                                <span className="text-xs font-bold text-gray-300">:</span>

                                                <div className="flex items-center gap-2">
                                                    <span className="w-6 text-center font-bold text-sm text-gray-800">
                                                        {game.awayTeam.score}
                                                    </span>
                                                    {game.awayTeam.logo ? (
                                                        <img src={game.awayTeam.logo} alt="" className="w-6 h-6 object-contain" />
                                                    ) : (
                                                        <div className="w-6 h-6 bg-gray-200 rounded-full flex items-center justify-center text-[10px] font-bold">
                                                            {game.awayTeam.teamLetter}
                                                        </div>
                                                    )}
                                                </div>

                                                <div className="h-6 w-px bg-gray-200 hidden sm:block" />

                                                <span className={`px-2 py-1 text-xs font-bold uppercase rounded ${
                                                    game.status === 'END' || game.status === 'FINAL' ? 'bg-gray-100 text-gray-600' : 'bg-blue-50 text-wildcats-blue'
                                                }`}>
                                                    {game.status === 'FINAL' ? 'END' : game.status}
                                                </span>

                                                <div className="h-6 w-px bg-gray-200" />

                                                <div className="flex items-center gap-1">
                                                    <button
                                                        onClick={() => startEditing(game)}
                                                        title="Edit Game Details"
                                                        className="p-1.5 text-gray-600 hover:text-wildcats-blue hover:bg-gray-100 rounded transition-colors cursor-pointer text-xs font-semibold"
                                                    >
                                                        Edit
                                                    </button>
                                                    <button
                                                        onClick={() => handleDeleteGame(game._id)}
                                                        title="Delete Game"
                                                        className="p-1.5 text-red-600 hover:bg-red-50 rounded transition-colors cursor-pointer text-xs font-semibold"
                                                    >
                                                        Delete
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}