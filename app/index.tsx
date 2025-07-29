import { useAllWorkerPlannedPrestation, useAllWorkerPrestation, useUser } from '@/context/userContext';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';

import React, { useEffect, useState } from 'react';
import { Image, StyleSheet, View } from 'react-native';
import config from '../config.json';

const StarsetScreen = () => {
  const [progress, setProgress] = useState(0);
  const [showGif, setShowGif] = useState(true); // État pour afficher le GIF ou l'image statique
  const { user, setUser } = useUser()
  const { setAllWorkerPrestation } = useAllWorkerPrestation()
  const { allWorkerPlannedPrestation, setAllWorkerPlannedPrestation } = useAllWorkerPlannedPrestation()
  const navigation = useNavigation();

  const getAccountId = async () => {
    try {
      const account_id = await AsyncStorage.getItem('account_id');
      if (account_id !== null) {
        return account_id;
      }
    } catch (e) {
      console.error('Erreur lors de la récupération du type de compte', e);
    }
  };

  const getWorkerId = async () => {
    try {
      const worker_id = await AsyncStorage.getItem('worker_id');
      if (worker_id !== null) {
        return worker_id;
      }
    } catch (e) {
      console.error('Erreur lors de la récupération du type de compte', e);
    }
  };

  const getPrestation = async () =>{
        const workerId = await getWorkerId()
        try {
          const response = await fetch(`${config.backendUrl}/api/mission/get-worker-planned-prestation`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ worker_id:workerId }),
        });
      const data = await response.json();
      console.log("ici dans la page index")
      console.log("ici dans la page index")
      console.log(data.plannedPrestations)
      setAllWorkerPlannedPrestation(data.plannedPrestations)
        
      }
      catch (error) {
        
      }
    }

  const getAllWorkerPrestation = async () => {
    try {
      const account_id = await getAccountId();
      const response = await fetch(`${config.backendUrl}/api/mission/get-all-prestation`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ account_id }),
      });

      if (!response.ok) {
        throw new Error('Network response was not ok');
      }

      const data = await response.json();
      if(data)
      {
        setAllWorkerPrestation(data.prestations);
      }

    } catch (error) {
      console.error('Une erreur est survenue lors de la récupération des prestations:', error);
    }
  };

  const getProfile = async () => {
  try {
    const accountId = await getAccountId();
    console.log('[getProfile] Account ID récupéré :', accountId);

    if (!accountId) {
      console.warn('[getProfile] Aucun accountId trouvé. Suppression et redirection.');
      await AsyncStorage.clear();
      navigation.navigate('isVisitor' as never);
      return;
    }

    const response = await fetch(`${config.backendUrl}/api/auth/get-account-by-id-crypt`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ accountId }),
    });

    console.log('[getProfile] Réponse reçue (status):', response.status);

    if (!response.ok) throw new Error('Erreur réseau');

    const data = await response.json();
    console.log('[getProfile] Données reçues :', data);

    if (!data || !data.account || !data.account.id) {
      console.warn('[getProfile] Compte invalide ou supprimé. Suppression et redirection.');
      await AsyncStorage.clear();
      navigation.navigate('isVisitor' as never);
      return;
    }

    setUser(data.account);
    console.log('[getProfile] Utilisateur mis à jour dans le contexte.');

    if (!data.account.verified) {
      console.log('[getProfile] Compte non vérifié. Redirection vers connexion.');
      navigation.navigate('isVisitor' as never);
    } else {
      console.log('[getProfile] Compte vérifié. Redirection vers (tabs).');
      navigation.navigate('(tabs)' as never);
    }
  } catch (error) {
    console.error('[getProfile] Erreur attrapée :', error);
    await AsyncStorage.clear();
    navigation.navigate('connexion' as never);
  }
};


  useEffect(() => {
  let interval: any;
  let gifTimeout: any;
  let hasLoaded = false;

  interval = setInterval(() => {
    setProgress((prev) => {
      if (prev < 100) {
        return prev + 25;
      } else {
        clearInterval(interval);

        if (!hasLoaded) {
          hasLoaded = true; // ✅ stop les appels multiples
          getProfile();
          getAllWorkerPrestation();
          getPrestation()
        }

        return prev;
      }
    });
  }, 1000);

  gifTimeout = setTimeout(() => {
    setShowGif(false);
  }, 3000);

  return () => {
    clearInterval(interval);
    clearTimeout(gifTimeout);
  };
}, [navigation]);

  return (
    <View style={styles.container}>
      
      <Image
        source={require('../assets/images/logo_gif_hd.gif')}
        style={{ width: '80%', height: 200 }}
        resizeMode="contain"
        
      />

      
      {/* Remplacer par un objet de style et non un tableau 
      <AnimatedCircularProgress
        size={120}
        width={10}
        fill={progress}
        tintColor="#3498db"
        backgroundColor="#e0e0e0"
        style={styles.circularProgress} // Utilisation d'un objet style directement
      />*/}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  logo: {
    width: '80%',
    resizeMode: 'contain',
    marginBottom: 50,
  },
  circularProgress: {
    marginTop: 50, // Aucun tableau ici, juste un objet style
  },
});

export default StarsetScreen;
