import React, { useState } from "react";
import {
    View,
    Text,
    Image,
    TouchableOpacity,
    StyleSheet,
    Dimensions,
    Pressable,
    ImageBackground,
} from "react-native";
import Carousel from "react-native-reanimated-carousel";
import { Ionicons, MaterialCommunityIcons, SimpleLineIcons } from "@expo/vector-icons";
import moment from "moment";
import { useNavigation } from "@react-navigation/native";
import ReportModal from "./ReportModal";
import { COMMUNITY_BACKGROUNDS } from "../utils/CommunityAssets";

const { width: screenWidth } = Dimensions.get("window");



interface SocialPostCardProps {
    post: any;
    onUpvote?: () => void;
    onDownvote?: () => void;
    onComment?: () => void;
    onShare?: () => void;
    onJoin?: () => void;
    onMenu?: () => void;
    onUserPress?: () => void;
    onAskQuestion?: () => void;
    onSave?: () => void;
    onUnsave?: () => void;
    onHide?: () => void;
    onReport?: (reason: string, details: string) => void;
}

const getLinkedItemText = (linkedItem: any) => {
    if (!linkedItem || !linkedItem.type) return "";

    const typeParts = linkedItem.type.split(":");
    const category = typeParts[0]?.trim().toLowerCase();
    const itemType = typeParts[1]?.trim().toLowerCase();

    // Check if it's from general or a specific category
    const isGeneral = category === "general";

    if (itemType === "mantra") {
        return isGeneral
            ? "Do this mantra today - let intention become action"
            : `Add this to your daily practice - progress happens gently`;
    } else if (itemType === "sankalp") {
        return isGeneral
            ? "Take this sankalp today - shape your inner resolve"
            : `Add this to your daily practice -  progress happens gently`;
    } else if (itemType === "practice") {
        return isGeneral
            ? "Add this to your daily practice - progress happens gently"
            : `Add this to your daily practice - progress happens gently`;
    }

    return "Add this to your daily practice - progress happens gently";
};

