import { HapticTab } from '@/components/HapticTab';
import PrestationConfirmation from '@/components/PrestationConfirmationModal';
import TabBarBackground from '@/components/ui/TabBarBackground';
import { Colors } from '@/constants/Colors';
import { useUser } from '@/context/userContext';
import { useColorScheme } from '@/hooks/useColorScheme';
import { BebasNeue_400Regular } from '@expo-google-fonts/bebas-neue';
import { FontAwesome, FontAwesome5, Ionicons } from '@expo/vector-icons';
import { CommonActions, useNavigation } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Tabs } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import { Image, Modal, Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import config from '../../config.json';

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const [isPopupVisible, setPopupVisible] = useState(false);
  const navigation = useNavigation();
  let [fontsLoaded] = useFonts({
      BebasNeue: BebasNeue_400Regular,
  });
  const [prestationModal, setPrestationModal] = useState(false);
      const [prestation, setPrestation] = useState(null);
      const [plannedPrestations, setPlannedPrestations] = useState<any[]>([]);
      const [shownPrestationIds, setShownPrestationIds] = useState<Set<number>>(new Set());
      const [isTime, setIsTime] = useState(false);
      const { user } = useUser();
       const [errorMessage, setErrorMessage] = useState('');


  const intervalRef : any = useRef<NodeJS.Timeout | null>(null);
     
      const loadPlannedPrestations = async () => {
        const workerId = user?.worker;
        if (!workerId) return;
    
        try {
          const response = await fetch(`${config.backendUrl}/api/mission/get-worker-planned-prestation`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ worker_id: workerId }),
          });
    
          const data = await response.json();
    
          if (response.ok && Array.isArray(data.plannedPrestations)) {
            setPlannedPrestations(data.plannedPrestations);
          }
        } catch (error) {
          console.error('Erreur lors du chargement des prestations :', error);
          setErrorMessage('Une erreur est survenue.');
        }
      };
    
      // Vérifie toutes les 30s si une prestation doit déclencher le popup
      const checkIfPrestationIsDue = () => {
        const now = new Date();
    
        for (let p of plannedPrestations) {
          const start = new Date(p.start_date);
          if (
            now > start &&
            p.status === 'waiting' &&
            !shownPrestationIds.has(p.id)
          ) {
            setPrestation(p.id);
            setPrestationModal(true);
            setShownPrestationIds((prev) => {
              const updated = new Set(prev);
              updated.add(p.id);
              return updated;
            });
            break; // on n’affiche qu’un seul popup à la fois
          }
        }
      };
    
      useEffect(() => {
        if (!user?.worker) return;
    
        const init = async () => {
          await loadPlannedPrestations(); // charge les prestations
          checkIfPrestationIsDue();       // vérifie immédiatement après
        };
      
        init(); // lance l'init
    
        // Démarrer l’interval pour vérifier régulièrement
        intervalRef.current = setInterval(() => {
          checkIfPrestationIsDue();
        }, 30000); // toutes les 30s
    
        return () => {
          if (intervalRef.current) {
            clearInterval(intervalRef.current);
          }
        };
      }, [user?.worker]); // `plannedPrestations` fixé au chargement initial
  
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

  function TabBarIcon(props: { name: React.ComponentProps<typeof FontAwesome>['name']; color: string; }) {
    return <FontAwesome size={28} style={{ marginBottom: -3 }} {...props} />;
  }
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
        name="search"
        options={{
          title: '',
          tabBarIcon: ({ color }) => (
            <Image
              source={require('../../assets/images/maison.png')}
              style={{ width: 28, height: 28, tintColor: color }}
              resizeMode="contain"
            />
          )
        }}
      />
      <Tabs.Screen
        name="index"
        options={{
          title: '',
          tabBarIcon: ({ color }) => (
            <Image
              source={require('../../assets/images/loupe.png')}
              style={{ width: 28, height: 28, tintColor: color }}
              resizeMode="contain"
            />
          )
        }}
      />  
      
      <Tabs.Screen
        name="ia"
        options={{
          title: '',
          tabBarIcon: ({ color }) => (
            <Image
              source={require('../../assets/images/Appel.png')}
              style={{ width: 34, height: 34 }}
              resizeMode="contain"
            />
          )
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
  name="account"
  options={{
    title: '',
    tabBarButton: (props: any) => {
      const CustomTabBarButton = React.forwardRef<any, any>((innerProps, ref) => (
        <Pressable
          ref={ref}
          {...innerProps}
          onLongPress={() => {
            setPopupVisible(true);
            console.log(123);
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

