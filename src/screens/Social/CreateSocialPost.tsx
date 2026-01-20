import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import api from "../../Networks/axios";
import { BASE_IMAGE_URL } from "../../Networks/baseURL";
import {
    SafeAreaView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    Modal,
    Image,
    ActivityIndicator,
} from "react-native";
import Ionicons from "react-native-vector-icons/Ionicons";
import { useNavigation, useRoute } from "@react-navigation/native";
import { useDispatch, useSelector } from "react-redux";
import { Dropdown } from "react-native-element-dropdown";
import * as ImagePicker from "expo-image-picker";
import { createPost, uploadMedia, fetchCommunities, updatePost } from "./actions";

const CreateSocialPost = () => {
    const { t, i18n } = useTranslation();
    const dispatch = useDispatch<any>();
    const navigation = useNavigation<any>();
    const route = useRoute<any>();
    const { data: communities } = useSelector((state: any) => state.communities);

    const editPostData = route.params?.post;
    const isEditing = !!editPostData;

    // Initial community from route params (if navigated from CommunityDetail)
    const initialCommunity = editPostData?.community?.slug || editPostData?.community_slug || route.params?.communitySlug || "";

    const [selectedCommunity, setSelectedCommunity] = useState(initialCommunity);
    const [title, setTitle] = useState(editPostData?.title || "");
    const [body, setBody] = useState(editPostData?.content || "");

    const ensureAbsoluteUrl = (url: any) => {
        if (!url || typeof url !== 'string') return "";
        if (url.startsWith("http") || url.startsWith("data:")) return url;
        // Prepend BASE_IMAGE_URL if it's a relative path
        return `${BASE_IMAGE_URL}${url.startsWith("/") ? "" : "/"}${url}`;
    };

    const extractImageUrl = (img: any) => {
        if (!img) return "";
        if (typeof img === 'string') return img;
        return img.image_url || img.image || img.uri || img.url || "";
    };

    const mapImages = (images: any[], mediaUrl?: string) => {
        if (!images && !mediaUrl) return [];
        const mapped = (images || []).map((img: any, idx: number) => {
            const rawUrl = extractImageUrl(img);
            const imgUrl = ensureAbsoluteUrl(rawUrl);
            return {
                id: `existing_${idx}`,
                uri: imgUrl,
                publicUrl: imgUrl,
                status: "success",
                type: "image/jpeg"
            };
        }).filter(m => m.uri);

        if (mediaUrl) {
            const videoUrl = ensureAbsoluteUrl(mediaUrl);
            mapped.push({
                id: "existing_video",
                uri: videoUrl,
                publicUrl: videoUrl,
                status: "success",
                type: "video/mp4"
            });
        }
        return mapped;
    };

    useEffect(() => {
        if (isEditing && editPostData?.id) {
            const loadPostDetails = async () => {
                setIsLoading(true);
                try {
                    const res = await api.get(`/posts/${editPostData.id}/?lang=${i18n.language}`);
                    const fullPost = res.data;
                    setTitle(fullPost.title || "");
                    setBody(fullPost.content || "");
                    setSelectedCommunity(fullPost.community?.slug || fullPost.community_slug || "");

                    if (fullPost.images || fullPost.media_url) {
                        setMediaFiles(mapImages(fullPost.images, fullPost.media_url));
                    }
                } catch (err) {
                    console.error("Failed to load post details:", err);
                } finally {
                    setIsLoading(false);
                }
            };
            loadPostDetails();
        }
    }, [isEditing, editPostData?.id, i18n.language]);
    const [mediaFiles, setMediaFiles] = useState<any[]>(() => {
        if (!editPostData) return [];
        return mapImages(editPostData.images, editPostData.media_url);
    });
    const [link, setLink] = useState("");
    const [isLinkModalVisible, setIsLinkModalVisible] = useState(false);
    const [tempLink, setTempLink] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [postError, setPostError] = useState<string | null>(null);

    useEffect(() => {
        dispatch(fetchCommunities());
    }, [dispatch]);

    const communityData = (communities || []).map((c: any) => ({
        label: c.name,
        value: c.slug,
        avatar: c.avatar_url || c.avatar,
    }));

    const handlePost = async () => {
        if (isPostDisabled) return;

        setIsLoading(true);
        setPostError(null);

        try {
            const payload: any = {
                title: title.trim(),
                content: body.trim() || link,
                community: selectedCommunity,
                is_flagged: true,
                is_pinned: true,
                tags: [],
            };

            const successfulMedia = mediaFiles.filter(m => m.status === "success");
            const videoFile = successfulMedia.find(m => m.type?.startsWith("video/"));

            if (videoFile) {
                payload.media_url = videoFile.publicUrl;
                payload.images = [];
            } else if (successfulMedia.length > 0) {
                payload.images = successfulMedia.map(m => m.publicUrl);
                payload.media_url = "";
            } else {
                payload.images = [];
                payload.media_url = "";
            }

            if (isEditing) {
                await dispatch(updatePost(editPostData.id, payload));
            } else {
                await dispatch(createPost(payload));
            }
            navigation.goBack();
        } catch (err: any) {
            setPostError(err.message || "Failed to save post");
        } finally {
            setIsLoading(false);
        }
    };

    const pickImage = async () => {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();

        if (status !== 'granted') {
            alert('Sorry, we need camera roll permissions to make this work!');
            return;
        }

        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ['images', 'videos'],
            allowsMultipleSelection: true,
            quality: 0.8,
        });

        if (!result.canceled) {
            const newMediaItems = result.assets.map(asset => ({
                uri: asset.uri,
                id: asset.assetId || Date.now().toString() + Math.random().toString(36).substr(2, 5),
                status: "uploading",
                type: asset.type,
                name: asset.fileName || `media_${Date.now()}.jpg`,
                fileSize: asset.fileSize || 0,
            }));

            setMediaFiles(prev => [...prev, ...newMediaItems]);

            // Start uploads for new items
            newMediaItems.forEach(async (item) => {
                try {
                    const uploadResult = await dispatch(uploadMedia({
                        uri: item.uri,
                        name: item.name,
                        type: item.type === 'video' ? 'video/mp4' : 'image/jpeg',
                        size: item.fileSize
                    }));

                    setMediaFiles(current =>
                        current.map(m => m.id === item.id
                            ? { ...m, status: "success", publicUrl: uploadResult.publicUrl }
                            : m
                        )
                    );
                } catch (error) {
                    setMediaFiles(current =>
                        current.map(m => m.id === item.id
                            ? { ...m, status: "error" }
                            : m
                        )
                    );
                }
            });
        }
    };

    const removeMedia = (id: any) => {
        setMediaFiles(mediaFiles.filter(m => m.id !== id));
    };

    const addLink = () => {
        if (tempLink.trim()) {
            setLink(tempLink);
            setIsLinkModalVisible(false);
            setTempLink("");
        }
    };

    const isPostDisabled = !selectedCommunity || !title.trim() || isLoading || mediaFiles.some(m => m.status === 'uploading');

    return (
        <SafeAreaView style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.headerIcon}>
                    <Ionicons name="close-outline" size={28} color="#000" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>{isEditing ? "Edit Post" : "Create Post"}</Text>
                <TouchableOpacity
                    onPress={handlePost}
                    disabled={isPostDisabled}
                    style={[styles.postButton, isPostDisabled && styles.postButtonDisabled]}
                >
                    {isLoading ? (
                        <ActivityIndicator size="small" color="#FFF" />
                    ) : (
                        <Text style={[styles.postButtonText, isPostDisabled && styles.postButtonTextDisabled]}>Post</Text>
                    )}
                </TouchableOpacity>
            </View>

            <KeyboardAvoidingView
                behavior={Platform.OS === "ios" ? "padding" : "height"}
                style={{ flex: 1 }}
            >
                <ScrollView contentContainerStyle={styles.content}>
                    {/* Community Picker */}
                    <Dropdown
                        style={styles.dropdown}
                        placeholderStyle={styles.placeholderStyle}
                        selectedTextStyle={styles.selectedTextStyle}
                        inputSearchStyle={styles.inputSearchStyle}
                        iconStyle={styles.iconStyle}
                        data={communityData}
                        search
                        maxHeight={300}
                        labelField="label"
                        valueField="value"
                        placeholder="Choose a community"
                        searchPlaceholder="Search communities..."
                        value={selectedCommunity}
                        onChange={item => setSelectedCommunity(item.value)}
                        renderLeftIcon={() => (
                            <View style={styles.communityIconPlaceholder}>
                                <Ionicons name="people-outline" size={18} color="#666" />
                            </View>
                        )}
                    />

                    {/* Title Input */}
                    <TextInput
                        style={styles.titleInput}
                        placeholder="Title"
                        placeholderTextColor="#999"
                        value={title}
                        onChangeText={setTitle}
                        multiline
                    />

                    {/* Body Input */}
                    <TextInput
                        style={styles.bodyInput}
                        placeholder="Body text (optional)"
                        placeholderTextColor="#999"
                        value={body}
                        onChangeText={setBody}
                        multiline
                        textAlignVertical="top"
                    />

                    {/* Media Preview */}
                    {mediaFiles.length > 0 && (
                        <View style={styles.imagePreviewContainer}>
                            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                                {mediaFiles.map((item) => (
                                    <View key={item.id} style={styles.imageWrapper}>
                                        <Image source={{ uri: item.uri }} style={styles.previewImage} />
                                        {item.type?.startsWith("video/") && (
                                            <View style={styles.videoOverlay}>
                                                <Ionicons name="play-circle" size={40} color="#FFF" />
                                            </View>
                                        )}
                                        {item.status === 'uploading' && (
                                            <View style={styles.uploadOverlay}>
                                                <ActivityIndicator size="small" color="#FFF" />
                                            </View>
                                        )}
                                        {item.status === 'error' && (
                                            <View style={[styles.uploadOverlay, { backgroundColor: 'rgba(255,0,0,0.4)' }]}>
                                                <Ionicons name="alert-circle" size={24} color="#FFF" />
                                            </View>
                                        )}
                                        <TouchableOpacity
                                            style={styles.removeImageButton}
                                            onPress={() => removeMedia(item.id)}
                                        >
                                            <Ionicons name="close-circle" size={24} color="rgba(0,0,0,0.6)" />
                                        </TouchableOpacity>
                                    </View>
                                ))}
                                <TouchableOpacity style={styles.addImageButton} onPress={pickImage}>
                                    <Ionicons name="add" size={32} color="#666" />
                                </TouchableOpacity>
                            </ScrollView>
                        </View>
                    )}

                    {/* Link Preview */}
                    {link !== "" && (
                        <View style={styles.linkPreviewContainer}>
                            <View style={styles.linkContent}>
                                <Ionicons name="link-outline" size={20} color="#007AFF" />
                                <Text style={styles.linkText} numberOfLines={1}>{link}</Text>
                            </View>
                            <TouchableOpacity onPress={() => setLink("")}>
                                <Ionicons name="close-circle" size={20} color="#666" />
                            </TouchableOpacity>
                        </View>
                    )}

                    {postError && (
                        <Text style={styles.errorText}>{postError}</Text>
                    )}
                </ScrollView>

                {/* Bottom Action Bar */}
                <View style={styles.bottomBar}>
                    <TouchableOpacity style={styles.actionButton} onPress={pickImage}>
                        <Ionicons name="image-outline" size={24} color="#007AFF" />
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.actionButton} onPress={pickImage}>
                        <Ionicons name="videocam-outline" size={24} color="#007AFF" />
                    </TouchableOpacity>
                    {/* <TouchableOpacity style={styles.actionButton} onPress={() => setIsLinkModalVisible(true)}>
                        <Ionicons name="link-outline" size={24} color="#007AFF" />
                    </TouchableOpacity> */}
                    {/* <TouchableOpacity style={styles.actionButton} onPress={() => alert("Poll builder logic will be added")}>
                        <Ionicons name="list-outline" size={24} color="#007AFF" />
                    </TouchableOpacity>
                    <View style={{ flex: 1 }} />
                    <TouchableOpacity style={styles.actionButton}>
                        <Ionicons name="ellipsis-horizontal-outline" size={20} color="#666" />
                    </TouchableOpacity> */}
                </View>
            </KeyboardAvoidingView>

            {/* Link Modal */}
            {/* <Modal
                visible={isLinkModalVisible}
                transparent
                animationType="fade"
                onRequestClose={() => setIsLinkModalVisible(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>Add a Link</Text>
                        <TextInput
                            style={styles.modalInput}
                            placeholder="Enter URL"
                            value={tempLink}
                            onChangeText={setTempLink}
                            autoFocus
                        />
                        <View style={styles.modalActions}>
                            <TouchableOpacity 
                                onPress={() => setIsLinkModalVisible(false)}
                                style={styles.modalButton}
                            >
                                <Text style={styles.modalButtonText}>Cancel</Text>
                            </TouchableOpacity>
                            <TouchableOpacity 
                                onPress={addLink}
                                style={[styles.modalButton, styles.modalButtonPrimary]}
                            >
                                <Text style={styles.modalButtonTextPrimary}>Add</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal> */}
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#FFF",
    },
    header: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: "#EEE",
        marginTop: 45
    },
    headerIcon: {
        padding: 4,
    },
    headerTitle: {
        fontSize: 16,
        fontWeight: "bold",
        color: "#000",
    },
    postButton: {
        backgroundColor: "#007AFF",
        paddingHorizontal: 16,
        paddingVertical: 6,
        borderRadius: 20,
        minWidth: 70,
        height: 32,
        justifyContent: 'center',
        alignItems: 'center',
    },
    postButtonDisabled: {
        backgroundColor: "#F0F0F0",
    },
    postButtonText: {
        color: "#FFF",
        fontWeight: "bold",
        fontSize: 14,
    },
    postButtonTextDisabled: {
        color: "#999",
    },
    content: {
        padding: 16,
    },
    dropdown: {
        height: 40,
        backgroundColor: "#F6F7F8",
        borderRadius: 20,
        paddingHorizontal: 12,
        marginBottom: 20,
        width: "100%",
    },
    placeholderStyle: {
        fontSize: 14,
        color: "#1a1a1b",
        fontWeight: "500",
    },
    selectedTextStyle: {
        fontSize: 14,
        color: "#1a1a1b",
        fontWeight: "500",
    },
    iconStyle: {
        width: 20,
        height: 20,
    },
    inputSearchStyle: {
        height: 40,
        fontSize: 14,
    },
    communityIconPlaceholder: {
        marginRight: 8,
    },
    titleInput: {
        fontSize: 20,
        fontWeight: "bold",
        color: "#1a1a1b",
        marginBottom: 16,
        padding: 0,
    },
    bodyInput: {
        fontSize: 15,
        color: "#1a1a1b",
        minHeight: 150,
        padding: 0,
    },
    imagePreviewContainer: {
        marginTop: 16,
        paddingBottom: 8,
    },
    imageWrapper: {
        position: "relative",
        marginRight: 12,
    },
    previewImage: {
        width: 120,
        height: 120,
        borderRadius: 8,
        backgroundColor: "#F0F0F0",
    },
    uploadOverlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0,0,0,0.3)',
        borderRadius: 8,
        justifyContent: 'center',
        alignItems: 'center',
    },
    videoOverlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0,0,0,0.2)',
        borderRadius: 8,
    },
    removeImageButton: {
        position: "absolute",
        top: -8,
        right: -8,
        backgroundColor: "#FFF",
        borderRadius: 12,
    },
    addImageButton: {
        width: 120,
        height: 120,
        borderRadius: 8,
        borderWidth: 2,
        borderColor: "#EEE",
        borderStyle: "dashed",
        justifyContent: "center",
        alignItems: "center",
        marginRight: 12,
    },
    linkPreviewContainer: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        padding: 12,
        backgroundColor: "#F6F7F8",
        borderRadius: 8,
        marginTop: 16,
    },
    linkContent: {
        flexDirection: "row",
        alignItems: "center",
        flex: 1,
    },
    linkText: {
        marginLeft: 8,
        fontSize: 14,
        color: "#007AFF",
        textDecorationLine: "underline",
    },
    errorText: {
        color: '#FF3B30',
        fontSize: 12,
        marginTop: 8,
        textAlign: 'center',
    },
    bottomBar: {
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderTopWidth: 1,
        borderTopColor: "#EEE",
        backgroundColor: "#FFF",
    },
    actionButton: {
        padding: 8,
        marginRight: 8,
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: "rgba(0,0,0,0.5)",
        justifyContent: "center",
        alignItems: "center",
        padding: 20,
    },
    modalContent: {
        width: "100%",
        backgroundColor: "#FFF",
        borderRadius: 12,
        padding: 20,
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: "bold",
        marginBottom: 16,
        textAlign: "center",
    },
    modalInput: {
        borderWidth: 1,
        borderColor: "#EEE",
        borderRadius: 8,
        padding: 12,
        fontSize: 16,
        marginBottom: 20,
    },
    modalActions: {
        flexDirection: "row",
        justifyContent: "flex-end",
    },
    modalButton: {
        paddingHorizontal: 16,
        paddingVertical: 10,
        marginLeft: 12,
    },
    modalButtonPrimary: {
        backgroundColor: "#007AFF",
        borderRadius: 20,
    },
    modalButtonText: {
        color: "#666",
        fontWeight: "600",
    },
    modalButtonTextPrimary: {
        color: "#FFF",
        fontWeight: "600",
    },
});

export default CreateSocialPost;