const SocialPostCard: React.FC<SocialPostCardProps> = ({
    post,
    onUpvote,
    onDownvote,
    onComment,
    onShare,
    onJoin,
    onMenu,
    onUserPress,
    onAskQuestion,
    onSave,
    onUnsave,
    onHide,
    onReport,
}) => {
    const navigation: any = useNavigation();
    const [isExpanded, setIsExpanded] = useState(false);
    const [showMenu, setShowMenu] = useState(false);
    const [isReportModalVisible, setIsReportModalVisible] = useState(false);

    // Random initial counts for upvotes and shares
    const [upvoteCount, setUpvoteCount] = useState(post.upvote_count || Math.floor(Math.random() * 950) + 50); // 50-1000
    const [shareCount, setShareCount] = useState(post.share_count || Math.floor(Math.random() * 20) + 10); // 10-500
    const [hasUserVoted, setHasUserVoted] = useState<'up' | 'down' | null>(null);

    // formatted date
    const timeAgo = post.created_at ? moment(post.created_at).fromNow() : "";

    // images for carousel
    const images = post.images || (post.hook_image ? [{ image: post.hook_image }] : []);

    // truncated content
    const content = post.content || "";
    const shouldTruncate = content.length > 100;

    const [cardWidth, setCardWidth] = useState(screenWidth - 8); // Updated base width for padding: 4
    const [activeIndex, setActiveIndex] = useState(0);

    // Aspect ratio calculation from slide_layouts as shown in user JSON
    const initialSlide = post.slide_layouts?.[0] || post.resolved_slide_layouts?.[0];
    const aspectRatioString = initialSlide?.layout?.aspect_ratio || post.layout?.aspect_ratio || "1:1";
    let aspectRatio = 1;

    if (aspectRatioString) {
        const [w, h] = aspectRatioString.split(":").map(Number);
        if (w && h) {
            aspectRatio = w / h;
        }
    }

    // Dynamic height based on measured width and strict ratio
    const imageHeight = cardWidth / aspectRatio;

    const renderCarouselItem = ({ item }: { item: any }) => (
        <View style={[styles.imageContainer, { width: cardWidth }]}>
            <Image
                source={{ uri: item.image_url || item.image || item }}
                style={styles.postImage}
                resizeMode="contain"
            />
            {item.overlayText && (
                <View style={styles.overlay}>
                    <Text style={styles.overlayTitle}>{item.overlayTitle}</Text>
                    <Text style={styles.overlaySubtitle}>{item.overlaySubtitle}</Text>
                </View>
            )}
        </View>
    );

    return (
        <View
            style={styles.card}
            onLayout={(event) => {
                const { width } = event.nativeEvent.layout;

                setCardWidth(width - 8);
            }}
        >
            {/* Header */}
            <View style={[styles.header, { zIndex: showMenu ? 1001 : 1 }]}>
                <TouchableOpacity
                    onPress={() => {
                        const slug = post.community?.slug || post.community_slug || post.slug;
                        if (slug) {
                            navigation.navigate('CommunityDetail', { slug });
                        }
                    }}
                    style={styles.userInfo}
                >
                    <View style={styles.avatarContainer}>
                        <ImageBackground
                            source={
                                COMMUNITY_BACKGROUNDS[post.community?.slug] ||
                                COMMUNITY_BACKGROUNDS[post.community_slug] ||
                                COMMUNITY_BACKGROUNDS[post.community?.id?.toString()] ||
                                (typeof post.community === 'string' ? COMMUNITY_BACKGROUNDS[post.community] : null) ||
                                (post.slug ? COMMUNITY_BACKGROUNDS[post.slug] : null) ||
                                (post.community_name ? COMMUNITY_BACKGROUNDS[post.community_name.toLowerCase().replace(/ & /g, '-').replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')] : null)
                            }
                            style={styles.avatarBackground}
                            imageStyle={{ borderRadius: 24 }}
                            resizeMode="cover"
                        >
                            <Image
                                source={{
                                    uri: post.community?.icon || post.creator?.avatar || "https://via.placeholder.com/40",
                                }}
                                style={styles.avatar}
                            />
                        </ImageBackground>
                    </View>
                    <View>
                        <Text style={styles.communityName}>
                            {post.community_name || "Community Name"}
                        </Text>
                        <Text style={styles.timeAgo}>{timeAgo}</Text>
                    </View>
                </TouchableOpacity>

                <View style={styles.headerActions}>
                    <TouchableOpacity
                        style={[styles.joinButton, post.is_joined && styles.joinedButton]}
                        onPress={onJoin}
                    >
                        <Text style={[styles.joinButtonText, post.is_joined && styles.joinedText]}>
                            {post.is_joined ? "Joined" : "Join"}
                        </Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => setShowMenu(!showMenu)}>

                        <Ionicons name="ellipsis-horizontal" size={24} color="#333" />
                    </TouchableOpacity>
                </View>

                {showMenu && (
                    <>
                        <TouchableOpacity
                            style={styles.menuBackdrop}
                            activeOpacity={1}
                            onPress={() => setShowMenu(false)}
                        />
                        <View style={styles.menuContainer}>
                            <TouchableOpacity
                                style={styles.menuItem}
                                onPress={() => {
                                    setShowMenu(false);
                                    post.is_saved ? onUnsave?.() : onSave?.();
                                }}
                            >
                                <Ionicons name={post.is_saved ? "bookmark" : "bookmark-outline"} size={20} color={post.is_saved ? "#D69E2E" : "#333"} />
                                <Text style={[styles.menuItemText, post.is_saved && { color: "#D69E2E" }]}>
                                    {post.is_saved ? "Saved" : "Save"}
                                </Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={styles.menuItem}
                                onPress={() => {
                                    setShowMenu(false);
                                    onHide?.();
                                }}
                            >
                                <Ionicons name="eye-off-outline" size={20} color="#333" />
                                <Text style={styles.menuItemText}>Hide</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.menuItem, { borderBottomWidth: 0 }]}
                                onPress={() => {
                                    setShowMenu(false);
                                    setIsReportModalVisible(true);
                                }}
                            >
                                <Ionicons name="flag-outline" size={20} color="#FF3B30" />
                                <Text style={[styles.menuItemText, { color: "#FF3B30" }]}>Report</Text>
                            </TouchableOpacity>
                        </View>
                    </>
                )}
            </View>

            <ReportModal
                isVisible={isReportModalVisible}
                onClose={() => setIsReportModalVisible(false)}
                onSubmit={(reason, details) => {
                    onReport?.(reason, details);
                    setIsReportModalVisible(false);
                }}
            />

            {/* Title */}
            {post.title && <Text style={styles.title}>{post.title}</Text>}

            {/* Carousel or Single Image */}
            {images.length > 0 && (
                <View style={{ height: imageHeight, width: "100%", marginTop: 0 }}>
                    <Carousel
                        loop={false}
                        width={cardWidth}
                        height={imageHeight}
                        data={images}
                        scrollAnimationDuration={1000}
                        onSnapToItem={(index) => setActiveIndex(index)}
                        renderItem={renderCarouselItem}
                    />
                    {/* Dot Indicators - Reddit Style */}
                    {images.length > 1 && (
                        <View style={styles.paginationContainer}>
                            {images.map((_: any, index: number) => (
                                <View
                                    key={index}
                                    style={[
                                        styles.dot,
                                        activeIndex === index ? styles.activeDot : styles.inactiveDot
                                    ]}
                                />
                            ))}
                        </View>
                    )}

                    {/* Slide Counter - Reddit Style (Bottom Right) */}
                    {images.length > 1 && (
                        <View style={styles.slideCounter}>
                            <Text style={styles.slideCounterText}>{activeIndex + 1}/{images.length}</Text>
                        </View>
                    )}
                </View>
            )}

            {/* Description */}
            {content ? (
                <View style={styles.contentContainer}>
                    <Text style={styles.content}>
                        {isExpanded ? content : content.slice(0, 100)}
                        {!isExpanded && shouldTruncate && "..."}
                    </Text>
                    {shouldTruncate && (
                        <TouchableOpacity onPress={() => setIsExpanded(!isExpanded)}>
                            <Text style={styles.showMore}>{isExpanded ? "Show less" : "Show more"}</Text>
                        </TouchableOpacity>
                    )}
                </View>
            ) : null}

            {/* Footer / Interaction Bar */}
            <View style={styles.footer}>
                <View style={styles.leftActions}>
                    <View style={styles.voteGroup}>

                        <TouchableOpacity style={styles.actionButton} onPress={() => {
                            if (hasUserVoted === 'up') {
                                // User is un-upvoting
                                setUpvoteCount(prev => Math.max(0, prev - 1));
                                setHasUserVoted(null);
                            } else {
                                // User is upvoting
                                if (hasUserVoted === 'down') {
                                    // Remove downvote first, then add upvote (net +2)
                                    setUpvoteCount(prev => prev + 2);
                                } else {
                                    // Just add upvote
                                    setUpvoteCount(prev => prev + 1);
                                }
                                setHasUserVoted('up');
                            }
                            onUpvote?.();
                        }}>
                            <MaterialCommunityIcons
                                name={hasUserVoted === 'up' ? "arrow-up-bold" : "arrow-up-bold-outline"}
                                size={24}
                                color={hasUserVoted === 'up' ? "#D69E2E" : "#666"}
                            />
                            <Text style={styles.voteactionText}>{upvoteCount}</Text>
                        </TouchableOpacity>

                        <TouchableOpacity style={styles.actionButton} onPress={() => {
                            if (hasUserVoted === 'down') {
                                // User is un-downvoting
                                setUpvoteCount(prev => prev + 1);
                                setHasUserVoted(null);
                            } else {
                                // User is downvoting
                                if (hasUserVoted === 'up') {
                                    // Remove upvote first, then add downvote (net -2)
                                    setUpvoteCount(prev => Math.max(0, prev - 2));
                                } else {
                                    // Just subtract for downvote
                                    setUpvoteCount(prev => Math.max(0, prev - 1));
                                }
                                setHasUserVoted('down');
                            }
                            onDownvote?.();
                        }}>
                            <MaterialCommunityIcons
                                name={hasUserVoted === 'down' ? "arrow-down-bold" : "arrow-down-bold-outline"}
                                size={24}
                                color={hasUserVoted === 'down' ? "#D69E2E" : "#666"}
                            />
                        </TouchableOpacity>
                    </View>
                    <View style={styles.voteGroup}>
                        <TouchableOpacity style={styles.actionButton} onPress={onComment}>

                            {/* Or Ionicons chatbubble-outline */}
                            <Ionicons name="chatbubble-outline" size={22} color="#666" />
                            <Text style={styles.actionText}>{post.comment_count || 0}</Text>
                        </TouchableOpacity>
                    </View>
                    <View style={styles.voteGroup}>
                        <TouchableOpacity style={styles.actionButton} onPress={() => {
                            setShareCount(prev => prev + 1);
                            onShare?.();
                        }}>
                            <Ionicons name="share-social-outline" size={22} color="#666" />
                            <Text style={styles.actionText}>{shareCount}</Text>
                        </TouchableOpacity>
                    </View>
                </View>

                <TouchableOpacity style={styles.askButton} onPress={onAskQuestion}>
                    <Ionicons name="help-circle-outline" size={20} color="#333" />
                    <Text style={styles.askButtonText}>Ask question</Text>
                </TouchableOpacity>
            </View>
            {/* Linked Item Card */}
            {post.linked_item && (
                <TouchableOpacity style={styles.linkedItemCard}>
                    <View style={styles.linkedItemContent}>
                        <View style={styles.linkedItemTitleRow}>
                            <MaterialCommunityIcons
                                name="hand-pointing-right"
                                size={18}
                                color="#CC9933"
                                style={styles.linkedItemInlineIcon}
                            />
                            <Text style={styles.linkedItemTitleText}>
                                {post.linked_item.name}
                            </Text>
                        </View>
                        <Text style={styles.linkedItemSubtitle}>
                            {getLinkedItemText(post.linked_item)}
                        </Text>
                    </View>
                </TouchableOpacity>
            )}

        </View>

    );
};

