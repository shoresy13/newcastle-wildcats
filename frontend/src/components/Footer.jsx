import React from 'react';
import { NavLink } from 'react-router';
import wildcatsLogo from '../assets/wildcats-logo.png';

export default function Footer() {
    const currentYear = new Date().getFullYear();

    const socialLinks = {
        instagram: "https://www.instagram.com/ncl_wildcats",
        facebook: "https://www.facebook.com/groups/2204168500",
        tiktok: "https://www.tiktok.com/@ncl_wildcats",
        youtube: "https://www.youtube.com/@newcastlewildcats",
        email: "mailto:nclwildcats@gmail.com",
        github: "https://github.com/shoresy13",
        buiha: "https://buiha.org.uk/club/newcastle",
        nusu: "https://nusu.co.uk/clubs/view/230",
    };

    const navRoutes = [
        { label: "Home", href: "/" },
        { label: "News", href: "/news" },
        { label: "Games", href: "/games" },
        { label: "Teams", href: "/teams" },
        { label: "Contact", href: "/contact" },
    ];

    const legalLinks = [
        { label: "Privacy Policy", href: "/privacy-policy" },
        { label: "Terms of Service", href: "/terms-of-service" },
    ];

    return (
        <footer className="w-full bg-wildcats-blue text-white uppercase select-none font-sans">
            <div className="h-1 w-full bg-wildcats-red" />

            <div className="border-t border-white/20 py-10 px-6">
                <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-start md:justify-between space-y-8 md:space-y-0 text-center md:text-left text-xs">

                    <div className="flex flex-col items-center md:items-start space-y-3">
                        <div className="flex items-center gap-3">
                            <NavLink to="/" className="flex items-center gap-3">
                                <img
                                    src={wildcatsLogo}
                                    alt="Newcastle Wildcats Logo"
                                    className="h-10 sm:h-12 md:h-14 w-auto shrink-0 object-contain"
                                />
                                <div className="flex flex-col font-wildcats font-bold uppercase text-white leading-tight text-xs sm:text-sm tracking-wider text-left">
                                    <span>NEWCASTLE</span>
                                    <span>WILDCATS</span>
                                </div>
                            </NavLink>

                            <div className="h-6 w-px bg-white/20" />
                            <div className="flex items-center gap-2">
                                <a
                                    href={socialLinks.buiha}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="opacity-80 hover:opacity-100 transition-opacity flex items-center"
                                >
                                    <img
                                        src="https://buiha.org.uk/buiha.png"
                                        alt="BUIHA Logo"
                                        className="h-6 sm:h-7 w-auto object-contain"
                                    />
                                </a>
                                <a
                                    href={socialLinks.nusu}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="opacity-80 hover:opacity-100 transition-opacity flex items-center"
                                >
                                    <img
                                        src="https://assets-cdn.sums.digital/NW/White_Mono_NUSU_Logo_.png"
                                        alt="NUSU Logo"
                                        className="h-5 sm:h-6 w-auto object-contain"
                                    />
                                </a>
                            </div>
                        </div>

                        <div className="space-y-1 font-sans font-semibold tracking-wider text-[10px] text-white/80">
                            <p>©{currentYear} BY NEWCASTLE WILDCATS.</p>
                            <p>
                                WEBSITE CREATED BY{' '}
                                <a
                                    href={socialLinks.github}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="underline underline-offset-2 hover:text-white transition-colors"
                                >
                                    JACOB LEWIS-SHORES
                                </a>
                            </p>
                        </div>
                    </div>

                    <div className="flex flex-col items-center md:items-start space-y-2">
                        <span className="font-wildcats font-bold text-[10px] tracking-wider text-white/50">
                            NAVIGATION
                        </span>
                        <nav className="flex flex-col items-center md:items-start space-y-1.5 font-sans font-semibold text-[10px] text-white/80 tracking-wider">
                            {navRoutes.map((route) => (
                                <NavLink
                                    key={route.label}
                                    to={route.href}
                                    className="hover:text-white transition-colors underline underline-offset-2"
                                >
                                    {route.label}
                                </NavLink>
                            ))}
                        </nav>
                    </div>

                    <div className="flex flex-col items-center md:items-start space-y-2">
                        <span className="font-wildcats font-bold text-[10px] tracking-wider text-white/50">
                            LEGAL
                        </span>
                        <nav className="flex flex-col items-center md:items-start space-y-1.5 font-sans font-semibold text-[10px] text-white/80 tracking-wider">
                            {legalLinks.map((link) => (
                                <NavLink
                                    key={link.label}
                                    to={link.href}
                                    className="hover:text-white transition-colors underline underline-offset-2"
                                >
                                    {link.label}
                                </NavLink>
                            ))}
                        </nav>
                    </div>

                    <div className="flex flex-col items-center md:items-end space-y-4">
                        <span className="font-wildcats font-bold text-[10px] tracking-wider text-white/50">
                            SOCIAL LINKS
                        </span>

                        <div className="flex items-center gap-5 text-white/90">
                            {/* Instagram */}
                            <a
                                href={socialLinks.instagram}
                                target="_blank"
                                rel="noopener noreferrer"
                                aria-label="Instagram"
                                className="hover:text-wildcats-red transition-colors"
                            >
                                <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                                </svg>
                            </a>

                            {/* Facebook */}
                            <a
                                href={socialLinks.facebook}
                                target="_blank"
                                rel="noopener noreferrer"
                                aria-label="Facebook"
                                className="hover:text-wildcats-red transition-colors"
                            >
                                <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                                </svg>
                            </a>

                            {/* TikTok */}
                            <a
                                href={socialLinks.tiktok}
                                target="_blank"
                                rel="noopener noreferrer"
                                aria-label="TikTok"
                                className="hover:text-wildcats-red transition-colors"
                            >
                                <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                                    <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.82.56-1.31 1.54-1.28 2.53.02 1.06.6 2.05 1.51 2.59.83.5 1.87.6 2.78.27.9-.31 1.61-1.07 1.88-1.99.11-.43.14-.88.14-1.32.01-4.27.01-8.53.01-12.8 0-.01 0-.01 0-.01z" />
                                </svg>
                            </a>

                            {/* YouTube */}
                            <a
                                href={socialLinks.youtube}
                                target="_blank"
                                rel="noopener noreferrer"
                                aria-label="YouTube"
                                className="hover:text-wildcats-red transition-colors"
                            >
                                <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                                    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                                </svg>
                            </a>
                        </div>

                        {/* Email */}
                        <p className="font-sans font-semibold tracking-wider text-[10px] text-white/80 text-center md:text-right">
                            <a
                                href={socialLinks.email}
                                className="underline underline-offset-2 hover:text-white transition-colors lowercase"
                            >
                                nclwildcats@gmail.com
                            </a>
                        </p>
                    </div>

                </div>
            </div>
        </footer>
    );
}