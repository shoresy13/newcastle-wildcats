import React, { useState, useEffect, useRef } from 'react';

export default function FixturesTopBar() {
    const [games, setGames] = useState([]);
    const [loading, setLoading] = useState(true);
    const [resizeKey, setResizeKey] = useState(0);
    const scrollContainerRef = useRef(null);

    const API_BASE = (import.meta.env.VITE_API_URL || 'https://newcastle-wildcats.onrender.com').replace(/\/$/, '');

    useEffect(() => {
        const fetchFixtures = async () => {
            try {
                const res = await fetch(`${API_BASE}/api/games`);
                if (!res.ok) throw new Error('Failed to fetch fixtures');
                const data = await res.json();

                const sorted = data.sort((a, b) => new Date(a.date) - new Date(b.date));
                setGames(sorted);
            } catch (err) {
                console.error('Failed to fetch top bar games:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchFixtures();
    }, [API_BASE]);

    useEffect(() => {
        const handleResize = () => {
            setResizeKey(prev => prev + 1);
        };

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    useEffect(() => {
        if (!loading && games.length > 0) {
            const timer = setTimeout(() => {
                if (scrollContainerRef.current) {
                    const container = scrollContainerRef.current;
                    const now = new Date();

                    const nextGame = games.find(g => new Date(g.date) >= now);

                    if (nextGame) {
                        const dateKey = new Date(nextGame.date).toISOString().split('T')[0];
                        const element = document.getElementById(`date-block-${dateKey}`);
                        if (element) {
                            container.scrollLeft = element.offsetLeft;
                            return;
                        }
                    }

                    container.scrollLeft = container.scrollWidth;
                }
            }, 100);
            return () => clearTimeout(timer);
        }
    }, [loading, games, resizeKey]);

    const groupedByDate = games.reduce((acc, game) => {
        const dateKey = new Date(game.date).toISOString().split('T')[0];
        if (!acc[dateKey]) acc[dateKey] = [];
        acc[dateKey].push(game);
        return acc;
    }, {});

    const dateColumns = Object.entries(groupedByDate);

    const scrollLeft = () => {
        if (scrollContainerRef.current) {
            scrollContainerRef.current.scrollBy({ left: -304, behavior: 'smooth' });
        }
    };

    const scrollRight = () => {
        if (scrollContainerRef.current) {
            scrollContainerRef.current.scrollBy({ left: 304, behavior: 'smooth' });
        }
    };

    const formatTeamName = (team) => {
        if (!team) return '';
        if (team.shortName && team.shortName.includes('-')) {
            return team.shortName.replace('-', ' ');
        }
        return team.shortName || team.name;
    };

    if (loading || games.length === 0) {
        return (
            <div className="w-full h-[88px] bg-white border-b border-gray-200 flex items-center justify-center">
                <span className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">Loading Schedule...</span>
            </div>
        );
    }

    return (
        <div key={resizeKey} className="w-full bg-white border-b border-gray-200 flex items-stretch h-[88px] select-none font-sans relative">

            <button
                onClick={scrollLeft}
                className="w-8 sm:w-10 flex-shrink-0 flex items-center justify-center bg-gray-50 hover:bg-gray-100 border-r border-gray-200 transition-colors cursor-pointer group z-10"
                aria-label="Scroll Left"
            >
                <svg className="w-4 h-4 text-gray-700 group-hover:-translate-x-0.5 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M15 19l-7-7 7-7" />
                </svg>
            </button>

            <div
                ref={scrollContainerRef}
                className="flex-1 flex overflow-x-auto scroll-smooth whitespace-nowrap"
                style={{
                    scrollbarWidth: 'none',
                    msOverflowStyle: 'none',
                    scrollSnapType: 'x mandatory',
                    scrollBehavior: 'smooth'
                }}
            >
                <style>{`
                    div::-webkit-scrollbar { display: none; }
                `}</style>

                <div className="flex items-stretch min-w-max">
                    {dateColumns.map(([dateStr, dayGames]) => {
                        const dateObj = new Date(dateStr);
                        const month = dateObj.toLocaleDateString(undefined, { month: 'short' }).toUpperCase();
                        const day = dateObj.getDate();

                        return (
                            <div
                                key={dateStr}
                                id={`date-block-${dateStr}`}
                                className="flex flex-shrink-0 items-stretch border-r border-gray-300"
                                style={{ scrollSnapAlign: 'start', scrollSnapStop: 'always' }}
                            >
                                <div className="w-[54px] flex flex-col items-center justify-center bg-[#f4f4f4] border-r border-gray-200 px-1">
                                    <span className="text-[10px] font-bold text-gray-500 leading-tight tracking-wider">{month}</span>
                                    <span className="text-[16px] font-extrabold text-gray-900 leading-none mt-0.5">{day}</span>
                                </div>

                                <div className="flex items-stretch bg-white">
                                    {dayGames.map((game, idx) => {
                                        const isEnded = game.status === 'END' || game.status === 'FINAL';
                                        const timeString = new Date(game.date).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' }).toUpperCase();

                                        return (
                                            <div
                                                key={game._id}
                                                className={`w-[250px] flex flex-col justify-between px-3.5 py-1.5 hover:bg-gray-50/50 transition-colors ${
                                                    idx !== dayGames.length - 1 ? 'border-r-2 border-gray-200' : ''
                                                }`}
                                            >
                                                <div className="text-[8px] font-bold text-gray-400 uppercase tracking-wider truncate whitespace-nowrap mb-1">
                                                    {game.gameType || 'GAME'}
                                                </div>

                                                <div className="flex items-center justify-between">
                                                    <div className="flex-1 flex flex-col gap-0.5">
                                                        {/* Away Team */}
                                                        <div className="flex items-center gap-2">
                                                            {game.awayTeam.logo ? (
                                                                <img src={game.awayTeam.logo} alt="" className="w-4 h-4 object-contain shrink-0" />
                                                            ) : (
                                                                <div className="w-4 h-4 bg-gray-200 rounded-full flex items-center justify-center text-[8px] font-bold shrink-0">
                                                                    {game.awayTeam.teamLetter}
                                                                </div>
                                                            )}
                                                            <span className="text-[12px] font-bold text-gray-900 uppercase flex-1 truncate tracking-wide">
                                                                {formatTeamName(game.awayTeam)}
                                                            </span>
                                                            <span className="text-[12px] font-extrabold text-gray-900 w-6 text-right shrink-0">
                                                                {isEnded ? game.awayTeam.score : '—'}
                                                            </span>
                                                        </div>

                                                        <div className="flex items-center gap-2">
                                                            {game.homeTeam.logo ? (
                                                                <img src={game.homeTeam.logo} alt="" className="w-4 h-4 object-contain shrink-0" />
                                                            ) : (
                                                                <div className="w-4 h-4 bg-gray-200 rounded-full flex items-center justify-center text-[8px] font-bold shrink-0">
                                                                    {game.homeTeam.teamLetter}
                                                                </div>
                                                            )}
                                                            <span className="text-[12px] font-bold text-gray-900 uppercase flex-1 truncate tracking-wide">
                                                                {formatTeamName(game.homeTeam)}
                                                            </span>
                                                            <span className="text-[12px] font-extrabold text-gray-900 w-6 text-right shrink-0">
                                                                {isEnded ? game.homeTeam.score : '—'}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="flex items-center justify-between pt-1 border-t border-gray-100 text-[10px] font-semibold text-gray-600 tracking-wide mt-1">
                                                    <span className="shrink-0">{timeString}</span>
                                                    <span className="truncate max-w-[145px] text-right font-normal text-gray-500">{game.venue}</span>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            <button
                onClick={scrollRight}
                className="w-8 sm:w-10 flex-shrink-0 flex items-center justify-center bg-gray-50 hover:bg-gray-100 border-l border-gray-200 transition-colors cursor-pointer group z-10"
                aria-label="Scroll Right"
            >
                <svg className="w-4 h-4 text-gray-700 group-hover:translate-x-0.5 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M9 5l7 7-7 7" />
                </svg>
            </button>
        </div>
    );
}