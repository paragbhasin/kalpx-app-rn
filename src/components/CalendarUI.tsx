import moment from 'moment';
import React, { FC, useState } from 'react';
import { Platform, StyleSheet, View } from 'react-native';
import { Calendar } from 'react-native-calendars';

interface CalendarDetails {
  startDate: string;
  onDayPress?: (day: any) => void;
}

const CalendarUI: FC<CalendarDetails> = ({ startDate, onDayPress }) => {
  const [selectedDate, setSelectedDate] = useState<string>(
    moment(startDate).isSameOrAfter(moment(), "day")
      ? startDate
      : moment().format("YYYY-MM-DD")
  );

  const handleDayPress = (day: any) => {
    const clickedDate = day.dateString;
    if (moment(clickedDate).isSameOrAfter(moment(), "day")) {
      setSelectedDate(clickedDate);
      if (onDayPress) onDayPress(day);
    }
  };

  return (
    <View style={styles.calendarContainer}>
      <Calendar
        enableSwipeMonths={true}
        onDayPress={handleDayPress}
        minDate={moment().format("YYYY-MM-DD")}
        maxDate={"2100-12-31"}
        current={selectedDate}
        markingType="custom"
        markedDates={{
          [selectedDate]: {
            customStyles: {
              container: {
                backgroundColor: "#E3B505",
                borderRadius: 6,
              },
              text: {
                color: "#fff",
                fontWeight: "bold",
              },
            },
          },
        }}
        theme={{
          backgroundColor: "#EBEBEB", // ✅ internal calendar background
          calendarBackground: "#EBEBEB", // ✅ matches wrapper color
          textSectionTitleColor: "#3C3C43",
          textDayFontSize: 16,
          textMonthFontSize: 20,
          monthTextColor: "#000000",
          textDayHeaderFontSize: 14,
          textDayHeaderFontWeight: "bold",
          arrowColor: "#E3B505",
          disabledArrowColor: "#d3d3d3",
        }}
      />
    </View>
  );
};

export default CalendarUI;

const styles = StyleSheet.create({
  calendarContainer: {
    borderRadius: 16,
    backgroundColor: '#EBEBEB', // ✅ light grey background behind calendar
    padding: 10,
    marginTop: 10,
    marginBottom: 10,
    // ✅ Shadow for iOS and elevation for Android
    ...Platform.select({
      ios: {
        shadowColor: '#000',
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
// import { View } from 'react-native';
// import { Calendar } from 'react-native-calendars';

// interface CalendarDetails {
//     startDate: string;
//     onDayPress?: (day: any) => void;
// }


// const CalendarUI: FC<CalendarDetails> = ({ startDate, onDayPress }) => {
//     const [selectedDate, setSelectedDate] = useState<string>(
//         moment(startDate).isSameOrAfter(moment(), "day")
//             ? startDate
//             : moment().format("YYYY-MM-DD")
//     );

//     const handleDayPress = (day: any) => {
//         const clickedDate = day.dateString;
//         if (moment(clickedDate).isSameOrAfter(moment(), "day")) {
//             setSelectedDate(clickedDate);
//             if (onDayPress) onDayPress(day);
//         }
//     };

//     return (
//         <View style={{ borderRadius: 16 }}>
//             <Calendar
//                 enableSwipeMonths={true}
//                 onDayPress={handleDayPress}
//                 minDate={moment().format("YYYY-MM-DD")}
//                 maxDate={"2100-12-31"}
//                 current={selectedDate}
//                 markingType="custom"
//                 markedDates={{
//                     [selectedDate]: {
//                         customStyles: {
//                             container: {
//                                 backgroundColor: "#E3B505",
//                                 borderRadius: 6,
//                             },
//                             text: {
//                                 color: "#fff",
//                                 fontWeight: "bold",
//                             },
//                         },
//                     },
//                 }}
//                 theme={{
//                     backgroundColor: "#EBEBEB", // <-- applies grey background
//                     textSectionTitleColor: "#3C3C43",
//                     textDayFontSize: 16,
//                     textMonthFontSize: 20,
//                     monthTextColor: "#000000",
//                     textDayHeaderFontSize: 14,
//                     textDayHeaderFontWeight: "bold",
//                     arrowColor: "#E3B505",
//                     disabledArrowColor: "#d3d3d3",
//                 }}
//             />
//         </View>
//     );
// };

// export default CalendarUI;
