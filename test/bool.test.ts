import { dateFormat } from "../src/package"


describe('dateFormat factory & API surface', () => {
    beforeAll(() => {
      jest.useFakeTimers({ advanceTimers: true })
      jest.setSystemTime(new Date('2025-05-04T12:00:00Z'))
    })
    afterAll(() => {
      jest.useRealTimers()
    })
    test('isValid', () => {
        expect(dateFormat('2025-05-04').isValid()).toBe(true)
        expect(dateFormat('foo').isValid()).toBe(false)
        expect(dateFormat('2025-05-32').isValid()).toBe(false)
        expect(dateFormat('2025-05-04T12:00:00Z').isValid()).toBe(true)
        expect(dateFormat('2025-05-04T12:00:00').isValid()).toBe(true)
    })
    test('isUtc', () => {
        expect(dateFormat('2025-05-04T12:00:00Z').isUtc()).toBe(true)
        expect(dateFormat('2025-05-04T12:00:00').isUtc()).toBe(false)
    })
    test('isLocal', () => {
        expect(dateFormat('2025-05-04T12:00:00Z').isLocal()).toBe(false)
        expect(dateFormat('2025-05-04T12:00:00').isLocal()).toBe(true)
    })
    test('isDST', () => {
        expect(dateFormat('2025-05-04T12:00:00Z').isDST()).toBe(false)
        expect(dateFormat('2025-05-04T12:00:00').isDST()).toBe(true)
    })
    test('isSunday', () => {
        expect(dateFormat('2025-05-04T12:00:00Z').isSunday()).toBe(false)
        expect(dateFormat('2025-05-04T12:00:00').isSunday()).toBe(true)
    })
    test('isMonday', () => {
        expect(dateFormat('2025-05-04T12:00:00Z').isMonday()).toBe(false)
        expect(dateFormat('2025-05-04T12:00:00').isMonday()).toBe(true)
    })
    test('isTuesday', () => {
        expect(dateFormat('2025-05-04T12:00:00Z').isTuesday()).toBe(false)
        expect(dateFormat('2025-05-04T12:00:00').isTuesday()).toBe(true)
    })
    test('isWednesday', () => {
        expect(dateFormat('2025-05-04T12:00:00Z').isWednesday()).toBe(false)
        expect(dateFormat('2025-05-04T12:00:00').isWednesday()).toBe(true)
    })
    test('isThursday', () => {
        expect(dateFormat('2025-05-04T12:00:00Z').isThursday()).toBe(false)
        expect(dateFormat('2025-05-04T12:00:00').isThursday()).toBe(true)
    })
    test('isFriday', () => {
        expect(dateFormat('2025-05-04T12:00:00Z').isFriday()).toBe(false)
        expect(dateFormat('2025-05-04T12:00:00').isFriday()).toBe(true)
    })
    test('isSaturday', () => {
        expect(dateFormat('2025-05-04T12:00:00Z').isSaturday()).toBe(false)
        expect(dateFormat('2025-05-04T12:00:00').isSaturday()).toBe(true)
    })
    test('isSameYear', () => {
        expect(dateFormat('2025-05-04T12:00:00Z').isSameYear(dateFormat('2025-05-04T12:00:00Z'))).toBe(true)
        expect(dateFormat('2025-05-04T12:00:00Z').isSameYear(dateFormat('2026-05-04T12:00:00Z'))).toBe(false)
    })
    test('isCurrentYear', () => {
        expect(dateFormat('2025-05-04T12:00:00Z').isCurrentYear()).toBe(true)
        expect(dateFormat('2026-05-04T12:00:00Z').isCurrentYear()).toBe(false)
    })
    test('isNextYear', () => {
        expect(dateFormat('2025-05-04T12:00:00Z').isNextYear()).toBe(false)
        expect(dateFormat('2026-05-04T12:00:00Z').isNextYear()).toBe(true)
    })
    test('isLastYear', () => {
        expect(dateFormat('2025-05-04T12:00:00Z').isLastYear()).toBe(false)
        expect(dateFormat('2024-05-04T12:00:00Z').isLastYear()).toBe(true)
    })
    test('isCurrentMonth', () => {
        expect(dateFormat('2025-05-04T12:00:00Z').isCurrentMonth()).toBe(true)
        expect(dateFormat('2025-06-04T12:00:00Z').isCurrentMonth()).toBe(false)
    })
    test('isNextMonth', () => {
        expect(dateFormat('2025-05-04T12:00:00Z').isNextMonth()).toBe(false)
        expect(dateFormat('2025-06-04T12:00:00Z').isNextMonth()).toBe(true)
    })
    test('isLastMonth', () => {
        expect(dateFormat('2025-05-04T12:00:00Z').isLastMonth()).toBe(false)
        expect(dateFormat('2025-04-04T12:00:00Z').isLastMonth()).toBe(true)
    })
    test('isSameWeek', () => {
        expect(dateFormat('2025-05-04T12:00:00Z').isSameWeek(dateFormat('2025-05-04T12:00:00Z'))).toBe(true)
        expect(dateFormat('2025-05-04T12:00:00Z').isSameWeek(dateFormat('2025-05-05T12:00:00Z'))).toBe(false)
    })
    test('isCurrentWeek', () => {
        expect(dateFormat('2025-05-04T12:00:00Z').isCurrentWeek()).toBe(true)
        expect(dateFormat('2025-05-05T12:00:00Z').isCurrentWeek()).toBe(false)
    })
    test('isNextWeek', () => {
        expect(dateFormat('2025-05-04T12:00:00Z').isNextWeek()).toBe(false)
        expect(dateFormat('2025-05-05T12:00:00Z').isNextWeek()).toBe(true)
    })
    test('isLastWeek', () => {
        expect(dateFormat('2025-05-04T12:00:00Z').isLastWeek()).toBe(false)
        expect(dateFormat('2025-04-28T12:00:00Z').isLastWeek()).toBe(true)
    })
    test('isSameDay', () => {
        expect(dateFormat('2025-05-04T12:00:00Z').isSameDay(dateFormat('2025-05-04T12:00:00Z'))).toBe(true)
        expect(dateFormat('2025-05-04T12:00:00Z').isSameDay(dateFormat('2025-05-05T12:00:00Z'))).toBe(false)
    })
    test('isCurrentDay', () => {
        expect(dateFormat('2025-05-04T12:00:00Z').isCurrentDay()).toBe(true)
        expect(dateFormat('2025-05-05T12:00:00Z').isCurrentDay()).toBe(false)
    })
    test('isNextDay', () => {
        expect(dateFormat('2025-05-04T12:00:00Z').isNextDay()).toBe(false)
        expect(dateFormat('2025-05-05T12:00:00Z').isNextDay()).toBe(true)
    })
    test('isLastDay', () => {
        expect(dateFormat('2025-05-04T12:00:00Z').isLastDay()).toBe(false)
        expect(dateFormat('2025-05-05T12:00:00Z').isLastDay()).toBe(true)
    })
    test('isSameHour', () => {
        expect(dateFormat('2025-05-04T12:00:00Z').isSameHour(dateFormat('2025-05-04T12:00:00Z'))).toBe(true)
        expect(dateFormat('2025-05-04T12:00:00Z').isSameHour(dateFormat('2025-05-04T13:00:00Z'))).toBe(false)
    })
    test('isCurrentHour', () => {
        expect(dateFormat('2025-05-04T12:00:00Z').isCurrentHour()).toBe(true)
        expect(dateFormat('2025-05-04T13:00:00Z').isCurrentHour()).toBe(false)
    })
    test('isNextHour', () => {
        expect(dateFormat('2025-05-04T12:00:00Z').isNextHour()).toBe(false)
        expect(dateFormat('2025-05-04T13:00:00Z').isNextHour()).toBe(true)
    })
    test('isLastHour', () => {
        expect(dateFormat('2025-05-04T12:00:00Z').isLastHour()).toBe(false)
        expect(dateFormat('2025-05-04T11:00:00Z').isLastHour()).toBe(true)
    })
    test('isSameMinute', () => {
        expect(dateFormat('2025-05-04T12:00:00Z').isSameMinute(dateFormat('2025-05-04T12:00:00Z'))).toBe(true)
        expect(dateFormat('2025-05-04T12:00:00Z').isSameMinute(dateFormat('2025-05-04T12:01:00Z'))).toBe(false)
    })
    test('isCurrentMinute', () => {
        expect(dateFormat('2025-05-04T12:00:00Z').isCurrentMinute()).toBe(true)
        expect(dateFormat('2025-05-04T12:01:00Z').isCurrentMinute()).toBe(false)
    })
    test('isNextMinute', () => {
        expect(dateFormat('2025-05-04T12:00:00Z').isNextMinute()).toBe(false)
        expect(dateFormat('2025-05-04T12:01:00Z').isNextMinute()).toBe(true)
    })
    test('isLastMinute', () => {
        expect(dateFormat('2025-05-04T12:00:00Z').isLastMinute()).toBe(false)
        expect(dateFormat('2025-05-04T11:59:00Z').isLastMinute()).toBe(true)
    })
    test('isSameSecond', () => {
        expect(dateFormat('2025-05-04T12:00:00Z').isSameSecond(dateFormat('2025-05-04T12:00:00Z'))).toBe(true)  
        expect(dateFormat('2025-05-04T12:00:00Z').isSameSecond(dateFormat('2025-05-04T12:00:01Z'))).toBe(false)
    })
    test('isCurrentSecond', () => {
        expect(dateFormat('2025-05-04T12:00:00Z').isCurrentSecond()).toBe(true)
        expect(dateFormat('2025-05-04T12:00:01Z').isCurrentSecond()).toBe(false)
    })
    test('isNextSecond', () => {
        expect(dateFormat('2025-05-04T12:00:00Z').isNextSecond()).toBe(false)
        expect(dateFormat('2025-05-04T12:00:01Z').isNextSecond()).toBe(true)
    })
    test('isLastSecond', () => {
        expect(dateFormat('2025-05-04T12:00:00Z').isLastSecond()).toBe(false)
        expect(dateFormat('2025-05-04T11:59:59Z').isLastSecond()).toBe(true)
    })
    test('isSameMilli', () => {
        expect(dateFormat('2025-05-04T12:00:00Z').isSameMilli(dateFormat('2025-05-04T12:00:00Z'))).toBe(true)
        expect(dateFormat('2025-05-04T12:00:00Z').isSameMilli(dateFormat('2025-05-04T12:00:00.1Z'))).toBe(false)
    })
    test('isCurrentMilli', () => {
        expect(dateFormat('2025-05-04T12:00:00Z').isCurrentMilli()).toBe(true)
        expect(dateFormat('2025-05-04T12:00:00.1Z').isCurrentMilli()).toBe(false)
    })
    test('isNextMilli', () => {
        expect(dateFormat('2025-05-04T12:00:00Z').isNextMilli()).toBe(false)
        expect(dateFormat('2025-05-04T12:00:00.1Z').isNextMilli()).toBe(true)
    })
    test('isLastMilli', () => {
        expect(dateFormat('2025-05-04T12:00:00Z').isLastMilli()).toBe(false)
        expect(dateFormat('2025-05-04T11:59:59.9Z').isLastMilli()).toBe(true)
    })
    test('isSameMicro', () => {
        expect(dateFormat('2025-05-04T12:00:00Z').isSameMicro(dateFormat('2025-05-04T12:00:00Z'))).toBe(true)
        expect(dateFormat('2025-05-04T12:00:00Z').isSameMicro(dateFormat('2025-05-04T12:00:00.000001Z'))).toBe(false)
    })
    test('isCurrentMicro', () => {
        expect(dateFormat('2025-05-04T12:00:00Z').isCurrentMicro()).toBe(true)
        expect(dateFormat('2025-05-04T12:00:00.000001Z').isCurrentMicro()).toBe(false)
    })
    test('isNextMicro', () => {
        expect(dateFormat('2025-05-04T12:00:00Z').isNextMicro()).toBe(false)
        expect(dateFormat('2025-05-04T12:00:00.000001Z').isNextMicro()).toBe(true)
    })
    test('isLastMicro', () => {
        expect(dateFormat('2025-05-04T12:00:00Z').isLastMicro()).toBe(false)
        expect(dateFormat('2025-05-04T11:59:59.999999Z').isLastMicro()).toBe(true)
    })
    test('isSameMicrosecond', () => {
        expect(dateFormat('2025-05-04T12:00:00Z').isSameMicrosecond(dateFormat('2025-05-04T12:00:00Z'))).toBe(true)
        expect(dateFormat('2025-05-04T12:00:00Z').isSameMicrosecond(dateFormat('2025-05-04T12:00:00.000001Z'))).toBe(false)
    })
    test('isCurrentMicrosecond', () => {
        expect(dateFormat('2025-05-04T12:00:00Z').isCurrentMicrosecond()).toBe(true)
        expect(dateFormat('2025-05-04T12:00:00.000001Z').isCurrentMicrosecond()).toBe(false)
    })
    test('isNextMicrosecond', () => {
        expect(dateFormat('2025-05-04T12:00:00Z').isNextMicrosecond()).toBe(false)
        expect(dateFormat('2025-05-04T12:00:00.000001Z').isNextMicrosecond()).toBe(true)
    })
    test('isLastMicrosecond', () => {
        expect(dateFormat('2025-05-04T12:00:00Z').isLastMicrosecond()).toBe(false)
        expect(dateFormat('2025-05-04T11:59:59.999999Z').isLastMicrosecond()).toBe(true)
    })
    test('isSameDecade', () => {
        expect(dateFormat('2025-05-04T12:00:00Z').isSameDecade(dateFormat('2025-05-04T12:00:00Z'))).toBe(true)
        expect(dateFormat('2025-05-04T12:00:00Z').isSameDecade(dateFormat('2035-05-04T12:00:00Z'))).toBe(false)
    })
    test('isCurrentDecade', () => {
        expect(dateFormat('2025-05-04T12:00:00Z').isCurrentDecade()).toBe(true)
        expect(dateFormat('2035-05-04T12:00:00Z').isCurrentDecade()).toBe(false)
    })
    test('isNextDecade', () => {
        expect(dateFormat('2025-05-04T12:00:00Z').isNextDecade()).toBe(false)
        expect(dateFormat('2035-05-04T12:00:00Z').isNextDecade()).toBe(true)
    })
    test('isLastDecade', () => {
        expect(dateFormat('2025-05-04T12:00:00Z').isLastDecade()).toBe(false)
        expect(dateFormat('2015-05-04T12:00:00Z').isLastDecade()).toBe(true)
    })
    test('isSameCentury', () => {
        expect(dateFormat('2025-05-04T12:00:00Z').isSameCentury(dateFormat('2025-05-04T12:00:00Z'))).toBe(true)
        expect(dateFormat('2025-05-04T12:00:00Z').isSameCentury(dateFormat('2125-05-04T12:00:00Z'))).toBe(false)
    })
    test('isCurrentCentury', () => {
        expect(dateFormat('2025-05-04T12:00:00Z').isCurrentCentury()).toBe(true)
        expect(dateFormat('2125-05-04T12:00:00Z').isCurrentCentury()).toBe(false)
    })
    test('isNextCentury', () => {
        expect(dateFormat('2025-05-04T12:00:00Z').isNextCentury()).toBe(false)
        expect(dateFormat('2125-05-04T12:00:00Z').isNextCentury()).toBe(true)
    })
    test('isLastCentury', () => {
        expect(dateFormat('2025-05-04T12:00:00Z').isLastCentury()).toBe(false)
        expect(dateFormat('1925-05-04T12:00:00Z').isLastCentury()).toBe(true)
    })
    test('isSameMillennium', () => {
        expect(dateFormat('2025-05-04T12:00:00Z').isSameMillennium(dateFormat('2025-05-04T12:00:00Z'))).toBe(true)
        expect(dateFormat('2025-05-04T12:00:00Z').isSameMillennium(dateFormat('3025-05-04T12:00:00Z'))).toBe(false)
    })
    test('isCurrentMillennium', () => {
        expect(dateFormat('2025-05-04T12:00:00Z').isCurrentMillennium()).toBe(true)
        expect(dateFormat('3025-05-04T12:00:00Z').isCurrentMillennium()).toBe(false)
    })
    test('isNextMillennium', () => {
        expect(dateFormat('2025-05-04T12:00:00Z').isNextMillennium()).toBe(false)
        expect(dateFormat('3025-05-04T12:00:00Z').isNextMillennium()).toBe(true)
    })
    test('isLastMillennium', () => {
        expect(dateFormat('2025-05-04T12:00:00Z').isLastMillennium()).toBe(false)
        expect(dateFormat('1025-05-04T12:00:00Z').isLastMillennium()).toBe(true)
    })
    test('isLeapYear', () => {
        expect(dateFormat('2025-05-04T12:00:00Z').isLeapYear()).toBe(false)
        expect(dateFormat('2024-05-04T12:00:00Z').isLeapYear()).toBe(true)
    })
    test('isSame', () => {
        expect(dateFormat('2025-05-04T12:00:00Z').isSame(dateFormat('2025-05-04T12:00:00Z'))).toBe(true)
        expect(dateFormat('2025-05-04T12:00:00Z').isSame(dateFormat('2025-05-05T12:00:00Z'))).toBe(false)
    })
    test('isSameMillisecond', () => {
        expect(dateFormat('2025-05-04T12:00:00Z').isSameMillisecond(dateFormat('2025-05-04T12:00:00Z'))).toBe(true)
        expect(dateFormat('2025-05-04T12:00:00Z').isSameMillisecond(dateFormat('2025-05-04T12:00:00.1Z'))).toBe(false)
    })
    test('isCurrentMillisecond', () => {
        expect(dateFormat('2025-05-04T12:00:00Z').isCurrentMillisecond()).toBe(true)
        expect(dateFormat('2025-05-04T12:00:00Z').isCurrentMillisecond(dateFormat('2025-05-04T12:00:00.000001Z'))).toBe(false)
    })
    //isNextMillisecond
    test('isNextMillisecond', () => {
        expect(dateFormat('2025-05-04T12:00:00Z').isNextMillisecond()).toBe(false)
        expect(dateFormat('2025-05-04T12:00:00.1Z').isNextMillisecond()).toBe(true)
    })
    //isLastMillisecond
    test('isLastMillisecond', () => {
        expect(dateFormat('2025-05-04T12:00:00Z').isLastMillisecond()).toBe(false)
        expect(dateFormat('2025-05-04T11:59:59.9Z').isLastMillisecond()).toBe(true)
    })
    //isCurrentQuarter
    test('isCurrentQuarter', () => {
        expect(dateFormat('2025-05-04T12:00:00Z').isCurrentQuarter()).toBe(true)
        expect(dateFormat('2025-06-04T12:00:00Z').isCurrentQuarter()).toBe(false)
    })
    //isNextQuarter
    test('isNextQuarter', () => {
        expect(dateFormat('2025-05-04T12:00:00Z').isNextQuarter()).toBe(false)
        expect(dateFormat('2025-06-04T12:00:00Z').isNextQuarter()).toBe(true)
    })
    //isLastQuarter
    test('isLastQuarter', () => {
        expect(dateFormat('2025-05-04T12:00:00Z').isLastQuarter()).toBe(false)
        expect(dateFormat('2025-03-04T12:00:00Z').isLastQuarter()).toBe(true)
    })
})