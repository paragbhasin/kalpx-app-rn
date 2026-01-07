import React, { useEffect, useState } from "react";
import {
    View,
    Text,
    FlatList,
    Image,
    TouchableOpacity,
    ActivityIndicator,
} from "react-native";
import { useDispatch, useSelector } from "react-redux";
import { fetchTopCommunities } from "./actions";
import { BASE_IMAGE_URL } from "../../Networks/baseURL";
import Ionicons from "react-native-vector-icons/Ionicons";
import { COMMUNITY_BACKGROUNDS } from "../../utils/CommunityAssets";
import styles from "./TopCommunitiesStyles";


import { useNavigation } from "@react-navigation/native";


const TopCommunities = () => {
    const dispatch = useDispatch();
    const navigation = useNavigation<any>();
    const [page, setPage] = useState(1);

    const { data: communities, loading, pagination } = useSelector(
        (state: any) => state.communities
    );

    useEffect(() => {
        dispatch(fetchTopCommunities(page) as any);
    }, [dispatch, page]);

    const renderItem = ({ item }: { item: any }) => (
        <TouchableOpacity
            style={styles.row}
            onPress={() => navigation.navigate("CommunityDetail", { slug: item.slug })}
        >
            <Text style={styles.rankText}>{item.rank || "-"}</Text>
            <Image
                source={
                    item.media_url
                        ? { uri: item.media_url.startsWith("http") ? item.media_url : `${BASE_IMAGE_URL}${item.media_url}` }
                        : (COMMUNITY_BACKGROUNDS[item.slug] || COMMUNITY_BACKGROUNDS[item.id?.toString()] || require("../../../assets/Group.png"))
                }
                style={styles.avatar}
            />
            <Text style={styles.communityName} numberOfLines={1}>
                {item.name}
            </Text>
        </TouchableOpacity>
    );



    const renderPagination = () => {
        if (!pagination || pagination.totalPages <= 1) return null;

        return (
            <View style={styles.paginationContainer}>
                <TouchableOpacity
                    onPress={() => setPage(prev => Math.max(1, prev - 1))}
                    disabled={page === 1}
                >
                    <Ionicons name="chevron-back" style={[styles.navArrow, page === 1 && { opacity: 0.3 }]} />
                </TouchableOpacity>

                {[...Array(pagination.totalPages)].map((_, i) => (
                    <TouchableOpacity key={i} onPress={() => setPage(i + 1)}>
                        <Text style={[styles.pageNumber, page === i + 1 && styles.activePageNumber]}>
                            {i + 1}
                        </Text>
                    </TouchableOpacity>
                ))}

                <TouchableOpacity
                    onPress={() => setPage(prev => Math.min(pagination.totalPages, prev + 1))}
                    disabled={page === pagination.totalPages}
                >
                    <Ionicons name="chevron-forward" style={[styles.navArrow, page === pagination.totalPages && { opacity: 0.3 }]} />
                </TouchableOpacity>
            </View>
        );
    };

    if (loading && communities.length === 0) {
        return (
            <View style={styles.loaderContainer}>
                <ActivityIndicator size="large" color="#D69E2E" />
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <FlatList
                data={communities}
                renderItem={renderItem}
                keyExtractor={(item) => (item.id || item.slug).toString()}
                contentContainerStyle={styles.listContent}
                ListFooterComponent={renderPagination}
                showsVerticalScrollIndicator={false}
            />
        </View>
    );
};

export default TopCommunities;
