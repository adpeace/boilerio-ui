import { Navigate } from 'react-router-dom';

export function RequireAuth({ children, redirectTo, authRequired }) {
    return !authRequired ? children : <Navigate to={redirectTo} />;
};