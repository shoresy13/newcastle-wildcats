import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router';
import { BUIHA_TEAMS } from '../utils/buihaTeams.js';
import { formatGameTypeLabel } from '../utils/formatters';

const DEFAULT_PROFILE_PIC = "https://buiha.org.uk/assets/img/profile/player-newcastle.jpg";

const POSITION_ORDER = { 'G': 1, 'D': 2, 'F': 3, '-': 4 };

const POSITION_LABELS = {
    'G': 'Netminder',
    'D': 'Defense',
    'F': 'Forward'
};

export default function TeamDetail() {
    const { teamId } = useParams();
    const navigate = useNavigate();

    const [team, setTeam] = useState(null);
    const [players, setPlayers] = useState([]);
    const [games, setGames] = useState([]);
    const [loading, setLoading] = useState(true);

    const API_BASE = (import.meta.env.VITE_API_URL || 'https://newcastle-wildcats.onrender.com').replace(/\/$/, '');

    useEffect(() => {
        const fetchTeamDetailData = async () => {
            if (!teamId) return;
            try {
                const [teamsRes, playersRes] = await Promise.all([
                    fetch(`${API_BASE}/api/teams`),
                    fetch(`${API_BASE}/api/players`)
                ]);
                if (!teamsRes.ok || !playersRes.ok) throw new Error('Data fetch failed for teams or players');

                const teamsData = await teamsRes.json();
                const playersData = await playersRes.json();

                const foundTeam = teamsData.find(t => (t.id || '').toLowerCase() === teamId.toLowerCase());
                if (!foundTeam) throw new Error('Team not found');

                setTeam(foundTeam);
                setPlayers(playersData);

                try {
                    const gamesRes = await fetch(`${API_BASE}/api/games`);
                    if (gamesRes.ok) {
                        const gamesData = await gamesRes.json();
                        setGames(gamesData);
                    }
                } catch (gameErr) {
                    console.warn('Could not fetch games, skipping game highlights:', gameErr);
                }

            } catch (err) {
                console.error('Error fetching team details:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchTeamDetailData();
    }, [API_BASE, teamId]);

    const getShorthandTeamName = (teamObj) => {
        if (!teamObj) return '';
        const matchedClub = BUIHA_TEAMS.find(t => teamObj.name.includes(t.name) || teamObj.shortName?.includes(t.shortName));
        if (matchedClub) {
            return `${matchedClub.shortName || matchedClub.name} ${teamObj.teamLetter || ''}`.trim();
        }
        return teamObj.shortName || teamObj.name;
    };

    const getFullTeamName = (teamObj) => {
        if (!teamObj) return '';
        const matchedClub = BUIHA_TEAMS.find(t => teamObj.name.includes(t.name) || teamObj.shortName?.includes(t.shortName));
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

    if (loading) {
        return (
            <div className="max-w-[1600px] mx-auto p-4 sm:p-6 font-sans">
                <div className="py-12 text-center text-sm font-semibold text-gray-400 uppercase tracking-widest">
                    Loading Team Info...
                </div>
            </div>
        );
    }

    if (!team) {
        return (
            <div className="max-w-[1600px] mx-auto p-4 sm:p-6 font-sans">
                <div className="bg-white border border-gray-200 p-10 text-center text-gray-500 italic text-sm">
                    Team not found.
                </div>
                <div className="mt-4 text-center">
                    <button
                        onClick={() => navigate('/teams')}
                        className="px-4 py-2 text-xs font-bold uppercase tracking-wider border border-gray-300 text-gray-700 bg-gray-50 hover:bg-gray-100 cursor-pointer"
                    >
                        &larr; Back to Teams
                    </button>
                </div>
            </div>
        );
    }

    const roster = team.roster || [];
    const wildcatsClub = BUIHA_TEAMS.find(t => t.name.toLowerCase().includes('wildcats') || t.shortName.toLowerCase().includes('wildcats'));
    const matchedClubLogo = wildcatsClub?.logo;

    const targetFullName = wildcatsClub
        ? `${wildcatsClub.name} ${team.id}`.toUpperCase()
        : team.name.toUpperCase();

    const captainNames = Array.isArray(team.captain) ? team.captain : (team.captain ? [team.captain] : []);
    const assistantNames = team.assistantCaptains || [];
    const coachNames = team.coaches || [];

    const getPlayerObjByName = (name) => players.find(p => p.name === name);

    const captainObjs = captainNames.map(name => getPlayerObjByName(name)).filter(Boolean);
    const assistantObjs = assistantNames.map(name => getPlayerObjByName(name)).filter(Boolean);
    const coachObjs = coachNames.map(name => getPlayerObjByName(name)).filter(Boolean);

    const sortedRoster = [...roster].sort((a, b) => {
        const posA = POSITION_ORDER[a.position || '-'] || 5;
        const posB = POSITION_ORDER[b.position || '-'] || 5;
        return posA - posB;
    });

    const trophies = team.trophies || [];

    const teamGames = games.filter(g => {
        if (!g.homeTeam || !g.awayTeam) return false;
        const homeName = getFullTeamName(g.homeTeam).toUpperCase();
        const awayName = getFullTeamName(g.awayTeam).toUpperCase();
        return homeName === targetFullName || awayName === targetFullName || homeName.includes(targetFullName) || awayName.includes(targetFullName);
    }).sort((a, b) => new Date(a.date) - new Date(b.date));

    const now = new Date();
    const upcomingGames = teamGames.filter(g => new Date(g.date) >= now && g.status !== 'END' && g.status !== 'FINAL');
    const pastGames = teamGames.filter(g => new Date(g.date) < now || g.status === 'END' || g.status === 'FINAL').reverse();

    const nextGame = upcomingGames.length > 0 ? upcomingGames[0] : null;
    const lastGame = pastGames.length > 0 ? pastGames[0] : null;

    const handlePlayerClick = (player) => {
        if (player && player.buihaProfileUrl) {
            window.open(player.buihaProfileUrl, '_blank', 'noreferrer');
        } else if (player && player.buihaLink) {
            window.open(player.buihaLink, '_blank', 'noreferrer');
        }
    };

    const renderGameCard = (game, labelTitle) => {
        if (!game) {
            return (
                <div className="bg-white border border-gray-200 p-5 flex flex-col justify-center items-center w-full h-full min-h-[140px] text-gray-400 italic text-xs">
                    No {labelTitle.toLowerCase()}.
                </div>
            );
        }

        const isEnded = game.status === 'END' || game.status === 'FINAL';
        const gameDate = new Date(game.date);
        const dateString = gameDate.toLocaleDateString(undefined, { month: 'short', day: 'numeric' }).toUpperCase();
        const timeString = gameDate.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' }).toUpperCase();
        const isHomeGame = game.venue.toLowerCase().includes('whitley bay');
        const outcome = getGameOutcome(game);

        const cardContent = (
            <div className="bg-white border border-gray-200 hover:border-blue-300 hover:shadow-md transition-all p-4 flex flex-col md:flex-row items-center justify-between gap-4 relative overflow-hidden group w-full h-full">
                <span className={`absolute top-0 left-0 px-3 py-0.5 text-[9px] font-bold uppercase tracking-widest text-white ${
                    isHomeGame ? 'bg-wildcats-blue' : 'bg-wildcats-red'
                }`}>
                    {isHomeGame ? 'Home' : 'Away'}
                </span>

                <div className="w-full md:w-44 space-y-1 text-center md:text-left mt-2 md:mt-0">
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
                    <div className="flex flex-col items-center gap-1">
                        {game.awayTeam.logo ? (
                            <img src={game.awayTeam.logo} alt="" className="w-12 h-12 object-contain" title={getFullTeamName(game.awayTeam)} />
                        ) : (
                            <div className="w-12 h-12 bg-gray-200 flex items-center justify-center text-xs font-bold">
                                {game.awayTeam.teamLetter}
                            </div>
                        )}
                        <span className="text-[9px] font-bold text-gray-700 uppercase tracking-wide">
                            {getShorthandTeamName(game.awayTeam)}
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

                    <div className="flex flex-col items-center gap-1">
                        {game.homeTeam.logo ? (
                            <img src={game.homeTeam.logo} alt="" className="w-12 h-12 object-contain" title={getFullTeamName(game.homeTeam)} />
                        ) : (
                            <div className="w-12 h-12 bg-gray-200 flex items-center justify-center text-xs font-bold">
                                {game.homeTeam.teamLetter}
                            </div>
                        )}
                        <span className="text-[9px] font-bold text-gray-700 uppercase tracking-wide">
                            {getShorthandTeamName(game.homeTeam)}
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
            <a href={game.buihaLink} target="_blank" rel="noreferrer" className="block w-full h-full">
                {cardContent}
            </a>
        ) : (
            <div className="w-full h-full">{cardContent}</div>
        );
    };

    return (
        <div className="max-w-[1600px] mx-auto p-4 sm:p-6 font-sans space-y-6">
            <div className="flex items-center justify-between border-b border-gray-200 pb-3 gap-2 min-w-0">
                <div className="flex items-center gap-3 truncate flex-wrap">
                    <div className="flex items-center gap-3">
                        {matchedClubLogo ? (
                            <img src={matchedClubLogo} alt="" className="w-8 h-8 sm:w-10 sm:h-10 object-contain shrink-0" />
                        ) : (
                            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gray-200 rounded-full flex items-center justify-center text-xs font-bold shrink-0">
                                {team.id}
                            </div>
                        )}
                        <h1 className="text-base min-[380px]:text-lg sm:text-2xl font-bold font-wildcats text-wildcats-blue uppercase tracking-wide truncate">
                            {team.name}
                        </h1>
                    </div>

                    <div className="flex items-center gap-2">
                        <span className="bg-gray-100 text-gray-600 border border-gray-200 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider">
                            {team.division || 'Unregistered'}
                        </span>
                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                            • {roster.length} {roster.length === 1 ? 'Player' : 'Players'}
                        </span>
                    </div>
                </div>

                <button
                    onClick={() => navigate('/teams')}
                    className="px-3 py-1.5 sm:px-4 sm:py-2 text-[10px] sm:text-xs font-bold uppercase tracking-wider border border-gray-300 text-gray-700 bg-gray-50 hover:bg-gray-100 text-center transition-colors cursor-pointer shrink-0 whitespace-nowrap"
                >
                    &larr; Back to Teams
                </button>
            </div>

            {team.description && (
                <div className="bg-white border border-gray-200 p-4 shadow-sm">
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-1">About Team</span>
                    <p className="text-xs text-gray-600 leading-relaxed max-w-4xl">
                        {team.description}
                    </p>
                </div>
            )}

            {(captainObjs.length > 0 || assistantObjs.length > 0 || coachObjs.length > 0) && (
                <div className="space-y-3">
                    <h2 className="text-sm font-bold font-wildcats text-wildcats-blue uppercase tracking-wider border-b border-gray-200 pb-1.5">
                        Team Leadership
                    </h2>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="bg-white border border-gray-200 p-3 flex flex-col space-y-2">
                            <span className="text-[10px] font-bold text-wildcats-red uppercase tracking-wider border-b border-gray-100 pb-1">
                                Captain
                            </span>
                            {captainObjs.length > 0 ? (
                                captainObjs.map(cap => {
                                    const profilePic = cap.profilePic || DEFAULT_PROFILE_PIC;
                                    return (
                                        <div
                                            key={cap._id}
                                            onClick={() => handlePlayerClick(cap)}
                                            className="border border-gray-100 hover:border-wildcats-blue hover:shadow-xs transition-all p-2.5 flex items-center justify-between gap-3 cursor-pointer group bg-gray-50/50"
                                        >
                                            <div className="flex items-center gap-3 min-w-0">
                                                <img
                                                    src={profilePic}
                                                    alt=""
                                                    onError={(e) => { e.target.src = DEFAULT_PROFILE_PIC; }}
                                                    className="w-9 h-9 object-cover rounded-full border border-gray-300 shrink-0"
                                                />
                                                <div className="min-w-0">
                                                    <div className="flex items-center gap-2 flex-wrap">
                                                        <span className="text-[10px] font-bold text-gray-400 shrink-0">
                                                            {cap.number ? `#${cap.number}` : '—'}
                                                        </span>
                                                        <h4 className="text-xs font-bold text-gray-900 group-hover:text-wildcats-blue uppercase tracking-wide truncate">
                                                            {cap.name}
                                                        </h4>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })
                            ) : (
                                <span className="text-xs text-gray-400 italic py-2">None assigned</span>
                            )}
                        </div>

                        <div className="bg-white border border-gray-200 p-3 flex flex-col space-y-2">
                            <span className="text-[10px] font-bold text-gray-700 uppercase tracking-wider border-b border-gray-100 pb-1">
                                Assistant Captains
                            </span>
                            {assistantObjs.length > 0 ? (
                                assistantObjs.map(ast => {
                                    const profilePic = ast.profilePic || DEFAULT_PROFILE_PIC;
                                    return (
                                        <div
                                            key={ast._id}
                                            onClick={() => handlePlayerClick(ast)}
                                            className="border border-gray-100 hover:border-wildcats-blue hover:shadow-xs transition-all p-2.5 flex items-center justify-between gap-3 cursor-pointer group bg-gray-50/50"
                                        >
                                            <div className="flex items-center gap-3 min-w-0">
                                                <img
                                                    src={profilePic}
                                                    alt=""
                                                    onError={(e) => { e.target.src = DEFAULT_PROFILE_PIC; }}
                                                    className="w-9 h-9 object-cover rounded-full border border-gray-300 shrink-0"
                                                />
                                                <div className="min-w-0">
                                                    <div className="flex items-center gap-2 flex-wrap">
                                                        <span className="text-[10px] font-bold text-gray-400 shrink-0">
                                                            {ast.number ? `#${ast.number}` : '—'}
                                                        </span>
                                                        <h4 className="text-xs font-bold text-gray-900 group-hover:text-wildcats-blue uppercase tracking-wide truncate">
                                                            {ast.name}
                                                        </h4>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })
                            ) : (
                                <span className="text-xs text-gray-400 italic py-2">None assigned</span>
                            )}
                        </div>

                        <div className="bg-white border border-gray-200 p-3 flex flex-col space-y-2">
                            <span className="text-[10px] font-bold text-wildcats-blue uppercase tracking-wider border-b border-gray-100 pb-1">
                                Coach
                            </span>
                            {coachObjs.length > 0 ? (
                                coachObjs.map(coach => {
                                    const profilePic = coach.profilePic || DEFAULT_PROFILE_PIC;
                                    return (
                                        <div
                                            key={coach._id}
                                            onClick={() => handlePlayerClick(coach)}
                                            className="border border-gray-100 hover:border-wildcats-blue hover:shadow-xs transition-all p-2.5 flex items-center justify-between gap-3 cursor-pointer group bg-gray-50/50"
                                        >
                                            <div className="flex items-center gap-3 min-w-0">
                                                <img
                                                    src={profilePic}
                                                    alt=""
                                                    onError={(e) => { e.target.src = DEFAULT_PROFILE_PIC; }}
                                                    className="w-9 h-9 object-cover rounded-full border border-gray-300 shrink-0"
                                                />
                                                <div className="min-w-0">
                                                    <div className="flex items-center gap-2 flex-wrap">
                                                        <span className="text-[10px] font-bold text-gray-400 shrink-0">
                                                            {coach.number ? `#${coach.number}` : '—'}
                                                        </span>
                                                        <h4 className="text-xs font-bold text-gray-900 group-hover:text-wildcats-blue uppercase tracking-wide truncate">
                                                            {coach.name}
                                                        </h4>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })
                            ) : (
                                <span className="text-xs text-gray-400 italic py-2">None assigned</span>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {trophies.length > 0 && (
                <div className="space-y-4">
                    <h2 className="text-sm font-bold font-wildcats text-wildcats-blue uppercase tracking-wider border-b border-gray-200 pb-1.5">
                        Team Trophies & Honors
                    </h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {trophies.map((trophy, idx) => (
                            <div key={idx} className="bg-white border border-gray-200 p-4 flex items-center gap-3 shadow-xs">
                                <div className="w-10 h-10 bg-yellow-50 border border-yellow-200 rounded-full flex items-center justify-center text-yellow-600 font-bold shrink-0 text-base">
                                    🏆
                                </div>
                                <div className="min-w-0">
                                    <h3 className="text-xs font-bold text-gray-900 uppercase tracking-wide truncate">
                                        {trophy.title || trophy.name || 'Tournament Trophy'}
                                    </h3>
                                    {trophy.season && (
                                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                                            Season: {trophy.season}
                                        </span>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            <div className="space-y-4">
                <h2 className="text-sm font-bold font-wildcats text-wildcats-blue uppercase tracking-wider border-b border-gray-200 pb-1.5">
                    Players
                </h2>

                {roster.length === 0 ? (
                    <div className="bg-white border border-gray-200 p-10 text-center text-gray-500 italic text-sm">
                        No players currently added to this team's roster.
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                        {sortedRoster.map((member) => {
                            const globalPlayer = players.find(p => p._id === member.playerId);
                            const profilePic = globalPlayer?.profilePic || DEFAULT_PROFILE_PIC;
                            const jerseyNum = member.number || globalPlayer?.number;
                            const positionLabel = POSITION_LABELS[member.position] || member.position || 'Skater';

                            return (
                                <div
                                    key={member.playerId}
                                    onClick={() => handlePlayerClick(globalPlayer)}
                                    className="bg-white border border-gray-200 hover:border-wildcats-blue hover:shadow-md transition-all p-3 flex items-center justify-between gap-3 cursor-pointer group relative overflow-hidden"
                                >
                                    <div className="flex items-center gap-3 min-w-0">
                                        <img
                                            src={profilePic}
                                            alt=""
                                            onError={(e) => { e.target.src = DEFAULT_PROFILE_PIC; }}
                                            className="w-10 h-10 object-cover rounded-full border border-gray-300 shrink-0"
                                        />
                                        <div className="min-w-0">
                                            <div className="flex items-center gap-2 flex-wrap">
                                                <span className="text-[10px] font-bold text-gray-400 shrink-0">
                                                    {jerseyNum ? `#${jerseyNum}` : '—'}
                                                </span>
                                                <h4 className="text-xs font-bold text-gray-900 group-hover:text-wildcats-blue uppercase tracking-wide truncate">
                                                    {member.name}
                                                </h4>
                                            </div>
                                            <span className="text-[9px] font-bold text-gray-500 uppercase tracking-wider block mt-0.5">
                                                {positionLabel}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pt-6 border-t border-gray-200 items-stretch">
                <div className="bg-white border border-gray-200 p-5 flex flex-col justify-between">
                    <h2 className="text-sm font-bold font-wildcats text-wildcats-blue uppercase tracking-wider border-b border-gray-200 pb-1.5 mb-4">
                        League Standings
                    </h2>
                    <div className="flex-1 flex flex-col items-center justify-center text-gray-400 italic text-xs py-20">
                        <span>No league table data. </span>
                    </div>
                </div>

                <div className="flex flex-col justify-between space-y-4">
                    <div className="flex-1 flex flex-col">
                        <h3 className="text-xs font-bold text-gray-600 uppercase tracking-wider mb-2">Upcoming Fixture</h3>
                        <div className="flex-1">{renderGameCard(nextGame, 'NEXT FIXTURE')}</div>
                    </div>
                    <div className="flex-1 flex flex-col">
                        <h3 className="text-xs font-bold text-gray-600 uppercase tracking-wider mb-2">Last Game Result</h3>
                        <div className="flex-1">{renderGameCard(lastGame, 'LAST RESULT')}</div>
                    </div>
                </div>
            </div>
        </div>
    );
}