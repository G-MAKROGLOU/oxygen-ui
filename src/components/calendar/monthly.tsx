import { useMemo } from 'react';
import {
	CalendarDay,
	CalendarEvent,
	CalendarEventBubble,
	MonthlyCalendarDailyEventsProps,
	MonthlyCalendarEventDayProps,
	MonthlyCalendarProps,
} from '../../types/calendar';
import { getEventTime, numberToDay } from './calendarUtils';
import { FaEllipsisH } from 'react-icons/fa';

const MonthlyCalendar = ({ monthDays, events }: MonthlyCalendarProps) => {
	const daysComplete = useMemo(() => {
		const flat = monthDays.flatMap((week: CalendarDay[]) =>
			week.map((day: CalendarDay) => day),
		);
		const firstOfTheMonth = flat.at(0)?.dayOfWeek as number;
		if (firstOfTheMonth > 0) {
			for (let i = firstOfTheMonth - 1; i >= 0; i--) {
				flat.unshift({
					dayOfWeek: i,
					dayOfMonth: -1,
				});
			}
		}
		return flat;
	}, [monthDays]);

	return (
		<div className="oxyui__calendar__monthly">
			<div className="oxyui__calendar__monthly__days">
				{Object.keys(numberToDay).map((key) => (
					<MonthlyCalendarEventDay
						key={numberToDay[parseInt(key)]}
						header={numberToDay[parseInt(key)]}
						events={events}
						calendarDays={
							daysComplete.filter(
								(day: CalendarDay) =>
									day.dayOfWeek === parseInt(key),
							)
						}
					/>
				))}
			</div>
		</div>
	);
};

const MonthlyCalendarEventDay = ({
	header,
	calendarDays,
	events,
}: MonthlyCalendarEventDayProps) => {
	return (
		<div className="oxyui__calendar__monthly__day">
			<h4 className="oxyui__calendar__monthly__day__header">{header}</h4>
			<div className="oxyui__calendar__monthly__day__events">
                {
                    calendarDays.map((day: CalendarDay) => (
                        <MonthlyCalendarDailyEvents
                            key={day.dayOfMonth}
                            day={day}
                            events={events}
                        />
                    ))
                }
			</div>
		</div>
	);
};

const MonthlyCalendarDailyEvents = ({
	day,
	events,
}: MonthlyCalendarDailyEventsProps) => {
	return (
		<div
			key={day.dayOfMonth}
			className="oxyui__calendar__monthly__day__event"
		>
			<h5 className="oxyui__calendar__monthly__day__event__day">
				{day.dayOfMonth === -1 ? '' : day.dayOfMonth}
			</h5>
			{events
				.filter(
					(event: CalendarEvent) =>
						event.dayOfMonth === day.dayOfMonth,
				)
				.map((event: CalendarEvent) => (
					<MonthlyCalendarEventBubble key={event.id} event={event} />
				))}
		</div>
	);
};

const MonthlyCalendarEventBubble = ({ event }: CalendarEventBubble) => {
	return (
		<div
			className="oxyui__calendar__monthly__day__event__bubble"
			style={{
				background: event.bg,
				color: event.color,
			}}
		>
			<div>{event.name}</div>
			<div className="oxyui__calendar__monthly__day__event__bubble__details">
				<div>
					{getEventTime(event.from)} - {getEventTime(event.to)}
				</div>
				<div className="oxyui__calendar__monthly__day__event__bubble__details__icon">
					<FaEllipsisH fontSize={15} />
				</div>
			</div>
		</div>
	);
};

export default MonthlyCalendar;
