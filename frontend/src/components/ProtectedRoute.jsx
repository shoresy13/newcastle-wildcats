import React from "react";
import { Navigate, Outlet } from "react-router";

export default function ProtectedRoute() {
    const userInfo = localStorage.getItem("userInfo")
        ? JSON.parse(localStorage.getItem("userInfo"))
        : null;

    const isAuthorized = userInfo && userInfo.token && userInfo.isAdmin;

    return isAuthorized ? <Outlet /> : <Navigate to="/login" replace />;
}