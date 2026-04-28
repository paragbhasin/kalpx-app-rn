// utils/storage.js
import AsyncStorage from "@react-native-async-storage/async-storage";

/**
 * Save user actions into AsyncStorage
 * @param {Object} action - The action object to store
 */
export async function saveUserAction(action) {
  try {
    const key = "userActions";

    // Get existing actions
    const existingData = await AsyncStorage.getItem(key);
    let actions = existingData ? JSON.parse(existingData) : [];

    // Append new action
    actions.push(action);

    // Save updated list
    await AsyncStorage.setItem(key, JSON.stringify(actions));

    return actions; // return updated list
  } catch (error) {
    console.error("Error saving user action:", error);
  }
}

/**
 * Get all stored user actions
 */
export async function getUserActions() {
  try {
    const key = "userActions";
    const existingData = await AsyncStorage.getItem(key);
    return existingData ? JSON.parse(existingData) : [];
  } catch (error) {
    console.error("Error fetching user actions:", error);
    return [];
  }
}

/**
 * Clear all user actions
 */
export async function clearUserActions() {
  try {
    const key = "userActions";
    await AsyncStorage.removeItem(key);
  } catch (error) {
    console.error("Error clearing user actions:", error);
  }
}
