import React from 'react';
import { View, Text, StyleSheet, Image, ScrollView } from 'react-native';

const MyRetreatBookings: React.FC = () => {
    return (
        <ScrollView contentContainerStyle={styles.container}>
            <View style={styles.emptyState}>
                <Image
                    source={require('../../../assets/retreats.png')}
                    style={styles.image}
                    resizeMode="contain"
                />
                <Text style={styles.title}>No Bookings Found</Text>
                <Text style={styles.subtitle}>
                    You haven't booked any retreats yet. Explore our upcoming retreats and start your wellness journey!
                </Text>
            </View>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flexGrow: 1,
        backgroundColor: '#fff',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 24,
    },
    emptyState: {
        alignItems: 'center',
    },
    image: {
        width: 200,
        height: 200,
        marginBottom: 24,
        opacity: 0.5,
    },
    title: {
        fontSize: 20,
        fontFamily: 'GelicaBold',
        color: '#333',
        marginBottom: 12,
    },
    subtitle: {
        fontSize: 15,
        fontFamily: 'GelicaMedium',
        color: '#707070',
        textAlign: 'center',
        lineHeight: 22,
    },
});

export default MyRetreatBookings;
