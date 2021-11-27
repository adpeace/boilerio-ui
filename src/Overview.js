import React, { useState, useEffect } from 'react';

import { Container, BottomNavigation, BottomNavigationAction } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';

import ScheduleIcon from '@material-ui/icons/Schedule';
import HomeIcon from '@material-ui/icons/Home';

import axios from 'axios';

import ZoneCard from './ZoneCard';
import Schedule from './Schedule';
import SensorsCard from './Sensors';

const axios_inst = axios.create({
        headers: {"X-Requested-With": "axios"}
    });

async function newScheduleEntry(dow, time, temp, zone) {
    try {
        const formData = new FormData();
        formData.set('day', dow);
        formData.set('time', time);
        formData.set('temp', temp);
        formData.set('zone', zone);

        await axios_inst.post(
            'api/schedule/new_entry', formData
            );
        return true;
    } catch (error) {
        return false;
    }
};

async function deleteScheduleEntry(dow, time, zone) {
    try {
        const formData = new FormData();
        formData.set('day', dow);
        formData.set('time', time);
        formData.set('zone', zone)

        await axios_inst.post(
            'api/schedule/delete_entry', formData
            );
        return true;
    } catch (error) {
        return false;
    }
};

export function Overview(props) {
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
    const changeTab = (ev, newTab) => { setActiveTab(newTab) };

    const [zones, setZones] = useState([]);
    const [schedules, setSchedules] = useState([]);
    const [isError, setIsError] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const result = await axios_inst.get('api/summary');
                setZones(result.data.zones);

                /* skanky for now */
                setSchedules(await Promise.all(result.data.zones.map(async zone => {
                    const schedres = await axios_inst.get('api/zones/' + zone.zone_id + '/schedule');
                    return {zone_id: zone.zone_id, name: zone.name, schedule: schedres.data};
                })));
            } catch (error) {
                console.debug(error);
                setIsError(true);
            }
        };

        fetchData();
    }, [props.refresh]);

    const zonecards = zones.map((z) =>
        <ZoneCard
            key={"zone_" + z.zone_id}
            name={z.name} zoneId={z.zone_id}
            temp={z.reported_state.current_temp
                ? Math.round(z.reported_state.current_temp * 10) / 10
                : null}
            target={z.target}
            timeToTarget={z.reported_state.time_to_target}
            boilerState={z.reported_state.state}
            targetOverride={z.target_override}
            reload={props.reload} />
    );
    const scheduleCards = schedules.map((z) =>
        <Schedule
            key={"schedule_" + z.zone_id}
            authRequired={props.authRequired}
            zoneId={z.zone_id}
            name={z.name}
            schedule={z.schedule}
            deleteEntry={deleteScheduleEntry}
            newEntry={newScheduleEntry}
            reload={props.reload}
        />
    );

    return (
        <>
            <Container maxWidth="sm" className={classes.container}>
                {activeTab === 0 ? zonecards : null }
                {activeTab === 1 ? scheduleCards : null }

                {activeTab === 0 ? <SensorsCard refresh={props.refresh} /> : null }
            </Container>
            <BottomNavigation value={activeTab}
                showLabels onChange={changeTab}
                className={classes.bottomnav}>
                <BottomNavigationAction label="Now" value={0} icon={<HomeIcon />} />
                <BottomNavigationAction label="Schedule" value={1}icon={<ScheduleIcon />} />
            </BottomNavigation>

            {isError && <div>Sorry, something went wrong...</div>}
        </>
    );
}
