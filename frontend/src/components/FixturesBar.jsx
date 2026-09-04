import React, { useState, useEffect, useRef } from 'react';

export default function FixturesBar() {
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

    const getAllSnapElements = () => {
        if (!scrollContainerRef.current) return [];
        const elements = [];
        dateColumns.forEach(([dateStr, dayGames]) => {
            const dateEl = document.getElementById(`date-block-${dateStr}`);
            if (dateEl) elements.push(dateEl);
            dayGames.forEach(game => {
                const gameEl = document.getElementById(`game-card-${game._id}`);
                if (gameEl) elements.push(gameEl);
            });
        });
        return elements;
    };

    const scrollByDirection = (direction) => {
        if (!scrollContainerRef.current) return;
        const container = scrollContainerRef.current;
        const currentScroll = container.scrollLeft;
        const elements = getAllSnapElements();
        if (elements.length === 0) return;

        let currentIndex = 0;
        let minDiff = Infinity;
        elements.forEach((el, idx) => {
            const diff = Math.abs(el.offsetLeft - currentScroll);
            if (diff < minDiff) {
                minDiff = diff;
                currentIndex = idx;
            }
        });

        let targetIndex = direction === 'right' ? currentIndex + 1 : currentIndex - 1;
        targetIndex = Math.max(0, Math.min(targetIndex, elements.length - 1));

        const targetElement = elements[targetIndex];
        if (targetElement) {
            container.scrollTo({ left: targetElement.offsetLeft, behavior: 'smooth' });
        }
    };

    const scrollLeft = () => scrollByDirection('left');
    const scrollRight = () => scrollByDirection('right');

    const formatTeamName = (team) => {
        if (!team) return '';
        if (team.shortName && team.shortName.includes('-')) {
            return team.shortName.replace('-', ' ');
        }
        return team.shortName || team.name;
    };

    const formatGameTypeBarLabel = (type) => {
        if (!type) return 'GAME';

        if (type.startsWith('Cup Comp North - ')) {
            const sub = type.replace('Cup Comp North - ', '');
            const shortSub = sub
                .replace('Checking ', 'CHK')
                .replace('Non-Check ', 'N-CHK')
                .replace("Women's", 'W')
                .replace(/\s+/g, '');
            return `N-${shortSub} NORTH`;
        }

        if (type.startsWith('Cup Comp South - ')) {
            const sub = type.replace('Cup Comp South - ', '');
            const shortSub = sub
                .replace('Checking ', 'CHK')
                .replace('Non-Check ', 'N-CHK')
                .replace("Women's", 'W')
                .replace(/\s+/g, '');
            return `S-${shortSub} SOUTH`;
        }

        if (type.startsWith('National Championships - ')) {
            const sub = type.replace('National Championships - ', '');
            const shortSub = sub
                .replace('Checking ', 'CHK ')
                .replace('Womens ', 'WMS ')
                .replace('Non-Check ', 'N-CHK ');
            return `${shortSub.toUpperCase()} NATS`;
        }

        return type.toUpperCase();
    };

    if (loading || games.length === 0) {
        return (
            <div className="w-full h-[76px] sm:h-[88px] bg-white border-b border-gray-200 flex items-center justify-center">
                <span className="text-[10px] sm:text-[11px] font-bold text-gray-400 uppercase tracking-widest">Loading Schedule...</span>
            </div>
        );
    }

    return (
        <div key={resizeKey} className="w-full bg-white border-b border-gray-200 flex items-stretch h-[76px] sm:h-[88px] select-none font-sans relative">

            <button
                onClick={scrollLeft}
                className="hidden lg:flex w-10 flex-shrink-0 items-center justify-center bg-gray-50 hover:bg-gray-100 border-r border-gray-200 transition-colors cursor-pointer group z-10"
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
                    scrollSnapType: 'x proximity',
                    scrollBehavior: 'smooth'
                }}
            >
                <style>{`
                    div::-webkit-scrollbar { display: none; }
                `}</style>

                <div className="flex items-center min-w-max">
                    {dateColumns.map(([dateStr, dayGames]) => {
                        const dateObj = new Date(dateStr);
                        const month = dateObj.toLocaleDateString(undefined, { month: 'short' }).toUpperCase();
                        const day = dateObj.getDate();

                        return (
                            <div
                                key={dateStr}
                                className="flex flex-shrink-0 items-stretch"
                            >
                                <div
                                    id={`date-block-${dateStr}`}
                                    className="w-[46px] sm:w-[54px] flex flex-col items-center justify-center bg-[#f4f4f4] border-r border-gray-200 px-1 flex-shrink-0"
                                    style={{ scrollSnapAlign: 'start' }}
                                >
                                    <span className="text-[9px] sm:text-[10px] font-bold text-gray-500 leading-tight tracking-wider">{month}</span>
                                    <span className="text-[14px] sm:text-[16px] font-extrabold text-gray-900 leading-none mt-0.5">{day}</span>
                                </div>

                                <div className="flex items-stretch bg-white">
                                    {dayGames.map((game, idx) => {
                                        const isEnded = game.status === 'END' || game.status === 'FINAL';
                                        const timeString = new Date(game.date).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' }).toUpperCase();

                                        const cardClassName = `w-[210px] sm:w-[250px] h-full flex flex-col justify-between px-3 sm:px-3.5 py-1 sm:py-1.5 bg-white hover:bg-blue-50/70 hover:shadow-inner transition-all duration-150 ${
                                            idx !== dayGames.length - 1 ? 'border-r-2 border-gray-200' : 'border-r border-gray-300'
                                        } flex-shrink-0`;

                                        const cardContent = (
                                            <>
                                                <div className="text-[7px] sm:text-[8px] font-bold text-gray-400 group-hover:text-wildcats-blue uppercase tracking-wider truncate whitespace-nowrap mb-0.5 sm:mb-1 transition-colors">
                                                    {formatGameTypeBarLabel(game.gameType)}
                                                </div>

                                                <div className="flex items-center justify-between">
                                                    <div className="flex-1 flex flex-col gap-0.5">
                                                        <div className="flex items-center gap-1.5 sm:gap-2">
                                                            {game.awayTeam.logo ? (
                                                                <img src={game.awayTeam.logo} alt="" className="w-3.5 h-3.5 sm:w-4 sm:h-4 object-contain shrink-0" />
                                                            ) : (
                                                                <div className="w-3.5 h-3.5 sm:w-4 sm:h-4 bg-gray-200 rounded-full flex items-center justify-center text-[7px] sm:text-[8px] font-bold shrink-0">
                                                                    {game.awayTeam.teamLetter}
                                                                </div>
                                                            )}
                                                            <span className="text-[11px] sm:text-[12px] font-bold text-gray-900 uppercase flex-1 truncate tracking-wide">
                                                                {formatTeamName(game.awayTeam)}
                                                            </span>
                                                            <span className="text-[11px] sm:text-[12px] font-extrabold text-gray-900 w-5 sm:w-6 text-right shrink-0">
                                                                {isEnded ? game.awayTeam.score : '—'}
                                                            </span>
                                                        </div>

                                                        <div className="flex items-center gap-1.5 sm:gap-2">
                                                            {game.homeTeam.logo ? (
                                                                <img src={game.homeTeam.logo} alt="" className="w-3.5 h-3.5 sm:w-4 sm:h-4 object-contain shrink-0" />
                                                            ) : (
                                                                <div className="w-3.5 h-3.5 sm:w-4 sm:h-4 bg-gray-200 rounded-full flex items-center justify-center text-[7px] sm:text-[8px] font-bold shrink-0">
                                                                    {game.homeTeam.teamLetter}
                                                                </div>
                                                            )}
                                                            <span className="text-[11px] sm:text-[12px] font-bold text-gray-900 uppercase flex-1 truncate tracking-wide">
                                                                {formatTeamName(game.homeTeam)}
                                                            </span>
                                                            <span className="text-[11px] sm:text-[12px] font-extrabold text-gray-900 w-5 sm:w-6 text-right shrink-0">
                                                                {isEnded ? game.homeTeam.score : '—'}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="flex items-center justify-between text-[7px] sm:text-[8px] font-bold text-gray-400 uppercase tracking-wider mt-1 gap-2">
                                                    <span className="shrink-0">{timeString}</span>
                                                    <span className="truncate text-right">{game.venue}</span>
                                                </div>
                                            </>
                                        );

                                        return (
                                            <div
                                                key={game._id}
                                                id={`game-card-${game._id}`}
                                                className="flex flex-shrink-0 items-stretch group"
                                                style={{ scrollSnapAlign: 'start' }}
                                            >
                                                {game.buihaLink ? (
                                                    <a
                                                        href={game.buihaLink}
                                                        target="_blank"
                                                        rel="noreferrer"
                                                        className={cardClassName}
                                                    >
                                                        {cardContent}
                                                    </a>
                                                ) : (
                                                    <div className={cardClassName}>
                                                        {cardContent}
                                                    </div>
                                                )}
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
                className="hidden lg:flex w-10 flex-shrink-0 items-center justify-center bg-gray-50 hover:bg-gray-100 border-l border-gray-200 transition-colors cursor-pointer group z-10"
                aria-label="Scroll Right"
            >
                <svg className="w-4 h-4 text-gray-700 group-hover:translate-x-0.5 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M9 5l7 7-7 7" />
                </svg>
            </button>
        </div>
    );
}