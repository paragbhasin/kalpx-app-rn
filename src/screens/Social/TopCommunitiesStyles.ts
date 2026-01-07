import { StyleSheet } from "react-native";

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#fff",
    },
    listContent: {
        paddingHorizontal: 20,
        paddingTop: 20,
        paddingBottom: 40,
    },
    row: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 25,
    },
    rankText: {
        fontSize: 18,
        color: "#666",
        width: 20,
        textAlign: "left",
    },
    avatar: {
        width: 50,
        height: 50,
        borderRadius: 30,
        backgroundColor: "#f0f0f0",
        marginHorizontal: 10,
    },
    communityName: {
        fontSize: 18,
        fontWeight: "600",
        color: "#1a1a1a",
        flex: 1,
    },
    paginationContainer: {
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "center",
        paddingVertical: 20,
        gap: 15,
    },
    pageNumber: {
        fontSize: 18,
        color: "#888",
        paddingHorizontal: 8,
    },
    activePageNumber: {
        color: "#D69E2E",
        fontWeight: "bold",
    },
    navArrow: {
        fontSize: 20,
        color: "#888",
    },
    loaderContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
    },
});

export default styles;
