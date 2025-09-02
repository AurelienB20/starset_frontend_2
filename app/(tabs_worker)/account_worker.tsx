import { useUser } from '@/context/userContext';
import { BebasNeue_400Regular } from '@expo-google-fonts/bebas-neue';
import { LeagueSpartan_700Bold } from '@expo-google-fonts/league-spartan';
import { FontAwesome, MaterialIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { CommonActions, useNavigation } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { useEffect, useState } from 'react';
import { Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import config from '../../config.json';
import { saveMode } from '../chooseAccount';

const AccountWorkerScreen = () => {

  const [account, setAccount] = useState<any>(null)
  const navigation = useNavigation();
  const { user } = useUser(); // Utilisation du contexte pour récupérer les infos utilisateur
  const [showLogoutModal, setShowLogoutModal] = useState(false);


  let [fontsLoaded] = useFonts({
        
        BebasNeue: BebasNeue_400Regular,
        LeagueSpartanBold : LeagueSpartan_700Bold
      });

  const changeToUser = async () => {
    saveMode('user')

    navigation.dispatch(
    CommonActions.reset({
      index: 0,
      routes: [{
      name: '(tabs)',
      params: { screen: 'account' },
    }],
  })
  );
  }

  const goToAbout = async () => {
    navigation.navigate('about' as never);
  }

  const goToMatching = async () => {
    navigation.navigate('matching' as never);
  }

  const goToLanguage = async () => {
    navigation.navigate('language' as never);
  }

  const goToReceivePayout = async () => {
    navigation.navigate('receivePayout' as never);
  }

  const goToModifyAccount = async () => {
    navigation.navigate('modifyAccount' as never);
  };

  const goToConfidentiality = async () => {
    navigation.navigate('confidentiality' as never);
  };

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


  const getProfile = async () => {
    try {
      // Récupérer l'ID du compte
      const accountId = await getAccountId(); 
  
      const response = await fetch(`${config.backendUrl}/api/auth/get-account-by-id`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ accountId }),
      });
  
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
  
      const data = await response.json();
      if(data)
      {
        console.log('Account:', data.account);
        console.log('ici');
        console.log(data);
        setAccount(data.account);
      }
    } catch (error) {
      console.error('Error fetching profile picture:', error);
      return null; // Retourne null en cas d'erreur
    }
  };

  const goToDocument = async () => {
    navigation.navigate('document' as never);
  };

  useEffect(() => {
    getProfile();
  }, []);


  return (
    <ScrollView contentContainerStyle={styles.container}>

{user && Object.keys(user).length > 0 ? (
      // 🟩 TON CONTENU ACTUEL ICI (copie ton JSX à l’intérieur de ce bloc)
      <>
<View style={styles.header}>
  <View style={styles.profileInfoHeader}>
    <Text style={styles.profileName}>{account?.firstname} {account?.lastname}</Text>
    <Text style={styles.profileHandle}>@{account?.pseudo}</Text>
    <Text style={styles.profileRole}>Worker</Text>
  </View>

  <TouchableOpacity onPress={goToModifyAccount}>
    <Image
      source={{
        uri: account?.profile_picture_url
          ? account?.profile_picture_url
          : 'https://www.iconpacks.net/icons/2/free-user-icon-3296-thumb.png',
      }}
      style={styles.profilePicture}
    />
  </TouchableOpacity>
</View>

      <TouchableOpacity style={styles.balanceContainer} onPress={goToReceivePayout}>
        <Text style={styles.balanceLabel}>Tirelire</Text>
        <View style={styles.balanceCard}>
          <Text style={styles.balanceAmount}>0,00 €</Text>
          <Image 
            source={require('../../assets/images/tirelire.png')} // Assure-toi d'avoir une image ici
            style={styles.tirelire} 
          />
        </View>
      </TouchableOpacity>

      
      <TouchableOpacity 
        style={styles.matchButton} 
        onPress={goToMatching}
      >
        <Text style={styles.matchButtonText}>MATCHER MON PROFIL</Text>
      </TouchableOpacity>


<TouchableOpacity style={styles.menuItem}  onPress={goToModifyAccount}>
  <MaterialIcons name="settings" size={24} color="#000" style={styles.menuIcon} />
  <Text style={styles.menuItemText}>Paramètres</Text>
</TouchableOpacity>

<TouchableOpacity style={styles.menuItem} onPress={goToLanguage}>
  <MaterialIcons name="language" size={24} color="#000" style={styles.menuIcon} />
  <Text style={styles.menuItemText}>Langues</Text>
</TouchableOpacity>

<TouchableOpacity style={styles.menuItem} onPress={goToAbout}>
  <MaterialIcons name="info-outline" size={24} color="#000" style={styles.menuIcon} />
  <Text style={styles.menuItemText}>À propos</Text>
</TouchableOpacity>

<TouchableOpacity style={styles.menuItem} onPress={goToConfidentiality}>
  <View style={styles.iconWithText}>
    <FontAwesome name="user" size={20} color="#000" style={styles.menuIcon} />
    <Text style={styles.menuItemText}>Politique de confidentialite</Text>
  </View>
</TouchableOpacity>

<TouchableOpacity style={styles.menuItem} onPress={goToDocument}>
  <MaterialIcons name="description" size={24} color="#000" style={styles.menuIcon} />
  <Text style={styles.menuItemText}>Mes documents</Text>
</TouchableOpacity>

<TouchableOpacity style={styles.menuItem} onPress={changeToUser}>
  <MaterialIcons name="swap-horiz" size={24} color="#000" style={styles.menuIcon} />
  <Text style={styles.menuItemText}>Interface User</Text>
</TouchableOpacity>
      </>
    ) : (
      // 🟥 AFFICHAGE SI NON CONNECTÉ
      <View style={{ alignItems:'center', padding: 20 }}>
        <Text style={{ fontSize: 24, fontWeight: 'bold', color: '#008000', marginBottom: 30, textAlign: 'center' }}>
          Pas encore de compte
        </Text>

        <TouchableOpacity
          style={{
            backgroundColor: '#28a745',
            paddingVertical: 12,
            paddingHorizontal: 30,
            borderRadius: 25,
            marginBottom: 15,
          }}
          onPress={() => navigation.navigate('creation' as never)}
        >
          <Text style={{ color: 'white', fontSize: 16, fontWeight: 'bold' }}>S'inscrire</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={{
            backgroundColor: '#ffc107',
            paddingVertical: 12,
            paddingHorizontal: 30,
            borderRadius: 25,
          }}
          onPress={() => navigation.navigate('connexion' as never)}
        >
          <Text style={{ color: 'white', fontSize: 16, fontWeight: 'bold' }}>Se connecter</Text>
        </TouchableOpacity>
      </View>
    )}

    
     


      
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    padding: 20,
    marginTop : 40
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  profilePicture: {
    width: 70,
    height: 70,
    borderRadius: 35,
  },
  profileInfo: {
    marginLeft: 10,
  },
  profileName: {
    fontSize: 26,
    fontFamily : 'LeagueSpartanBold',
    color: '#000',
  },
  profileHandle: {
    fontSize: 12,
    color: '#666',
  },
  balanceContainer: {
    marginBottom: 20,
  },
  balanceLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
  },
  balanceCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#7ED957',
    padding: 15,
    borderRadius: 10,
    
  },
  balanceAmount: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  walletIcon: {
    width: 40,
    height: 40,
  },
 
  menuItemText: {
    fontSize: 16,
    color: '#000',
  },
  premiereColor:{
    color: '#7ED957'
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    paddingVertical: 10,
    borderTopWidth: 1,
    borderColor: '#E0E0E0',
    position: 'absolute',
    bottom: 0,
    left: 0,
  },
  footerIcon: {
    padding: 10,
  },
  footerProfileImage: {
    width: 30,
    height: 30,
    borderRadius: 15,
  },

  typeOAccount: {
    fontSize: 30,
    fontWeight : 'bold',
    color : 'black'
  },

  rightHeader : {
    marginBottom: 20,
  },

  header: {
    flexDirection: 'row',
    justifyContent : 'space-between',

    marginRight : 30,
    marginTop : 10,
    marginBottom : 50
  },

  tirelire: {
    width: 40,  // Taille de l’icône tirelire
    height: 40,
    marginRight: 10, // Espacement avec le montant
  },

  menuIcon: {
    marginRight: 10,
  },
  menuItem: {
    flexDirection: 'row', // Pour afficher icône + texte en ligne
    alignItems: 'center',
    backgroundColor: '#F0F0F0',
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
  },

  iconWithText: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  profileInfoHeader: {
  flexDirection: 'column',
  justifyContent: 'center',
  flex: 1,
},

profileRole: {
  fontSize: 20,
  fontFamily : 'LeagueSpartanBold',
  color : 'black'
},

matchButton: {
  backgroundColor: '#00A651', // vert foncé
  paddingVertical: 15,
  borderRadius: 10,
  alignItems: 'center',
  marginBottom: 20,
},
matchButtonText: {
  color: '#fff',
  fontSize: 18,
  fontFamily: 'LeagueSpartanBold',
},


});

export default AccountWorkerScreen;