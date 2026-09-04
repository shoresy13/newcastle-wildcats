import React, { useState, useEffect } from 'react';
import { TEAMS } from '../utils/teams';
import { formatGameTypeLabel } from '../utils/formatters';

const SEASONS = ["2026/27", "2025/26"];

export default function Games() {
    const [games, setGames] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedSeason, setSelectedSeason] = useState(SEASONS[0]);
    const [selectedTeamFilter, setSelectedTeamFilter] = useState('ALL');
    const [filterTab, setFilterTab] = useState('ALL');

    const API_BASE = (import.meta.env.VITE_API_URL || 'https://newcastle-wildcats.onrender.com').replace(/\/$/, '');

    useEffect(() => {
        const fetchGames = async () => {
            try {
                const res = await fetch(`${API_BASE}/api/games`);
                if (!res.ok) throw new Error('Failed to fetch games');
                const data = await res.json();
                setGames(data);

                const hasDefaultSeasonGames = data.some(g => (g.season || '2026/27') === SEASONS[0]);
                if (!hasDefaultSeasonGames) {
                    setSelectedSeason(SEASONS[1]);
                }
            } catch (err) {
                console.error('Error fetching games:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchGames();
    }, [API_BASE]);

    const getFullTeamName = (teamObj) => {
        if (!teamObj) return '';
        const matchedClub = TEAMS.find(t => teamObj.name.includes(t.name) || teamObj.shortName?.includes(t.shortName));
        if (matchedClub) {
            return `${matchedClub.name} ${teamObj.teamLetter || ''}`.trim();
        }
        return teamObj.name;
    };

    const getGameOutcome = (game) => {
        const isEnded = game.status === 'END' || game.status === 'FINAL';
        if (!isEnded) return { text: 'UPCOMING', className: 'border-gray-300 text-gray-500 bg-gray-50' };

        const isHomeWildcat = game.homeTeam.name.toLowerCase().includes('wildcats');
        const wildcatScore = isHomeWildcat ? game.homeTeam.score : game.awayTeam.score;
        const oppScore = isHomeWildcat ? game.awayTeam.score : game.homeTeam.score;

        if (wildcatScore > oppScore) {
            return { text: 'WIN', className: 'border-green-600 text-green-700 bg-green-50' };
        } else if (wildcatScore < oppScore) {
            return { text: 'LOSS', className: 'border-red-600 text-red-700 bg-red-50' };
        } else {
            return { text: 'DRAW', className: 'border-yellow-600 text-yellow-700 bg-yellow-50' };
        }
    };

    const wildcatsClub = TEAMS.find(t => t.name.toLowerCase().includes('wildcats') || t.shortName.toLowerCase().includes('wildcats'));
    const allWildcatTeamVariants = wildcatsClub
        ? wildcatsClub.teams.map(letter => `${wildcatsClub.name} ${letter}`)
        : [];

    const filteredGames = games
        .filter(g => (g.season || '2026/27') === selectedSeason)
        .filter(g => {
            if (selectedTeamFilter === 'ALL') return true;
            const homeName = getFullTeamName(g.homeTeam);
            const awayName = getFullTeamName(g.awayTeam);
            return homeName === selectedTeamFilter || awayName === selectedTeamFilter;
        })
        .filter(g => {
            const isEnded = g.status === 'END' || g.status === 'FINAL';
            if (filterTab === 'UPCOMING') return !isEnded;
            if (filterTab === 'RESULTS') return isEnded;
            return true;
        })
        .sort((a, b) => new Date(b.date) - new Date(a.date));

    return (
        <div className="max-w-5xl mx-auto p-4 sm:p-6 font-sans">
            <div className="flex items-center justify-between border-b border-gray-200 pb-4 mb-6 gap-2">
                <h1 className="text-xl sm:text-2xl font-bold font-wildcats text-wildcats-blue uppercase tracking-wide">
                    Fixtures & Results
                </h1>

                <div className="flex gap-1 bg-gray-100 p-0.5 sm:p-1 border border-gray-200 shrink-0">
                    {SEASONS.map((season) => (
                        <button
                            key={season}
                            type="button"
                            onClick={() => setSelectedSeason(season)}
                            className={`px-2 py-1 sm:px-3 sm:py-1 text-[10px] sm:text-xs font-bold uppercase cursor-pointer transition-colors ${
                                selectedSeason === season
                                    ? 'bg-wildcats-blue text-white shadow-xs'
                                    : 'text-gray-600 hover:text-gray-900'
                            }`}
                        >
                            {season}
                        </button>
                    ))}
                </div>
            </div>

            <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 mb-6">
                <div className="grid grid-cols-3 gap-1.5 sm:flex sm:gap-2">
                    {['ALL', 'UPCOMING', 'RESULTS'].map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setFilterTab(tab)}
                            className={`px-3 py-2 sm:px-4 sm:py-1.5 text-xs font-bold uppercase tracking-wider transition-colors border cursor-pointer text-center ${
                                filterTab === tab
                                    ? 'bg-wildcats-red text-white border-wildcats-red'
                                    : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                            }`}
                        >
                            {tab}
                        </button>
                    ))}
                </div>

                <div className="flex items-center gap-2 bg-gray-50 px-3 py-2 border border-gray-200 w-full md:w-auto">
                    <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider shrink-0">Filter Team:</span>
                    <select
                        value={selectedTeamFilter}
                        onChange={(e) => setSelectedTeamFilter(e.target.value)}
                        className="border border-gray-300 bg-white px-2 py-1 text-xs font-bold uppercase text-gray-800 outline-none focus:border-wildcats-blue flex-1 md:flex-none"
                    >
                        <option value="ALL">All Teams</option>
                        {allWildcatTeamVariants.map((teamName) => (
                            <option key={teamName} value={teamName}>
                                {teamName}
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            {loading ? (
                <div className="py-12 text-center text-sm font-semibold text-gray-400 uppercase tracking-widest">
                    Loading Games...
                </div>
            ) : filteredGames.length === 0 ? (
                <div className="bg-white border border-gray-200 p-10 text-center text-gray-500 italic text-sm">
                    No games found for the {selectedSeason} season under this filter.
                </div>
            ) : (
                <div className="space-y-4">
                    {filteredGames.map((game) => {
                        const isEnded = game.status === 'END' || game.status === 'FINAL';
                        const gameDate = new Date(game.date);
                        const dateString = gameDate.toLocaleDateString(undefined, { month: 'short', day: 'numeric' }).toUpperCase();
                        const timeString = gameDate.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' }).toUpperCase();

                        const isHomeGame = game.venue.toLowerCase().includes('whitley bay');
                        const outcome = getGameOutcome(game);

                        const cardInner = (
                            <div className="bg-white border border-gray-200 hover:border-blue-300 hover:shadow-md transition-all p-5 flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden group">

                                <span className={`absolute top-0 left-0 px-3 py-0.5 text-[9px] font-bold uppercase tracking-widest text-white ${
                                    isHomeGame ? 'bg-wildcats-blue' : 'bg-wildcats-red'
                                }`}>
                                    {isHomeGame ? 'Home' : 'Away'}
                                </span>

                                <div className="w-full md:w-56 space-y-1 text-center md:text-left mt-2 md:mt-0">
                                    <div className="text-[10px] font-bold text-wildcats-blue uppercase tracking-wider">
                                        {formatGameTypeLabel(game.gameType)}
                                    </div>
                                    <div className="text-xs font-bold text-gray-700">
                                        {dateString} • {timeString}
                                    </div>
                                    <div className="text-[7px] sm:text-[8px] font-bold text-gray-400 uppercase tracking-wider truncate">
                                        {game.venue}
                                    </div>
                                </div>

                                <div className="flex-1 flex items-center justify-center gap-6 w-full">
                                    <div className="flex-1 flex flex-col items-center text-center gap-2">
                                        {game.awayTeam.logo ? (
                                            <img src={game.awayTeam.logo} alt="" className="w-12 h-12 sm:w-14 sm:h-14 object-contain" />
                                        ) : (
                                            <div className="w-12 h-12 sm:w-14 sm:h-14 bg-gray-200 flex items-center justify-center text-xs font-bold">
                                                {game.awayTeam.teamLetter}
                                            </div>
                                        )}
                                        <span className="text-xs sm:text-sm font-bold text-gray-900 uppercase">
                                            {getFullTeamName(game.awayTeam)}
                                        </span>
                                    </div>

                                    <div className="flex items-center gap-3 bg-gray-50 px-4 py-2 border border-gray-200 shadow-xs shrink-0">
                                        <span className="font-bold text-lg text-gray-900 w-7 text-center">
                                            {isEnded ? game.awayTeam.score : '—'}
                                        </span>
                                        <span className="text-xs text-gray-300 font-bold">:</span>
                                        <span className="font-bold text-lg text-gray-900 w-7 text-center">
                                            {isEnded ? game.homeTeam.score : '—'}
                                        </span>
                                    </div>

                                    <div className="flex-1 flex flex-col items-center text-center gap-2">
                                        {game.homeTeam.logo ? (
                                            <img src={game.homeTeam.logo} alt="" className="w-12 h-12 sm:w-14 sm:h-14 object-contain" />
                                        ) : (
                                            <div className="w-12 h-12 sm:w-14 sm:h-14 bg-gray-200 flex items-center justify-center text-xs font-bold">
                                                {game.homeTeam.teamLetter}
                                            </div>
                                        )}
                                        <span className="text-xs sm:text-sm font-bold text-gray-900 uppercase">
                                            {getFullTeamName(game.homeTeam)}
                                        </span>
                                    </div>
                                </div>

                                <div className="w-full md:w-32 flex justify-center md:justify-end">
                                    <span className={`px-4 py-2 text-xs font-bold uppercase tracking-wider border text-center w-full md:w-auto ${outcome.className}`}>
                                        {outcome.text}
                                    </span>
                                </div>
                            </div>
                        );

                        return game.buihaLink ? (
                            <a key={game._id} href={game.buihaLink} target="_blank" rel="noreferrer" className="block">
                                {cardInner}
                            </a>
                        ) : (
                            <div key={game._id}>
                                {cardInner}
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}