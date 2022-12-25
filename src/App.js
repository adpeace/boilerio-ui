import React, { useState, useEffect } from 'react';

import { Routes, Route, HashRouter }
    from 'react-router-dom';

import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar'
import Typography from '@material-ui/core/Typography';
import CssBaseline from '@material-ui/core/CssBaseline';
import IconButton from '@material-ui/core/IconButton';
import { makeStyles } from '@material-ui/core/styles';
import RefreshIcon from '@material-ui/icons/Refresh';

import axios from 'axios';

import { Overview } from './Overview';
import { Login } from './Login';
import { ProfileButton } from './ProfileButton';
import { RequireAuth } from './RequireAuth';
import './App.css';

const axios_inst = axios.create({
        headers: {"X-Requested-With": "axios"}
    });

function App() {
    const classes = makeStyles(theme => ({
        title: {
            flexGrow: 1,
        },
    }))();

    const [refresh, setRefresh] = useState(0);
    const reload = () => {setRefresh(!refresh)};
    const onFocus = () => setRefresh(1);

    /* Authentication-related state: */
    const [authRequired, setAuthRequired] = useState(false);
    const [profilePicture, setProfilePicture] = useState(null);
    const [, showLogoutError] = useState(false);

    /* For logout */
    const handleLogout = () => {
        async function do_logout() {
            try {
                const result = await axios_inst.delete('api/me');
                if (result.status === 200 || result.status === 204) {
                    setAuthRequired(true);
                }
            } catch(e) {
                showLogoutError(true);
            }
        }
        do_logout();
    }

    useEffect(() => {
        async function fetchData() {
            if (!authRequired) {
                try {
                    const r = await axios_inst.get('api/me');
                    setProfilePicture(r.data.picture);
                } catch(e) {
                    if (e.response) {
                        if (e.response.status === 401) {
                            setAuthRequired(true);
                        }
                    }
                }
            } else {
                setProfilePicture(null);
            }
        };

        fetchData();

        window.addEventListener("focus", onFocus);
        // Specify how to clean up after this effect:
        return () => {
            window.removeEventListener("focus", onFocus);
        };
    }, [authRequired]);

    return (
        <>
            <CssBaseline />

            <AppBar position="static" color="primary">
                <Toolbar>
                    <Typography color="inherit" variant="h6" className={classes.title}>
                        Heating
                    </Typography>
                    <IconButton color="inherit" onClick={ () => setRefresh(!refresh) }>
                        <RefreshIcon />
                    </IconButton>
                    <ProfileButton
                        handleLogout={handleLogout}
                        authenticated={!authRequired}
                        profilePicture={profilePicture}
                        />
                </Toolbar>
            </AppBar>

            <HashRouter>
                <Routes>
                    <Route path="/login" element={
                        <Login
                            authRequired={authRequired} setAuthRequired={setAuthRequired}
                            />
                    } />
                    <Route path="/" element={
                        <RequireAuth authRequired={authRequired} redirectTo="/login">
                            <Overview refresh={refresh} reload={reload}/>
                        </RequireAuth>
                    } />
                </Routes>
            </HashRouter>
        </>
    );
}

export default App;
