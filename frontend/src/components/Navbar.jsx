import React, { useState } from "react";
import { NavLink } from "react-router";
import wildcatsLogo from "../assets/wildcats-logo.png";

export default function Navbar() {
    const [open, setOpen] = useState(false);

    const links = [
        { name: "Home", path: "/" },
        { name: "News", path: "/news" },
        { name: "Games", path: "/games" },
        { name: "Teams", path: "/teams" },
        { name: "Contact", path: "/contact" },
    ];

    return (
        <header className="relative w-full z-50 select-none">
            <div className="h-1 w-full bg-wildcats-red" />

            <nav className="bg-wildcats-blue border-b border-white/10 text-white shadow-lg">
                <div className="relative max-w-[1600px] mx-auto px-6 md:px-10 flex items-center justify-between h-20">

                    <NavLink to="/" className="flex items-center gap-2 h-full py-1 cursor-pointer z-10">
                        <img
                            src={wildcatsLogo}
                            alt="Newcastle Wildcats Logo"
                            className="h-full w-auto object-contain shrink-0"
                        />
                        <div className="-ml-1 sm:-ml-1.5 flex flex-col font-wildcats font-bold uppercase text-white leading-tight text-xs sm:text-sm md:text-base tracking-wider">
                            <span>NEWCASTLE</span>
                            <span>WILDCATS</span>
                        </div>
                    </NavLink>

                    <div className="hidden lg:flex absolute left-1/2 -translate-x-1/2 items-center space-x-4 text-[10px] uppercase tracking-[0.24em] font-sans font-semibold">
                        {links.map((link, index) => (
                            <React.Fragment key={link.name}>
                                <NavLink
                                    to={link.path}
                                    className={({ isActive }) =>
                                        `relative py-1 transition-colors duration-150 group ${
                                            isActive ? "text-white" : "text-white/70 hover:text-white"
                                        }`
                                    }
                                >
                                    {({ isActive }) => (
                                        <>
                                            <span>{link.name}</span>
                                            <span
                                                className={`absolute bottom-0 left-0 h-0.5 bg-wildcats-red transition-all duration-200 ${
                                                    isActive ? "w-full" : "w-0 group-hover:w-full"
                                                }`}
                                            />
                                        </>
                                    )}
                                </NavLink>

                                {index < links.length - 1 && (
                                    <span className="text-white/20 font-normal select-none">|</span>
                                )}
                            </React.Fragment>
                        ))}
                    </div>

                    <div className="flex items-center gap-4 sm:gap-6 z-10">
                        <div className="flex items-center gap-4 sm:gap-5">
                            <a
                                href="https://buiha.org.uk"
                                target="_blank"
                                rel="noreferrer"
                                className="opacity-80 hover:opacity-100 transition-opacity"
                            >
                                <img
                                    src="https://buiha.org.uk/buiha.png"
                                    alt="BUIHA Logo"
                                    className="h-9 sm:h-11 w-auto object-contain"
                                />
                            </a>
                            <div className="h-6 w-px bg-white/20" />
                            <a
                                href="https://nusu.co.uk"
                                target="_blank"
                                rel="noreferrer"
                                className="opacity-80 hover:opacity-100 transition-opacity"
                            >
                                <img
                                    src="https://assets-cdn.sums.digital/NW/White_Mono_NUSU_Logo_.png"
                                    alt="NUSU Logo"
                                    className="h-8 sm:h-10 w-auto object-contain"
                                />
                            </a>
                        </div>

                        <div className="flex items-center lg:hidden">
                            <button
                                type="button"
                                aria-label="Toggle menu"
                                className="relative flex flex-col justify-center items-center w-10 h-10 border border-white/20 rounded bg-white/5 hover:bg-white/10 p-2 focus:outline-none transition-colors"
                                onClick={() => setOpen(!open)}
                            >
                <span
                    className={`block h-0.5 w-5 bg-white transition-all duration-300 absolute ${
                        open ? "rotate-45" : "-translate-y-1.5"
                    }`}
                />
                                <span
                                    className={`block h-0.5 w-5 bg-white transition-all duration-300 ${
                                        open ? "opacity-0 scale-0" : "opacity-100"
                                    }`}
                                />
                                <span
                                    className={`block h-0.5 w-5 bg-white transition-all duration-300 absolute ${
                                        open ? "-rotate-45" : "translate-y-1.5"
                                    }`}
                                />
                            </button>
                        </div>
                    </div>
                </div>

                {open && (
                    <div className="lg:hidden border-t border-white/10 bg-wildcats-blue px-6 py-4 flex flex-col space-y-1 shadow-2xl font-sans">
                        {links.map((link) => (
                            <NavLink
                                key={link.name}
                                to={link.path}
                                onClick={() => setOpen(false)}
                                className={({ isActive }) =>
                                    `relative flex flex-col py-2.5 transition-colors ${
                                        isActive ? "text-white font-semibold" : "text-white/70 hover:text-white"
                                    }`
                                }
                            >
                                {({ isActive }) => (
                                    <>
                                        <span className="text-[11px] uppercase tracking-[0.2em]">{link.name}</span>
                                        {isActive && (
                                            <span className="h-0.5 w-8 bg-wildcats-red mt-1 rounded-full" />
                                        )}
                                    </>
                                )}
                            </NavLink>
                        ))}
                    </div>
                )}
            </nav>
        </header>
    );
}