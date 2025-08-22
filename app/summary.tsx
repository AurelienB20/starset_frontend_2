import { useCart, useUser } from '@/context/userContext';
import { useNavigation } from '@react-navigation/native';
import React, { useEffect, useState } from 'react';
import { Image, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

const SummaryScreen = () => {
  const navigation = useNavigation();
  const { cart } = useCart();

  const [instruction, setInstruction] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [addressParts, setAddressParts] = useState({ street: 'N/A', city: 'N/A', country: 'N/A' });
  const {user , setUser} = useUser()
  const [finalCart, setFinalCart] = useState([]);

  if (cart.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text>Votre panier est vide.</Text>
      </View>
    );
  }

  const extractAddressParts = (address : any) => {
    

    const parts = address.split(',');
    
    if (parts.length < 3) return { street: 'N/A', city: 'N/A', postalCode: 'N/A' };
    
    const street = parts[0]?.trim() || 'N/A';
    const city = parts[1]?.trim() || 'N/A';
    const country = parts[2]?.trim() || 'N/A';
    console.log(street)
    return { street, city, country };
  };

  // Récupérer la prestation courante
  const currentItem = cart[currentIndex];

  // Formatage dates/heures avec fallback
  const formatDate = (d?: string | null) => (d ? new Date(d).toLocaleDateString("fr-FR") : 'N/A');
  const formatTime = (d?: string | null) =>
    d ? new Date(d).toLocaleTimeString("fr-FR", { hour: '2-digit', minute: '2-digit' }) : 'N/A';

  const {
    prestation,
    startDate,
    endDate,
    arrivalTime,
    departureTime,
    totalRemuneration,
    profilePictureUrl,
  } = currentItem;

  // Simulation d'extraction d'adresse (exemple statique ou à adapter selon ton user context)
  // Ici on garde 'N/A' car tu n'as pas envoyé d'adresse dans cart
  useEffect(() => {
    // Si tu as une adresse dans ton contexte utilisateur, remplace ici
    const { street, city, country } = extractAddressParts(user?.address);
    setAddressParts({ street, city, country });
  }, []);

  // Total global du panier
  const totalGlobal = cart.reduce((sum, item) => sum + (item.totalRemuneration || 0), 0);

  // Gestion du bouton étape suivante
  const nextStep = () => {
    if (currentIndex < cart.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      navigation.navigate({
        name: 'payment',
        params: { cart, instruction, totalRemuneration: totalGlobal },
      } as never);
    }
  };

  

  return (
    <View style={styles.container}>
      <Text style={styles.headerText}>
        RÉCAPITULATIF {currentIndex + 1}/{cart.length}
      </Text>

      <View style={styles.profileContainer}>
        <Image
          source={{ uri: profilePictureUrl || prestation.picture_url }}
          style={styles.profilePicture}
        />
      </View>

      <View style={{ width: '100%', height: 50 }} />

      <View style={styles.infoContainer}>
        <View style={styles.daterow}>
          <View style={styles.date}>
            <Text style={styles.infoText}>{formatDate(startDate)}</Text>
          </View>

          <Text style={styles.infoText}>➔</Text>

          <View style={styles.date}>
            <Text style={styles.infoText}>{formatDate(endDate)}</Text>
          </View>
        </View>

        <View style={styles.daterow}>
          <View style={styles.date}>
            <Text style={styles.infoText}>{formatTime(arrivalTime)}</Text>
          </View>

          <Text style={styles.infoText}>➔</Text>

          <View style={styles.date}>
            <Text style={styles.infoText}>{formatTime(departureTime)}</Text>
          </View>
        </View>

        <View style={styles.row}>
          <View style={styles.case}>
            <Text style={styles.infoText}>{addressParts.street}</Text>
          </View>
          <View style={styles.case}>
            <Text style={styles.infoText}>{addressParts.city}</Text>
          </View>
        </View>

        <View style={styles.row}>
          <View style={styles.date}>
            <Text style={styles.infoText}>{addressParts.country}</Text>
          </View>
        </View>
      </View>

      <TextInput
        style={styles.input}
        placeholder="Ajouter une instruction ou information primordiale"
        value={instruction}
        onChangeText={setInstruction}
      />

      <View style={styles.totalpurchase}>
        <Text style={styles.totalText}>Total achat:</Text>
        <Text style={styles.totalText}>{totalGlobal.toFixed(2)} €</Text>
      </View>

      <TouchableOpacity style={styles.button} onPress={nextStep}>
        <Text style={styles.buttonText}>
          {currentIndex < cart.length - 1 ? 'Étape suivante' : 'Passer au paiement'}
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 20,
  },
  headerText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 20,
  },
  profileContainer: {
    marginBottom: 20,
  },
  profilePicture: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  infoContainer: {
    width: '100%',
    alignItems: 'center',
    marginBottom: 20,
  },
  infoText: {
    fontSize: 16,
    color: '#000',
    marginVertical: 5,
    textAlign: 'center',
  },
  input: {
    width: '100%',
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    padding: 10,
    marginBottom: 10,
    color: '#000'
  },
  totalText: {
    fontSize: 20,
    color: '#000',
    marginBottom: 20,
  },
  button: {
    backgroundColor: 'green',
    padding: 15,
    borderRadius: 5,
    width: '100%',
    alignItems: 'center',
  },
  buttonText: {
    fontSize: 16,
    color: '#FFFFFF',
  },
  daterow: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  row: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'flex-start',
  },
  date: {
    width: 150,
    margin: 3,
    padding: 5,
    backgroundColor: '#D3D3D3',
    borderRadius: 10,
  },
  case: {
    margin: 3,
    padding: 5,
    paddingHorizontal: 15,
    backgroundColor: '#D3D3D3',
    borderRadius: 10,
  },
  totalpurchase: {
    width: '100%',
    flexDirection: 'row',
    margin: 10,
    padding: 10,
    justifyContent: 'space-between',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default SummaryScreen;
