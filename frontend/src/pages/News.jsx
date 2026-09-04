import React from 'react';
import wildcatsLogo from '../assets/wildcats-logo.png';

export default function News() {
    return (
        <div className="min-h-[75vh] flex flex-col items-center justify-center p-6 text-center font-sans bg-gray-50/50">
            <div className="max-w-lg w-full bg-white border border-gray-200 p-8 sm:p-10 shadow-sm relative overflow-hidden">
                <div className="absolute top-0 left-0 right-0 h-1 bg-wildcats-red" />

                <div className="flex flex-col items-center">
                    <img
                        src={wildcatsLogo}
                        alt="Newcastle Wildcats Logo"
                        className="w-20 h-20 sm:w-24 sm:h-24 object-contain mb-6 drop-shadow-sm"
                    />

                    <h1 className="text-xl sm:text-2xl font-bold font-wildcats text-wildcats-blue uppercase tracking-wide mb-3">
                        Under Development
                    </h1>

                    <p className="text-xs sm:text-sm text-gray-600 uppercase tracking-widest font-lighbold max-w-sm leading-relaxed mb-8">
                        The Newcastle Wildcats website is currently being updated. Please check back soon!
                    </p>

                </div>
            </div>
        </div>
    );
}