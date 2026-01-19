import React, { useState, useEffect } from "react";
import { useRoute } from "@react-navigation/native";
import { useTranslation } from "react-i18next";

import {
    View,
    Text,
    Image,
    TouchableOpacity,
    StyleSheet,
    Dimensions,
    Pressable,
    ImageBackground,
    ScrollView,
    Platform,
    Modal,
    SafeAreaView,
    Share,
} from "react-native";
import Carousel from "react-native-reanimated-carousel";
import { Ionicons, MaterialCommunityIcons, SimpleLineIcons } from "@expo/vector-icons";
import moment from "moment";
import { useNavigation } from "@react-navigation/native";
import ReportModal from "./ReportModal";
import { COMMUNITY_BACKGROUNDS } from "../utils/CommunityAssets";
import { getRawPracticeObject } from "../utils/getPracticeObjectById";
import MantraCard from "./MantraCard";
import SankalpCard from "./SankalpCard";
import DailyPracticeDetailsCard from "./DailyPracticeDetailsCard";
import VideoPostPlayer from "./VideoPostPlayer";

const { width: screenWidth } = Dimensions.get("window");
const MEDIA_WIDTH = screenWidth - 24;
const MEDIA_MARGIN = 12;



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
    isVisible?: boolean;
}

const getLinkedItemText = (linkedItem: any, t: any) => {
    if (!linkedItem || !linkedItem.type) return "";

    const typeParts = linkedItem.type.split(":");
    const category = typeParts[0]?.trim().toLowerCase();
    const itemType = typeParts[1]?.trim().toLowerCase();

    // Check if it's from general or a specific category
    const isGeneral = category === "general";

    if (itemType === "mantra") {
        return isGeneral
            ? t("community.post.linkedMantraGeneral")
            : t("community.post.linkedPracticeSpecific");
    } else if (itemType === "sankalp") {
        return isGeneral
            ? t("community.post.linkedSankalpGeneral")
            : t("community.post.linkedSankalpSpecific");
    } else if (itemType === "practice") {
        return isGeneral
            ? t("community.post.linkedPracticeGeneral")
            : t("community.post.linkedPracticeSpecific");
    }

    return t("community.post.linkedPracticeSpecific");
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
    isVisible,
}) => {
    const { t, i18n } = useTranslation();
    const navigation: any = useNavigation();
    const route = useRoute();

    const getTranslatedContent = (item: any, field: string) => {
        const language = i18n.language;
        // If current locale is English or no translation available, return original
        if (language === "en" || !item[`resolved_${field}`]) {
            return item[field];
        }
        // Return translated content if available
        return item[`resolved_${field}`] || item[field];
    };

    const translatedTitle = getTranslatedContent(post, 'title');
    const translatedContent = getTranslatedContent(post, 'content');
    const translatedCommunityName = getTranslatedContent(post, 'community_name') || post.community?.name;

    const [isExpanded, setIsExpanded] = useState(false);
    const [showMenu, setShowMenu] = useState(false);
    const [isReportModalVisible, setIsReportModalVisible] = useState(false);

    // Use post.score if available, otherwise fallback to a stable random number for realistic look
    // We use a ref or state that initializes once to keep the random number stable for this post instance
    const [randomUpvotes] = useState(() => Math.floor(Math.random() * 950) + 50);
    const [randomShares] = useState(() => Math.floor(Math.random() * 20) + 10);

    const getEffectiveUpvotes = (p: any) => {
        const val = p.score !== undefined ? p.score : (p.upvote_count || 0);
        return val || randomUpvotes;
    };

    const getEffectiveShares = (p: any) => {
        return p.share_count || randomShares;
    };

    const [upvoteCount, setUpvoteCount] = useState(() => getEffectiveUpvotes(post));
    const [shareCount, setShareCount] = useState(() => getEffectiveShares(post));
    const [hasUserVoted, setHasUserVoted] = useState<'up' | 'down' | null>(
        post.user_vote === 1 ? 'up' : post.user_vote === -1 ? 'down' : null
    );

    useEffect(() => {
        setUpvoteCount(getEffectiveUpvotes(post));
        setShareCount(getEffectiveShares(post));
        setHasUserVoted(post.user_vote === 1 ? 'up' : post.user_vote === -1 ? 'down' : null);
    }, [post.score, post.upvote_count, post.share_count, post.user_vote]);
    const [showLinkedDetail, setShowLinkedDetail] = useState(false);
    const [selectedLinkedPractice, setSelectedLinkedPractice] = useState<any>(null);
    const [linkedCardType, setLinkedCardType] = useState<'mantra' | 'sankalp' | 'practice' | null>(null);

    // formatted date
    const timeAgo = post.created_at ? moment(post.created_at).fromNow() : "";

    // images/slides resolution
    const getImagesData = () => {
        const language = i18n.language;
        if (language !== "en" && post.resolved_slide_layouts && post.resolved_slide_layouts.length > 0) {
            return post.resolved_slide_layouts;
        }
        if (post.slide_layouts && post.slide_layouts.length > 0) return post.slide_layouts;
        if (post.slides && post.slides.length > 0) return post.slides;
        if (post.ai_output?.slides && post.ai_output.slides.length > 0) return post.ai_output.slides;
        if (post.images && post.images.length > 0) return post.images;
        if (post.hook_image) return [{ image: post.hook_image }];
        return [];
    };

    const imagesData = getImagesData();

    // truncated content
    const content = translatedContent || "";
    const shouldTruncate = content.length > 100;

    const [cardWidth, setCardWidth] = useState(screenWidth - 8); // Updated base width for padding: 4
    const [activeIndex, setActiveIndex] = useState(0);
    const [loadedIndices, setLoadedIndices] = useState<number[]>([0]);

    const initialSlide = imagesData[0];
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

    const getSlideBlocks = (slideIndex: number) => {
        const language = i18n.language;

        // 1. Check for resolved_slide_layouts (translated content)
        if (
            language !== "en" &&
            post.resolved_slide_layouts &&
            post.resolved_slide_layouts[slideIndex] &&
            post.resolved_slide_layouts[slideIndex].resolved_blocks
        ) {
            return post.resolved_slide_layouts[slideIndex].resolved_blocks;
        }

        // 2. Check if post has slide_layouts (new structure from community posts)
        if (
            post.slide_layouts &&
            post.slide_layouts[slideIndex] &&
            post.slide_layouts[slideIndex].layout &&
            post.slide_layouts[slideIndex].layout.blocks
        ) {
            return post.slide_layouts[slideIndex].layout.blocks;
        }

        // 3. Check if post has slides with layout blocks (from explore posts)
        if (
            post.slides &&
            post.slides[slideIndex] &&
            post.slides[slideIndex].layout &&
            post.slides[slideIndex].layout.blocks
        ) {
            return post.slides[slideIndex].layout.blocks;
        }

        // 4. Check if post has ai_output with slides (alternative structure)
        if (
            post.ai_output &&
            post.ai_output.slides &&
            post.ai_output.slides[slideIndex] &&
            post.ai_output.slides[slideIndex].layout &&
            post.ai_output.slides[slideIndex].layout.blocks
        ) {
            return post.ai_output.slides[slideIndex].layout.blocks;
        }

        // Fallback to item itself if it has blocks (for single image slides/images field)
        const item = imagesData[slideIndex];
        if (item) {
            return item.resolved_blocks || item.layout?.blocks || item.blocks || [];
        }

        return [];
    };

    const renderCarouselItem = ({ item, index: slideIndex }: { item: any; index: number }) => {
        const blocks = getSlideBlocks(slideIndex);
        const imageUrl = item.image_url || item.image || (typeof item === 'string' ? item : null);
        const isVideo = imageUrl?.toLowerCase().endsWith('.mp4') || imageUrl?.toLowerCase().endsWith('.mov');
        const isLoaded = loadedIndices.includes(slideIndex);

        return (
            <View style={[styles.imageContainer, { width: MEDIA_WIDTH }]}>
                {imageUrl && isLoaded && (
                    isVideo ? (
                        <VideoPostPlayer
                            url={imageUrl}
                            aspectRatio={aspectRatio}
                            width={MEDIA_WIDTH}
                            shouldPlay={isVisible && activeIndex === slideIndex}
                        />
                    ) : (
                        <Image
                            source={{ uri: imageUrl }}
                            style={styles.postImage}
                            resizeMode="cover"
                        />
                    )
                )}
                {blocks.map((block: any, index: number) => {
                    const blockText = block.resolved_text || block.text;
                    if (!blockText) return null;

                    const scaledFontSize = (block.fontSize || 24) * (MEDIA_WIDTH / 420);
                    const isCentered = block.align === 'center';
                    const lineCount = blockText.split('\n').length;

                    return (
                        <View
                            key={block.id || index}
                            style={{
                                position: 'absolute',
                                left: isCentered ? 0 : `${block.x}%`,
                                top: `${block.y}%`,
                                width: isCentered ? MEDIA_WIDTH : `${Math.max(40, 100 - block.x)}%`,
                                pointerEvents: 'none',
                                transform: [
                                    { translateY: -(scaledFontSize * lineCount * 0.6) }
                                ],
                                paddingHorizontal: 15, // Side padding to prevent edge touching
                                justifyContent: 'center',
                                alignItems: isCentered ? 'center' : block.align === 'right' ? 'flex-end' : 'flex-start',
                            }}
                        >
                            <Text
                                style={{
                                    color: block.color || '#ffffff',
                                    fontSize: scaledFontSize,
                                    textAlign: block.align || 'center',
                                    fontFamily: block.fontFamily || 'System',
                                    fontWeight: '700',
                                    textShadowColor: 'rgba(0,0,0,1)',
                                    textShadowOffset: { width: 1, height: 1 },
                                    textShadowRadius: 6,
                                    opacity: (block.opacity || 100) / 100,
                                    lineHeight: scaledFontSize * 1.2,
                                }}
                            >
                                {blockText}
                            </Text>
                        </View>
                    );
                })}
                {item.overlayText && !blocks.length && (
                    <View style={styles.overlay}>
                        <Text style={styles.overlayTitle}>{item.overlayTitle}</Text>
                        <Text style={styles.overlaySubtitle}>{item.overlaySubtitle}</Text>
                    </View>
                )}
            </View>
        );
    };

    const handleLinkedItemPress = () => {
        if (!post.linked_item || !post.linked_item.id) return;

        const { id } = post.linked_item;
        const { data: practiceData, type: resolvedType } = getRawPracticeObject(id, post.linked_item);

        setSelectedLinkedPractice(practiceData);
        setLinkedCardType(resolvedType);
        setShowLinkedDetail(true);
    };

    const handleAddToMyPractice = (practice: any, type: string) => {
        setShowLinkedDetail(false);
        navigation.navigate('TrackerEdit', {
            selectedmantra: practice,
            autoSelectCategory: type === 'mantra' ? 'daily-mantra' : type === 'sankalp' ? 'daily-sankalp' : (practice.category || 'sanatan')
        });
    };

    const handleShare = async () => {
        try {
            let shareUrl;

            // If post has explore_post_id, use explore URL
            if (post.explore_post_id) {
                shareUrl = `https://kalpx.com/og/render?path=/explore/${post.explore_post_id}`;
            } else {
                const communitySlug =
                    post.community_slug || post.community?.slug || post.slug || (route.params as any)?.slug;
                const currentView = "home"; // Default to home since RN doesn't typically use query params for view state
                shareUrl = `https://kalpx.com/og/render?path=/community/${communitySlug}/post/${post.id}?view=${currentView}`;
            }

            const title = post.title || "KalpX Community Post";
            const currentContent = post.content || "";
            const text = currentContent
                ? `${title} - ${currentContent.slice(0, 100)}...`
                : title;

            const result = await Share.share({
                title: title,
                message: `${text}\n${shareUrl}`, // Android: Text + URL
                url: shareUrl, // iOS: URL field
            });

            if (result.action === Share.sharedAction) {
                // On iOS, result.activityType indicates if it was actually shared or just an action was taken
                // On Android, sharedAction is returned even if the user just invokes the sheet usually, but strictly it means 'completed'
                // We'll increment only if we think it succeeded.
                if (result.activityType) {
                    // Shared with activity type of result.activityType
                    setShareCount(prev => prev + 1);
                    onShare?.();
                } else {
                    // Shared
                    setShareCount(prev => prev + 1);
                    onShare?.();
                }
            }
        } catch (error: any) {
            console.error("Share failed:", error.message);
        }
    };

    return (
        <View
            style={styles.card}
            onLayout={(event) => {
                const { width } = event.nativeEvent.layout;
                setCardWidth(width);
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
                            {translatedCommunityName || t("community.defaultCommunityName")}
                        </Text>
                        <Text style={styles.timeAgo}>{timeAgo}</Text>
                    </View>
                </TouchableOpacity>
                <View style={styles.headerActions}>
                    {route.name !== 'CommunityDetail' && (

                        <TouchableOpacity
                            style={[styles.joinButton, post.is_joined && styles.joinedButton]}
                            onPress={onJoin}
                        >
                            <Text style={[styles.joinButtonText, post.is_joined && styles.joinedText]}>
                                {post.is_joined ? t("community.joined") : t("community.join")}
                            </Text>
                        </TouchableOpacity>
                    )}

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
                                    {post.is_saved ? t("community.postMenu.unsave") : t("community.postMenu.save")}
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
                                <Text style={styles.menuItemText}>{t("community.postMenu.hide")}</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.menuItem, { borderBottomWidth: 0 }]}
                                onPress={() => {
                                    setShowMenu(false);
                                    setIsReportModalVisible(true);
                                }}
                            >
                                <Ionicons name="flag-outline" size={20} color="#FF3B30" />
                                <Text style={[styles.menuItemText, { color: "#FF3B30" }]}>{t("community.postMenu.report")}</Text>
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
            {translatedTitle && <Text style={styles.title}>{translatedTitle}</Text>}

            {/* Carousel or Single Image */}
            {imagesData.length > 0 && (
                <View style={{ height: imageHeight, width: MEDIA_WIDTH, marginHorizontal: MEDIA_MARGIN, marginTop: 4, borderRadius: 16, overflow: 'hidden' }}>
                    {imagesData.length > 1 ? (
                        <Carousel
                            loop={false}
                            width={MEDIA_WIDTH}
                            height={imageHeight}
                            data={imagesData}
                            scrollAnimationDuration={1000}
                            onSnapToItem={(index) => {
                                setActiveIndex(index);
                                if (!loadedIndices.includes(index)) {
                                    setLoadedIndices(prev => [...prev, index]);
                                }
                            }}
                            renderItem={renderCarouselItem}
                        />
                    ) : (
                        renderCarouselItem({ item: imagesData[0], index: 0 })
                    )}
                    {/* Dot Indicators - Reddit Style */}
                    {imagesData.length > 1 && (
                        <View style={styles.paginationContainer}>
                            {imagesData.map((_: any, index: number) => (
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
                    {imagesData.length > 1 && (
                        <View style={styles.slideCounter}>
                            <Text style={styles.slideCounterText}>{activeIndex + 1}/{imagesData.length}</Text>
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
                            <Text style={styles.showMore}>{isExpanded ? t("community.post.showLess") : t("community.post.showMore")}</Text>
                        </TouchableOpacity>
                    )}
                </View>
            ) : null}
            {post.linked_item && (
                <TouchableOpacity
                    style={styles.linkedItemCard}
                    onPress={handleLinkedItemPress}
                >
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
                            {getLinkedItemText(post.linked_item, t)}
                        </Text>
                    </View>
                </TouchableOpacity>
            )}
            {/* Footer / Interaction Bar */}
            <View style={styles.footer}>
                <View style={styles.leftActions}>
                    <View style={styles.voteGroup}>
                        <TouchableOpacity style={styles.voteButton} onPress={() => {
                            if (hasUserVoted === 'up') {
                                setUpvoteCount(prev => Math.max(0, prev - 1));
                                setHasUserVoted(null);
                            } else {
                                if (hasUserVoted === 'down') {
                                    setUpvoteCount(prev => prev + 2);
                                } else {
                                    setUpvoteCount(prev => prev + 1);
                                }
                                setHasUserVoted('up');
                            }
                            onUpvote?.();
                        }}>
                            <MaterialCommunityIcons
                                name={hasUserVoted === 'up' ? "arrow-up-bold" : "arrow-up-bold-outline"}
                                size={22}
                                color={hasUserVoted === 'up' ? "#FF4500" : "#666"}
                            />
                        </TouchableOpacity>

                        <Text style={styles.voteCountText}>{upvoteCount}</Text>

                        <TouchableOpacity style={styles.voteButton} onPress={() => {
                            if (hasUserVoted === 'down') {
                                setUpvoteCount(prev => prev + 1);
                                setHasUserVoted(null);
                            } else {
                                if (hasUserVoted === 'up') {
                                    setUpvoteCount(prev => Math.max(0, prev - 2));
                                } else {
                                    setUpvoteCount(prev => Math.max(0, prev - 1));
                                }
                                setHasUserVoted('down');
                            }
                            onDownvote?.();
                        }}>
                            <MaterialCommunityIcons
                                name={hasUserVoted === 'down' ? "arrow-down-bold" : "arrow-down-bold-outline"}
                                size={22}
                                color={hasUserVoted === 'down' ? "#7193FF" : "#666"}
                            />
                        </TouchableOpacity>
                    </View>

                    <TouchableOpacity style={styles.pillButton} onPress={onComment}>
                        <Ionicons name="chatbubble-outline" size={18} color="#666" />
                        <Text style={styles.pillButtonText}>{post.comment_count || 0}</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.pillButton} onPress={handleShare}>
                        <Ionicons name="share-social-outline" size={18} color="#666" />
                        <Text style={styles.pillButtonText}>{shareCount}</Text>

                    </TouchableOpacity>
                </View>

                <TouchableOpacity style={styles.askButton} onPress={onAskQuestion}>
                    <Ionicons name="help-circle-outline" size={20} color="#333" />
                    <Text style={styles.askButtonText}>{t("community.post.askQuestion")}</Text>
                </TouchableOpacity>
            </View>

            {/* Full Screen Linked Item Modal */}
            <Modal
                visible={showLinkedDetail}
                animationType="slide"
                transparent={false}
                onRequestClose={() => setShowLinkedDetail(false)}
            >
                <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }}>
                    <View style={styles.overlayHeader}>
                        <TouchableOpacity
                            onPress={() => setShowLinkedDetail(false)}
                            style={styles.backButton}
                        >
                            <Ionicons name="arrow-back" size={26} color="#000" />
                        </TouchableOpacity>
                    </View>

                    <ScrollView
                        style={{ flex: 1 }}
                        contentContainerStyle={styles.overlayScrollContent}
                        showsVerticalScrollIndicator={false}
                    >
                        {selectedLinkedPractice && (
                            <>
                                {linkedCardType === 'mantra' && (
                                    <MantraCard
                                        practiceTodayData={{
                                            started: { mantra: true },
                                            ids: { mantra: selectedLinkedPractice.id }
                                        }}
                                        onPressChantMantra={() => { }}
                                        DoneMantraCalled={() => { }}
                                        viewOnly={true}
                                        onAddToMyPractice={() => handleAddToMyPractice(selectedLinkedPractice, 'mantra')}
                                    />
                                )}
                                {linkedCardType === 'sankalp' && (
                                    <SankalpCard
                                        practiceTodayData={{
                                            started: { sankalp: true },
                                            ids: { sankalp: selectedLinkedPractice.id }
                                        }}
                                        onPressStartSankalp={() => { }}
                                        onCompleteSankalp={() => { }}
                                        viewOnly={true}
                                        onAddToMyPractice={() => handleAddToMyPractice(selectedLinkedPractice, 'sankalp')}
                                    />
                                )}
                                {linkedCardType === 'practice' && (
                                    <DailyPracticeDetailsCard
                                        mode="view"
                                        data={selectedLinkedPractice}
                                        item={{
                                            name: post.linked_item?.category || "Practice",
                                            key: post.linked_item?.category
                                        }}
                                        onChange={() => { }}
                                        onBackPress={() => setShowLinkedDetail(false)}
                                        isLocked={true}
                                        selectedCount={null}
                                        onSelectCount={() => { }}
                                        onAddToMyPractice={() => handleAddToMyPractice(selectedLinkedPractice, 'practice')}
                                    />
                                )}
                            </>
                        )}
                    </ScrollView>
                </SafeAreaView>
            </Modal>



        </View>

    );
};

const styles = StyleSheet.create({
    card: {
        backgroundColor: "#fff",
        marginVertical: 0,
        marginHorizontal: 0,
        paddingBottom: 4,
        borderBottomWidth: 8,
        borderBottomColor: "#F0F2F5",
    },
    header: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingHorizontal: 12,
        paddingTop: 12,
        marginBottom: 4,
    },
    userInfo: {
        flexDirection: "row",
        alignItems: "center",
        flex: 1,
    },
    avatarContainer: {
        width: 32, // Smaller avatar like Reddit
        height: 32,
        justifyContent: "center",
        alignItems: "center",
        marginRight: 8,
        borderRadius: 16,
        overflow: "hidden",
    },
    avatarBackground: {
        width: 32,
        height: 32,
        justifyContent: "center",
        alignItems: "center",
    },
    avatar: {
        width: 24,
        height: 24,
        borderRadius: 12,
        backgroundColor: "transparent",
    },
    communityName: {
        fontSize: 13,
        fontWeight: "700",
        color: "#1c1c1c",
    },
    timeAgo: {
        fontSize: 12,
        color: "#7c7c7c",
        marginLeft: 4,
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
        paddingVertical: 4,
        borderRadius: 20,
        marginRight: 8,
    },
    joinButtonText: {
        color: "#fff",
        fontWeight: "700",
        fontSize: 12,
    },
    joinedButton: {
        backgroundColor: "#EDEFF1",
    },
    joinedText: {
        color: "#1c1c1c",
    },

    title: {
        fontSize: 18, // Reddit style bold title
        fontWeight: "700",
        color: "#1c1c1c",
        lineHeight: 24,
        marginHorizontal: 12,
        marginBottom: 8,
        marginTop: 4,
    },
    imageContainer: {
        flex: 1, // Fill the carousel item height
        borderRadius: 16, // Reddit style rounded media
        overflow: "hidden",
        backgroundColor: "#F6F7F8",
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
        borderRadius: 16,
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
        marginTop: 8,
        paddingHorizontal: 12,
    },
    content: {
        fontSize: 13,
        color: "#1c1c1c",
        lineHeight: 18,
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
        marginTop: 8,
        paddingBottom: 8,
        paddingHorizontal: 12,
    },
    leftActions: {
        flexDirection: "row",
        alignItems: "center",
        gap: 8, // Pill gap
    },
    voteGroup: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#EDEFF1",
        borderRadius: 20,
        paddingHorizontal: 4,
        paddingVertical: 2,
    },
    voteButton: {
        padding: 6,
    },
    voteCountText: {
        fontSize: 13,
        fontWeight: "700",
        color: "#1c1c1c",
        marginHorizontal: 2,
    },
    pillButton: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#EDEFF1",
        borderRadius: 20,
        paddingHorizontal: 12,
        paddingVertical: 8,
    },
    pillButtonText: {
        marginLeft: 6,
        fontSize: 13,
        fontWeight: "700",
        color: "#1c1c1c",
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
        borderRadius: 12, // slightly less rounded for reddit feel
        paddingVertical: 12,
        paddingHorizontal: 12,
        marginTop: 15,
        marginHorizontal: 16,
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
        fontSize: 14,
        color: "#000",
        textDecorationLine: "underline",
    },
    linkedItemSubtitle: {
        fontSize: 12,
        color: "#333",

        marginLeft: 24, // aligns subtitle under title text, not icon
    },
    overlayHeader: {
        paddingHorizontal: 16,
        paddingTop: 10,
        paddingBottom: 5,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
    },
    backButton: {
        padding: 4,
    },
    overlayScrollContent: {
        paddingBottom: 40,
        alignItems: 'center',
    },
});

export default SocialPostCard;
