import { useEffect, useMemo, useRef, useState } from 'react';
import { useTheme } from '../../hooks';
import { CalendarToolbarProps, DecadeProps, WeekDisplayProps } from '../../types/calendar';
import { ButtonPart } from '../../types/buttonGroup';
import { getHundredYears, numberToMonth } from './calendarUtils';
import { Button, ButtonGroup, IconButton } from '../buttons';
import {
	BsFillCalendarDayFill,
	BsFillCalendarMonthFill,
	BsFillCaretLeftFill,
	BsFillCaretRightFill,
	BsFillCalendarPlusFill,
} from 'react-icons/bs';

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
	weekNumber,
}: CalendarToolbarProps) => {
	const { theme } = useTheme();
	const monthPickerRef = useRef<HTMLDivElement>(null);
	const yearPickerRef = useRef<HTMLDivElement>(null);
	const [hundrendYears, setHundrendYears] = useState<number[][]>([]);
	const [decadeIndex, setDecadeIndex] = useState<number>(0);
	const [itemsAnimationClass, setItemsAnimationClass] = useState<string>('');
	const [weekButtonsVisible, setWeekButtonsVisible] = useState<boolean>(
		scheme === 'week',
	);

	const buttons: ButtonPart[] = useMemo(
		() => [
			{
				key: 'month',
				content: 'Month',
				icon: <BsFillCalendarMonthFill />,
				type: 'primary',
			},
			{
				key: 'week',
				content: 'Week',
				icon: <BsFillCalendarDayFill />,
				type: 'secondary',
			},
		],
		[],
	);

	useEffect(() => {
		if (!hundrendYears.length) {
			const hundrend = getHundredYears();
			for (let i = 0; i < hundrend.length; i++) {
				if (hundrend[i].includes(year)) {
					setDecadeIndex(i);
					break;
				}
			}
			setHundrendYears(hundrend);
		}
	}, [hundrendYears]); // OK

	useEffect(() => {
		const clickAway = (e: MouseEvent) => {
			const target = e.target as Node;
			if (
				monthPickerRef.current &&
				!monthPickerRef.current.contains(target) &&
				yearPickerRef.current &&
				!yearPickerRef.current.contains(target)
			) {
				if (
					!monthPickerRef.current?.classList.contains(
						'oxyui__calendar__toolbar__month__picker__hidden',
					)
				) {
					monthPickerRef.current?.classList.add(
						'oxyui__calendar__toolbar__month__picker__hidden',
					);
				}
				if (
					!yearPickerRef.current?.classList.contains(
						'oxyui__calendar__toolbar__year__picker__hidden',
					)
				) {
					yearPickerRef.current?.classList.add(
						'oxyui__calendar__toolbar__year__picker__hidden',
					);
				}
			}
		};
		document.addEventListener('mousedown', clickAway);
	}, []); // OK

	const onMonthClick = (): void => {
		monthPickerRef.current?.classList.toggle(
			'oxyui__calendar__toolbar__month__picker__hidden',
		);
	}; // OK

	const onYearClick = (): void => {
		yearPickerRef.current?.classList.toggle(
			'oxyui__calendar__toolbar__year__picker__hidden',
		);
	}; // OK

	const toNextDecade = (
		e: React.MouseEvent<HTMLDivElement, MouseEvent>,
	): void => {
		e.stopPropagation();
		if (decadeIndex + 1 <= 9) {
			setDecadeIndex(decadeIndex + 1);
			setItemsAnimationClass(
				'oxyui__calendar__toolbar__year__picker__decade__hidden__next',
			);
		}
	}; // OK

	const toPreviousDecade = (
		e: React.MouseEvent<HTMLDivElement, MouseEvent>,
	): void => {
		e.stopPropagation();
		if (decadeIndex - 1 >= 0) {
			setDecadeIndex(decadeIndex - 1);
			setItemsAnimationClass(
				'oxyui__calendar__toolbar__year__picker__decade__hidden__prev',
			);
		}
	}; // OK

	const oxyOnSchemeChange = (key: string | number): void => {
		setWeekButtonsVisible(key === 'week');
		onSchemeChange(key);
	}; // OK

	const toPrevWeek = (): void => {
		// cant go any further back
		if (year === 1990 && month === 0 && weekNumber === 0) {
			return;
		}
		// going back multiple weeks triggers going back months and years as well
		if (weekNumber - 1 < 0) {
			let numberOfWeeks = month - 1 === 1 ? 4 : 5;
			onWeekChange(numberOfWeeks - 1);
			if (month - 1 < 0) {
				setMonth(11);
				if (year - 1 >= 1990) {
					setYear(year - 1);
				}
			} else {
				setMonth(month - 1);
			}
			return;
		}
		// normal decrement
		onWeekChange(weekNumber - 1);
	}; // OK

	const toNextWeek = (): void => {
		// cant go any further in the future
		if (year === 2089 && month === 11 && weekNumber === totalWeeks) {
			return;
		}
		// going forward multiple weeks triggers going forward months and years as well
		if (weekNumber + 1 >= totalWeeks) {
			onWeekChange(0);
			if (month + 1 > 11) {
				setMonth(0);
				if (year + 1 <= 2089) {
					setYear(year + 1);
				}
			} else {
				setMonth(month + 1);
			}
			return;
		}
		// normal decrement
		onWeekChange(weekNumber + 1);
	}; // OK

	return (
		<div className="oxyui__calendar__toolbar">
			<div className="oxyui__calendar__toolbar__month__year">
				<ButtonGroup
					buttons={buttons}
					defaultKey={scheme}
					onClick={oxyOnSchemeChange}
				/>
				<div
					onClick={onMonthClick}
					className="oxyui__calendar__toolbar__month__wrapper"
				>
					<h3 className="oxyui__calendar__toolbar__month">
						{numberToMonth[month]}
					</h3>
					<div
						ref={monthPickerRef}
						className={`oxyui__calendar__toolbar__month__picker oxyui__calendar__toolbar__month__picker__${theme} oxyui__calendar__toolbar__month__picker__hidden`}
					>
						{Object.keys(numberToMonth).map((key) => (
							<div
								key={key}
								onClick={() => onMonthChange(parseInt(key))}
								className={`oxyui__calendar__toolbar__month__picker__item ${
									parseInt(key) === month
										? 'oxyui__calendar__toolbar__month__picker__item__active'
										: ''
								}`}
							>
								{numberToMonth[parseInt(key)].replace('.', '')}
							</div>
						))}
					</div>
				</div>
				<div
					onClick={onYearClick}
					className="oxyui__calendar__toolbar__year__wrapper"
				>
					<h3 className="oxyui__calendar__toolbar__year">{year}</h3>
					<div
						ref={yearPickerRef}
						className={`oxyui__calendar__toolbar__year__picker oxyui__calendar__toolbar__year__picker__${theme} oxyui__calendar__toolbar__year__picker__hidden`}
					>
						<div
							className={`oxyui__calendar__toolbar__year__picker__prev oxyui__calendar__toolbar__year__picker__prev__${theme}`}
							onClick={toPreviousDecade}
						>
							<BsFillCaretLeftFill />
						</div>
						<div
							className={`oxyui__calendar__toolbar__year__picker__items`}
						>
							{hundrendYears.map((decade, index) => (
								<Decade
                                    key={index}
                                    index={index}
                                    decade={decade}
                                    decadeIndex={decadeIndex}
                                    itemsAnimationClass={itemsAnimationClass}
                                    year={year}
                                    onYearChange={onYearChange}
                                />
                            ))}
						</div>
						<div
							className={`oxyui__calendar__toolbar__year__picker__next oxyui__calendar__toolbar__year__picker__next__${theme}`}
							onClick={toNextDecade}
						>
							<BsFillCaretRightFill />
						</div>
					</div>
				</div>
				{weekButtonsVisible 
                ? <WeekDisplay weekNumber={weekNumber} toNextWeek={toNextWeek} toPrevWeek={toPrevWeek}/>
				 : null}
			</div>

			<Button
				content="New Event"
				type="primary"
				icon={<BsFillCalendarPlusFill />}
			/>
		</div>
	);
};


