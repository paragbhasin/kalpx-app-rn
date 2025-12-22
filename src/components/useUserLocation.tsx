// hooks/useUserLocation.js
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Location from "expo-location";
import { useEffect, useState } from "react";

export const useUserLocation = () => {
  const [locationData, setLocationData] = useState({
    city: "",
    country: "",
    timezone: "",
    latitude: null,
    longitude: null,
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        // ✅ 1️⃣ Try cached location
        const cached = await AsyncStorage.getItem("user_location");
        if (cached) {
          const parsed = JSON.parse(cached);
          setLocationData(parsed);
          setLoading(false);
          console.log("📍 Using cached location:", parsed);
          return;
        }

        // ✅ 2️⃣ Ask permission once
        let { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== "granted") {
          setError("Permission denied");
          setLoading(false);
          return;
        }

        // ✅ 3️⃣ Get coordinates
        const loc = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.High,
        });

        // ✅ 4️⃣ Reverse geocode (get city/country)
        let city = "";
        let country = "";
        try {
          const geo = await Location.reverseGeocodeAsync({
            latitude: loc.coords.latitude,
            longitude: loc.coords.longitude,
          });
          city = geo[0]?.city || geo[0]?.region || "";
          country = geo[0]?.country || "";
        } catch (geoError) {
          console.warn("⚠️ Reverse geocode failed:", geoError.message);
        }

        // ✅ 5️⃣ Get timezone
        const timezone =
          Intl.DateTimeFormat().resolvedOptions().timeZone || "Asia/Kolkata";

        const newLocation = {
          city,
          country,
          timezone,
          latitude: loc.coords.latitude,
          longitude: loc.coords.longitude,
        };

        // ✅ 6️⃣ Save + cache
        setLocationData(newLocation);
        await AsyncStorage.setItem("user_location", JSON.stringify(newLocation));
        console.log("✅ Saved location:", newLocation);
      } catch (err) {
        console.error("❌ Error fetching location:", err);
        setError("Unable to fetch location");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return { locationData, loading, error };
};



// import * as Location from "expo-location";
// import { useEffect, useState } from "react";

// export const useUserLocation = () => {
//   const [locationData, setLocationData] = useState({
//     city: "",
//     country: "",
//     timezone: "",
//     latitude: null,
//     longitude: null,
//   });

//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState<string | null>(null);

//   useEffect(() => {
//     (async () => {
//       try {
//         let { status } = await Location.requestForegroundPermissionsAsync();
//         if (status !== "granted") {
//           setError("Permission denied");
//           setLoading(false);
//           return;
//         }

//         const loc = await Location.getCurrentPositionAsync({});
//         const geo = await Location.reverseGeocodeAsync({
//           latitude: loc.coords.latitude,
//           longitude: loc.coords.longitude,
//         });

//         const city = geo[0]?.city || "";
//         const country = geo[0]?.country || "";
//         const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone || "";

//         setLocationData({
//           city,
//           country,
//           timezone,
//           latitude: loc.coords.latitude,
//           longitude: loc.coords.longitude,
//         });
//       } catch (err) {
//         console.error("Error fetching location:", err);
//         setError("Unable to fetch location");
//       } finally {
//         setLoading(false);
//       }
//     })();
//   }, []);

//   return { locationData, loading, error };
// };
