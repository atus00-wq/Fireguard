import { useState, useEffect } from 'react';

interface LocationData {
  latitude: number;
  longitude: number;
  accuracy: number;
  timestamp: number;
}

export default function useLocation() {
  const [location, setLocation] = useState<LocationData | null>(null);
  const [locationEnabled, setLocationEnabled] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let watchId: number | null = null;

    const startLocationTracking = () => {
      if (!navigator.geolocation) {
        setError('Geolocation is not supported by this browser');
        setLocationEnabled(false);
        return;
      }

      if (!locationEnabled) return;

      try {
        // First try to get the current position
        navigator.geolocation.getCurrentPosition(
          (position) => {
            setLocation({
              latitude: position.coords.latitude,
              longitude: position.coords.longitude,
              accuracy: position.coords.accuracy,
              timestamp: position.timestamp,
            });
            setError(null);
          },
          (err) => {
            console.error('Error getting current position:', err);
            setError(`Location error: ${err.message}`);
            
            if (err.code === 1) { // PERMISSION_DENIED
              setLocationEnabled(false);
            }
          },
          {
            enableHighAccuracy: true,
            timeout: 15000,
            maximumAge: 60000,
          }
        );

        // Then set up continuous watching
        watchId = navigator.geolocation.watchPosition(
          (position) => {
            setLocation({
              latitude: position.coords.latitude,
              longitude: position.coords.longitude,
              accuracy: position.coords.accuracy,
              timestamp: position.timestamp,
            });
            setError(null);
          },
          (err) => {
            console.error('Error watching position:', err);
            setError(`Location error: ${err.message}`);
            
            if (err.code === 1) { // PERMISSION_DENIED
              setLocationEnabled(false);
              if (watchId !== null) {
                navigator.geolocation.clearWatch(watchId);
                watchId = null;
              }
            }
          },
          {
            enableHighAccuracy: true,
            timeout: 15000,
            maximumAge: 60000,
          }
        );
      } catch (err) {
        console.error('Exception in geolocation:', err);
        setError(`Location exception: ${err instanceof Error ? err.message : String(err)}`);
      }
    };

    if (locationEnabled) {
      startLocationTracking();
    }

    return () => {
      if (watchId !== null) {
        navigator.geolocation.clearWatch(watchId);
      }
    };
  }, [locationEnabled]);

  const toggleLocation = () => {
    setLocationEnabled(!locationEnabled);
  };

  return { location, locationEnabled, toggleLocation, error };
}