const styles = StyleSheet.create({
    card: {

        borderRadius: 12,
        marginVertical: 8,
        marginHorizontal: 16,
        padding: 2,
        elevation: 2, // Android shadow

        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
    },
    header: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 8,
    },
    userInfo: {
        flexDirection: "row",
        alignItems: "center",
    },
    avatarContainer: {
        width: 48,
        height: 48,
        justifyContent: "center",
        alignItems: "center",
        marginRight: 10,
        borderRadius: 24,
        overflow: "hidden",
    },
    avatarBackground: {
        width: 48,
        height: 48,
        justifyContent: "center",
        alignItems: "center",
    },
    avatar: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: "transparent",
    },
    communityName: {
        fontSize: 14,
        fontWeight: "bold",
        color: "#333",
    },
    timeAgo: {
        fontSize: 12,
        color: "#888",
    },
    headerActions: {
        flexDirection: "row",
        alignItems: "center",
        zIndex: 100,
    },
    menuContainer: {
        position: 'absolute',
        top: 45,
        right: 15,
        backgroundColor: '#fff',
        borderRadius: 12,
        paddingVertical: 4,
        paddingHorizontal: 12,
        minWidth: 160,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 10,
        elevation: 10,
        zIndex: 1000,
        borderWidth: 1,
        borderColor: '#f0f0f0',
    },
    menuBackdrop: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 999,
    },
    menuItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#f5f5f5',
    },
    menuItemText: {
        fontSize: 14,
        marginLeft: 12,
        color: '#333',
        fontWeight: '500',
    },
    joinButton: {
        backgroundColor: "#D69E2E", // Gold/Mustard color from image
        paddingHorizontal: 16,
        paddingVertical: 6,
        borderRadius: 20,
        marginRight: 10,
    },
    joinButtonText: {
        color: "#fff",
        fontWeight: "600",
        fontSize: 12,
    },
    joinedButton: {
        backgroundColor: "#E8E8E8",
    },
    joinedText: {
        color: "#666",
    },

    title: {
        fontSize: 14,
        fontWeight: "bold",
        color: "#000",

        lineHeight: 22,
    },
    imageContainer: {
        flex: 1, // Fill the carousel item height
        borderRadius: 12,
        overflow: "hidden",
        backgroundColor: "#000", // Reddit-style black background for images
        justifyContent: 'center',
        alignItems: 'center',
    },
    paginationContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        position: 'absolute',
        bottom: 15,
        alignSelf: 'center',
        backgroundColor: 'rgba(0,0,0,0.4)',
        paddingHorizontal: 8,
        paddingVertical: 5,
        borderRadius: 15,
    },
    slideCounter: {
        position: 'absolute',
        bottom: 15,
        right: 15,
        backgroundColor: 'rgba(0,0,0,0.6)',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
    },
    slideCounterText: {
        color: '#fff',
        fontSize: 10,
        fontWeight: 'bold',
    },
    dot: {
        width: 6,
        height: 6,
        borderRadius: 3,
        marginHorizontal: 3,
    },
    activeDot: {
        backgroundColor: '#fff',
    },
    inactiveDot: {
        backgroundColor: 'rgba(255, 255, 255, 0.5)',
    },
    postImage: {
        width: "100%",
        height: "100%",
    },
    overlay: {
        position: "absolute",
        top: 20,
        left: 0,
        right: 0,
        alignItems: "center",
    },
    overlayTitle: {
        color: "#fff",
        fontSize: 24,
        fontWeight: "bold",
        textShadowColor: "rgba(0,0,0,0.5)",
        textShadowOffset: { width: 1, height: 1 },
        textShadowRadius: 3,
    },
    overlaySubtitle: {
        color: "#fff",
        fontSize: 14,
        marginTop: 4,
        textShadowColor: "rgba(0,0,0,0.5)",
        textShadowOffset: { width: 1, height: 1 },
        textShadowRadius: 3,
    },
    contentContainer: {
        marginTop: 10,
    },
    content: {
        fontSize: 14,
        color: "#333",
        lineHeight: 20,
    },
    showMore: {
        color: "#D69E2E",
        marginTop: 4,
        fontSize: 14,
        fontWeight: '500',
    },
    footer: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginTop: 15,
        paddingTop: 10,
        borderTopWidth: 1,
        borderTopColor: "#eee",
    },
    leftActions: {
        flexDirection: "row",
        alignItems: "center",
    },
    voteGroup: {
        flexDirection: "row",
        alignItems: "center",
        marginRight: 16,
        borderWidth: 1,
        borderColor: "#DFDADA",
        borderRadius: 8, // 
        padding: 5
    },
    actionButton: {
        flexDirection: "row",
        alignItems: "center",

    },
    actionText: {
        marginLeft: 4,
        fontSize: 12,
        color: "#666",
        fontWeight: '500',
    },
    voteactionText: {
        marginLeft: 2,
        marginRight: 2,

        fontSize: 12,
        color: "#666",
        fontWeight: '500',
    },
    askButton: {
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#e0e0e0',
        borderRadius: 20,
        paddingHorizontal: 10,
        paddingVertical: 6,
    },
    askButtonText: {
        marginLeft: 4,
        fontSize: 12,
        color: '#333',
    },
    linkedItemCard: {
        backgroundColor: "#FFFCF0",
        borderWidth: 1,
        borderColor: "#CC9933",
        borderRadius: 20,
        paddingVertical: 10,
        paddingHorizontal: 12,
        marginTop: 15,
        marginHorizontal: 4,
    },
    linkedItemTitleRow: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 4,
    },
    linkedItemInlineIcon: {
        marginRight: 6,
        marginTop: 1,
    },
    linkedItemContent: {
        flex: 1,
    },
    linkedItemTitleText: {
        fontSize: 16,
        fontWeight: "bold",
        color: "#000",
        textDecorationLine: "underline",
    },
    linkedItemSubtitle: {
        fontSize: 14,
        color: "#333",
        lineHeight: 20,
        marginLeft: 24, // aligns subtitle under title text, not icon
    },
});

export default SocialPostCard;
