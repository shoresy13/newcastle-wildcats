import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';

import aTeamImg from '../assets/a-team.jpg';
import bTeamImg from '../assets/b-team.jpg';
import cTeamImg from '../assets/c-team.jpg';

const TEAM_PHOTOS = {
    'a': aTeamImg,
    'b': bTeamImg,
    'c': cTeamImg
};

const DEFAULT_PROFILE_PIC = "https://buiha.org.uk/assets/img/profile/player-newcastle.jpg";

export default function Teams() {
    const [teams, setTeams] = useState([]);
    const [players, setPlayers] = useState([]);
    const [loading, setLoading] = useState(true);

    const navigate = useNavigate();

    const API_BASE = (import.meta.env.VITE_API_URL || 'https://newcastle-wildcats.onrender.com').replace(/\/$/, '');

    useEffect(() => {
        const fetchTeamsData = async () => {
            try {
                const [teamsRes, playersRes] = await Promise.all([
                    fetch(`${API_BASE}/api/teams`),
                    fetch(`${API_BASE}/api/players`)
                ]);
                if (!teamsRes.ok || !playersRes.ok) throw new Error('Failed to fetch data');
                const teamsData = await teamsRes.json();
                const playersData = await playersRes.json();
                setTeams(teamsData);
                setPlayers(playersData);
            } catch (err) {
                console.error('Error fetching teams/players:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchTeamsData();
    }, [API_BASE]);

    const getPlayerObjByName = (name) => players.find(p => p.name === name);

    if (loading) {
        return (
            <div className="max-w-[1600px] mx-auto p-4 sm:p-6 font-sans">
                <div className="py-12 text-center text-sm font-semibold text-gray-400 uppercase tracking-widest">
                    Loading Teams...
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-[1600px] mx-auto p-4 sm:p-6 font-sans space-y-6">
            <div className="border-b border-gray-200 pb-3">
                <h1 className="text-lg sm:text-2xl font-bold font-wildcats text-wildcats-blue uppercase tracking-wide">
                    Our Teams
                </h1>
            </div>

            {teams.length === 0 ? (
                <div className="bg-white border border-gray-200 p-10 text-center text-gray-500 italic text-sm">
                    No teams available at the moment.
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 items-start">
                    {teams.map((team) => {
                        const teamPhoto = TEAM_PHOTOS[team.id?.toLowerCase()] || team.teamPicture;
                        const rosterCount = team.roster ? team.roster.length : 0;

                        const captainNames = Array.isArray(team.captain) ? team.captain : (team.captain ? [team.captain] : []);
                        const assistantNames = team.assistantCaptains || [];
                        const coachNames = team.coaches || [];

                        const captainObjs = captainNames.map(name => getPlayerObjByName(name)).filter(Boolean);
                        const assistantObjs = assistantNames.map(name => getPlayerObjByName(name)).filter(Boolean);
                        const coachObjs = coachNames.map(name => getPlayerObjByName(name)).filter(Boolean);

                        return (
                            <div
                                key={team._id || team.id}
                                onClick={() => navigate(`/teams/${team.id}`)}
                                className="bg-white border border-gray-200 hover:border-wildcats-blue hover:shadow-md transition-all flex flex-col overflow-hidden group shadow-sm cursor-pointer"
                            >
                                {teamPhoto ? (
                                    <div className="w-full h-56 bg-gray-100 overflow-hidden border-b border-gray-200 shrink-0">
                                        <img
                                            src={teamPhoto}
                                            alt={team.name}
                                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                        />
                                    </div>
                                ) : (
                                    <div className="w-full h-36 bg-gray-50 border-b border-gray-200 flex items-center justify-center text-gray-400 text-xs font-bold uppercase tracking-widest shrink-0">
                                        No Photo Available
                                    </div>
                                )}

                                <div className="p-5 space-y-4">
                                    <div className="space-y-2">
                                        <div className="flex items-center justify-between">
                                            <span className="bg-gray-100 text-gray-600 border border-gray-200 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider">
                                                {team.division || 'Unregistered'}
                                            </span>
                                            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                                                {rosterCount} {rosterCount === 1 ? 'Player' : 'Players'}
                                            </span>
                                        </div>
                                        <h2 className="text-base sm:text-lg font-bold font-wildcats text-gray-900 group-hover:text-wildcats-blue uppercase tracking-wide pt-1">
                                            {team.name}
                                        </h2>
                                        {team.description && (
                                            <p className="text-xs text-gray-600 line-clamp-2 leading-relaxed">
                                                {team.description}
                                            </p>
                                        )}
                                    </div>

                                    <div className="space-y-2 pt-3 border-t border-gray-100">
                                        <div className="bg-gray-50/70 border border-gray-200 p-2.5 flex flex-col space-y-1.5">
                                            <span className="text-[9px] font-bold text-wildcats-red uppercase tracking-wider border-b border-gray-200 pb-1">
                                                {captainObjs.length > 1 ? 'Captains' : 'Captain'}
                                            </span>
                                            {captainObjs.length > 0 ? (
                                                captainObjs.map(cap => (
                                                    <div key={cap._id} className="flex items-center gap-2.5 min-w-0">
                                                        <img
                                                            src={cap.profilePic || DEFAULT_PROFILE_PIC}
                                                            alt=""
                                                            onError={(e) => { e.target.src = DEFAULT_PROFILE_PIC; }}
                                                            className="w-7 h-7 object-cover rounded-full border border-gray-300 shrink-0"
                                                        />
                                                        <div className="min-w-0 flex items-center justify-between w-full">
                                                            <div className="text-[10px] font-bold text-gray-900 uppercase truncate">
                                                                {cap.name}
                                                            </div>
                                                            <div className="text-[9px] font-bold text-gray-400 shrink-0 ml-1">
                                                                {cap.number ? `#${cap.number}` : ''}
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))
                                            ) : (
                                                <span className="text-[10px] text-gray-400 italic">None assigned</span>
                                            )}
                                        </div>

                                        <div className="bg-gray-50/70 border border-gray-200 p-2.5 flex flex-col space-y-1.5">
                                            <span className="text-[9px] font-bold text-gray-700 uppercase tracking-wider border-b border-gray-200 pb-1">
                                                Assistant Captains
                                            </span>
                                            {assistantObjs.length > 0 ? (
                                                assistantObjs.map(ast => (
                                                    <div key={ast._id} className="flex items-center gap-2.5 min-w-0">
                                                        <img
                                                            src={ast.profilePic || DEFAULT_PROFILE_PIC}
                                                            alt=""
                                                            onError={(e) => { e.target.src = DEFAULT_PROFILE_PIC; }}
                                                            className="w-7 h-7 object-cover rounded-full border border-gray-300 shrink-0"
                                                        />
                                                        <div className="min-w-0 flex items-center justify-between w-full">
                                                            <div className="text-[10px] font-bold text-gray-900 uppercase truncate">
                                                                {ast.name}
                                                            </div>
                                                            <div className="text-[9px] font-bold text-gray-400 shrink-0 ml-1">
                                                                {ast.number ? `#${ast.number}` : ''}
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))
                                            ) : (
                                                <span className="text-[10px] text-gray-400 italic">None assigned</span>
                                            )}
                                        </div>

                                        <div className="bg-gray-50/70 border border-gray-200 p-2.5 flex flex-col space-y-1.5">
                                            <span className="text-[9px] font-bold text-wildcats-blue uppercase tracking-wider border-b border-gray-200 pb-1">
                                                {coachObjs.length > 1 ? 'Coaches' : 'Coach'}
                                            </span>
                                            {coachObjs.length > 0 ? (
                                                coachObjs.map(coach => (
                                                    <div key={coach._id} className="flex items-center gap-2.5 min-w-0">
                                                        <img
                                                            src={coach.profilePic || DEFAULT_PROFILE_PIC}
                                                            alt=""
                                                            onError={(e) => { e.target.src = DEFAULT_PROFILE_PIC; }}
                                                            className="w-7 h-7 object-cover rounded-full border border-gray-300 shrink-0"
                                                        />
                                                        <div className="min-w-0 flex items-center justify-between w-full">
                                                            <div className="text-[10px] font-bold text-gray-900 uppercase truncate">
                                                                {coach.name}
                                                            </div>
                                                            <div className="text-[9px] font-bold text-gray-400 shrink-0 ml-1">
                                                                {coach.number ? `#${coach.number}` : ''}
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))
                                            ) : (
                                                <span className="text-[10px] text-gray-400 italic">None assigned</span>
                                            )}
                                        </div>
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