import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';

const DEFAULT_PROFILE_PIC = "https://buiha.org.uk/assets/img/profile/player-newcastle.jpg";

export default function TeamManager() {
    const [teams, setTeams] = useState([]);
    const [players, setPlayers] = useState([]);
    const [loading, setLoading] = useState(true);

    const navigate = useNavigate();
    const API_BASE = (import.meta.env.VITE_API_URL || 'https://newcastle-wildcats.onrender.com').replace(/\/$/, '');

    const fetchData = async () => {
        try {
            const [teamsRes, playersRes] = await Promise.all([
                fetch(`${API_BASE}/api/teams`),
                fetch(`${API_BASE}/api/players`)
            ]);
            if (!teamsRes.ok || !playersRes.ok) throw new Error('Data fetch failed');

            const teamsData = await teamsRes.json();
            const playersData = await playersRes.json();

            setTeams(teamsData.sort((a, b) => (a.id || '').localeCompare(b.id || '')));
            setPlayers(playersData);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    return (
        <div className="max-w-5xl mx-auto p-4 sm:p-6 font-sans">
            <div className="flex items-center justify-between gap-2 mb-6">
                <h1 className="text-sm min-[380px]:text-base sm:text-2xl font-bold font-wildcats text-wildcats-blue uppercase shrink truncate">
                    Team Manager
                </h1>
                <button
                    onClick={() => navigate('/admin')}
                    className="px-2.5 py-1.5 sm:px-4 sm:py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-[10px] min-[380px]:text-[11px] sm:text-xs font-bold uppercase tracking-wider border border-gray-300 transition-colors cursor-pointer text-center shrink-0 whitespace-nowrap"
                >
                    &larr; Back to Dashboard
                </button>
            </div>

            <div className="bg-white border border-gray-200 shadow-md p-4 sm:p-6">
                {loading ? (
                    <p className="text-sm text-gray-500 text-center py-6 uppercase tracking-widest font-semibold">Loading teams...</p>
                ) : teams.length === 0 ? (
                    <p className="text-sm text-gray-500 italic py-6 text-center">No teams found in database.</p>
                ) : (
                    <div className="space-y-4">
                        {teams.map((team) => {
                            const rosterCount = team.roster ? team.roster.length : 0;

                            const captainObjs = team.captain ? (Array.isArray(team.captain) ? team.captain : [team.captain]).map(cName => players.find(p => p.name === cName)).filter(Boolean) : [];
                            const assistantObjs = team.assistantCaptains ? team.assistantCaptains.map(aName => players.find(p => p.name === aName)).filter(Boolean) : [];
                            const coachObjs = team.coaches ? team.coaches.map(cName => players.find(p => p.name === cName)).filter(Boolean) : [];

                            return (
                                <div key={team._id || team.id} className="bg-white border border-gray-200 hover:border-gray-300 p-4 sm:p-5 relative group flex flex-col md:flex-row items-start md:items-center justify-between gap-4 md:gap-6 shadow-sm transition-all">
                                    <div className="w-full md:flex-1 space-y-3 mt-1 md:mt-0">
                                        <div className="flex items-center gap-3">
                                            <h3 className="text-lg font-bold text-gray-900 uppercase tracking-wide">
                                                {team.name}
                                            </h3>
                                            <span className="bg-gray-100 text-gray-700 border border-gray-300 px-2.5 py-0.5 text-[10px] font-bold uppercase">
                                                {team.division}
                                            </span>
                                        </div>

                                        <div className="flex flex-col items-start gap-1.5 pt-1">
                                            {captainObjs.length > 0 && (
                                                <div className="inline-flex items-center bg-gray-50 border border-gray-200 px-3 py-1.5 gap-2">
                                                    <span className="text-[10px] font-bold text-gray-400 uppercase w-20 sm:w-24 text-left shrink-0">Captain:</span>
                                                    <div className="flex items-center gap-x-4 gap-y-1 flex-wrap">
                                                        {captainObjs.map(cap => {
                                                            const profilePic = cap.profilePic || DEFAULT_PROFILE_PIC;
                                                            return (
                                                                <div key={cap._id} className="flex items-center gap-1.5">
                                                                    <img
                                                                        src={profilePic}
                                                                        alt=""
                                                                        onError={(e) => { e.target.src = DEFAULT_PROFILE_PIC; }}
                                                                        className="w-6 h-6 object-cover rounded-full border border-gray-300 shrink-0"
                                                                    />
                                                                    <span className="text-xs font-bold text-gray-800 uppercase">{cap.name}</span>
                                                                </div>
                                                            );
                                                        })}
                                                    </div>
                                                </div>
                                            )}

                                            {assistantObjs.length > 0 && (
                                                <div className="inline-flex items-center bg-gray-50 border border-gray-200 px-3 py-1.5 gap-2">
                                                    <span className="text-[10px] font-bold text-gray-400 uppercase w-20 sm:w-24 text-left shrink-0">Assistant:</span>
                                                    <div className="flex items-center gap-x-4 gap-y-1 flex-wrap">
                                                        {assistantObjs.map(a => {
                                                            const profilePic = a.profilePic || DEFAULT_PROFILE_PIC;
                                                            return (
                                                                <div key={a._id} className="flex items-center gap-1.5">
                                                                    <img
                                                                        src={profilePic}
                                                                        alt=""
                                                                        onError={(e) => { e.target.src = DEFAULT_PROFILE_PIC; }}
                                                                        className="w-6 h-6 object-cover rounded-full border border-gray-300 shrink-0"
                                                                    />
                                                                    <span className="text-xs font-bold text-gray-800 uppercase">{a.name}</span>
                                                                </div>
                                                            );
                                                        })}
                                                    </div>
                                                </div>
                                            )}

                                            {coachObjs.length > 0 && (
                                                <div className="inline-flex items-center bg-gray-50 border border-gray-200 px-3 py-1.5 gap-2">
                                                    <span className="text-[10px] font-bold text-gray-400 uppercase w-20 sm:w-24 text-left shrink-0">Coach:</span>
                                                    <div className="flex items-center gap-x-4 gap-y-1 flex-wrap">
                                                        {coachObjs.map(c => {
                                                            const profilePic = c.profilePic || DEFAULT_PROFILE_PIC;
                                                            return (
                                                                <div key={c._id} className="flex items-center gap-1.5">
                                                                    <img
                                                                        src={profilePic}
                                                                        alt=""
                                                                        onError={(e) => { e.target.src = DEFAULT_PROFILE_PIC; }}
                                                                        className="w-6 h-6 object-cover rounded-full border border-gray-300 shrink-0"
                                                                    />
                                                                    <span className="text-xs font-bold text-gray-800 uppercase">{c.name}</span>
                                                                </div>
                                                            );
                                                        })}
                                                    </div>
                                                </div>
                                            )}

                                            <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider pt-1">
                                                Count: {rosterCount} Players
                                            </div>
                                        </div>
                                    </div>

                                    <div className="w-full md:w-32 flex justify-end shrink-0">
                                        <button
                                            onClick={() => navigate(`/admin/team-manager/${team.id.toLowerCase()}`)}
                                            className="w-full md:w-auto px-5 py-2.5 text-xs font-bold uppercase tracking-wider border border-gray-300 text-gray-700 bg-gray-50 hover:bg-gray-100 text-center transition-colors cursor-pointer"
                                        >
                                            Edit Team
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}