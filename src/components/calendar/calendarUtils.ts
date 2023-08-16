import { CSSProperties } from "react";

export const numberToMonth: { [key: number]: string } = {
    0: 'Jan.',
    1: 'Feb.',
    2: 'Mar.',
    3: 'Apr.',
    4: 'May.',
    5: 'Jun.',
    6: 'Jul.',
    7: 'Aug.',
    8: 'Sep.',
    9: 'Oct.',
    10: 'Nov.',
    11: 'Dec.'
}

export const getHundredYears = () => {
    const hundredYears: number[][] = []
    
    let startingYear = 1990;
    for (let i = 0;  i < 10; i++) {
        let tenYears = [];
        for (let j = 0; j < 10; j++) {
            tenYears.push(startingYear + j)
        }
        startingYear += 10;
        hundredYears.push(tenYears)
    }
    return hundredYears;
}

export const numberToDay: { [key: number]: string } = {
    0: 'Sun',
    1: 'Mon',
    2: 'Tue',
    3: 'Wed',
    4: 'Thu',
    5: 'Fri',
    6: 'Sat'
}

export const getSuperScript = (dayOfMonth: number): string => {
    const forSt = [1, 21, 31]
    const forNd = [2, 22]
    const forRd = [3, 23]
    
    if (forSt.includes(dayOfMonth)){
        return 'st'
    }

    if (forNd.includes(dayOfMonth)){
        return 'nd'
    }

    if (forRd.includes(dayOfMonth)){
        return 'rd'
    }
    return 'th'
}

export const isWithinDay = (event: any, day: any) => {
    return event.dayOfMonth === day.dayOfMonth;
}

export const isWithinHours = (event: any, currIndex: number) => {
    const fromDate = new Date(event.from)
    const toDate = new Date(event.to)
    const indexToDate = new Date(fromDate.getFullYear(), fromDate.getMonth(), fromDate.getDate(), currIndex, fromDate.getMinutes())
    return fromDate.getHours() === currIndex && indexToDate.getTime() >= fromDate.getTime() && indexToDate.getTime() < toDate.getTime(); 
}

export const getEventStyle = (event: any): CSSProperties => {
    let height: string = '100%';
    let top: string = '0px';
    const fromDate = new Date(event.from);
    const toDate = new Date(event.to);
    const hourDiff = (toDate.getTime() - fromDate.getTime()) / 36e5;

    if (fromDate.getMinutes() !== 0) {
        top = `calc(100% / ${60 / fromDate.getMinutes()})`
    }

    if (hourDiff > 1) {
        let hourPrc = 0;
        const floored = Math.floor(hourDiff)
        hourPrc = floored * 100;
        const minuteDiff = (hourDiff - floored) * 100;
        hourPrc += minuteDiff;
        height = `${hourPrc}%`
    }

    return {
        height,
        top,
        backgroundColor: event.bg,
        color: event.color
    }
}

export const getCurrentWeek = () => {
    const today = new Date();
    const weeks = [];
    for (let i = 1;  i <= 31; i+=7) {
        const week = [];
        for (let j = i; j < i+7; j++) {
            if (j <= 31){
                const date = new Date(today.getFullYear(), today.getMonth(), j);
                week.push(date.getDate())
            }
        }
        weeks.push(week)
    }
    return weeks.findIndex(week => week.find(d => d === today.getDate()))
}

export const getWeekOfMonth = ({year, month, week}: any) => {
    const weekDays = [];
    for (let i = 1; i <= 31; i++) {
        if (i >= week * 7 && i <= week+1 * 7) {
            const date = new Date(year, month, i)
            weekDays.push({
                dayOfMonth: date.getDate(),
                dayOfWeek: date.getDay()
            })
        }
    }

    return weekDays;
}

export const getLastDayOfMonth = ({ year, month }: any) => {
    return new Date(year, month+1, 0).getDate();
}

export const getWeeksOfMonth = (year: number, month: number) => {
    const weeks = [];        
    for (let i = 1;  i <= 31; i+=7) {
        const week = [];
        for (let j = i; j < i+7; j++) {
            if (j <= 31){
                const date = new Date(year, month, j);
                if (date.getMonth() === month){
                    week.push({
                        dayOfWeek: date.getDay(),
                        dayOfMonth: date.getDate()
                    })
                }
            }
        }
        if (week.length){
            weeks.push(week)
        }
    }
    return weeks
}

export const getEventTime = (eventTimeSource: any) => {
    const time = eventTimeSource.split('T')[1]
    return time.substring(0, time.length - 3)
}