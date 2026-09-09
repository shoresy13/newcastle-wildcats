import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router';

const DEFAULT_PROFILE_PIC = "https://buiha.org.uk/assets/img/profile/player-newcastle.jpg";

const DIVISIONS = [
    'Unregistered',
    'Checking 1',
    'Checking 2',
    'Non-Check 1',
    'Non-Check 2',
    'Non-Check 3'
];

const TEAM_POSITIONS = [
    { label: '-', value: '-' },
    { label: 'Forward', value: 'F' },
    { label: 'Defense', value: 'D' },
    { label: 'Netminder', value: 'G' }
];

export default function TeamEdit() {
    const { teamId } = useParams();
    const navigate = useNavigate();

    const [team, setTeam] = useState(null);
    const [players, setPlayers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState({ text: '', isError: false });

    const [editFormData, setEditFormData] = useState({});

    const [isAddingRoster, setIsAddingRoster] = useState(false);
    const [rosterSearchQuery, setRosterSearchQuery] = useState('');

    const [isAddingCaptain, setIsAddingCaptain] = useState(false);
    const [captainSearchQuery, setCaptainSearchQuery] = useState('');

    const [isAddingAssistant, setIsAddingAssistant] = useState(false);
    const [assistantSearchQuery, setAssistantSearchQuery] = useState('');

    const [isAddingCoach, setIsAddingCoach] = useState(false);
    const [coachSearchQuery, setCoachSearchQuery] = useState('');

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

            const foundTeam = teamsData.find(t => (t.id || '').toLowerCase() === teamId.toLowerCase());
            if (!foundTeam) throw new Error('Team not found');

            let matchedDivision = 'Unregistered';
            if (foundTeam.division) {
                const normalizedSaved = foundTeam.division.toLowerCase().replace(/[\s-]/g, '');
                const foundMatch = DIVISIONS.find(d => d.toLowerCase().replace(/[\s-]/g, '') === normalizedSaved);
                if (foundMatch) {
                    matchedDivision = foundMatch;
                } else {
                    matchedDivision = foundTeam.division;
                }
            }

            let normalizedCaptains = [];
            if (Array.isArray(foundTeam.captain)) {
                normalizedCaptains = foundTeam.captain;
            } else if (foundTeam.captain) {
                normalizedCaptains = [foundTeam.captain];
            }

            setTeam(foundTeam);
            setEditFormData({
                ...foundTeam,
                division: matchedDivision,
                captain: normalizedCaptains,
                assistantCaptains: foundTeam.assistantCaptains || [],
                coaches: foundTeam.coaches || [],
                roster: foundTeam.roster || []
            });
            setPlayers(playersData);
        } catch (err) {
            setMessage({ text: err.message, isError: true });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [teamId]);

    const handleFieldChange = (field, value) => {
        setEditFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleAssignPlayer = (player) => {
        if ((editFormData.roster || []).some(r => r.playerId === player._id)) return;

        const newRosterMember = {
            playerId: player._id,
            name: player.name,
            number: player.number,
            position: '-'
        };

        setEditFormData(prev => ({
            ...prev,
            roster: [...(prev.roster || []), newRosterMember]
        }));
        setIsAddingRoster(false);
        setRosterSearchQuery('');
        setMessage({ text: 'Member added to team roster.', isError: false });
    };

    const handleRemovePlayerFromRoster = (playerId, playerName) => {
        setEditFormData(prev => ({
            ...prev,
            roster: (prev.roster || []).filter(r => r.playerId !== playerId),
            captain: (prev.captain || []).filter(n => n !== playerName),
            assistantCaptains: (prev.assistantCaptains || []).filter(n => n !== playerName),
            coaches: (prev.coaches || []).filter(n => n !== playerName)
        }));
        setMessage({ text: 'Member removed from team roster.', isError: false });
    };

    const handleUpdateTeamRosterPosition = (playerId, newPos) => {
        setEditFormData(prev => ({
            ...prev,
            roster: (prev.roster || []).map(r => r.playerId === playerId ? { ...r, position: newPos } : r)
        }));
    };

    const handleSaveAndReturn = async () => {
        const userInfo = JSON.parse(localStorage.getItem('userInfo'));
        try {
            const res = await fetch(`${API_BASE}/api/teams/${team._id || team.id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${userInfo?.token}`
                },
                body: JSON.stringify(editFormData)
            });
            if (!res.ok) {
                const errData = await res.json();
                throw new Error(errData.message || 'Failed to save team changes');
            }

            setMessage({ text: 'Team updated successfully!', isError: false });
            setTimeout(() => {
                navigate('/admin/team-manager');
            }, 600);
        } catch (err) {
            setMessage({ text: err.message, isError: true });
        }
    };

    if (loading) {
        return <div className="p-8 text-center text-sm font-semibold uppercase text-gray-500">Loading team editor...</div>;
    }

    const teamRoster = editFormData.roster || [];

    const searchedAvailablePlayers = players.filter(p => {
        if (teamRoster.some(r => r.playerId === p._id)) return false;
        const query = rosterSearchQuery.toLowerCase();
        return p.name.toLowerCase().includes(query) || String(p.number || '').includes(query);
    });

    const searchedGlobalPlayersForCoach = players.filter(p => {
        const query = coachSearchQuery.toLowerCase();
        return (
            (p.name.toLowerCase().includes(query) || String(p.number || '').includes(query)) &&
            !(editFormData.coaches || []).includes(p.name)
        );
    });

    return (
        <div className="max-w-4xl mx-auto p-4 sm:p-8 font-sans">
            <div className="flex items-center justify-between gap-2 mb-6">
                <h1 className="text-sm min-[380px]:text-base sm:text-xl font-bold font-wildcats text-gray-800 uppercase tracking-wide shrink truncate">
                    Editing Team {editFormData.id}
                </h1>
                <button
                    onClick={() => navigate('/admin/team-manager')}
                    className="px-2.5 py-1.5 sm:px-4 sm:py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-[10px] min-[380px]:text-[11px] sm:text-xs font-bold uppercase tracking-wider border border-gray-300 transition-colors cursor-pointer text-center shrink-0 whitespace-nowrap"
                >
                    &larr; Back to Team Manager
                </button>
            </div>

            {message.text && (
                <div className={`p-3 mb-6 text-sm font-semibold text-center sm:text-left ${message.isError ? 'bg-red-100 text-red-700 border border-red-300' : 'bg-green-100 text-green-700 border border-green-300'}`}>
                    {message.text}
                </div>
            )}

            <div className="bg-white border-2 border-wildcats-blue shadow-xl p-6 sm:p-8 space-y-6">
                <div className="border-b border-gray-200 pb-4">
                    <span className="text-xs font-bold text-wildcats-blue uppercase tracking-wider block">Team Settings</span>
                    <h2 className="text-2xl font-bold font-wildcats uppercase text-gray-900">{editFormData.name}</h2>
                </div>

                <div className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-bold uppercase text-gray-700 mb-1">Team Name</label>
                            <input
                                type="text"
                                value={editFormData.name || ''}
                                onChange={(e) => handleFieldChange('name', e.target.value)}
                                className="w-full border border-gray-300 p-3 text-xs bg-white text-gray-900 font-semibold outline-none focus:border-wildcats-blue uppercase"
                                placeholder="Enter team name..."
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold uppercase text-gray-700 mb-1">Division</label>
                            <select
                                value={editFormData.division || 'Unregistered'}
                                onChange={(e) => handleFieldChange('division', e.target.value)}
                                className="w-full border border-gray-300 p-3 text-xs bg-white font-semibold outline-none focus:border-wildcats-blue uppercase cursor-pointer"
                            >
                                {DIVISIONS.map(div => (
                                    <option key={div} value={div}>{div}</option>
                                ))}
                                {!DIVISIONS.includes(editFormData.division) && editFormData.division && (
                                    <option value={editFormData.division}>{editFormData.division}</option>
                                )}
                            </select>
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-bold uppercase text-gray-700 mb-1">Description</label>
                        <textarea
                            rows="4"
                            value={editFormData.description || ''}
                            onChange={(e) => handleFieldChange('description', e.target.value)}
                            className="w-full border border-gray-300 p-3 text-xs bg-white outline-none focus:border-wildcats-blue resize-none"
                            placeholder="Enter team description..."
                        />
                    </div>

                    <div className="border-t border-gray-200 pt-6">
                        <label className="block text-xs font-bold uppercase text-gray-700 mb-1">Captains</label>
                        <div className="space-y-2">
                            {(editFormData.captain || []).map((capName, idx) => {
                                const matchedPlayer = players.find(p => p.name === capName);
                                const profilePic = matchedPlayer?.profilePic || DEFAULT_PROFILE_PIC;
                                const number = matchedPlayer ? matchedPlayer.number : '';

                                return (
                                    <div key={idx} className="flex flex-col sm:flex-row items-start sm:items-center justify-between bg-gray-50 border border-gray-300 p-3 gap-2">
                                        <div className="flex items-center gap-3">
                                            <img
                                                src={profilePic}
                                                alt=""
                                                onError={(e) => { e.target.src = DEFAULT_PROFILE_PIC; }}
                                                className="w-8 h-8 object-cover rounded-full border border-gray-300 shrink-0"
                                            />
                                            <span className="text-xs font-bold uppercase text-gray-800">{number ? `#${number} ` : '— '}{capName}</span>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => {
                                                const updatedCaptains = editFormData.captain.filter((_, i) => i !== idx);
                                                handleFieldChange('captain', updatedCaptains);
                                            }}
                                            className="text-xs text-red-600 hover:text-red-800 font-bold uppercase cursor-pointer self-end sm:self-auto"
                                        >
                                            Remove
                                        </button>
                                    </div>
                                );
                            })}

                            {isAddingCaptain ? (
                                <div className="bg-gray-50 border border-gray-300 p-3 space-y-2">
                                    <div className="flex items-center justify-between">
                                        <span className="text-[10px] font-bold uppercase text-gray-500">Search Team Roster for Captain</span>
                                        <button type="button" onClick={() => setIsAddingCaptain(false)} className="text-[10px] text-gray-500 uppercase underline cursor-pointer">Cancel</button>
                                    </div>
                                    <input
                                        type="text"
                                        placeholder="Type player name"
                                        value={captainSearchQuery}
                                        onChange={(e) => setCaptainSearchQuery(e.target.value)}
                                        className="w-full border border-gray-300 p-2.5 text-xs bg-white uppercase font-semibold outline-none"
                                    />
                                    <div className="max-h-36 overflow-y-auto bg-white border border-gray-200 divide-y">
                                        {teamRoster.filter(r => r.name.toLowerCase().includes(captainSearchQuery.toLowerCase()) && !(editFormData.captain || []).includes(r.name)).length === 0 ? (
                                            <p className="p-2 text-xs text-gray-400 italic">No available roster members</p>
                                        ) : (
                                            teamRoster
                                                .filter(r => r.name.toLowerCase().includes(captainSearchQuery.toLowerCase()) && !(editFormData.captain || []).includes(r.name))
                                                .map(r => {
                                                    const matchedPlayer = players.find(p => p._id === r.playerId);
                                                    const profilePic = matchedPlayer?.profilePic || DEFAULT_PROFILE_PIC;
                                                    return (
                                                        <div key={r.playerId} className="flex items-center justify-between p-2.5 hover:bg-gray-50 cursor-pointer" onClick={() => {
                                                            const updatedCaptains = [...(editFormData.captain || []), r.name];
                                                            handleFieldChange('captain', updatedCaptains);
                                                            setIsAddingCaptain(false);
                                                        }}>
                                                            <div className="flex items-center gap-2">
                                                                <img
                                                                    src={profilePic}
                                                                    alt=""
                                                                    onError={(e) => { e.target.src = DEFAULT_PROFILE_PIC; }}
                                                                    className="w-6 h-6 object-cover rounded-full border border-gray-300 shrink-0"
                                                                />
                                                                <span className="text-xs font-bold uppercase">{r.number ? `#${r.number} ` : '— '}{r.name}</span>
                                                            </div>
                                                            <span className="text-[10px] text-wildcats-blue font-bold uppercase">Add</span>
                                                        </div>
                                                    );
                                                })
                                        )}
                                    </div>
                                </div>
                            ) : (
                                <button
                                    type="button"
                                    onClick={() => { setIsAddingCaptain(true); setCaptainSearchQuery(''); }}
                                    className="px-4 py-2.5 bg-gray-800 hover:bg-black text-white text-xs font-bold uppercase cursor-pointer"
                                >
                                    + Add Captain
                                </button>
                            )}
                        </div>
                    </div>

                    <div className="pt-4">
                        <label className="block text-xs font-bold uppercase text-gray-700 mb-1">Assistant Captains</label>
                        <div className="space-y-2">
                            {(editFormData.assistantCaptains || []).map((astName, idx) => {
                                const matchedPlayer = players.find(p => p.name === astName);
                                const profilePic = matchedPlayer?.profilePic || DEFAULT_PROFILE_PIC;
                                const number = matchedPlayer ? matchedPlayer.number : '';

                                return (
                                    <div key={idx} className="flex flex-col sm:flex-row items-start sm:items-center justify-between bg-gray-50 border border-gray-300 p-3 gap-2">
                                        <div className="flex items-center gap-3">
                                            <img
                                                src={profilePic}
                                                alt=""
                                                onError={(e) => { e.target.src = DEFAULT_PROFILE_PIC; }}
                                                className="w-8 h-8 object-cover rounded-full border border-gray-300 shrink-0"
                                            />
                                            <span className="text-xs font-bold uppercase text-gray-800">{number ? `#${number} ` : '— '}{astName}</span>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => {
                                                const updatedAssistants = editFormData.assistantCaptains.filter((_, i) => i !== idx);
                                                handleFieldChange('assistantCaptains', updatedAssistants);
                                            }}
                                            className="text-xs text-red-600 hover:text-red-800 font-bold uppercase cursor-pointer self-end sm:self-auto"
                                        >
                                            Remove
                                        </button>
                                    </div>
                                );
                            })}

                            {isAddingAssistant ? (
                                <div className="bg-gray-50 border border-gray-300 p-3 space-y-2">
                                    <div className="flex items-center justify-between">
                                        <span className="text-[10px] font-bold uppercase text-gray-500">Search Team Roster for Assistant</span>
                                        <button type="button" onClick={() => setIsAddingAssistant(false)} className="text-[10px] text-gray-500 uppercase underline cursor-pointer">Cancel</button>
                                    </div>
                                    <input
                                        type="text"
                                        placeholder="Type player name"
                                        value={assistantSearchQuery}
                                        onChange={(e) => setAssistantSearchQuery(e.target.value)}
                                        className="w-full border border-gray-300 p-2.5 text-xs bg-white uppercase font-semibold outline-none"
                                    />
                                    <div className="max-h-36 overflow-y-auto bg-white border border-gray-200 divide-y">
                                        {teamRoster.filter(r => r.name.toLowerCase().includes(assistantSearchQuery.toLowerCase()) && !(editFormData.assistantCaptains || []).includes(r.name)).length === 0 ? (
                                            <p className="p-2 text-xs text-gray-400 italic">No available roster members</p>
                                        ) : (
                                            teamRoster
                                                .filter(r => r.name.toLowerCase().includes(assistantSearchQuery.toLowerCase()) && !(editFormData.assistantCaptains || []).includes(r.name))
                                                .map(r => {
                                                    const matchedPlayer = players.find(p => p._id === r.playerId);
                                                    const profilePic = matchedPlayer?.profilePic || DEFAULT_PROFILE_PIC;
                                                    return (
                                                        <div key={r.playerId} className="flex items-center justify-between p-2.5 hover:bg-gray-50 cursor-pointer" onClick={() => {
                                                            const updatedAssistants = [...(editFormData.assistantCaptains || []), r.name];
                                                            handleFieldChange('assistantCaptains', updatedAssistants);
                                                            setIsAddingAssistant(false);
                                                        }}>
                                                            <div className="flex items-center gap-2">
                                                                <img
                                                                    src={profilePic}
                                                                    alt=""
                                                                    onError={(e) => { e.target.src = DEFAULT_PROFILE_PIC; }}
                                                                    className="w-6 h-6 object-cover rounded-full border border-gray-300 shrink-0"
                                                                />
                                                                <span className="text-xs font-bold uppercase">{r.number ? `#${r.number} ` : '— '}{r.name}</span>
                                                            </div>
                                                            <span className="text-[10px] text-wildcats-blue font-bold uppercase">Add</span>
                                                        </div>
                                                    );
                                                })
                                        )}
                                    </div>
                                </div>
                            ) : (
                                <button
                                    type="button"
                                    onClick={() => { setIsAddingAssistant(true); setAssistantSearchQuery(''); }}
                                    className="px-4 py-2.5 bg-gray-800 hover:bg-black text-white text-xs font-bold uppercase cursor-pointer"
                                >
                                    + Add Assistant Captain
                                </button>
                            )}
                        </div>
                    </div>

                    <div className="pt-4">
                        <label className="block text-xs font-bold uppercase text-gray-700 mb-1">Coaches</label>
                        <div className="space-y-2">
                            {(editFormData.coaches || []).map((coachName, idx) => {
                                const matchedPlayer = players.find(p => p.name === coachName);
                                const profilePic = matchedPlayer?.profilePic || DEFAULT_PROFILE_PIC;
                                const number = matchedPlayer ? matchedPlayer.number : '';

                                return (
                                    <div key={idx} className="flex flex-col sm:flex-row items-start sm:items-center justify-between bg-gray-50 border border-gray-300 p-3 gap-2">
                                        <div className="flex items-center gap-3">
                                            <img
                                                src={profilePic}
                                                alt=""
                                                onError={(e) => { e.target.src = DEFAULT_PROFILE_PIC; }}
                                                className="w-8 h-8 object-cover rounded-full border border-gray-300 shrink-0"
                                            />
                                            <span className="text-xs font-bold uppercase text-gray-800">{number ? `#${number} ` : '— '}{coachName}</span>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => {
                                                const updatedCoaches = editFormData.coaches.filter((_, i) => i !== idx);
                                                handleFieldChange('coaches', updatedCoaches);
                                            }}
                                            className="text-xs text-red-600 hover:text-red-800 font-bold uppercase cursor-pointer self-end sm:self-auto"
                                        >
                                            Remove
                                        </button>
                                    </div>
                                );
                            })}

                            {isAddingCoach ? (
                                <div className="bg-gray-50 border border-gray-300 p-3 space-y-2">
                                    <div className="flex items-center justify-between">
                                        <span className="text-[10px] font-bold uppercase text-gray-500">Search Global Members for Coach</span>
                                        <button type="button" onClick={() => setIsAddingCoach(false)} className="text-[10px] text-gray-500 uppercase underline cursor-pointer">Cancel</button>
                                    </div>
                                    <input
                                        type="text"
                                        placeholder="Type player name or number"
                                        value={coachSearchQuery}
                                        onChange={(e) => setCoachSearchQuery(e.target.value)}
                                        className="w-full border border-gray-300 p-2.5 text-xs bg-white uppercase font-semibold outline-none"
                                    />
                                    <div className="max-h-36 overflow-y-auto bg-white border border-gray-200 divide-y">
                                        {searchedGlobalPlayersForCoach.length === 0 ? (
                                            <p className="p-2 text-xs text-gray-400 italic">No global members found</p>
                                        ) : (
                                            searchedGlobalPlayersForCoach.map(p => {
                                                const profilePic = p.profilePic || DEFAULT_PROFILE_PIC;
                                                return (
                                                    <div key={p._id} className="flex items-center justify-between p-2.5 hover:bg-gray-50 cursor-pointer" onClick={() => {
                                                        const updatedCoaches = [...(editFormData.coaches || []), p.name];
                                                        handleFieldChange('coaches', updatedCoaches);
                                                        setIsAddingCoach(false);
                                                        setCoachSearchQuery('');
                                                    }}>
                                                        <div className="flex items-center gap-2">
                                                            <img
                                                                src={profilePic}
                                                                alt=""
                                                                onError={(e) => { e.target.src = DEFAULT_PROFILE_PIC; }}
                                                                className="w-6 h-6 object-cover rounded-full border border-gray-300 shrink-0"
                                                            />
                                                            <span className="text-xs font-bold uppercase">{p.number ? `#${p.number} ` : '— '}{p.name}</span>
                                                        </div>
                                                        <span className="text-[10px] text-wildcats-blue font-bold uppercase">Add</span>
                                                    </div>
                                                );
                                            })
                                        )}
                                    </div>
                                </div>
                            ) : (
                                <button
                                    type="button"
                                    onClick={() => { setIsAddingCoach(true); setCoachSearchQuery(''); }}
                                    className="px-4 py-2.5 bg-gray-800 hover:bg-black text-white text-xs font-bold uppercase cursor-pointer"
                                >
                                    + Add Coach
                                </button>
                            )}
                        </div>
                    </div>

                    <div className="border-t border-gray-200 pt-6">
                        <label className="block text-xs font-bold uppercase text-gray-700 mb-1">Manage Roster ({teamRoster.length} Members)</label>

                        <div className="space-y-2 mb-3">
                            {isAddingRoster ? (
                                <div className="bg-gray-50 border border-gray-300 p-3 space-y-2">
                                    <div className="flex items-center justify-between">
                                        <span className="text-[10px] font-bold uppercase text-gray-500">Search Global Members to Add</span>
                                        <button type="button" onClick={() => setIsAddingRoster(false)} className="text-[10px] text-gray-500 uppercase underline cursor-pointer">Cancel</button>
                                    </div>
                                    <input
                                        type="text"
                                        placeholder="Type player name"
                                        value={rosterSearchQuery}
                                        onChange={(e) => setRosterSearchQuery(e.target.value)}
                                        className="w-full border border-gray-300 p-2.5 text-xs bg-white uppercase font-semibold outline-none"
                                    />
                                    <div className="max-h-36 overflow-y-auto bg-white border border-gray-200 divide-y">
                                        {searchedAvailablePlayers.length === 0 ? (
                                            <p className="p-2 text-xs text-gray-400 italic">No members found matching "{rosterSearchQuery}"</p>
                                        ) : (
                                            searchedAvailablePlayers.map(p => {
                                                const profilePic = p.profilePic || DEFAULT_PROFILE_PIC;
                                                return (
                                                    <div key={p._id} className="flex items-center justify-between p-2.5 hover:bg-gray-50 cursor-pointer" onClick={() => handleAssignPlayer(p)}>
                                                        <div className="flex items-center gap-2">
                                                            <img
                                                                src={profilePic}
                                                                alt=""
                                                                onError={(e) => { e.target.src = DEFAULT_PROFILE_PIC; }}
                                                                className="w-6 h-6 object-cover rounded-full border border-gray-300 shrink-0"
                                                            />
                                                            <span className="text-xs font-bold uppercase">{p.number ? `#${p.number} ` : '— '}{p.name}</span>
                                                        </div>
                                                        <span className="text-[10px] text-wildcats-blue font-bold uppercase">Add</span>
                                                    </div>
                                                );
                                            })
                                        )}
                                    </div>
                                </div>
                            ) : (
                                <button
                                    type="button"
                                    onClick={() => { setIsAddingRoster(true); setRosterSearchQuery(''); }}
                                    className="px-4 py-2.5 bg-gray-800 hover:bg-black text-white text-xs font-bold uppercase cursor-pointer"
                                >
                                    + Add Member to Roster
                                </button>
                            )}
                        </div>

                        <div className="max-h-60 overflow-y-auto bg-gray-50 border border-gray-300 p-2.5 space-y-2">
                            {teamRoster.length === 0 ? (
                                <span className="text-xs text-gray-400 italic">No members assigned to this team yet. Use the button above to add members.</span>
                            ) : (
                                teamRoster.map(r => {
                                    const matchingPlayer = players.find(p => p._id === r.playerId);
                                    const profilePic = matchingPlayer?.profilePic || DEFAULT_PROFILE_PIC;

                                    return (
                                        <div key={r.playerId} className="flex flex-col sm:flex-row items-start sm:items-center justify-between bg-white border border-gray-200 px-3 py-2.5 gap-2">
                                            <div className="flex items-center gap-3">
                                                <img
                                                    src={profilePic}
                                                    alt=""
                                                    onError={(e) => { e.target.src = DEFAULT_PROFILE_PIC; }}
                                                    className="w-8 h-8 object-cover rounded-full border border-gray-200 shrink-0"
                                                />
                                                <span className="text-xs font-bold uppercase text-gray-800">{r.number ? `#${r.number} ` : '— '}{r.name}</span>
                                            </div>

                                            <div className="flex items-center justify-between sm:justify-end gap-3 w-full sm:w-auto pt-1 sm:pt-0 border-t sm:border-t-0 border-gray-100">
                                                <select
                                                    value={r.position || '-'}
                                                    onChange={(e) => handleUpdateTeamRosterPosition(r.playerId, e.target.value)}
                                                    className="border border-gray-300 px-2.5 py-1.5 text-xs bg-white font-bold outline-none uppercase cursor-pointer"
                                                >
                                                    {TEAM_POSITIONS.map(pos => (
                                                        <option key={pos.value} value={pos.value}>{pos.label}</option>
                                                    ))}
                                                </select>
                                                <button
                                                    type="button"
                                                    onClick={() => handleRemovePlayerFromRoster(r.playerId, r.name)}
                                                    className="text-xs text-red-600 font-bold uppercase hover:underline cursor-pointer"
                                                >
                                                    Remove
                                                </button>
                                            </div>
                                        </div>
                                    );
                                })
                            )}
                        </div>
                    </div>
                </div>

                <div className="flex flex-row gap-3 justify-end pt-6 border-t border-gray-200">
                    <button
                        onClick={handleSaveAndReturn}
                        className="px-8 py-3 bg-green-600 hover:bg-green-700 text-white text-xs font-bold uppercase transition-colors cursor-pointer shadow-sm w-full sm:w-auto"
                    >
                        Save Changes
                    </button>
                </div>
            </div>
        </div>
    );
}