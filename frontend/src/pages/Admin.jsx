import React from 'react';
import { Link } from 'react-router';

export default function Admin() {
    return (
        <div className="max-w-5xl mx-auto p-4 sm:p-6 font-sans">
            <div className="mb-8 border-b border-gray-200 pb-4">
                <h1 className="text-2xl font-bold font-wildcats text-wildcats-blue uppercase">
                    Admin Dashboard
                </h1>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                <Link
                    to="/admin/game-manager"
                    className="bg-white border border-gray-200 shadow-md p-6 hover:border-wildcats-blue hover:shadow-lg transition-all group block relative overflow-hidden"
                >
                    <div className="absolute top-0 left-0 w-1.5 h-full bg-wildcats-blue group-hover:bg-wildcats-red transition-colors" />
                    <h2 className="text-base font-bold font-wildcats text-gray-800 uppercase tracking-wide group-hover:text-wildcats-blue transition-colors mb-2">
                        Game Manager
                    </h2>
                    <p className="text-xs text-gray-600 leading-relaxed">
                        Create new fixtures and update scores for games.
                    </p>
                </Link>

                <Link
                    to="/admin/team-manager"
                    className="bg-white border border-gray-200 shadow-md p-6 hover:border-wildcats-blue hover:shadow-lg transition-all group block relative overflow-hidden"
                >
                    <div className="absolute top-0 left-0 w-1.5 h-full bg-wildcats-blue group-hover:bg-wildcats-red transition-colors" />
                    <h2 className="text-base font-bold font-wildcats text-gray-800 uppercase tracking-wide group-hover:text-wildcats-blue transition-colors mb-2">
                        Team Manager
                    </h2>
                    <p className="text-xs text-gray-600 leading-relaxed">
                        Manage team details, divisions, descriptions, and staff.
                    </p>
                </Link>

                <Link
                    to="/admin/player-manager"
                    className="bg-white border border-gray-200 shadow-md p-6 hover:border-wildcats-blue hover:shadow-lg transition-all group block relative overflow-hidden"
                >
                    <div className="absolute top-0 left-0 w-1.5 h-full bg-wildcats-blue group-hover:bg-wildcats-red transition-colors" />
                    <h2 className="text-base font-bold font-wildcats text-gray-800 uppercase tracking-wide group-hover:text-wildcats-blue transition-colors mb-2">
                        Player Manager
                    </h2>
                    <p className="text-xs text-gray-600 leading-relaxed">
                        Add players to club, update numbers and BUIHA links.
                    </p>
                </Link>
            </div>
        </div>
    );
}