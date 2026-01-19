import React, { useRef, useState, useEffect } from 'react';
import { View, StyleSheet, TouchableOpacity, ActivityIndicator, Dimensions, Image, Pressable } from 'react-native';
import { Video, ResizeMode, Audio } from 'expo-av';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';

interface VideoPostPlayerProps {
    url: string;
    poster?: string;
    aspectRatio?: number;
    width?: number;
    shouldPlay?: boolean;
}

const VideoPostPlayer: React.FC<VideoPostPlayerProps> = ({
    url,
    poster,
    aspectRatio = 1,
    width = Dimensions.get('window').width,
    shouldPlay: initialShouldPlay = false
}) => {
    const videoRef = useRef<Video>(null);
    const [status, setStatus] = useState<any>({});
    const [isMuted, setIsMuted] = useState(true);
    const [isPlaying, setIsPlaying] = useState(false); // Default to false to avoid autoplay
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        // Ensure audio works correctly
        Audio.setAudioModeAsync({
            playsInSilentModeIOS: true,
            allowsRecordingIOS: false,
            interruptionModeIOS: 1, // DoNotMix
            shouldDuckAndroid: true,
            interruptionModeAndroid: 1, // DoNotMix
            playThroughEarpieceAndroid: false,
            staysActiveInBackground: false,
        });
    }, []);

    // Effect to handle external play/pause commands (e.g. from parent visibility)
    // Removed to ensure explicit user play action as requested
    /*
    useEffect(() => {
        setIsPlaying(initialShouldPlay);
    }, [initialShouldPlay]);
    */

    const handlePlayPause = async () => {
        if (videoRef.current) {
            if (isPlaying) {
                await videoRef.current.pauseAsync();
                setIsPlaying(false);
            } else {
                // User wants volume on play
                if (isMuted) {
                    await videoRef.current.setIsMutedAsync(false);
                    setIsMuted(false);
                }
                await videoRef.current.playAsync();
                setIsPlaying(true);
            }
        }
    };

    const toggleMute = async (e: any) => {
        if (e && e.stopPropagation) e.stopPropagation();
        if (videoRef.current) {
            const newMuteState = !isMuted;
            await videoRef.current.setIsMutedAsync(newMuteState);
            setIsMuted(newMuteState);
        }
    };

    const handleSkip = async (amount: number) => {
        if (videoRef.current && status.isLoaded) {
            const newPosition = Math.max(0, Math.min(status.durationMillis || 0, status.positionMillis + amount));
            await videoRef.current.setPositionAsync(newPosition);
        }
    };

    const handleMaximize = async (e: any) => {
        e.stopPropagation();
        if (videoRef.current) {
            try {
                await videoRef.current.presentFullscreenPlayer();
            } catch (error) {
                console.error("Failed to present fullscreen player:", error);
            }
        }
    };

    const videoHeight = width / aspectRatio;

    return (
        <View style={[styles.container, { width, height: videoHeight }]}>
            {/* Blurred Background for aspect ratio mismatch */}
            {poster && (
                <Image
                    source={{ uri: poster }}
                    style={[StyleSheet.absoluteFill, { borderRadius: 16 }]}
                    blurRadius={20}
                />
            )}
            <BlurView intensity={30} style={[StyleSheet.absoluteFill, { borderRadius: 16, overflow: 'hidden' }]} tint="dark" />

            <Video
                ref={videoRef}
                source={{ uri: url }}
                posterSource={poster ? { uri: poster } : undefined}
                usePoster={!!poster}
                posterStyle={{ resizeMode: 'cover' }}
                style={styles.video}
                resizeMode={ResizeMode.CONTAIN} // Use CONTAIN for better visibility of full video
                isMuted={isMuted}
                shouldPlay={isPlaying}
                isLooping
                onPlaybackStatusUpdate={newStatus => {
                    setStatus(newStatus);
                    if (newStatus.isLoaded) {
                        setIsLoading(false);
                        // Sync mute state if changed in native player
                        if (newStatus.isMuted !== isMuted) {
                            setIsMuted(newStatus.isMuted);
                        }
                    }
                }}
                onLoadStart={() => setIsLoading(true)}
                onLoad={() => setIsLoading(false)}
            />

            <Pressable
                style={styles.overlay}
                onPress={handlePlayPause}
            >
                {isLoading && (
                    <View style={styles.centerControl}>
                        <ActivityIndicator size="large" color="#D69E2E" />
                    </View>
                )}

                {!isPlaying && !isLoading && (
                    <View style={styles.centerContainer}>
                        <Pressable
                            onPress={(e) => {
                                e.stopPropagation();
                                handleSkip(-10000);
                            }}
                            style={styles.skipButton}
                        >
                            <Ionicons name="play-back" size={24} color="#fff" />
                        </Pressable>

                        <View style={styles.centerPlayButton}>
                            <Ionicons name="play" size={40} color="#fff" style={{ marginLeft: 5 }} />
                        </View>

                        <Pressable
                            onPress={(e) => {
                                e.stopPropagation();
                                handleSkip(10000);
                            }}
                            style={styles.skipButton}
                        >
                            <Ionicons name="play-forward" size={24} color="#fff" />
                        </Pressable>
                    </View>
                )}

                <View style={styles.bottomControls}>
                    <Pressable onPress={toggleMute} style={styles.controlButton}>
                        <Ionicons
                            name={isMuted ? "volume-mute" : "volume-high"}
                            size={18}
                            color="#fff"
                        />
                    </Pressable>

                    <Pressable onPress={handleMaximize} style={[styles.controlButton, { marginLeft: 10 }]}>
                        <Ionicons name="expand" size={18} color="#fff" />
                    </Pressable>
                </View>

                {status.isLoaded && (
                    <Pressable
                        style={styles.progressBarContainer}
                        onPress={(e) => {
                            // Simple scrubbing logic: click on progress bar to jump
                            const { locationX } = e.nativeEvent;
                            const percent = locationX / width;
                            if (status.durationMillis) {
                                videoRef.current?.setPositionAsync(status.durationMillis * percent);
                            }
                        }}
                    >
                        <View
                            style={[
                                styles.progressBar,
                                { width: `${(status.positionMillis / status.durationMillis) * 100}%` }
                            ]}
                        />
                    </Pressable>
                )}
            </Pressable>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        backgroundColor: '#000',
        overflow: 'hidden',
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 16,
    },
    video: {
        width: '100%',
        height: '100%',
        borderRadius: 16,
    },
    overlay: {
        ...StyleSheet.absoluteFillObject,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 16,
    },
    centerControl: {
        justifyContent: 'center',
        alignItems: 'center',
    },
    centerContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        width: '100%',
    },
    skipButton: {
        padding: 20,
        backgroundColor: 'rgba(0,0,0,0.3)',
        borderRadius: 40,
        marginHorizontal: 15,
    },
    centerPlayButton: {
        backgroundColor: 'rgba(0,0,0,0.4)',
        borderRadius: 35,
        width: 70,
        height: 70,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.2)',
    },
    bottomControls: {
        position: 'absolute',
        bottom: 15,
        right: 15,
        flexDirection: 'row',
    },
    controlButton: {
        backgroundColor: 'rgba(0,0,0,0.6)',
        padding: 8,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.2)',
    },
    progressBarContainer: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        height: 3,
        backgroundColor: 'rgba(255,255,255,0.1)',
    },
    progressBar: {
        height: '100%',
        backgroundColor: '#D69E2E',
    },
});

export default VideoPostPlayer;
