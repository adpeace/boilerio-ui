import React, { useState, useEffect } from 'react';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar'
import Typography from '@material-ui/core/Typography';
import CssBaseline from '@material-ui/core/CssBaseline';
import IconButton from '@material-ui/core/IconButton';
import { Container, BottomNavigation, BottomNavigationAction } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';

import RefreshIcon from '@material-ui/icons/Refresh';
import ScheduleIcon from '@material-ui/icons/Schedule';
import HomeIcon from '@material-ui/icons/Home';

import axios from 'axios';

import ZoneCard from './ZoneCard';
import Schedule from './Schedule';
import SensorsCard from './Sensors';

import './App.css';

async function newScheduleEntry(dow, time, temp, zone) {
    try {
        const formData = new FormData();
        formData.set('day', dow);
        formData.set('time', time);
        formData.set('temp', temp);
        formData.set('zone', zone);

        await axios.post(
            'api/schedule/new_entry', formData
            );
        return true;
    } catch (error) {
        return false;
    }
}

async function deleteScheduleEntry(dow, time, zone) {
    try {
        const formData = new FormData();
        formData.set('day', dow);
        formData.set('time', time);
        formData.set('zone', zone)

        await axios.post(
            'api/schedule/delete_entry', formData
            );
        return true;
    } catch (error) {
        return false;
    }
}

function App() {
    const classes = makeStyles(theme => ({
        title: {
            flexGrow: 1,
        },
        bottomnav: {
            top: 'auto',
            bottom: 0,
            position: 'fixed',
            width: '100%',
            boxShadow: theme.shadows[3]
        },
        container: {
            paddingBottom: 80,
        }
    }))();

    const [activeTab, setActiveTab] = useState(0);
    function changeTab(ev, newTab) {
        setActiveTab(newTab);
    }

    const [zones, setZones] = useState([]);
    const [schedules, setSchedules] = useState([]);
    const [isError, setIsError] = useState(false);
    const [refresh, setRefresh] = useState(0);

    const reload = () => {setRefresh(!refresh)};

    useEffect(() => {
        const fetchData = async () => {
            try {
                const result = await axios.get('api/summary');
                setZones(result.data.zones);

                /* skanky for now */
                setSchedules(await Promise.all(result.data.zones.map(async zone => {
                    const schedres = await axios.get('api/zones/' + zone.zone_id + '/schedule');
                    return {zone_id: zone.zone_id, name: zone.name, schedule: schedres.data};
                })));
            } catch (error) {
                setIsError(true);
            }
        };

        fetchData();
    }, [refresh]);

    const zonecards = zones.map((z) => 
        <ZoneCard name={z.name} zoneId={z.zone_id}
            temp={Math.round(z.reported_state.current_temp * 10) / 10}
            target={z.target}
            timeToTarget={z.reported_state.time_to_target}
            boilerState={z.reported_state.state}
            targetOverride={z.target_override}
            reload={reload} />
    );
    const scheduleCards = schedules.map((z) =>
        <Schedule 
            zoneId={z.zone_id}
            name={z.name}
            schedule={z.schedule}
            deleteEntry={deleteScheduleEntry}
            newEntry={newScheduleEntry}
            reload={reload}
        />
    );

    return ( 
        <React.Fragment>
            <CssBaseline />

            <div className={classes.root}>
                <AppBar position="static" color="primary">
                    <Toolbar>
                        <Typography color="inherit" variant="h6" className={classes.title}>
                            Heating
                        </Typography>
                        <IconButton color="inherit" onClick={ () => setRefresh(!refresh) }>
                            <RefreshIcon />
                        </IconButton>
                    </Toolbar>
                </AppBar>
            </div>

            <Container maxWidth="sm" className={classes.container}>
                {activeTab === 0 ? zonecards : <></> }
                {activeTab === 1 ? scheduleCards : <></> }

                {activeTab === 0 ? <SensorsCard refresh={refresh} /> : <></> }
            </Container>

            <BottomNavigation value={activeTab} 
                showLabels onChange={changeTab}
                className={classes.bottomnav}>
                <BottomNavigationAction label="Now" value={0} icon={<HomeIcon />} />
                <BottomNavigationAction label="Schedule" value={1}icon={<ScheduleIcon />} />
            </BottomNavigation>

            {isError && <div>Sorry, something went wrong...</div>}
        </React.Fragment>
    );
}

export default App;
