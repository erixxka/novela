import { useMemo, useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { ChevronLeft, ChevronRight } from 'lucide-react-native';

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

const WEEKDAYS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

type Cell = { day: number; inMonth: boolean; date: Date };

function buildCells(year: number, month: number): Cell[] {
  const firstOfMonth = new Date(year, month, 1);
  const startWeekday = firstOfMonth.getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const daysInPrevMonth = new Date(year, month, 0).getDate();

  const cells: Cell[] = [];

  for (let i = startWeekday - 1; i >= 0; i--) {
    const day = daysInPrevMonth - i;
    cells.push({ day, inMonth: false, date: new Date(year, month - 1, day) });
  }
  for (let day = 1; day <= daysInMonth; day++) {
    cells.push({ day, inMonth: true, date: new Date(year, month, day) });
  }
  while (cells.length < 42) {
    const offset = cells.length - (startWeekday + daysInMonth) + 1;
    cells.push({ day: offset, inMonth: false, date: new Date(year, month + 1, offset) });
  }
  return cells;
}

export function MonthGrid() {
  const today = useMemo(() => new Date(), []);
  const [current, setCurrent] = useState(() => new Date(today.getFullYear(), today.getMonth(), 1));

  const cells = useMemo(
    () => buildCells(current.getFullYear(), current.getMonth()),
    [current]
  );

  const isToday = (d: Date) =>
    d.getFullYear() === today.getFullYear() &&
    d.getMonth() === today.getMonth() &&
    d.getDate() === today.getDate();

  const prev = () => setCurrent(new Date(current.getFullYear(), current.getMonth() - 1, 1));
  const next = () => setCurrent(new Date(current.getFullYear(), current.getMonth() + 1, 1));

  return (
    <View
      style={{
        marginHorizontal: 20,
        marginTop: 20,
        backgroundColor: '#FAF6F2',
        borderRadius: 20,
        borderWidth: 1,
        borderColor: 'rgba(47,65,86,0.10)',
        padding: 18,
      }}
    >
      {/* Month header */}
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: 14,
        }}
      >
        <Pressable
          onPress={prev}
          style={({ pressed }) => ({
            width: 32,
            height: 32,
            borderRadius: 16,
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: pressed ? 'rgba(47,65,86,0.08)' : 'transparent',
          })}
        >
          <ChevronLeft size={18} color="rgba(47,65,86,0.65)" />
        </Pressable>
        <View style={{ alignItems: 'center' }}>
          <Text
            style={{
              fontFamily: 'CormorantGaramond_500Medium',
              fontSize: 22,
              color: '#2F4156',
              lineHeight: 24,
            }}
          >
            {MONTH_NAMES[current.getMonth()]}
          </Text>
          <Text
            style={{
              fontFamily: 'Inter_500Medium',
              fontSize: 10,
              letterSpacing: 2.2,
              textTransform: 'uppercase',
              color: 'rgba(47,65,86,0.42)',
              marginTop: 2,
            }}
          >
            {current.getFullYear()}
          </Text>
        </View>
        <Pressable
          onPress={next}
          style={({ pressed }) => ({
            width: 32,
            height: 32,
            borderRadius: 16,
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: pressed ? 'rgba(47,65,86,0.08)' : 'transparent',
          })}
        >
          <ChevronRight size={18} color="rgba(47,65,86,0.65)" />
        </Pressable>
      </View>

      {/* Weekday row */}
      <View style={{ flexDirection: 'row', marginBottom: 8 }}>
        {WEEKDAYS.map((d, i) => (
          <View key={i} style={{ flex: 1, alignItems: 'center' }}>
            <Text
              style={{
                fontFamily: 'Inter_500Medium',
                fontSize: 10,
                letterSpacing: 1.8,
                color: 'rgba(47,65,86,0.42)',
              }}
            >
              {d}
            </Text>
          </View>
        ))}
      </View>

      {/* Day grid */}
      <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
        {cells.map((c, i) => {
          const today = isToday(c.date);
          return (
            <View
              key={i}
              style={{
                width: `${100 / 7}%`,
                aspectRatio: 1,
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <View
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: 16,
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: today ? '#2F4156' : 'transparent',
                }}
              >
                <Text
                  style={{
                    fontFamily: today ? 'Inter_600SemiBold' : 'Inter_400Regular',
                    fontSize: 14,
                    color: today
                      ? '#F5EFEB'
                      : c.inMonth
                        ? '#2F4156'
                        : 'rgba(47,65,86,0.25)',
                  }}
                >
                  {c.day}
                </Text>
              </View>
            </View>
          );
        })}
      </View>
    </View>
  );
}
