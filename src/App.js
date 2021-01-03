import React, { useState, useEffect } from 'react';

import { Switch, Route, HashRouter }
    from 'react-router-dom';
import { Redirect } from 'react-router-dom';

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
import './App.css';

const axios_inst = axios.create({
        headers: {"X-Requested-With": "axios"}
    });

const ProtectedRoute = ({children, authRequired, ...rest}) => {
    return (
        <Route {...rest}>
            {!authRequired ? children : <Redirect to="/login" />}
        </Route>
    );
};

function App() {
    const classes = makeStyles(theme => ({
        title: {
            flexGrow: 1,
        },
    }))();

    const [refresh, setRefresh] = useState(0);
    const reload = () => {setRefresh(!refresh)};

    /* Authentication-related state: */
    const [authRequired, setAuthRequired] = useState(false);
    const [profilePicture, setProfilePicture] = useState(null);
    const [logoutError, showLogoutError] = useState(false);

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
                <Switch>
                    <Route path="/login">
                        <Login
                            authRequired={authRequired} setAuthRequired={setAuthRequired}
                            />
                    </Route>
                    <ProtectedRoute authRequired={authRequired} path="/">
                        <Overview refresh={refresh} reload={reload}/>
                    </ProtectedRoute>
                </Switch>
            </HashRouter>
        </>
    );
}

export default App;
