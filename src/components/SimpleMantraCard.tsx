import React from "react";
import { View, StyleSheet, TouchableOpacity, Text } from "react-native";
import { Card } from "react-native-paper";
import { useTranslation } from "react-i18next";
import Colors from "./Colors";
import FontSize from "./FontSize";
import TextComponent from "./TextComponent";
import { black } from "react-native-paper/lib/typescript/styles/themes/v2/colors";

interface SimpleMantraCardProps {
    mantra: any;
    isDone: boolean;
    onMarkDone: () => void;
}

const SimpleMantraCard: React.FC<SimpleMantraCardProps> = ({
    mantra,
    isDone,
    onMarkDone,
}) => {
    const { t } = useTranslation();

    return (
        <Card style={styles.card}>
            <View style={styles.content}>
                <TextComponent type="semiBoldText" style={styles.header}>
                                  Today's Mantra

                </TextComponent>

                <TextComponent type="cardText" style={styles.devanagari}>
                    {mantra?.devanagari}
                </TextComponent>

    

                <TouchableOpacity
                    style={styles.button}
                    onPress={onMarkDone}
                    disabled={isDone}
                >
                    <View style={styles.checkboxContainer}>
                        {isDone ? (
                            <View style={styles.checkedBox}>
                                <Text style={styles.checkmark}>✓</Text>
                            </View>
                        ) : (
                            <View style={styles.uncheckedBox} />
                        )}
                        <TextComponent type="semiBoldText" style={styles.buttonText}>
                            {isDone
                                ? t("mantraCard.done", { defaultValue: "Done" })
                                : t("mantraCard.markDone", { defaultValue: "Mark as Done" })}
                        </TextComponent>
                    </View>
                </TouchableOpacity>
            </View>
        </Card>
    );
};

const styles = StyleSheet.create({
    card: {
        borderRadius: 6,
        backgroundColor: "#F9F3E4",
        borderWidth: 1,
        borderColor: Colors.Colors.App_theme,
        marginHorizontal: 10,
        overflow: "hidden",
    },
    content: {
        padding: 16,
    },
    header: {
     color: '#1877F2',
        fontSize: FontSize.CONSTS.FS_14,
        marginBottom: 8,
    },
    devanagari: {
        color: "#303030",
        fontSize: FontSize.CONSTS.FS_18,
        fontWeight: "600",
        marginBottom: 4,
    },
    iast: {
        color: Colors.Colors.blue_text,
        fontSize: FontSize.CONSTS.FS_14,
        marginBottom: 16,
    },
    button: {
        borderColor: Colors.Colors.Yellow,
        borderWidth: 1,
        borderRadius: 6,
        paddingVertical: 10,
        paddingHorizontal: 16,
        alignSelf: "flex-start",
    },
    checkboxContainer: {
        flexDirection: "row",
        alignItems: "center",
    },
    uncheckedBox: {
        width: 18,
        height: 18,
        borderColor: Colors.Colors.BLACK,
        borderWidth: 1,
        borderRadius: 4,
        marginRight: 10,
    },
    checkedBox: {
        width: 18,
        height: 18,
        borderRadius: 4,
        marginRight: 10,
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "green",
    },
    checkmark: {
        color: "white",
        fontSize: 12,
        fontWeight: "bold",
    },
    buttonText: {
        color: Colors.Colors.BLACK,
        fontSize: FontSize.CONSTS.FS_14,
    },
});

export default SimpleMantraCard;
