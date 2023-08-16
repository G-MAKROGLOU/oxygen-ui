import { useEffect, useMemo, useRef, useState } from "react"
import { useTheme } from "../../hooks"
import { ButtonPart } from "../../types/buttonGroup"
import { IconButton, ButtonGroup, Button } from "../buttons"
import { BsFillCalendarDayFill, BsFillCalendarMonthFill, BsFillCaretLeftFill, BsFillCaretRightFill, BsFillCalendarPlusFill } from 'react-icons/bs'
import { FaEllipsisH } from 'react-icons/fa'
import { getCurrentWeek, getEventStyle, getEventTime, getHundredYears, getSuperScript, getWeekOfMonth, getWeeksOfMonth, isWithinDay, isWithinHours, numberToDay, numberToMonth } from "./calendarUtils"

const defaultDate = new Date();

const Calendar = ({
    width = '100%',
    height = '100%',
    defaults = {
        year: defaultDate.getFullYear(),
        month: defaultDate.getMonth(),
        week: 0,
        scheme: 'month'
    },
    eventSpecs = {
        get: '/api/v1/events?fromDate=@from&toDate=@to',
        post: '/api/v1/events',
        put: '/api/v1/events/:eventId',
        headers: {
            'Content-Type': 'application/json'
        }
    },
}: any) => {
    const { theme } = useTheme();
    const [month, setMonth] = useState<number>(defaults.month);
    const [year, setYear] = useState<number>(defaults.year);
    const [scheme, setScheme] = useState<string>(defaults.scheme)
    const [shownWeek, setShownWeek] = useState<number>(defaults?.week)
    const [events, setEvents] = useState<any[]>([])

    const oxyOnSchemeChange = async (clickedKey: string | number) => {
        setScheme(clickedKey as string)
        
        let dateFrom = new Date(year, month, 2).toISOString().split('T')[0]
        let dateTo = new Date(year, month+1, 1).toISOString().split('T')[0]
        
        if (clickedKey === 'week') {
            //const currentWeek = getCurrentWeek()
            //setShownWeek(currentWeek)
            const daysOfNewWeek = weekDays.allWeeks[shownWeek]
            const fromDay = daysOfNewWeek.at(0)?.dayOfMonth as number
            const lastDay = daysOfNewWeek.at(-1)?.dayOfMonth as number
            dateFrom = new Date(year, month, fromDay+1).toISOString().split('T')[0]
            dateTo = new Date(year, month, lastDay+1).toISOString().split('T')[0]
        }

        // get the events
        try {
            const url = eventSpecs.get.replace('@from', dateFrom).replace('@to', dateTo)
            const response = await fetch(url, eventSpecs.headers)
            const json = await response.json()
            setEvents(json)
        } catch (err: unknown) {
            const error = err as Error;
            // TODO: show something like a notification when notifications are ready
        }
    } // OK

    const oxyOnMonthChange = async (month: number) => {
        // update the state
        let toShow = shownWeek;
        const newMonthWeeks = getWeeksOfMonth(year, month)
        if (shownWeek === 4 && newMonthWeeks.length - 1 < shownWeek) {
            toShow = newMonthWeeks.length - 1
        }
        setShownWeek(toShow)
        setMonth(month);
        
        // get the events
        try {
            let dateFrom = new Date(year, month, 1).toISOString()
            let dateTo = new Date(year, month + 1, -1).toISOString()

            if (scheme === 'week') {
                const firstDayOfWeek = newMonthWeeks[toShow].at(0)?.dayOfMonth as number;
                const lastDayOfWeek = newMonthWeeks[toShow].at(-1)?.dayOfMonth as number
                dateFrom = new Date(year, month, firstDayOfWeek+1).toISOString().split('T')[0]
                dateTo = new Date(year, month, lastDayOfWeek+1).toISOString().split('T')[0]
            }

            const url = eventSpecs.get.replace('@from', dateFrom).replace('@to', dateTo)
            const response = await fetch(url, eventSpecs.headers)
            const json = await response.json()
            setEvents(json)
        } catch (err: unknown) {
            const error = err as Error;
        }
    } // OK

    const oxyOnYearChange = async (year: number) => {
        let toShow = shownWeek
        const newMonthWeeks = getWeeksOfMonth(year, month)
        if (shownWeek === 4 && newMonthWeeks.length - 1 < shownWeek) {
            toShow = newMonthWeeks.length - 1
        }
        setShownWeek(toShow)
        setYear(year);

        // get the events
        try {
            let dateFrom = new Date(year, month, 1).toISOString().split('T')[0]
            let dateTo = new Date(year, month, -1).toISOString().split('T')[0]
            
            if (scheme === 'week') {
                const firstDayOfWeek = newMonthWeeks[toShow].at(0)?.dayOfMonth as number;
                const lastDayOfWeek = newMonthWeeks[toShow].at(-1)?.dayOfMonth as number
                dateFrom = new Date(year, month, firstDayOfWeek+1).toISOString().split('T')[0]
                dateTo = new Date(year, month, lastDayOfWeek+1).toISOString().split('T')[0]
            }
            
            const url = eventSpecs.get.replace('@from', dateFrom).replace('@to', dateTo)
            const response = await fetch(url, eventSpecs.headers)
            const json = await response.json()
            setEvents(json)
        } catch (err: unknown) {
            const error = err as Error;
            // TODO: show a notification when notifications are ready
        }
    } // OK

    const oxyOnWeekChange = async (weekNumber: number) => {
        setShownWeek(weekNumber)
        
        // get the events
        try {
            // FIXME: bug when the change of a week changes month and year
            
            let daysOfNewWeek = weekDays.allWeeks[weekNumber]
            let currMonth = month;
            const fromDay = daysOfNewWeek.at(0)?.dayOfMonth as number;
            const lastDay = daysOfNewWeek.at(-1)?.dayOfMonth as number;
            const dateFrom = new Date(year, currMonth, fromDay+1).toISOString().split('T')[0]
            const dateTo = new Date(year, currMonth, lastDay+1).toISOString().split('T')[0]
            const url = eventSpecs.get.replace('@from', dateFrom).replace('@to', dateTo)
            const response = await fetch(url, eventSpecs.headers)
            const json = await response.json()
            setEvents(json)
        } catch (err: unknown) {
            const error = err as Error;
            // TODO: show somekind of notification when notifications are ready
        }
    } // OK

    const weekDays = useMemo(() => {
        const weeks = getWeeksOfMonth(year, month)
        return {
            toShow: weeks[shownWeek],
            total: weeks.length,
            allWeeks: weeks,
        }
    }, [shownWeek, month, year]) // OK

    useEffect(() => {
        
        const abortController = new AbortController();
        const { signal } = abortController;
        let fromDate = new Date(defaults.year, defaults.month, 2)
        let toDate = new Date(defaults.year, defaults.month+1, 1)

        if (defaults.scheme === 'week'){
            const week = getWeekOfMonth(defaults)
            const firstDayOfWeek = week.at(0)?.dayOfMonth as number;
            const lastDayOfWeek = week.at(-1)?.dayOfMonth as number;
            fromDate = new Date(defaults.year, defaults.month, firstDayOfWeek+1, 0, 0, 0)
            toDate = new Date(defaults.year, defaults.month, lastDayOfWeek+1, 0, 0, 0)
        }

        const from = fromDate.toISOString().split('T')[0]
        const to = toDate.toISOString().split('T')[0]
        const url = eventSpecs.get.replace("@from", from).replace("@to", to)
        
        fetch(url, {...eventSpecs.headers, signal})
        .then(res => res.json())
        .then(setEvents)
        .catch(console.error)

        return () => {
            abortController.abort();
        }
    }, []) // OK

    return (
        <div
            className={`oxyui__calendar oxyui__calendar__${theme}`} 
            style={{ width, height }}
        >
            <CalendarToolbar 
                onWeekChange={oxyOnWeekChange}
                onMonthChange={oxyOnMonthChange}
                onYearChange={oxyOnYearChange}
                setYear={setYear}
                setMonth={setMonth}
                scheme={defaults.scheme}
                onSchemeChange={oxyOnSchemeChange}
                month={month}
                year={year}
                totalWeeks={weekDays.total}
                weekNumber={shownWeek}
            />
            {
                scheme === 'week'
                ? <WeeklyCalendar weekDays={weekDays.toShow} events={events}/>
                : <MonthlyCalendar monthDays={weekDays.allWeeks} events={events}/>
            }
        </div>
    )
}

