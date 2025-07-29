import { HapticTab } from '@/components/HapticTab';
import PrestationConfirmation from '@/components/PrestationConfirmationModal';
import TabBarBackground from '@/components/ui/TabBarBackground';
import { Colors } from '@/constants/Colors';
import { useUser } from '@/context/userContext';
import { useColorScheme } from '@/hooks/useColorScheme';
import { FontAwesome5, Ionicons } from '@expo/vector-icons';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { CommonActions, useNavigation } from '@react-navigation/native';
import { Tabs } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import { Image, Modal, Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import config from '../../config.json';


const Tab = createBottomTabNavigator();

function TabBarIcon(props: { name: React.ComponentProps<typeof FontAwesome>['name']; color: string; }) {
  return <FontAwesome size={28} style={{ marginBottom: -3 }} {...props} />;
}

export default function TabNavigator() {
  const [isPopupVisible, setPopupVisible] = useState(false);
    const navigation = useNavigation();
    const colorScheme = useColorScheme();
    const [errorMessage, setErrorMessage] = useState('');
    const [prestationModal, setPrestationModal] = useState(false);
    const [prestation, setPrestation] = useState(null);
    const [plannedPrestations, setPlannedPrestations] = useState<any[]>([]);
    const [shownPrestationIds, setShownPrestationIds] = useState<any[]>([]);
    const [isTime, setIsTime] = useState(false);
    const { user } = useUser();

    const intervalRef : any = useRef<NodeJS.Timeout | null>(null);
   
    const loadPlannedPrestations = async () => {
  const workerId = user?.worker;
  if (!workerId) {
    console.log('Aucun worker ID trouvé');
    return;
  }

  try {
    console.log('Chargement des prestations pour le worker :', workerId);

    const response = await fetch(`${config.backendUrl}/api/mission/get-worker-planned-prestation`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ worker_id: workerId }),
    });

    const data = await response.json();
    console.log('Réponse reçue du serveur :', data);

    if (response.ok) {
      console.log('Prestations planifiées chargées : ',data.plannedPrestations);
      setPlannedPrestations(data.plannedPrestations);
    } else {
      console.warn('Réponse inattendue ou format incorrect :', data);
    }
  } catch (error) {
    console.error('Erreur lors du chargement des prestations :', error);
    setErrorMessage('Une erreur est survenue.');
  }
};
const combineDateTime = (dateStr: string, timeStr?: string) => {
  const date = new Date(dateStr);
  const [hours, minutes, seconds] = (timeStr ?? '23:59:00').split(':');
  date.setHours(+hours, +minutes, +seconds || 0, 0);
  return date;
};

const checkIfPrestationIsDue = () => {
  const now = new Date();
  console.log('⏰ Vérification des prestations à', now.toISOString());
  console.log(plannedPrestations)

  for (let p of plannedPrestations) {
    const start = combineDateTime(p.start_date, p.start_time);
    const end = combineDateTime(p.end_date || p.start_date, p.end_time || '23:59:00');

    console.log(`➡️ Prestation ${p.id}`);
    console.log(`   - Statut       : ${p.status}`);
    console.log(`   - Début réel   : ${start.toISOString()}`);
    console.log(`   - Fin réelle   : ${end.toISOString()}`);
    console.log(`   - Déjà montré ? : ${shownPrestationIds.includes(p.id)}`);

    const startsSoon = now < start && (start.getTime() - now.getTime()) <= 3 * 60 * 1000; // dans moins de 10 minutes

    if (
      p.status === 'inProgress' &&
      !shownPrestationIds.includes(p.id) &&
      (
        (now >= start && now < end) || startsSoon
      )
    ) {
      console.log(`✅ Affichage du popup pour la prestation ${p.id}`);
      setPrestation(p.id);
      setPrestationModal(true);
      setShownPrestationIds((prev) => [...prev, p.id]);
      console.log(shownPrestationIds)
      break; // Un seul popup à la fois
    }
  }
};



