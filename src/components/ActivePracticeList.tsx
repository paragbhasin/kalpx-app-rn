import React from 'react';
import { View } from 'react-native';
import { useTranslation } from 'react-i18next';
import SimpleSankalpCard from './SimpleSankalpCard';
import SimpleMantraCard from './SimpleMantraCard';
import SimplePracticeCard from './SimplePracticeCard';
import { DAILY_SANKALPS } from '../data/sankalps';
import { CATALOGS } from '../data/mantras';
import { SANATAN_PRACTICES_FINAL } from '../data/sanatanPractices';

interface ActivePracticeListProps {
    todayItems: any[];
    onMarkSankalpDone: (sankalp: any) => void;
    onMarkMantraDone: (mantra: any) => void;
    onMarkPracticeDone?: (practice: any) => void;
    filter?: (item: any) => boolean;
}

const ActivePracticeList: React.FC<ActivePracticeListProps> = ({
    todayItems,
    onMarkSankalpDone,
    onMarkMantraDone,
    onMarkPracticeDone,
    filter,
}) => {
    const { i18n } = useTranslation();
    const [hiddenIds, setHiddenIds] = React.useState<Set<string>>(new Set());
    const timersRef = React.useRef<{ [key: string]: any }>({});

    const currentLang = i18n.language.split("-")[0];
    const langKey = currentLang.toLowerCase();
    const allMantras = CATALOGS[langKey] || CATALOGS.en;

    React.useEffect(() => {
        todayItems.forEach(item => {
            if (item.completed_at && !hiddenIds.has(item.item_id) && !timersRef.current[item.item_id]) {
                timersRef.current[item.item_id] = setTimeout(() => {
                    setHiddenIds(prev => {
                        const newSet = new Set(prev);
                        newSet.add(item.item_id);
                        return newSet;
                    });
                    delete timersRef.current[item.item_id];
                }, 2000);
            }
        });
    }, [todayItems]);

    React.useEffect(() => {
        return () => {
            // Cleanup all timers on unmount
            Object.values(timersRef.current).forEach(timer => clearTimeout(timer));
        };
    }, []);

    if (!todayItems || todayItems.length === 0) return null;

    let itemsToShow = todayItems.filter(item =>
        !hiddenIds.has(item.item_id)
    );

    if (filter) {
        itemsToShow = itemsToShow.filter(filter);
    }

    if (itemsToShow.length === 0) return null;

    return (
        <View style={{ marginTop: 10 }}>
            {itemsToShow.map((item, idx) => {
                if (item.practice_type === "sankalp") {
                    const sankalp = DAILY_SANKALPS.find((s) => s.id === item.item_id);
                    if (!sankalp) return null;
                    return (
                        <View key={`sankalp-${idx}`} style={{ marginBottom: 10 }}>
                            <SimpleSankalpCard
                                sankalp={sankalp}
                                isDone={!!item.completed_at}
                                onMarkDone={() => onMarkSankalpDone(sankalp)}
                            />
                        </View>
                    );
                } else if (item.practice_type === "mantra") {
                    const mantra = allMantras.find((m) => m.id === item.item_id);
                    if (!mantra) return null;
                    return (
                        <View key={`mantra-${idx}`} style={{ marginBottom: 10 }}>
                            <SimpleMantraCard
                                mantra={mantra}
                                isDone={!!item.completed_at}
                                onMarkDone={() => onMarkMantraDone(mantra)}
                            />
                        </View>
                    );
                } else if (item.practice_type === "library" || item.practice_type === "practice") {
                    const practice = SANATAN_PRACTICES_FINAL.find((p) => p.id === item.item_id);
                    if (!practice) return null;
                    return (
                        <View key={`practice-${idx}`} style={{ marginBottom: 10 }}>
                            <SimplePracticeCard
                                practice={practice}
                                isDone={!!item.completed_at}
                                onMarkDone={() => onMarkPracticeDone && onMarkPracticeDone(practice)}
                            />
                        </View>
                    );
                }
                return null;
            })}
        </View>
    );
};

export default ActivePracticeList;
