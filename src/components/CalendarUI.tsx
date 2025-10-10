import moment from 'moment';
import React, { FC, useState } from 'react';
import { View } from 'react-native';
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
        <View style={{ borderRadius: 16 }}>
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
                    backgroundColor: "#EBEBEB", // <-- applies grey background
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
