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
        let { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== "granted") {
          setError("Permission denied");
          setLoading(false);
          return;
        }

        const loc = await Location.getCurrentPositionAsync({});
        const geo = await Location.reverseGeocodeAsync({
          latitude: loc.coords.latitude,
          longitude: loc.coords.longitude,
        });

        const city = geo[0]?.city || "";
        const country = geo[0]?.country || "";
        const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone || "";

        setLocationData({
          city,
          country,
          timezone,
          latitude: loc.coords.latitude,
          longitude: loc.coords.longitude,
        });
      } catch (err) {
        console.error("Error fetching location:", err);
        setError("Unable to fetch location");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return { locationData, loading, error };
};
