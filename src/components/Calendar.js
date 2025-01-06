import React, { useState, useEffect } from 'react';
import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';
import { Tooltip } from 'react-tooltip';
import { fetchScheduleData } from '../services/api';
import AdvancedDropdown from './AdvancedDropdown';
import ReactDOMServer from 'react-dom/server'
import '/Users/imamfachrudin/Documents/live ops/class-calendar/src/App.css';

const Calendar = () => {
    const [teacherData, setTeacherData] = useState([]);
    const [guruPiketData, setGuruPiketData] = useState([]);
    const [lastUpdated, setLastUpdated] = useState('');

    const [filters, setFilters] = useState({
        level: 'All',
        subject: 'All',
        grade: 'All',
        teacherName: 'All',
        mentorName: 'All',
        weekPeriod: '',
        grade_piket: '',
        subject_piket: ''
    });

    const [isWeekSelected, setIsWeekSelected] = useState(false);
    const [areDropdownsSelected, setDropdownSelected] = useState(false);
    const [loading, setLoading] = useState(true);
    const [activeSchedule, setActiveSchedule] = useState('teacher');

    const timeToMinutes = (timeStr) => {
        const [start] = timeStr.split("-");
        const [hour, minute] = start.split(":").map(Number);

        return (hour || 0) * 60 + (minute || 0);
    }

    const classTimes = [...new Set(teacherData.map(item => item.time))].sort((a, b) => {
        const timeA = timeToMinutes(a);
        const timeB = timeToMinutes(b);

        return timeA - timeB;
    });

    const days = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];

    const teacher_schedule_url = process.env.REACT_APP_TEACHER_SCHEDULE_URL;
    const guru_piket_url = process.env.REACT_APP_GURU_PIKET_URL;
    const last_data_updated = process.env.REACT_APP_LAST_DATA_UPDATED;

    const fetchLastUpdated = async () => {
        try {
            const response = await fetch(last_data_updated);
            const data = await response.json();
            if (data.last_updated) {
                setLastUpdated(data.last_updated);
            } else {
                setLastUpdated('No update timestamp found');
            }
        } catch (error) {
            console.error('Error fetching last updated time:', error);
            setLastUpdated('Failed to fetch update timestamp');
        }
    }

    useEffect(() => {
        const loadData = async () => {
            setLoading(true);

            if (activeSchedule === "teacher" && teacherData.length === 0) {
                const scheduleData = await fetchScheduleData(teacher_schedule_url);
                setTeacherData(scheduleData);
                const selectedWeek = getSelectedweek(scheduleData);
                setFilters((prevFilters) => ({
                    ...prevFilters,
                    weekPeriod: selectedWeek
                }));
                await fetchLastUpdated();
                setLoading(false);
            } else if (activeSchedule === "guruPiket" && guruPiketData.length === 0) {
                const scheduleData = await fetchScheduleData(guru_piket_url);
                setGuruPiketData(scheduleData);
                setLoading(false);
            } else {
                setLoading(false);
            }
        };
        const resetFiltersOnScheduleChange = () => {
            setFilters((prevFilters) => ({
                ...prevFilters,
                level: 'All',
                subject: 'All',
                grade: 'All',
                teacherName: 'All',
                mentorName: 'All',
                grade_piket: '',
                subject_piket: '',
            }));
        };

        resetFiltersOnScheduleChange();
        loadData();
    }, [activeSchedule]);

    const getSelectedweek = (data) => {
        const period_of_week = [...new Set(data.map(row => row.period_week))];
        const today = getMonday(new Date());
        period_of_week.sort();
        let selected_week = period_of_week.find(week => {
            return new Date(week).toLocaleDateString() === today.toLocaleDateString();
        });

        if (!selected_week) {
            selected_week = period_of_week.reduce((prev, current) => {
                let prevDiff = Math.abs(new Date(prev) - today);
                let currDiff = Math.abs(new Date(current) - today);
                return prevDiff < currDiff ? prev : current;
            })
        }
        return convertDateToLocaleString(selected_week) || '';
    }

    function getMonday(e) {
        const d = new Date(e);
        const day = d.getDay();
        const diff = d.getDate() - day + (day == 0 ? -6 : 1);
        return new Date(d.setDate(diff));
    };

    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        const updatedFilters = { ...filters, [name]: value };
        setFilters(updatedFilters);

        if (updatedFilters.grade_piket && updatedFilters.subject_piket) {
            setDropdownSelected(true);
        } else {
            setDropdownSelected(false);
        }

        if (name === 'weekPeriod') {
            setIsWeekSelected(true);
        }
    };

    const resetFilters = () => {
        setFilters(prevFilter => (
            {
                level: 'All',
                subject: 'All',
                grade: 'All',
                teacherName: 'All',
                mentorName: 'All',
                weekPeriod: prevFilter.weekPeriod,
                grade_piket: '',
                subject_piket: ''
            }
        ));

        setDropdownSelected(false);
        setIsWeekSelected(false);
    }

    const isAnyFilterActive = () => {
        const { weekPeriod, ...otherFilters } = filters;
        return Object.values(otherFilters).some(value => value !== 'All' && value !== '');
    };

    const convertDateToLocaleString = (e) => {
        return new Date(e).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" });
    };

    const uniqueLevel = ['All', ...new Set(teacherData
        .filter(item =>
            (filters.weekPeriod === convertDateToLocaleString(item.period_week)) &&
            (filters.level === 'All' || item.level === filters.level) &&
            (filters.subject === 'All' || item.subject === filters.subject) &&
            (filters.grade === 'All' || item.grade.toString() === filters.grade.toString()) &&
            (filters.teacherName === 'All' || item.teacher_name === filters.teacherName) &&
            (filters.mentorName === 'All' || item.mentor_name === filters.mentorName) &&
            (item["level"])
        )
        .map((item) => item.level))];
    const uniqueGrades = [(activeSchedule === "teacher" ? 'All' : ''), ...new Set(teacherData
        .filter(item =>
            (filters.weekPeriod === convertDateToLocaleString(item.period_week)) &&
            (filters.level === 'All' || item.level === filters.level) &&
            (filters.subject === 'All' || item.subject === filters.subject) &&
            (filters.grade === 'All' || item.grade.toString() === filters.grade.toString()) &&
            (filters.teacherName === 'All' || item.teacher_name === filters.teacherName) &&
            (filters.mentorName === 'All' || item.mentor_name === filters.mentorName) &&
            (item["grade"])
        )
        .map((item) => item.grade))].sort((a, b) => Number(a) - Number(b));
    const uniqueGradesPiket = [...new Set(guruPiketData.map((item) => item.grade))].sort((a, b) => {
        if (typeof a === "number" && typeof b === "number") return Number(a) - Number(b);
        if (typeof a !== "number" || typeof b !== "number") return String(a).localeCompare(String(b));
    });
    const uniqueSubjects = [(activeSchedule === "teacher" ? 'All' : ''), ...new Set(teacherData
        .filter(item =>
            (filters.weekPeriod === convertDateToLocaleString(item.period_week)) &&
            (filters.level === 'All' || item.level === filters.level) &&
            (filters.subject === 'All' || item.subject === filters.subject) &&
            (filters.grade === 'All' || item.grade.toString() === filters.grade.toString()) &&
            (filters.teacherName === 'All' || item.teacher_name === filters.teacherName) &&
            (filters.mentorName === 'All' || item.mentor_name === filters.mentorName) &&
            (item["subject"])
        )
        .map((item) => item.subject))];
    const uniqueSubjectPiket = [...new Set(guruPiketData
        .filter(item =>
            (String(filters.grade_piket) === String(item.grade))
        )
        .map((item) => item.subject))];

    const createUniqueNames = (teacherData, filters, propName) => {
        const names = ['All', ...new Set(
            teacherData
                .filter(item =>
                    (filters.weekPeriod === convertDateToLocaleString(item.period_week)) &&
                    (filters.level === 'All' || item.level === filters.level) &&
                    (filters.subject === 'All' || item.subject === filters.subject) &&
                    (filters.grade === 'All' || item.grade.toString() === filters.grade.toString()) &&
                    (filters.teacherName === 'All' || item.teacher_name === filters.teacherName) &&
                    (filters.mentorName === 'All' || item.mentor_name === filters.mentorName) &&
                    (item[propName])
                )
                .map(item => item[propName])
        )].sort((a, b) => {
            if (a === "All" && a !== b) {
                return a - b;
            }
            if (b === "All" && a !== b) {
                return b - a;
            }
            return a.localeCompare(b)
        });

        return names;
    }
    const uniqueWeekPeriods = [...new Set(teacherData.map((item) => convertDateToLocaleString(item.period_week)))];
    const filteredForGuruPiket = guruPiketData.filter((item) => {
        return (
            (String(item.grade) === String(filters.grade_piket)) &&
            (item.subject === filters.subject_piket)
        );
    })
    const filteredData = teacherData.filter((item) => {
        return (
            (filters.level === 'All' || item.level === filters.level) &&
            (filters.subject === 'All' || item.subject === filters.subject) &&
            (filters.grade === 'All' || item.grade.toString() === filters.grade.toString()) &&
            (filters.teacherName === 'All' || item.teacher_name.includes(filters.teacherName)) &&
            (filters.mentorName === 'All' || item.mentor_name.includes(filters.mentorName)) &&
            (filters.weekPeriod === 'All' || convertDateToLocaleString(item.period_week) === filters.weekPeriod)
        );
    });


    const getDayDate = (weekStartDate, dayIndex) => {
        if (!weekStartDate) return '';

        try {
            const startDate = new Date(weekStartDate);
            const targetDate = new Date(startDate);
            targetDate.setDate(startDate.getDate() + dayIndex);

            const dateFormatOptions = {
                day: 'numeric',
                month: 'long',
                year: 'numeric'
            };

            return targetDate.toLocaleDateString('id-ID', dateFormatOptions);
        } catch (error) {
            console.error('Error calculating date:', error);
            return '';
        }
    };

    const groupByWeekPeriod = (weekPeriod) => {
        const classesForWeekPeriod = filteredData.filter(
            (item) => convertDateToLocaleString(item.period_week) === weekPeriod
        );

        const groupedByDayTime = classesForWeekPeriod.reduce((acc, item) => {
            const dayTimeKey = `${item.day}-${item.time}`;
            if (!acc[dayTimeKey]) acc[dayTimeKey] = [];
            acc[dayTimeKey].push(item);
            return acc;
        }, {});

        return groupedByDayTime;
    };


    return (
        <div className="calendar-container">
            {loading ? (
                <div className="skeleton-container">
                    <Skeleton height={50} width={300} />
                    <Skeleton height={50} width={200} />
                    <Skeleton height={50} width={400} />
                </div>
            ) : (
                <>
                    <header>
                        <h2>{activeSchedule === 'teacher' ? 'Teacher Schedule' : 'Guru Piket Schedule'}</h2>
                        <div className='tables-navigation'>
                            <button
                                onClick={resetFilters}
                                disabled={!isAnyFilterActive()}
                                className={isAnyFilterActive() ? 'reset-button active' : 'inactive'}
                            >
                                <div>
                                    <svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%" viewBox="0 0 24 24" fill="currentColor" fit="" preserveAspectRatio="xMidYMid meet" focusable="false">
                                        <path d="M0 0h24v24H0z" fill="none"></path>
                                        <path d="M12.5 8c-2.65 0-5.05.99-6.9 2.6L2 7v9h9l-3.62-3.62c1.39-1.16 3.16-1.88 5.12-1.88 3.54 0 6.55 2.31 7.6 5.5l2.37-.78C21.08 11.03 17.15 8 12.5 8z"></path>
                                    </svg>
                                    Reset
                                </div>
                            </button>
                            <button onClick={() => setActiveSchedule('teacher')} className={activeSchedule === 'teacher' ? 'active' : 'inactive'}>Teacher Schedule</button>
                            <button onClick={() => setActiveSchedule('guruPiket')} className={activeSchedule === 'guruPiket' ? 'active' : 'inactive'}>Guru Piket Schedule</button>
                        </div>
                    </header>
                    <div className="filters">

                        {activeSchedule === 'teacher' && (
                            <>
                                <label>
                                    Week Period:
                                    {loading ? <Skeleton height={35} width={200} /> : (
                                        <AdvancedDropdown
                                            name="weekPeriod"
                                            options={uniqueWeekPeriods}
                                            value={filters.weekPeriod}
                                            onChange={handleFilterChange}
                                            placeholder="Select Week"
                                        />
                                    )}
                                </label>

                                <label>
                                    Level:
                                    {loading ? <Skeleton height={35} width={200} /> : (
                                        <AdvancedDropdown
                                            name="level"
                                            options={uniqueLevel}
                                            value={filters.level}
                                            onChange={handleFilterChange}
                                            placeholder="Select Level"
                                        />
                                    )}
                                </label>

                                <label>
                                    Subject:
                                    {loading ? <Skeleton height={35} width={200} /> : (
                                        <AdvancedDropdown
                                            name="subject"
                                            options={uniqueSubjects}
                                            value={filters.subject}
                                            onChange={handleFilterChange}
                                            placeholder="Select Subject"
                                        />
                                    )}
                                </label>

                                <label>
                                    Grade:
                                    {loading ? <Skeleton height={35} width={200} /> : (
                                        <AdvancedDropdown
                                            name="grade"
                                            options={uniqueGrades.map(String)}
                                            value={filters.grade}
                                            onChange={handleFilterChange}
                                            placeholder="Select Grade"
                                        />
                                    )}
                                </label>

                                <label>
                                    Teacher:
                                    {loading ? <Skeleton height={35} width={200} /> : (
                                        <AdvancedDropdown
                                            name="teacherName"
                                            options={createUniqueNames(teacherData, filters, "teacher_name")}
                                            value={filters.teacherName}
                                            onChange={handleFilterChange}
                                            placeholder="Select Teacher"
                                        />
                                    )}
                                </label>

                                <label>
                                    Mentor:
                                    {loading ? <Skeleton height={35} width={200} /> : (
                                        <AdvancedDropdown
                                            name="mentorName"
                                            options={createUniqueNames(teacherData, filters, "mentor_name")}
                                            value={filters.mentorName}
                                            onChange={handleFilterChange}
                                            placeholder="Select Mentor"
                                        />
                                    )}
                                </label>
                            </>
                        )}

                        {activeSchedule === 'guruPiket' && (
                            <>
                                <label>
                                    Grade:
                                    {loading ? <Skeleton height={35} width={200} /> : (
                                        <AdvancedDropdown
                                            name="grade_piket"
                                            options={uniqueGradesPiket.map(String)}
                                            value={filters.grade_piket}
                                            onChange={handleFilterChange}
                                            placeholder="Select Grade"
                                        />
                                    )}
                                </label>

                                <label>
                                    Subject:
                                    {loading ? <Skeleton height={35} width={200} /> : (
                                        <AdvancedDropdown
                                            name="subject_piket"
                                            options={uniqueSubjectPiket}
                                            value={filters.subject_piket}
                                            onChange={handleFilterChange}
                                            placeholder="Select Subject"
                                        />
                                    )}
                                </label>
                            </>
                        )}
                    </div>

                    {activeSchedule === 'teacher' && (
                        <div className="calendar">
                            <table>
                                <thead>
                                    <tr>
                                        <th>Time/Day</th>
                                        {days.map((day, index) => {
                                            const weekStartDate = filters.weekPeriod
                                                ? teacherData.find(item => convertDateToLocaleString(item.period_week) === filters.weekPeriod)?.period_week
                                                : null;

                                            const dayDate = weekStartDate
                                                ? getDayDate(weekStartDate, index)
                                                : '';

                                            return (
                                                <th key={day}>
                                                    {day}
                                                    {dayDate && <div style={{ fontSize: '0.8em', color: '#fff', fontWeight: 300 }}>{dayDate}</div>}
                                                </th>
                                            );
                                        })}
                                    </tr>
                                </thead>
                                <tbody>
                                    {classTimes.map((time) => (
                                        <tr key={time}>
                                            <td>{time}</td>
                                            {days.map((day) => (
                                                <td key={`${day}-${time}`}>
                                                    {filters.weekPeriod &&
                                                        groupByWeekPeriod(filters.weekPeriod)[`${day}-${time}`]?.map((item, index, array) => (
                                                            <div key={item.id} className="class-info" style={{ marginBottom: array.length > 1 ? "2.5rem" : "0px" }}>
                                                                <p style={{
                                                                    fontWeight: "700",
                                                                    color: "#36454F"
                                                                }}>
                                                                    {item.teacher_name}
                                                                    {!item.is_available && (
                                                                        <span className="tooltip">
                                                                            <a data-tooltip-id="my-tooltip-data-html" data-tooltip-html={ReactDOMServer.renderToStaticMarkup(
                                                                                item.teacher_replaces
                                                                                    ? <span>{item.teacher_name} is not available, will be replaced by <span style={{ color: '#f49b26' }}>{item.teacher_replaces}</span></span>
                                                                                    : <span>{item.teacher_name} is not available, no replacement assigned yet.</span>
                                                                            )}>
                                                                                <svg className="MuiSvgIcon-root" focusable="false" viewBox="0 0 24 24" aria-hidden="true">
                                                                                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"></path>
                                                                                </svg>
                                                                            </a>
                                                                            <Tooltip id="my-tooltip-data-html" />
                                                                        </span>
                                                                    )}
                                                                </p>
                                                                {item.mentor_name && (
                                                                    <p style={{ color: "grey", fontSize: "0.9rem", fontWeight: 700 }}>
                                                                        {`Mentor: ${item.mentor_name}`}
                                                                    </p>
                                                                )}
                                                                <p className={item.classNote === "Mandatory" ? "slot-name-based slot-mandatory" : "slot-name-based slot-non-mandatory"}>
                                                                    {item.classNote === "Mandatory" ? `${item.grade} ${item.slot_name}` : item.slot_name}
                                                                </p>
                                                                {new Date(item.first_class_date) > new Date() && (
                                                                    <p style={{ color: "grey", fontSize: "0.9rem" }}>
                                                                        {`Class starts ${convertDateToLocaleString(item.first_class_date)}`}
                                                                    </p>
                                                                )}
                                                            </div>
                                                        ))}
                                                </td>
                                            ))}
                                        </tr>
                                    ))}
                                </tbody>

                            </table>
                        </div>
                    )}

                    {areDropdownsSelected && isAnyFilterActive() && activeSchedule === 'guruPiket' && (
                        <div className="calendar">
                            <table>
                                <thead>
                                    <tr>
                                        <th>Time/Day</th>
                                        {days.map((day) => {
                                            return (
                                                <th key={day}>
                                                    {day}
                                                </th>
                                            );
                                        })}
                                    </tr>
                                </thead>
                                <tbody>
                                    {classTimes.map((time) => (
                                        <tr key={time}>
                                            <td>{time}</td>
                                            {days.map((day) => (
                                                <td key={`${day}-${time}`}>
                                                    {filteredForGuruPiket.filter(item => item.day === day && item.time === time).map(item => (
                                                        <p>
                                                            {item.teacherName}
                                                            {item.note && (
                                                                <span className="tooltip">
                                                                    <a data-tooltip-id="my-tooltip-data-html" data-tooltip-html={ReactDOMServer.renderToStaticMarkup(
                                                                        <span>{item.note}</span>
                                                                    )}>
                                                                        <svg className="MuiSvgIcon-root" focusable="false" viewBox="0 0 24 24" aria-hidden="true">
                                                                            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"></path>
                                                                        </svg>
                                                                    </a>
                                                                    <Tooltip id="my-tooltip-data-html" />
                                                                </span>
                                                            )}
                                                        </p>
                                                    ))}
                                                </td>
                                            ))}
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}

                    <div>
                        <p style={{ color: "grey", marginTop: "2rem" }}>{`Terakhir diupdate: ${lastUpdated}`}</p>
                    </div>

                </>
            )
            }
        </div>
    );
};

export default Calendar;
