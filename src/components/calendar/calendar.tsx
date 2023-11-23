import { useEffect, useMemo, useState } from 'react';
import { useTheme } from '../../hooks';
import { getWeekOfMonth, getWeeksOfMonth } from './calendarUtils';
import type {
	CalendarEvent,
	CalendarProps,
	WeekDays,
} from '../../types/calendar';
import MonthlyCalendar from './monthly';
import CalendarToolbar from './toolbar';
import WeeklyCalendar from './weekly';

const defaultDate = new Date();

const Calendar = ({
	width = '100%',
	height = '100%',
	defaults = {
		year: defaultDate.getFullYear(),
		month: defaultDate.getMonth(),
		week: 0,
		scheme: 'month',
	},
	eventSpecs = {
		get: '/api/v1/events?fromDate=@from&toDate=@to',
		post: '/api/v1/events',
		put: '/api/v1/events/:eventId',
		headers: {
			'Content-Type': 'application/json',
		},
	},
}: CalendarProps) => {
	const { theme } = useTheme();
	const [month, setMonth] = useState<number>(defaults.month);
	const [year, setYear] = useState<number>(defaults.year);
	const [scheme, setScheme] = useState<string>(defaults.scheme);
	const [shownWeek, setShownWeek] = useState<number>(defaults?.week);
	const [events, setEvents] = useState<CalendarEvent[]>([]);

	const oxyOnSchemeChange = async (
		clickedKey: string | number,
	): Promise<void> => {
		setScheme(clickedKey as string);

		let dateFrom = new Date(year, month, 2).toISOString().split('T')[0];
		let dateTo = new Date(year, month + 1, 1).toISOString().split('T')[0];

		if (clickedKey === 'week') {
			//const currentWeek = getCurrentWeek()
			//setShownWeek(currentWeek)
			const daysOfNewWeek = weekDays.allWeeks[shownWeek];
			const fromDay = daysOfNewWeek.at(0)?.dayOfMonth as number;
			const lastDay = daysOfNewWeek.at(-1)?.dayOfMonth as number;
			dateFrom = new Date(year, month, fromDay + 1)
				.toISOString()
				.split('T')[0];
			dateTo = new Date(year, month, lastDay + 1)
				.toISOString()
				.split('T')[0];
		}

		// get the events
		try {
			const url = eventSpecs.get
				.replace('@from', dateFrom)
				.replace('@to', dateTo);
			const response = await fetch(url, eventSpecs.headers);
			const json = await response.json();
			setEvents(json);
		} catch (err: unknown) {
			const error = err as Error;
			// TODO: show something like a notification when notifications are ready
		}
	}; // OK

	const oxyOnMonthChange = async (month: number): Promise<void> => {
		// update the state
		let toShow = shownWeek;
		const newMonthWeeks = getWeeksOfMonth(year, month);
		if (shownWeek === 4 && newMonthWeeks.length - 1 < shownWeek) {
			toShow = newMonthWeeks.length - 1;
		}
		setShownWeek(toShow);
		setMonth(month);

		// get the events
		try {
			let dateFrom = new Date(year, month, 1).toISOString();
			let dateTo = new Date(year, month + 1, -1).toISOString();

			if (scheme === 'week') {
				const firstDayOfWeek = newMonthWeeks[toShow].at(0)
					?.dayOfMonth as number;
				const lastDayOfWeek = newMonthWeeks[toShow].at(-1)
					?.dayOfMonth as number;
				dateFrom = new Date(year, month, firstDayOfWeek + 1)
					.toISOString()
					.split('T')[0];
				dateTo = new Date(year, month, lastDayOfWeek + 1)
					.toISOString()
					.split('T')[0];
			}

			const url = eventSpecs.get
				.replace('@from', dateFrom)
				.replace('@to', dateTo);
			const response = await fetch(url, eventSpecs.headers);
			const json = await response.json();
			setEvents(json);
		} catch (err: unknown) {
			const error = err as Error;
		}
	}; // OK

	const oxyOnYearChange = async (year: number): Promise<void> => {
		let toShow = shownWeek;
		const newMonthWeeks = getWeeksOfMonth(year, month);
		if (shownWeek === 4 && newMonthWeeks.length - 1 < shownWeek) {
			toShow = newMonthWeeks.length - 1;
		}
		setShownWeek(toShow);
		setYear(year);

		// get the events
		try {
			let dateFrom = new Date(year, month, 1).toISOString().split('T')[0];
			let dateTo = new Date(year, month, -1).toISOString().split('T')[0];

			if (scheme === 'week') {
				const firstDayOfWeek = newMonthWeeks[toShow].at(0)
					?.dayOfMonth as number;
				const lastDayOfWeek = newMonthWeeks[toShow].at(-1)
					?.dayOfMonth as number;
				dateFrom = new Date(year, month, firstDayOfWeek + 1)
					.toISOString()
					.split('T')[0];
				dateTo = new Date(year, month, lastDayOfWeek + 1)
					.toISOString()
					.split('T')[0];
			}

			const url = eventSpecs.get
				.replace('@from', dateFrom)
				.replace('@to', dateTo);
			const response = await fetch(url, eventSpecs.headers);
			const json = await response.json();
			setEvents(json);
		} catch (err: unknown) {
			const error = err as Error;
			// TODO: show a notification when notifications are ready
		}
	}; // OK

	const oxyOnWeekChange = async (weekNumber: number): Promise<void> => {
		setShownWeek(weekNumber);

		// get the events
		try {
			// FIXME: bug when the change of a week changes month and year

			let daysOfNewWeek = weekDays.allWeeks[weekNumber];
			let currMonth = month;
			const fromDay = daysOfNewWeek.at(0)?.dayOfMonth as number;
			const lastDay = daysOfNewWeek.at(-1)?.dayOfMonth as number;
			const dateFrom = new Date(year, currMonth, fromDay + 1)
				.toISOString()
				.split('T')[0];
			const dateTo = new Date(year, currMonth, lastDay + 1)
				.toISOString()
				.split('T')[0];
			const url = eventSpecs.get
				.replace('@from', dateFrom)
				.replace('@to', dateTo);
			const response = await fetch(url, eventSpecs.headers);
			const json = await response.json();
			setEvents(json);
		} catch (err: unknown) {
			const error = err as Error;
			// TODO: show somekind of notification when notifications are ready
		}
	}; // OK

	const weekDays: WeekDays = useMemo(() => {
		const weeks = getWeeksOfMonth(year, month);
		return {
			toShow: weeks[shownWeek],
			total: weeks.length,
			allWeeks: weeks,
		};
	}, [shownWeek, month, year]); // OK

	useEffect(() => {
		const abortController = new AbortController();
		const { signal } = abortController;
		let fromDate = new Date(defaults.year, defaults.month, 2);
		let toDate = new Date(defaults.year, defaults.month + 1, 1);

		if (defaults.scheme === 'week') {
			const week = getWeekOfMonth(defaults);
			const firstDayOfWeek = week.at(0)?.dayOfMonth as number;
			const lastDayOfWeek = week.at(-1)?.dayOfMonth as number;
			fromDate = new Date(
				defaults.year,
				defaults.month,
				firstDayOfWeek + 1,
				0,
				0,
				0,
			);
			toDate = new Date(
				defaults.year,
				defaults.month,
				lastDayOfWeek + 1,
				0,
				0,
				0,
			);
		}

		const from = fromDate.toISOString().split('T')[0];
		const to = toDate.toISOString().split('T')[0];
		const url = eventSpecs.get.replace('@from', from).replace('@to', to);

		fetch(url, { ...eventSpecs.headers, signal })
			.then((res) => res.json())
			.then(setEvents)
			.catch(console.error);

		return () => {
			abortController.abort();
		};
	}, []); // OK

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
			{scheme === 'week' ? (
				<WeeklyCalendar weekDays={weekDays.toShow} events={events} />
			) : (
				<MonthlyCalendar
					monthDays={weekDays.allWeeks}
					events={events}
				/>
			)}
		</div>
	);
};

export default Calendar;
