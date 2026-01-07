import { StyleSheet, Dimensions } from "react-native";

const { width } = Dimensions.get("window");

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#fff",
    },
    header: {
        fontSize: 18,
        fontWeight: "bold",
        color: "#1a1a1a",
        paddingHorizontal: 20,
        paddingTop: 10,
        paddingBottom: 20,
    },
    tabContainer: {
        flexDirection: "row",
        paddingHorizontal: 20,
        marginBottom: 25,
        gap: 12,
    },
    tab: {
        paddingHorizontal: 24,
        paddingVertical: 10,
        borderRadius: 25,
        backgroundColor: "#fff",
        borderWidth: 1,
        borderColor: "#e0e0e0",
    },
    activeTab: {
        backgroundColor: "#F3EBD5",
        borderColor: "#D69E2E",
    },
    tabText: {
        fontSize: 15,
        fontWeight: "600",
        color: "#666",
    },
    activeTabText: {
        color: "#1a1a1a",
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: "bold",
        color: "#333",
        paddingHorizontal: 20,
        marginBottom: 15,
    },
    listContent: {
        paddingBottom: 20,
    },
    card: {
        backgroundColor: "#fff",
        borderRadius: 16,
        padding: 16,
        marginHorizontal: 20,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: "#F3EBD5",
        // Shadow for iOS
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        // Elevation for Android
        elevation: 2,
    },
    cardHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 12,
    },
    communityInfo: {
        flex: 1,
        marginRight: 10,
    },
    communityName: {
        fontSize: 17,
        fontWeight: "bold",
        color: "#1a1a1a",
        marginBottom: 2,
    },
    visitorCount: {
        fontSize: 13,
        color: "#888",
    },
    joinButton: {
        paddingHorizontal: 20,
        paddingVertical: 8,
        borderRadius: 12,
        backgroundColor: "#D69E2E",
    },
    joinedButton: {
        backgroundColor: "#E8E8E8",
    },
    joinText: {
        color: "#fff",
        fontSize: 14,
        fontWeight: "700",
    },
    joinedText: {
        color: "#666",
    },
    description: {
        fontSize: 14,
        color: "#444",
        lineHeight: 20,
    },
    loaderContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        paddingVertical: 40,
    },
    emptyContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        paddingVertical: 60,
    },
    emptyText: {
        fontSize: 16,
        color: "#999",
        textAlign: "center",
    },
});

export default styles;
