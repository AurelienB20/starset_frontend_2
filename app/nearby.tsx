import { useUser } from '@/context/userContext';
import { useNavigation } from '@react-navigation/native'; // 👈 Ajout
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Image, StyleSheet, Text, View } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import config from '../config.json';

const NearbyWorkersMap = ({ route }: any) => {
  const [region, setRegion] = useState<any>(null);
  const [workers, setWorkers] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useUser();
  const navigation = useNavigation(); // 👈 Ajout navigation

  useEffect(() => {
    const fetchWorkersNearby = async () => {
      try {
        const response = await fetch(`${config.backendUrl}/api/mission/get-workers-with-metiers-nearby`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ account_id: user?.id }),
        });

        const data = await response.json();

        if (data.success && data.workers.length > 0) {
          setWorkers(data.workers);
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

  // 👇 Fonction de navigation vers prestationView
  const goToPrestationViewWithId = (id: string) => {
    navigation.navigate({
      name: 'prestationView',
      params: { id },
    } as never);
  };

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
            longitude: parseFloat(worker.lng),
          }}
          onPress={() => goToPrestationViewWithId(worker.metiers?.[0]?.id)}
        >
          <View style={{ alignItems: 'center' }}>
            <Image
              source={{
                uri: worker.profile_picture_url ||  'https://www.iconpacks.net/icons/2/free-user-icon-3296-thumb.png',
              }}
              style={{
                width: 50,
                height: 50,
                borderRadius: 25,
                borderWidth: 2,
                borderColor: 'white',
              }}
            />
            <View
              style={{
                backgroundColor: 'white',
                paddingHorizontal: 6,
                paddingVertical: 2,
                borderRadius: 6,
                marginTop: 4,
              }}
            >
              <Text style={{ fontSize: 12 }}>{worker.firstname}</Text>
            </View>
          </View>
        </Marker>
        
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
