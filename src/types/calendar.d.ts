export type CalendarProps = {
	width: string | number;
	height: string | number;
	defaults: CalendarDefaults;
	eventSpecs: CalendarEventSpecs;
};

export type CalendarDefaults = {
	year: number;
	month: number;
	week: number;
	scheme: CalendarScheme;
};

export type CalendarScheme = 'week' | 'month';

export type CalendarEventSpecs = {
	get: string;
	post: string;
	put: string;
	headers: { [key: string]: string };
};

export type CalendarToolbarProps = {
	onSchemeChange: (newScheme: string | number) => void;
	scheme: CalendarScheme;
	setMonth: React.Dispatch<React.SetStateAction<number>>;
	setYear: React.Dispatch<React.SetStateAction<number>>;
	onMonthChange: (newMonth: number) => void;
	onYearChange: (newYear: number) => void;
	onWeekChange: (newWeek: number) => void;
	month: number;
	year: number;
	totalWeeks: number;
	weekNumber: number;
};

export type CalendarDay = {
	dayOfWeek: number;
	dayOfMonth: number;
};

export type WeeklyCalendarProps = {
	weekDays: CalendarDay[];
	events: CalendarEvent[];
};

export type MonthlyCalendarProps = {
	monthDays: CalendarDay[][];
	events: CalendarEvent[];
};

export type CalendarEvent = {
	id: string;
	dayOfMonth: number;
	from: string;
	to: string;
	bg: string;
	color: string;
	name: string;
};

export type MonthlyCalendarEventDayProps = {
	header: string;
	calendarDays: CalendarDay[];
	events: CalendarEvent[];
};

export type CalendarEventBubble = {
	event: CalendarEvent;
};

export type MonthlyCalendarDailyEventsProps = {
	day: CalendarDay;
	events: CalendarEvent[];
};

export type WeekDays = {
	toShow: CalendarDay[];
	total: number;
	allWeeks: CalendarDay[][];
};

export type WeeklyCalendarHourProps = {
	hour: number;
};

export type WeeklyCalendarDayProps = {
	hours: number[];
	day: CalendarDay;
	events: CalendarEvent[];
};

export type WeeklyCalendarDayEventsProps = {
	day: CalendarDay;
	events: CalendarEvent[];
	hour: number;
};


export type WeekDisplayProps = {
    toNextWeek: () => void;
    toPrevWeek: () => void;
    weekNumber: number;
}

export type DecadeProps = {
    index: number;
    decadeIndex: number;
    itemsAnimationClass: string;
    decade: number[];
    year: number;
    onYearChange: (newYear: number) => void;
}