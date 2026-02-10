import { useNavigation } from "@react-navigation/native";
import React, { useState } from "react";
import {
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import Icon from "react-native-vector-icons/Ionicons";

const AddressListView = () => {
    const navigation = useNavigation<any>();
    const [selectedId, setSelectedId] = useState(1);

    const addresses = [
        {
            id: 1,
            name: "Ramesh Shankar",
            address: "Flat 302, Shanti Apartments, Lajpat Nagar, New Delhi – 110024",
            mobile: "9823456367",
        },
        {
            id: 2,
            name: "Ramesh Shanakr", // typo kept from mockup
            address: "Flat 302, Shanti Apartments, Lajpat Nagar, New Delhi – 110024",
            mobile: "9823456367",
        },
    ];

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                    <Icon name="arrow-back" size={24} color="#1a1a1b" />
                </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
                {addresses.map((item) => (
                    <TouchableOpacity
                        key={item.id}
                        style={styles.addressWrapper}
                        onPress={() => setSelectedId(item.id)}
                        activeOpacity={0.8}
                    >
                        {/* Custom Radio Icon */}
                        <View style={styles.radioContainer}>
                            <View style={[
                                styles.radioOutline,
                                selectedId === item.id && styles.activeRadioOutline
                            ]}>
                                {selectedId === item.id && <View style={styles.radioInner} />}
                            </View>
                        </View>

                        {/* Address Card */}
                        <View style={styles.addressCard}>
                            <View style={styles.cardHeader}>
                                <Text style={styles.userName}>{item.name}</Text>
                                <TouchableOpacity>
                                    <Icon name="pencil" size={18} color="#1a1a1b" />
                                </TouchableOpacity>
                            </View>
                            <Text style={styles.addressBody}>{item.address}</Text>
                            <Text style={styles.mobileText}>
                                Mobile: <Text style={styles.mobileValue}>{item.mobile}</Text>
                            </Text>
                        </View>
                    </TouchableOpacity>
                ))}

                {/* Add New Address Button */}
                <TouchableOpacity
                    style={styles.addBtn}
                    onPress={() => navigation.navigate("AddNewAddress")}
                >
                    <Icon name="add" size={20} color="#1a1a1b" />
                    <Text style={styles.addBtnText}>Add New Address</Text>
                </TouchableOpacity>
            </ScrollView>

            {/* Save Button */}
            <View style={styles.footer}>
                <TouchableOpacity
                    style={styles.saveBtn}
                    onPress={() => navigation.goBack()}
                >
                    <Text style={styles.saveBtnText}>Save</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#fff",
    },
    header: {
        paddingHorizontal: 16,
        paddingTop: 50,
        paddingBottom: 16,
    },
    backBtn: {
        width: 40,
        height: 40,
        justifyContent: "center",
    },
    scrollContent: {
        padding: 16,
        paddingBottom: 100,
    },
    addressWrapper: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 16,
        gap: 12,
    },
    radioContainer: {
        width: 24,
        height: 24,
        justifyContent: "center",
        alignItems: "center",
    },
    radioOutline: {
        width: 22,
        height: 22,
        borderRadius: 11,
        borderWidth: 2,
        borderColor: "#e5e7eb",
        justifyContent: "center",
        alignItems: "center",
    },
    activeRadioOutline: {
        borderColor: "#387F31",
    },
    radioInner: {
        width: 12,
        height: 12,
        borderRadius: 6,
        backgroundColor: "#387F31",
    },
    addressCard: {
        flex: 1,
        backgroundColor: "#F9F9F9", // Lighter grey background as per mockup
        borderRadius: 12,
        padding: 16,
        borderWidth: 1,
        borderColor: "#f3f4f6",
    },
    cardHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 8,
    },
    userName: {
        fontSize: 15,
        fontWeight: "700",
        color: "#1a1a1b",
    },
    addressBody: {
        fontSize: 14,
        color: "#4b5563",
        lineHeight: 20,
        marginBottom: 8,
    },
    mobileText: {
        fontSize: 14,
        color: "#4b5563",
    },
    mobileValue: {
        fontWeight: "600",
        color: "#1a1a1b",
    },
    addBtn: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        borderWidth: 1,
        borderColor: "#e5e7eb",
        borderRadius: 8,
        paddingVertical: 12,
        marginTop: 8,
        gap: 8,
    },
    addBtnText: {
        fontSize: 15,
        fontWeight: "600",
        color: "#1a1a1b",
    },
    footer: {
        position: "absolute",
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: "#fff",
        padding: 16,
        paddingBottom: 30,
    },
    saveBtn: {
        backgroundColor: "#c9a24d",
        paddingVertical: 14,
        borderRadius: 8,
        alignItems: "center",
    },
    saveBtnText: {
        color: "#fff",
        fontSize: 18,
        fontWeight: "700",
    },
});

export default AddressListView;
