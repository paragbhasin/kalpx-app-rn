import React from 'react';
import { View, ScrollView, StyleSheet } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import MantraCard from './MantraCard';
import SankalpCard from './SankalpCard';
import DailyPracticeDetailsCard from './DailyPracticeDetailsCard';
import { DAILY_SANKALPS } from '../data/sankalps';
import { CATALOGS } from '../data/mantras';

interface PracticeDetailNavigatorProps {
    selectedPractice: any;
    onClose: () => void;
}

const PracticeDetailNavigator: React.FC<PracticeDetailNavigatorProps> = ({
    selectedPractice,
    onClose,
}) => {
    if (!selectedPractice) return null;

    const raw = selectedPractice?.rawItem || selectedPractice;
    const item = selectedPractice;
    const category = raw?.category || item?.category;
    const practiceId = raw?.practice_id || item?.practice_id || item?.id;

    // Clean the ID for comparison (removing prefixes like "sankalp.", "mantra.", "practice.")
    const cleanId = String(practiceId).replace(/^(sankalp|mantra|practice)\./, "");

    // Check if found in sankalp.ts (DAILY_SANKALPS)
    const isSankalp = DAILY_SANKALPS.some(s => s.id === cleanId || s.id === practiceId);

    // Check if found in mantra.ts (CATALOGS)
    const isMantra = Object.values(CATALOGS).some(catalog =>
        catalog.some(m => m.id === cleanId || m.id === practiceId)
    );

    const renderContent = () => {
        if (isMantra) {
            return (
                <MantraCard
                    practiceTodayData={{
                        started: { mantra: true },
                        ids: { mantra: practiceId },
                    }}
                    onPressChantMantra={() => { }}
                    DoneMantraCalled={() => { }}
                    viewOnly={true}
                />
            );
        }

        if (isSankalp) {
            return (
                <SankalpCard
                    practiceTodayData={{
                        started: { sankalp: true },
                        ids: { sankalp: practiceId },
                    }}
                    onPressStartSankalp={() => { }}
                    onCompleteSankalp={() => { }}
                    viewOnly={true}
                />
            );
        }

        // Default: show DailyPracticeDetailsCard for all other practices
        return (
            <DailyPracticeDetailsCard
                mode="view"
                data={item}
                item={{ name: category || "Practice", key: category }}
                onChange={() => { }}
                onBackPress={onClose}
                isLocked={true}
                selectedCount={null}
                onSelectCount={() => { }}
            />
        );
    };

    return (
        <View style={styles.overlay}>
            <View style={styles.header}>
                <Ionicons
                    name="arrow-back"
                    size={26}
                    color="#000"
                    onPress={onClose}
                />
            </View>

            <ScrollView
                style={styles.scrollView}
                contentContainerStyle={[
                    styles.scrollContent,
                    !isMantra && !isSankalp && { alignItems: 'center' }, // Center align for DailyPracticeDetailsCard
                ]}
                showsVerticalScrollIndicator={false}
            >
                {renderContent()}
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    overlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: '#FFFFFF',
        zIndex: 999,
        flex: 1,
    },
    header: {
        paddingHorizontal: 16,
        paddingTop: 10,
    },
    scrollView: {
        flex: 1,
        marginTop: 10,
    },
    scrollContent: {
        paddingBottom: 20,
        flexGrow: 1,
    },
});

export default PracticeDetailNavigator;
