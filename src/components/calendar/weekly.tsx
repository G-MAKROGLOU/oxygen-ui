import { useMemo } from 'react';
import {
	CalendarDay,
	CalendarEvent,
	CalendarEventBubble,
	WeeklyCalendarDayEventsProps,
	WeeklyCalendarDayProps,
	WeeklyCalendarHourProps,
	WeeklyCalendarProps,
} from '../../types/calendar';
import {
	getEventStyle,
	getSuperScript,
	isWithinDay,
	isWithinHours,
	numberToDay,
} from './calendarUtils';
import { FaEllipsisH } from 'react-icons/fa';

const WeeklyCalendarHour = ({ hour }: WeeklyCalendarHourProps) => {
	return (
		<div className="oxyui__calendar__weekly__hour">
			{hour < 10 ? `0${hour}:00` : `${hour}:00`}
		</div>
	);
};

const WeeklyCalendarEventBubble = ({ event }: CalendarEventBubble) => {
	return (
		<div
			key={event.id}
			className="oxyui__calendar__weekly__day__event__bubble"
			style={getEventStyle(event)}
		>
			<div className="oxyui__calendar__weekly__day__event__bubble__name">
				{event.name}
			</div>
			<div>
				<FaEllipsisH fontSize={15} />
			</div>
		</div>
	);
};

const WeeklyCalendarDayEvents = ({
	events,
	day,
	hour,
}: WeeklyCalendarDayEventsProps) => {
	return (
		<div className="oxyui__calendar__weekly__day__event">
			{events.map((event: CalendarEvent) => (
				<WeeklyCalendarEventBubble key={event.id} event={event} />
			))}
		</div>
	);
};

const WeeklyCalendarDay = ({ hours, day, events }: WeeklyCalendarDayProps) => {
	return (
		<div className="oxyui__calendar__weekly__day">
			<h3 className="oxyui__calendar__weekly__day__header">
				{numberToDay[day.dayOfWeek]} {day.dayOfMonth}
				<sup>{getSuperScript(day.dayOfMonth)}</sup>
			</h3>
			<div className="oxyui__calendar__weekly__day__events">
				{hours.map((_: number, index: number) => (
					<WeeklyCalendarDayEvents
						key={index}
						events={events.filter(
							(event: CalendarEvent) =>
								isWithinDay(event, day) &&
								isWithinHours(event, index),
						)}
						day={day}
						hour={index}
					/>
				))}
			</div>
		</div>
	);
};

const WeeklyCalendar = ({ weekDays, events }: WeeklyCalendarProps) => {
	const hoursPlaceholder = useMemo(() => new Array(24).fill(0), []);
	return (
		<div className="oxyui__calendar__weekly">
			<div className="oxyui__calendar__weekly__hours">
				{hoursPlaceholder.map((_, index) => (
					<WeeklyCalendarHour key={index} hour={index} />
				))}
			</div>
			<div className="oxyui__calendar__weekly__days">
				{weekDays.map((day: CalendarDay) => (
					<WeeklyCalendarDay
						key={day.dayOfMonth}
						hours={hoursPlaceholder}
						day={day}
						events={events}
					/>
				))}
			</div>
		</div>
	);
};

export default WeeklyCalendar;
