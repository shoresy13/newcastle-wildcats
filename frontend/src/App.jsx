import React, { useEffect } from "react";
import { Routes, Route, Outlet, useLocation } from "react-router";
import { checkConnection } from "./utils/api";

import Navbar from "./components/Navbar.jsx";
import Footer from "./components/Footer.jsx";
import Home from "./pages/Home.jsx";

function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}

export function Layout() {
  return (
      <div>
        <ScrollToTop />
        <Navbar />
        <main>
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
        </Route>
      </Routes>
  );
}