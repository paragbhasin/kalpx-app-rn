import React, { FC, useEffect, useState } from "react";
import { Platform, Pressable, StyleSheet, Text, View } from "react-native";
import { Calendar } from "react-native-calendars";

interface CalendarDetails {
  startDate: string;
  // allowedWeekdays: number[];
  highlightDates: string[];
  onDayPress?: (day: any) => void;
  onMonthChange?: (month: any) => void;  
}

const CalendarUI: FC<CalendarDetails> = ({
  startDate,
  // allowedWeekdays,
  highlightDates,
  onDayPress,
  onMonthChange
}) => {

  const [selectedDate, setSelectedDate] = useState(startDate);

  useEffect(() => {
  setSelectedDate(startDate);
}, [startDate]);

const isDisabledDate = (dateString: string) => {
  return !highlightDates.includes(dateString);
};


// const isDisabledDate = (dateString: string) => {
//   const date = moment(dateString);

//   if (date.isBefore(moment(), "day")) return true;

//   return !highlightDates.includes(dateString);
// };


  const handlePress = (day: any) => {
    if (isDisabledDate(day.dateString)) return;

    setSelectedDate(day.dateString);
    onDayPress && onDayPress(day);
  };

  return (
    <View style={styles.calendarContainer}>
      <Calendar
        current={selectedDate}
        enableSwipeMonths={true}
        hideExtraDays={true}
        markingType="custom"
          onMonthChange={(month) => {
    onMonthChange && onMonthChange(month);   // ⭐ Trigger API here
  }}
        // We will NOT use markedDates here because dayComponent overrides it
        dayComponent={({ date }) => {
          const dateStr = date.dateString;
          const isSelected = dateStr === selectedDate;
          // const hasSlot = highlightDates.includes(dateStr);
          const disabled = isDisabledDate(dateStr);

          return (
            <Pressable
              onPress={() => handlePress(date)}
              disabled={disabled}
              style={{
                height: 40,
                width: 40,
                borderRadius: 6,
                justifyContent: "center",
                alignItems: "center",
                backgroundColor: isSelected
                  ? "#E3B505"                   // selected
                  : disabled
                  ? "#E0E0E0"                   // disabled grey
                  : "#FFFFFF",                  // normal
                // borderWidth: hasSlot ? 2 : 0,
                // borderColor: hasSlot ? "#E3B505" : "transparent",
              }}
            >
              <Text
                style={{
                  color: disabled
                    ? "#A0A0A0"
                    : isSelected
                    ? "#fff"
                    : "#000",
                  fontWeight: isSelected ? "700" : "500",
                }}
              >
                {date.day}
              </Text>
            </Pressable>
          );
        }}
        theme={{
          backgroundColor: "#FFFFFF",
          calendarBackground: "#FFFFFF",
          textDayFontSize: 18,
          monthTextColor: "#000000",
          textMonthFontSize: 20,
          arrowColor: "#E3B505",
        }}
      />
    </View>
  );
};

export default CalendarUI;

const styles = StyleSheet.create({
  calendarContainer: {
    borderRadius: 16,
    backgroundColor: "#FFFFFF",
    padding: 10,
    marginTop: 10,
    marginBottom: 10,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
      },
      android: {
        elevation: 6,
      },
    }),
  },
});