useEffect(() => {
  if (!user?.worker) {
    console.log('Aucun worker détecté dans useEffect.');
    return;
  }

  console.log("Initialisation : chargement des prestations et démarrage de l'interval");

  // Charger les prestations une seule fois
  loadPlannedPrestations();

  // Démarrer l’interval pour vérifier régulièrement
  intervalRef.current = setInterval(() => {
    checkIfPrestationIsDue();
  }, 30000); // toutes les 30s

  return () => {
    if (intervalRef.current) {
      console.log("Nettoyage de l'interval");
      clearInterval(intervalRef.current);
    }
  };
}, [user?.worker]);

  

    const goToUserTabs = () => {
      navigation.dispatch(
        CommonActions.reset({
          index: 0,
          routes: [{ name: '(tabs)' }],
        })
      );
    };

    const goToWorkerTabs = () => {
      navigation.dispatch(
        CommonActions.reset({
          index: 0,
          routes: [{ name: '(tabs_worker)' }],
        })
      );
    };


  return (
    <>
    <PrestationConfirmation
      visible={prestationModal}
      onClose={() => {
          setPrestationModal(false);
          setIsTime(false);
        }}
      prestation={prestation}
    />
  
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: '#00A65A',
        headerShown: false,
        tabBarButton: HapticTab,
        tabBarBackground: TabBarBackground,
        tabBarStyle: Platform.select({
          ios: {
            // Use a transparent background on iOS to show the blur effect
            position: 'absolute',
          },
          default: {},
        }),
      }}>
      <Tabs.Screen
        name="croissance"
        options={{
          title: '',
          tabBarIcon: ({ color }) => (
            <Image
              source={require('../../assets/images/croissance_icone.png')}
              style={{ width: 28, height: 28, tintColor: color }}
              resizeMode="contain"
            />
          )
        }}
      />
      <Tabs.Screen
        name="jobs"
        
        options={{
          title: '',
          tabBarIcon: ({ color }) => (
            <Image
              source={require('../../assets/images/tableau.png')}
              style={{ width: 28, height: 28, tintColor: color }}
              resizeMode="contain"
            />
          )
        }}
      />
      <Tabs.Screen
      name="addJob"
      options={{
      title: '',
      tabBarIcon: ({ color }) => (
      <View style={{
        width: 32,
        height: 32,
        borderRadius: 8,
        backgroundColor: '#FFF',
        borderColor: color,
        borderWidth: 2,
        alignItems: 'center',
        justifyContent: 'center',
      }}>
        <FontAwesome name="plus" size={18} color={color} />
      </View>
    ),
  }}
/>
      <Tabs.Screen
        name="conversation"
        
        options={{
          title: '',
          tabBarIcon: ({ color }) => <TabBarIcon name="envelope-o" color={color} />,
        }}
      />
      <Tabs.Screen
  name="account_worker"
  options={{
    title: '',
    tabBarButton: (props: any) => {
      const CustomTabBarButton = React.forwardRef<any, any>((innerProps, ref) => (
        <Pressable
          ref={ref}
          {...innerProps}
          onLongPress={() => {
            setPopupVisible(true);
            console.log(isPopupVisible);
          }}
          onPress={innerProps.onPress}
          style={innerProps.style}
        >
          <Ionicons
            name="person"
            size={28}
            color={
              innerProps.accessibilityState?.selected
                ? Colors[colorScheme ?? 'light'].tint
                : 'gray'
            }
          />
        </Pressable>
      ));
    
      return <CustomTabBarButton {...props} />;
    },
    
    
  }}
/>   
    </Tabs>
    <Modal
      animationType="slide"
      transparent
      visible={isPopupVisible}
      onRequestClose={() => setPopupVisible(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
        <Pressable onPress={goToUserTabs} style={styles.widthMax}>
            <View style={[styles.changeContainer, styles.userContainer]}>
              <FontAwesome5 name="user-circle" size={26} color="black" style={styles.leftIcon} />
              <Text style={styles.modalText}>USER</Text> 
            </View>
          </Pressable>

          <Pressable onPress={goToWorkerTabs} style={styles.widthMax}>
            <View style={[styles.changeContainer, styles.workerContainer]}>
              <FontAwesome5 name="hard-hat" size={24} color="white" style={styles.leftIcon} />
              <Text style={styles.modalText}>WORKER</Text> 
            </View>
          </Pressable>
          <Pressable onPress={() => setPopupVisible(false)}>
            <Text style={styles.closeButton}>Fermer</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },

  modalContent: {
    backgroundColor: 'white',
    padding: 20,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    alignItems: 'center',
    width : '100%'
  },

  modalText: {
    fontSize: 24,
    
    margin: 12,
    fontFamily: 'BebasNeue',
    color : 'white'
  },

  closeButton: {
    marginTop : 10,
    fontSize: 16,
    color: 'blue',
    fontWeight : 'bold'
  },

  changeContainer : {
    
    margin: 5,
    marginHorizontal : 20,
    alignItems : "center",
    justifyContent : "center",
    borderRadius : 20,
    width : '100%',
    
  },

  userContainer : {
    backgroundColor : 'gold'//'#F2C700'
  },

  workerContainer : {
    backgroundColor : '#00A65A'
  },

  widthMax : {
    width : '100%',
    
    justifyContent : 'center',
    alignItems : 'center'
  },

  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  
  icon: {
    marginRight: 10,
  },

  leftIcon: {
    position: 'absolute',
    left: 20, // ou un autre padding si besoin
  },

});