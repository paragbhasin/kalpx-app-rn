import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    Pressable,
    Image,
    ScrollView,
    SafeAreaView,
    StatusBar,
    ImageBackground,
} from 'react-native';
import ExploreRetreats from './ExploreRetreats';
import MyRetreatBookings from './MyRetreatBookings';

export default function RetreatsScreen() {
    const [activeTab, setActiveTab] = useState<'explore' | 'bookings'>('explore');

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="light-content" />
            <ScrollView stickyHeaderIndices={[1]} showsVerticalScrollIndicator={false}>
                {/* Hero Section */}
                <ImageBackground
                    source={require('../../../assets/retreat/landing1.png')}
                    style={styles.hero}
                >
                    <View style={styles.heroOverlay}>
                        <View style={styles.heroContent}>
                            <Text style={styles.heroTitle}>Welcome to KalpX Retreats</Text>
                            <Text style={styles.heroSubtitle}>
                                Mindfully curated wellness retreats that help you pause, reset and
                                connect at your own space
                            </Text>
                        </View>
                    </View>
                </ImageBackground>

                {/* Navigation Tabs */}
                <View style={styles.tabContainer}>
                    <View style={styles.tabWrapper}>
                        <Pressable
                            style={[
                                styles.tab,
                                activeTab === 'explore' && styles.activeTab,
                            ]}
                            onPress={() => setActiveTab('explore')}
                        >
                            <Text
                                style={[
                                    styles.tabText,
                                    activeTab === 'explore' && styles.activeTabText,
                                ]}
                            >
                                Explore Retreats
                            </Text>
                        </Pressable>
                        <Pressable
                            style={[
                                styles.tab,
                                activeTab === 'bookings' && styles.activeTab,
                            ]}
                            onPress={() => setActiveTab('bookings')}
                        >
                            <Text
                                style={[
                                    styles.tabText,
                                    activeTab === 'bookings' && styles.activeTabText,
                                ]}
                            >
                                My Bookings
                            </Text>
                        </Pressable>
                    </View>
                </View>

                {/* Content */}
                <View style={styles.contentArea}>
                    {activeTab === 'explore' ? <ExploreRetreats /> : <MyRetreatBookings />}
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    hero: {
        width: '100%',
        height: 250,
    },
    heroOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.4)',
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 24,
    },
    heroContent: {
        alignItems: 'center',
        gap: 8,
    },
    heroTitle: {
        fontSize: 20,
        fontFamily: 'GelicaBold',
        color: '#fff',
        textAlign: 'center',
    },
    heroSubtitle: {
        fontSize: 16,
        fontFamily: 'GelicaMedium',
        color: 'rgba(255,255,255,0.9)',
        textAlign: 'center',
        lineHeight: 22,
    },
    tabContainer: {
        backgroundColor: '#fff',
        paddingHorizontal: 16,
        paddingVertical: 12,
    },
    tabWrapper: {
        flexDirection: 'row',
        backgroundColor: '#EBEBEB',
        borderRadius: 12,
        padding: 4,
    },
    tab: {
        flex: 1,
        paddingVertical: 10,
        alignItems: 'center',
        borderRadius: 10,
    },
    activeTab: {
        backgroundColor: '#D4A017',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
    },
    tabText: {
        fontSize: 15,
        fontFamily: 'GelicaBold',
        color: '#707070',
    },
    activeTabText: {
        color: '#fff',
    },
    contentArea: {
        flex: 1,
    },
});
