import React, { useEffect } from "react";
import { Routes, Route, Outlet, useLocation } from "react-router";
import { checkConnection } from "./utils/api";

import Navbar from "./components/Navbar.jsx";
import Footer from "./components/Footer.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx";

import Home from "./pages/Home.jsx";
import News from "./pages/News.jsx";
import Games from "./pages/Games.jsx";
import Teams from "./pages/Teams.jsx";
import Contact from "./pages/Contact.jsx";
import Login from "./pages/Login.jsx";

import Admin from "./pages/Admin.jsx"
import AddGame from "./pages/AddGame.jsx";


function ScrollToTop() {
    const { pathname } = useLocation();

    useEffect(() => {
        window.scrollTo(0, 0);
    }, [pathname]);

    return null;
}

export function Layout() {
    return (
        <div className="min-h-screen flex flex-col ">
            <ScrollToTop />
            <Navbar />
            <main className="w-full grow min-h-[calc(100vh-80px)]">
                <Outlet />
            </main>
            <Footer />
        </div>
    );
}

export default function App() {
    useEffect(() => {
        checkConnection()
            .then((data) => console.log("Success:", data))
            .catch((err) => console.error("Error:", err));
    }, []);

    return (
        <Routes>
            <Route path="/" element={<Layout />}>
                <Route index element={<Home />} />
                <Route path="news" element={<News />} />
                <Route path="games" element={<Games />} />
                <Route path="teams" element={<Teams />} />
                <Route path="contact" element={<Contact />} />
                <Route path="login" element={<Login />} />

                <Route element={<ProtectedRoute />}>
                    <Route path="admin" element={<Admin />} />
                    <Route path="admin/add-game" element={<AddGame />} />
                </Route>
            </Route>
        </Routes>
    );
}