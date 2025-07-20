import { useUser } from '@/context/userContext';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import config from '../config.json';

const NearbyWorkersMap = ({ route }: any) => {
  
  const [region, setRegion] = useState<any>(null);
  const [workers, setWorkers] = useState([]);
  const [loading, setLoading] = useState(true);
   const { user, setUser } = useUser()

  useEffect(() => {
    const fetchWorkersNearby = async () => {
  try {
    const response = await fetch(`${config.backendUrl}/api/mission/get-workers-with-metiers-nearby`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ account_id : user?.id }),
    });

    const data = await response.json();

    if (data.success && data.workers.length > 0) {
      setWorkers(data.workers);

      // Centrer la carte autour du 1er worker pour début
      const first = data.workers[0];
      setRegion({
        latitude: parseFloat(first.lat),
        longitude: parseFloat(first.lng),
        latitudeDelta: 0.1,
        longitudeDelta: 0.1,
      });
    }

  } catch (err) {
    console.error('Erreur API :', err);
  } finally {
    setLoading(false);
  }
};

    fetchWorkersNearby();
  }, [user?.id]);

  if (loading || !region) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#00cc66" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <MapView style={styles.map} initialRegion={region}>
        {workers.map((worker: any) => (
          <Marker
            key={worker.worker_id}
            coordinate={{
              latitude: parseFloat(worker.lat),
              longitude: parseFloat(worker.lng)
            }}
            title={worker.firstname}
            description={worker.metiers?.[0]?.name || ''}
          />
        ))}
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