const Decade = ({
    index,
    decadeIndex,
    itemsAnimationClass,
    decade,
    year,
    onYearChange
}: DecadeProps) => {
    return (
        <div
            className={`oxyui__calendar__toolbar__year__picker__decade ${
                index === decadeIndex
                    ? ''
                    : `oxyui__calendar__toolbar__year__picker__decade__hidden ${itemsAnimationClass}`
            }`}
        >
            {decade.map((decadeYear) => (
                <div
                    key={decadeYear}
                    onClick={() =>onYearChange(decadeYear)}
                    className={`oxyui__calendar__toolbar__year__picker__item ${
                        year === decadeYear
                            ? 'oxyui__calendar__toolbar__year__picker__item__active'
                            : ''
                    }`}
                >
                    {decadeYear}
                </div>
            ))}
        </div>
    )
}

const WeekDisplay = ({
    toNextWeek,
    toPrevWeek,
    weekNumber
}: WeekDisplayProps) => {
    return (
        <div className="oxyui__calendar__toolbar__week__picker">
            <div>
                <IconButton
                    type="primary"
                    icon={<BsFillCaretLeftFill />}
                    onClick={toPrevWeek}
                />
            </div>
            <h4>Week {weekNumber + 1}</h4>
            <div>
                <IconButton
                    type="primary"
                    icon={<BsFillCaretRightFill />}
                    onClick={toNextWeek}
                />
            </div>
        </div>
    )
}




export default CalendarToolbar;