const CalendarToolbar = ({
    onSchemeChange,
    scheme,
    setMonth,
    setYear,
    onMonthChange,
    onYearChange,
    onWeekChange,
    month,
    year,
    totalWeeks,
    weekNumber
}: any) => {
    const {theme} = useTheme()
    const monthPickerRef = useRef<HTMLDivElement>(null);
    const yearPickerRef = useRef<HTMLDivElement>(null);
    const [hundrendYears, setHundrendYears] = useState<number[][]>([]);
    const [decadeIndex, setDecadeIndex] = useState<number>(0);
    const [itemsAnimationClass, setItemsAnimationClass] = useState<string>('');
    const [weekButtonsVisible, setWeekButtonsVisible] = useState<boolean>(scheme === 'week');

    const buttons: ButtonPart[] = [
        {
            key: 'month',
            content: 'Month',
            icon: <BsFillCalendarMonthFill/>,
            type: 'primary'
        },
        {
            key: 'week',
            content: 'Week',
            icon: <BsFillCalendarDayFill/>,
            type: 'secondary'
        }
    ]

    useEffect(() => {
        if (!hundrendYears.length) {
            const hundrend = getHundredYears()
            for (let i = 0; i < hundrend.length; i++) {
                if (hundrend[i].includes(year)){
                    setDecadeIndex(i)
                    break;
                }
            }
            setHundrendYears(hundrend)
        }
    }, [hundrendYears])

    useEffect(() => {
        const clickAway = (e: MouseEvent) => {
            const target = e.target as Node
            if (
                (monthPickerRef.current && !monthPickerRef.current.contains(target)) &&
                (yearPickerRef.current && !yearPickerRef.current.contains(target))
            ){
                if (!monthPickerRef.current?.classList.contains('oxyui__calendar__toolbar__month__picker__hidden')){
                    monthPickerRef.current?.classList.add('oxyui__calendar__toolbar__month__picker__hidden')
                }
                if (!yearPickerRef.current?.classList.contains('oxyui__calendar__toolbar__year__picker__hidden')){
                    yearPickerRef.current?.classList.add('oxyui__calendar__toolbar__year__picker__hidden')
                }
            }
        }
        document.addEventListener('mousedown', clickAway)
    }, [])

    const onMonthClick = () => {
        monthPickerRef.current?.classList.toggle('oxyui__calendar__toolbar__month__picker__hidden');
    }

    const onYearClick = () => {
        yearPickerRef.current?.classList.toggle('oxyui__calendar__toolbar__year__picker__hidden');
    }

    const toNextDecade = (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
        e.stopPropagation();
        if (decadeIndex + 1 <= 9){
            setDecadeIndex(decadeIndex + 1)
            setItemsAnimationClass('oxyui__calendar__toolbar__year__picker__decade__hidden__next')
        }
    }

    const toPreviousDecade = (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
        e.stopPropagation();
        if (decadeIndex - 1 >= 0){
            setDecadeIndex(decadeIndex - 1)
            setItemsAnimationClass('oxyui__calendar__toolbar__year__picker__decade__hidden__prev')
        }
    }

    const oxyOnSchemeChange = (key: string | number) => {
        setWeekButtonsVisible(key === 'week')
        onSchemeChange(key)
    }

    const toPrevWeek = () => {
        // cant go any further back
        if (year === 1990 && month === 0 && weekNumber === 0){
            return;
        }
        // going back multiple weeks triggers going back months and years as well
        if (weekNumber - 1 < 0) {
            let numberOfWeeks = month - 1 === 1 ? 4 : 5;
            onWeekChange(numberOfWeeks-1)
            if (month - 1 < 0) {
                setMonth(11)
                if (year - 1 >= 1990){
                    setYear(year - 1)
                }
            }else {
                setMonth(month - 1)
            }
            return
        }
        // normal decrement
        onWeekChange(weekNumber - 1)
    }

    const toNextWeek = () => {
        // cant go any further in the future
        if (year === 2089 && month === 11 && weekNumber === totalWeeks){
            return;
        }
        // going forward multiple weeks triggers going forward months and years as well
        if (weekNumber + 1 >= totalWeeks) {
            onWeekChange(0)
            if (month + 1 > 11) {
                setMonth(0)
                if (year + 1 <= 2089){
                    setYear(year + 1)
                }
            }else {
                setMonth(month + 1)
            }
            return
        }
        // normal decrement
        onWeekChange(weekNumber + 1)
    }

    return (
        <div className='oxyui__calendar__toolbar'>

            <div className='oxyui__calendar__toolbar__month__year'>
                <ButtonGroup
                    buttons={buttons}
                    defaultKey={scheme}
                    onClick={oxyOnSchemeChange}
                />
                <div onClick={onMonthClick} className='oxyui__calendar__toolbar__month__wrapper'>
                    <h3 className='oxyui__calendar__toolbar__month'>{numberToMonth[month]}</h3>
                    <div ref={monthPickerRef} className={`oxyui__calendar__toolbar__month__picker oxyui__calendar__toolbar__month__picker__${theme} oxyui__calendar__toolbar__month__picker__hidden`}>
                        {Object.keys(numberToMonth).map((key) => (
                            <div
                                key={key}
                                onClick={() => onMonthChange(parseInt(key))} 
                                className={`oxyui__calendar__toolbar__month__picker__item ${parseInt(key) === month ? 'oxyui__calendar__toolbar__month__picker__item__active' : ''}`}
                            >
                                {numberToMonth[parseInt(key)].replace('.', '')}
                            </div>   
                        ))}
                    </div>
                </div>
                <div
                    onClick={onYearClick} 
                    className='oxyui__calendar__toolbar__year__wrapper'
                >
                    <h3 className='oxyui__calendar__toolbar__year'>{year}</h3>
                    <div 
                        ref={yearPickerRef}
                        className={`oxyui__calendar__toolbar__year__picker oxyui__calendar__toolbar__year__picker__${theme} oxyui__calendar__toolbar__year__picker__hidden`}
                    >
                        <div
                            className={`oxyui__calendar__toolbar__year__picker__prev oxyui__calendar__toolbar__year__picker__prev__${theme}`}
                            onClick={toPreviousDecade}
                        >
                            <BsFillCaretLeftFill/>
                        </div>
                        <div
                            className={`oxyui__calendar__toolbar__year__picker__items`}
                        >
                            {
                                hundrendYears.map((decade, index) => {
                                    return (
                                        <div key={index} className={`oxyui__calendar__toolbar__year__picker__decade ${index === decadeIndex ? '' : `oxyui__calendar__toolbar__year__picker__decade__hidden ${itemsAnimationClass}` }`}>
                                            {decade.map((decadeYear) => (
                                                <div
                                                    key={decadeYear}
                                                    className={`oxyui__calendar__toolbar__year__picker__item ${year === decadeYear ? 'oxyui__calendar__toolbar__year__picker__item__active' : ''}`} 
                                                    onClick={() => onYearChange(decadeYear)} 
                                                >
                                                    {decadeYear}
                                                </div>
                                            ))}
                                        </div>
                                        ) 
                                    }
                                )
                            }
                        </div>
                        <div
                            className={`oxyui__calendar__toolbar__year__picker__next oxyui__calendar__toolbar__year__picker__next__${theme}`}
                            onClick={toNextDecade}
                        >
                            <BsFillCaretRightFill/>
                        </div>
                    </div>
                </div>
                {
                    weekButtonsVisible
                    ? <div className='oxyui__calendar__toolbar__week__picker'>
                        <div>
                            <IconButton 
                                type='primary'
                                icon={<BsFillCaretLeftFill/>}
                                onClick={toPrevWeek}
                            />
                        </div>
                        <h4>Week {weekNumber+1}</h4>
                        <div>
                            <IconButton 
                                type='primary'
                                icon={<BsFillCaretRightFill/>}
                                onClick={toNextWeek}
                            />
                        </div>
                    </div>
                    : null
                }
            </div>

            <Button 
                content="New Event"
                type="primary"
                icon={<BsFillCalendarPlusFill/>}
            />
           
        </div>
    )
}

