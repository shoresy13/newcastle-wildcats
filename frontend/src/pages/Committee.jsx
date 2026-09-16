import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';

const DEFAULT_PROFILE_PIC = "https://buiha.org.uk/assets/img/profile/player-newcastle.jpg";

const DEFAULT_COMMITTEE = [
    { role: "President", name: "Name Here", description: "Oversees the overall running of the club, coordinates management, and represents the team to the university and BUIHA.", image: DEFAULT_PROFILE_PIC, instagram: "" },
    { role: "Secretary", name: "Name Here", description: "Handles club administration, meeting minutes, organizational communication, and general club documentation.", image: DEFAULT_PROFILE_PIC, instagram: "" },
    { role: "Treasurer", name: "Name Here", description: "Manages club finances, collects membership fees, tracks match budgets, and oversees overall team accounts.", image: DEFAULT_PROFILE_PIC, instagram: "" },
    { role: "Sponsorship Officer", name: "Name Here", description: "Secures external partnerships, manages sponsor relations, and generates financial support for club initiatives.", image: DEFAULT_PROFILE_PIC, instagram: "" },
    { role: "Social Media Sec", name: "Name Here", description: "Runs online platforms, posts match updates, creates media content, and grows the Wildcats community presence.", image: DEFAULT_PROFILE_PIC, instagram: "" },
    { role: "Welfare Officer", name: "Name Here", description: "Acts as a confidential point of contact for member wellbeing, inclusivity, safeguarding, and mental health support.", image: DEFAULT_PROFILE_PIC, instagram: "" },
    { role: "Social Secretary", name: "Name Here", description: "Organizes team socials, away trip entertainment, and club bonding events throughout the academic year.", image: DEFAULT_PROFILE_PIC, instagram: "" },
    { role: "Kit Officer", name: "Name Here", description: "Manages team jerseys, off-ice apparel orders, equipment tracking, and kit distribution.", image: DEFAULT_PROFILE_PIC, instagram: "" },
    { role: "Transport Sec", name: "Name Here", description: "Organizes travel logistics, minibuses, and carpools for away games and nationwide tournaments.", image: DEFAULT_PROFILE_PIC, instagram: "" },
    { role: "Social Secretary", name: "Name Here", description: "Coordinates party themes, bar partnerships, and social calendars alongside the social team.", image: DEFAULT_PROFILE_PIC, instagram: "" },
    { role: "Social Secretary", name: "Name Here", description: "Helps run events, integrates new players into club traditions, and ensures safe drinking and social environments.", image: DEFAULT_PROFILE_PIC, instagram: "" }
];

export default function Committee() {
    const navigate = useNavigate();
    const [committee, setCommittee] = useState(DEFAULT_COMMITTEE);

    const API_BASE = (import.meta.env.VITE_API_URL || 'https://newcastle-wildcats.onrender.com').replace(/\/$/, '');

    useEffect(() => {
        const fetchCommittee = async () => {
            try {
                const res = await fetch(`${API_BASE}/api/committee`);
                if (res.ok) {
                    const data = await res.json();
                    if (Array.isArray(data) && data.length > 0) {
                        setCommittee(data);
                    }
                }
            } catch (err) {
                console.warn('Could not fetch dynamic committee data, using defaults:', err);
            }
        };
        fetchCommittee();
    }, [API_BASE]);

    const formatInstagramUrl = (handle) => {
        if (!handle) return '#';
        const cleanHandle = handle.trim().replace(/^@/, '').replace('https://instagram.com/', '').replace('https://www.instagram.com/', '');
        return `https://instagram.com/${cleanHandle}`;
    };

    const formatInstagramDisplay = (handle) => {
        if (!handle) return '';
        const cleanHandle = handle.trim().replace(/^@/, '');
        return `@${cleanHandle}`;
    };

    return (
        <div className="max-w-[1600px] mx-auto p-4 sm:p-6 font-sans space-y-8">
            <div className="flex items-center justify-between border-b border-gray-200 pb-3">
                <h1 className="text-xl sm:text-2xl font-bold font-wildcats text-wildcats-blue uppercase tracking-wide">
                    Committee
                </h1>
                <button
                    onClick={() => navigate('/')}
                    className="px-3 py-1.5 sm:px-4 sm:py-2 text-[10px] sm:text-xs font-bold uppercase tracking-wider border border-gray-300 text-gray-700 bg-gray-50 hover:bg-gray-100 transition-colors cursor-pointer whitespace-nowrap"
                >
                    &larr; Back to Home
                </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {committee.map((member, index) => (
                    <div key={index} className="bg-white border border-gray-200 hover:border-wildcats-blue hover:shadow-md transition-all p-4 flex flex-col justify-between">
                        <div>
                            <div className="flex items-center gap-4 mb-3">
                                <img
                                    src={member.image || DEFAULT_PROFILE_PIC}
                                    alt={member.name}
                                    onError={(e) => { e.target.src = DEFAULT_PROFILE_PIC; }}
                                    className="w-14 h-14 object-cover rounded-full border border-gray-300 shrink-0 shadow-xs"
                                />
                                <div className="min-w-0">
                                    <span className="text-[10px] font-bold text-wildcats-blue uppercase tracking-widest block">
                                        {member.role}
                                    </span>
                                    <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wide truncate">
                                        {member.name || 'Name Here'}
                                    </h3>
                                    {member.instagram && (
                                        <a
                                            href={formatInstagramUrl(member.instagram)}
                                            target="_blank"
                                            rel="noreferrer"
                                            className="text-[10px] font-bold text-wildcats-red hover:underline tracking-wide mt-0.5 block truncate"
                                        >
                                            {formatInstagramDisplay(member.instagram)}
                                        </a>
                                    )}
                                </div>
                            </div>
                        </div>
                        <p className="text-xs text-gray-600 leading-relaxed border-t border-gray-100 pt-2.5">
                            {member.description}
                        </p>
                    </div>
                ))}
            </div>
        </div>
    );
}