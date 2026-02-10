import { useNavigation } from "@react-navigation/native";
import React from "react";
import {
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import Icon from "react-native-vector-icons/Ionicons";

const AddNewAddress = () => {
    const navigation = useNavigation<any>();

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                    <Icon name="arrow-back" size={24} color="#1a1a1b" />
                </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
                <Text style={styles.title}>Add New Address</Text>

                {/* Form Fields */}
                <View style={styles.form}>
                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Name</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="Enter your name here"
                            placeholderTextColor="#9ca3af"
                        />
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Mobile Number</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="Enter your mobile number here"
                            placeholderTextColor="#9ca3af"
                            keyboardType="phone-pad"
                        />
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Country</Text>
                        <TouchableOpacity style={styles.selectInput}>
                            <Text style={styles.selectText}>Select</Text>
                            <Icon name="chevron-down" size={20} color="#9ca3af" />
                        </TouchableOpacity>
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>State</Text>
                        <TouchableOpacity style={styles.selectInput}>
                            <Text style={styles.selectText}>select</Text>
                            <Icon name="chevron-down" size={20} color="#9ca3af" />
                        </TouchableOpacity>
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>City</Text>
                        <TouchableOpacity style={styles.selectInput}>
                            <Text style={styles.selectText}>Select</Text>
                            <Icon name="chevron-down" size={20} color="#9ca3af" />
                        </TouchableOpacity>
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Area</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="Enter details here"
                            placeholderTextColor="#9ca3af"
                        />
                    </View>
                </View>
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
        paddingBottom: 8,
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
    title: {
        fontSize: 22,
        fontWeight: "700",
        color: "#1a1a1b",
        marginBottom: 24,
    },
    form: {
        gap: 20,
    },
    inputGroup: {
        gap: 8,
    },
    label: {
        fontSize: 14,
        color: "#6b7280",
        fontWeight: "500",
    },
    input: {
        borderWidth: 1,
        borderColor: "#e5e7eb",
        borderRadius: 8,
        paddingHorizontal: 12,
        height: 50,
        fontSize: 15,
        color: "#1a1a1b",
    },
    selectInput: {
        borderWidth: 1,
        borderColor: "#e5e7eb",
        borderRadius: 8,
        paddingHorizontal: 12,
        height: 50,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
    },
    selectText: {
        fontSize: 15,
        color: "#9ca3af",
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

export default AddNewAddress;