const WeeklyCalendar = ({ weekDays, events }: any) => {
    const hoursPlaceholder = useMemo(() => new Array(24).fill(0), [])
    return (
        <div className='oxyui__calendar__weekly'>
            <div className='oxyui__calendar__weekly__hours'>
                {hoursPlaceholder.map((_, index) => (
                    <div key={index} className='oxyui__calendar__weekly__hour'>{index < 10 ? `0${index}:00` : `${index}:00`}</div>
                ))}
            </div>
            <div className='oxyui__calendar__weekly__days'>
                {weekDays.map((day: any) => (
                    <div key={day.dayOfMonth} className='oxyui__calendar__weekly__day'>
                        <h3 className='oxyui__calendar__weekly__day__header'>
                            {numberToDay[day.dayOfWeek]} {day.dayOfMonth}
                            <sup>{getSuperScript(day.dayOfMonth)}</sup>
                        </h3>
                        <div className='oxyui__calendar__weekly__day__events'>
                            {hoursPlaceholder.map((_, index) => (
                                <div key={index} className='oxyui__calendar__weekly__day__event'>
                                    {
                                        events
                                        .filter((event: any) => isWithinDay(event, day) && isWithinHours(event, index))
                                        .map((event: any) => (
                                            <div 
                                                key={event.id} 
                                                className='oxyui__calendar__weekly__day__event__bubble' 
                                                style={getEventStyle(event)}
                                            >
                                                <div className='oxyui__calendar__weekly__day__event__bubble__name'>{event.name}</div>
                                                <div><FaEllipsisH fontSize={15}/></div>
                                            </div>
                                        ))
                                    }
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}

//numberToDay
const MonthlyCalendar = ({
    monthDays, events
}: any) => {

    const daysComplete = useMemo(() => {
        const flat = monthDays.flatMap((week: any) => week.map((day: any) => day))
        const firstOfTheMonth = flat.at(0).dayOfWeek
        if (firstOfTheMonth > 0) {
            for (let i = firstOfTheMonth - 1; i >= 0; i--) {
                flat.unshift({
                    dayOfWeek: i,
                    dayOfMonth: ''
                })
            }
        }
        return flat
    }, [monthDays])

    return (
        <div className='oxyui__calendar__monthly'>
            
            <div className='oxyui__calendar__monthly__days'>
                {Object.keys(numberToDay).map((key) => (
                    <div key={numberToDay[parseInt(key)]} className='oxyui__calendar__monthly__day'>
                        <h4 className='oxyui__calendar__monthly__day__header'>{numberToDay[parseInt(key)]}</h4>
                        <div className='oxyui__calendar__monthly__day__events'>
                            {
                                daysComplete
                                .filter((day: any) => day.dayOfWeek === parseInt(key))
                                .map((day: any) => (
                                    <div className='oxyui__calendar__monthly__day__event'>
                                        <h5 className='oxyui__calendar__monthly__day__event__day'>
                                            {day.dayOfMonth}
                                        </h5>
                                        {
                                            events.filter((event: any) => event.dayOfMonth === day.dayOfMonth)
                                            .map((event: any) => (
                                                <div 
                                                    className='oxyui__calendar__monthly__day__event__bubble'
                                                    style={{ background: event.bg, color: event.color }}
                                                >
                                                    <div>{event.name}</div>
                                                    <div className='oxyui__calendar__monthly__day__event__bubble__details'>
                                                        <div>{getEventTime(event.from)} - {getEventTime(event.to)}</div>
                                                        <div className='oxyui__calendar__monthly__day__event__bubble__details__icon'>
                                                            <FaEllipsisH fontSize={15}/>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))
                                        }
                                    </div>
                                ))
                            }
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}

export default Calendar