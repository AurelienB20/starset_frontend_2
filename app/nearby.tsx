import { useUser } from '@/context/userContext';
import { useNavigation } from '@react-navigation/native';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Platform, StyleSheet, View } from 'react-native';
import MapView, { PROVIDER_GOOGLE } from 'react-native-maps';
import config from '../config.json';

const NearbyWorkersMap = () => {
  const [workers, setWorkers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const { user } = useUser();
  const navigation = useNavigation();

  useEffect(() => {
    const fetchWorkersNearby = async () => {
      try {
        const response = await fetch(`${config.backendUrl}/api/mission/get-workers-with-metiers-nearby`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ account_id: user?.id }),
        });

        const data = await response.json();
        if (data.success && data.workers.length > 0) {
          setWorkers(data.workers);
        }
      } catch (err) {
        console.error('Erreur API :', err);
      } finally {
        setLoading(false);
      }
    };

    fetchWorkersNearby();
  }, [user?.id]);

  const goToPrestationViewWithId = (id: string) => {
    navigation.navigate({
      name: 'prestationView',
      params: { id },
    } as never);
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#00cc66" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <MapView
        style={styles.map}
        {...(Platform.OS === 'android' ? { provider: PROVIDER_GOOGLE } : {})}
        
        initialRegion={{
          latitude: 48.8566, // Paris (hardcodé)
          longitude: 2.3522,
          latitudeDelta: 0.05,
          longitudeDelta: 0.05,
        }}
      >
        
      </MapView>
    </View>
  );
};

export default NearbyWorkersMap;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
