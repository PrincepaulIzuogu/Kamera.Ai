import React from "react";
import { Route, Navigate } from "react-router-dom";

// PrivateRoute component that checks for the token
const PrivateRoute = ({ element: Component, ...rest }) => {
  const token = localStorage.getItem("access_token");

  return (
    <Route
      {...rest}
      element={token ? Component : <Navigate to="/sign-in" />} // Navigate to /sign-in if not authenticated
    />
  );
};

export default PrivateRoute;
