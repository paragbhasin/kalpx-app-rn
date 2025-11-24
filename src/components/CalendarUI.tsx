import moment from "moment";
import React, { FC, useEffect, useState } from "react";
import { Platform, Pressable, StyleSheet, Text, View } from "react-native";
import { Calendar } from "react-native-calendars";

interface CalendarDetails {
  startDate: string;
  allowedWeekdays: number[];
  highlightDates: string[];
  onDayPress?: (day: any) => void;
}

const CalendarUI: FC<CalendarDetails> = ({
  startDate,
  allowedWeekdays,
  highlightDates,
  onDayPress,
}) => {

  const [selectedDate, setSelectedDate] = useState(startDate);

  useEffect(() => {
  setSelectedDate(startDate);
}, [startDate]);

  const isDisabledDate = (dateString: string) => {
    const date = moment(dateString);
    const weekday = date.day();

    if (date.isBefore(moment(), "day")) return true;   // past days
    if (!allowedWeekdays.includes(weekday)) return true; // Sat/Sun
    return false;
  };

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












// import moment from 'moment';
// import React, { FC, useState } from 'react';
// import { Platform, StyleSheet, View } from 'react-native';
// import { Calendar } from 'react-native-calendars';

// interface CalendarDetails {
//   startDate: string;
//   onDayPress?: (day: any) => void;
// }

// const CalendarUI: FC<CalendarDetails> = ({ startDate, onDayPress }) => {
//   const [selectedDate, setSelectedDate] = useState<string>(
//     moment(startDate).isSameOrAfter(moment(), "day")
//       ? startDate
//       : moment().format("YYYY-MM-DD")
//   );

//   const handleDayPress = (day: any) => {
//     const clickedDate = day.dateString;
//     if (moment(clickedDate).isSameOrAfter(moment(), "day")) {
//       setSelectedDate(clickedDate);
//       if (onDayPress) onDayPress(day);
//     }
//   };

//   return (
//     <View style={styles.calendarContainer}>
//       <Calendar
//         enableSwipeMonths={true}
//         onDayPress={handleDayPress}
//         minDate={moment().format("YYYY-MM-DD")}
//         maxDate={"2100-12-31"}
//         current={selectedDate}
//         markingType="custom"
//         markedDates={{
//           [selectedDate]: {
//             customStyles: {
//               container: {
//                 backgroundColor: "#E3B505",
//                 borderRadius: 6,
//               },
//               text: {
//                 color: "#fff",
//                 fontWeight: "bold",
//               },
//             },
//           },
//         }}
//         theme={{
//           backgroundColor: "#EBEBEB", // ✅ internal calendar background
//           calendarBackground: "#EBEBEB", // ✅ matches wrapper color
//           textSectionTitleColor: "#3C3C43",
//           textDayFontSize: 16,
//           textMonthFontSize: 20,
//           monthTextColor: "#000000",
//           textDayHeaderFontSize: 14,
//           textDayHeaderFontWeight: "bold",
//           arrowColor: "#E3B505",
//           disabledArrowColor: "#d3d3d3",
//         }}
//       />
//     </View>
//   );
// };

// export default CalendarUI;

// const styles = StyleSheet.create({
//   calendarContainer: {
//     borderRadius: 16,
//     backgroundColor: '#EBEBEB', // ✅ light grey background behind calendar
//     padding: 10,
//     marginTop: 10,
//     marginBottom: 10,
//     // ✅ Shadow for iOS and elevation for Android
//     ...Platform.select({
//       ios: {
//         shadowColor: '#000',
//         shadowOffset: { width: 0, height: 2 },
//         shadowOpacity: 0.2,
//         shadowRadius: 4,
//       },
//       android: {
//         elevation: 6,
//       },
//     }),
//   },
// });