import { rest } from "msw";
import { v4 as uuidv4 } from 'uuid'

export const handlers = [
  rest.get("/api/v1/login", (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json({
        token: "1231231231231",
        refreshToken: "222222222222222"
      })
    );
  }),
  rest.get("/api/v1/events", (req, res, ctx) => {
    const fromDate = req.url.searchParams.get('fromDate') as string;
    const toDate = req.url.searchParams.get('toDate') as string;

    const fromDateObj = new Date(fromDate)
    const toDateObj = new Date(toDate)

    const month = fromDateObj.getMonth() + 1 < 10 ? `0${fromDateObj.getMonth() + 1}` : fromDateObj.getMonth() + 1
    const year = new Date(fromDate).getFullYear()


    const fromDay = fromDateObj.getDate()
    const toDay = toDateObj.getDate()
    const possibleDates: number[] = [];
    for (let i = fromDay; i <= toDay; i++){
        possibleDates.push(i)
    }
    let fromHour = 11;
    let toHour = 12;
    const events = new Array(3).fill(0).map(i => {
        const random = Math.round(Math.random() * (possibleDates.length - 1))
        const day = possibleDates[random] < 10 ? `0${possibleDates[random]}` : possibleDates[random]
        const event =  {
            id: uuidv4(),
            dayOfMonth: possibleDates[random],
            from: `${year}-${month}-${day}T${fromHour}:00:00`,
            to: `${year}-${month}-${day}T${toHour}:00:00`,
            bg: 'royalblue',
            color: '#fff',
            name: 'Daily Stand Up meeting'
        }
        fromHour++
        toHour++
        return event;
    })

    return res(
        ctx.status(200),
        ctx.json(events)
    )

  })
];