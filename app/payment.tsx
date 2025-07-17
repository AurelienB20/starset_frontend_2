import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation, useRoute } from '@react-navigation/native';
import { usePaymentSheet } from '@stripe/stripe-react-native';
import React, { useEffect, useState } from 'react';
import { Alert, Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import config from '../config.json';

const PaymentScreen = () => {
  const route = useRoute() as any;
  const [ready, setReady] = useState(false);
  const navigation = useNavigation();
  const {initPaymentSheet, presentPaymentSheet} = usePaymentSheet();
  // On récupère cart, instruction, totalRemuneration depuis params
  const { cart = [], instruction = '', totalRemuneration = 0 } = route.params || {};

  const [isLoading, setIsLoading] = useState(false);
  const [savedCards, setSavedCards] = useState<any[]>([]);
const [selectedPaymentMethodId, setSelectedPaymentMethodId] = useState<string | null>(null);
const [useSavedCard, setUseSavedCard] = useState<boolean>(false);


  useEffect(() => {
    initialisePaymentSheet();
    fetchSavedCards();
  }, []);

  const getAccountId = async () => {
    try {
      const account_id = await AsyncStorage.getItem('account_id');
      return account_id;
    } catch (e) {
      console.error('Erreur lors de la récupération du compte', e);
    }
  };

  const initialisePaymentSheet = async() =>{
    const {paymentIntent, ephemeralKey, customer} =
      await fetchPaymentSheetParams();
  
      const {error} = await initPaymentSheet({
        customerId: customer,
        customerEphemeralKeySecret: ephemeralKey,
        paymentIntentClientSecret: paymentIntent,
        merchantDisplayName: 'Starset',
        allowsDelayedPaymentMethods: true,
        returnURL: 'starset://stripe-redirect'

      });
      if(error){
        console.log(`Error code: ${error.code}`, error.message);
      } else {
        setReady(true);
      }
    };

    const fetchSavedCards = async () => {
      const user_id = await getAccountId();
      const res = await fetch(`${config.backendUrl}/api/stripe/get-customer-payment-methods-with-account-id`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ account_id: user_id }),
      });
    
      const data = await res.json();
      if (data.success) {
        setSavedCards(data.cards);
      }
    };

    const fetchPaymentSheetParams = async () =>{
      const user_id = await getAccountId();
      const response = await fetch(`${config.backendUrl}/api/stripe/create-payment-sheet`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_id: user_id,
          items: [{amount: totalRemuneration*100}]})
      });

      const {paymentIntent, ephemeralKey, customer} = await response.json();
      return {
        paymentIntent,
        ephemeralKey,
        customer,
      }
    };

    const handlePayment = async () => {
      if (cart.length === 0) {
        Alert.alert('Panier vide', 'Votre panier est vide.');
        return;
      }
    
      setIsLoading(true);
    
      try {
        const user_id = await getAccountId();
    
        // Paiement avec carte enregistrée
        if (selectedPaymentMethodId) {
          const res = await fetch(`${config.backendUrl}/api/stripe/charge-payment-method`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              account_id: user_id,
              payment_method_id: selectedPaymentMethodId,
              amount: totalRemuneration * 100,
            }),
          });
    
          const chargeData = await res.json();
          if (!chargeData.success) {
            throw new Error('Échec du paiement avec la carte sélectionnée');
          }
        } else {
          // Paiement via Stripe Payment Sheet (nouvelle carte)
          const { error } = await presentPaymentSheet();
          if (error) {
            Alert.alert('Erreur', error.message);
            setIsLoading(false);
            return;
          }
        }
    
        // Créer les prestations après paiement réussi
        for (const item of cart) {
          const {
            prestation,
            startDate,
            endDate,
            arrivalTime,
            departureTime,
            totalRemuneration: itemRemuneration,
            type_of_remuneration,
            customPrestationId,
            instruction,
            profilePictureUrl,
          } = item;
    
          const response = await fetch(`${config.backendUrl}/api/planned-prestation/create-planned-prestation`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              worker_id: prestation.worker_id,
              user_id,
              prestation_id: prestation.id,
              start_date: startDate,
              end_date: endDate,
              type_of_remuneration,
              remuneration: itemRemuneration,
              start_time: arrivalTime,
              end_time: departureTime,
              instruction,
              custom_prestation_id: customPrestationId,
              profile_picture_url: profilePictureUrl,
            }),
          });
    
          const data = await response.json();
          if (!data.success) {
            throw new Error(`Erreur lors de la création de la prestation ${prestation.metier}`);
          }
        }
    
        setIsLoading(false);
        setReady(false);
        Alert.alert('Succès', 'Le paiement et les prestations ont bien été enregistrés.');
        navigation.navigate('validation' as never);
    
      } catch (error) {
        console.error('Erreur paiement :', error);
        Alert.alert('Erreur', 'Impossible de valider le paiement. Vérifiez votre connexion.');
        setIsLoading(false);
        setReady(false);
      }
    };
    

  // Affichage résumé des prestations dans le panier
  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.headerText}>Paiement</Text>
      
      {cart.map((item: any, index: number) => {
        const {
          prestation,
          profilePictureUrl,
          totalRemuneration: itemRemuneration,
        } = item;

        return (
          <View key={index} style={styles.prestationContainer}>
            
            <Image
              source={{ uri: profilePictureUrl || prestation.picture_url }}
              style={styles.profilePicture}
            />
            <Text style={styles.prestationTitle}>{prestation.metier}</Text>
            <Text style={styles.descriptionText}>{prestation.description}</Text>
            <Text style={styles.paymentAmount}>Montant : {itemRemuneration?.toFixed(2)} €</Text>
          </View>
        );
      })}

      <View style={styles.separator} />
      <Text style={styles.totalText}>Total global : {parseFloat(totalRemuneration).toFixed(2)} €</Text>

      <View style={{ width: '100%', marginBottom: 20 }}>
  <Text style={styles.headerText}>Choisir une carte enregistrée</Text>
  {savedCards.length === 0 && <Text>Aucune carte enregistrée.</Text>}
  {savedCards.map((card) => (
    <TouchableOpacity
      key={card.id}
      style={{
        padding: 10,
        borderWidth: 1,
        borderColor: selectedPaymentMethodId === card.id ? 'green' : '#ccc',
        borderRadius: 8,
        marginBottom: 10,
      }}
      onPress={() => setSelectedPaymentMethodId(card.id)}
    >
      <Text>{card.card.brand.toUpperCase()} **** {card.card.last4}</Text>
      <Text>Expire: {card.card.exp_month}/{card.card.exp_year}</Text>
    </TouchableOpacity>
  ))}
  <TouchableOpacity
  onPress={() => {
    setUseSavedCard(false);
    setSelectedPaymentMethodId(null);
  }}
  style={{
    padding: 10,
    backgroundColor: '#eee',
    borderRadius: 8,
    marginTop: 10,
    alignItems: 'center',
  }}
>
  <Text style={{ color: '#000' }}>Utiliser une autre carte</Text>
</TouchableOpacity>
</View>
      
      <TouchableOpacity
        style={[styles.button, isLoading && { backgroundColor: '#666' }]}
        onPress={handlePayment}
        disabled={isLoading} // add  || !ready when 
      >
        <Text style={styles.buttonText}>{isLoading ? 'Traitement...' : 'Valider le paiement'}</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  headerText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 20,
  },
  prestationContainer: {
    width: '100%',
    backgroundColor: '#f0f9f0',
    padding: 15,
    borderRadius: 10,
    marginBottom: 20,
    alignItems: 'center',
  },
  profilePicture: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  prestationTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 10,
  },
  descriptionText: {
    fontSize: 14,
    color: '#555',
    marginVertical: 10,
    textAlign: 'center',
  },
  paymentAmount: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'green',
  },
  separator: {
    height: 1,
    width: '100%',
    backgroundColor: '#ccc',
    marginVertical: 20,
  },
  totalText: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 30,
  },
  button: {
    backgroundColor: 'green',
    padding: 15,
    borderRadius: 8,
    width: '100%',
    alignItems: 'center',
  },
  buttonText: {
    color: '#FFF',
    fontWeight: 'bold',
    fontSize: 16,
  },
});

export default PaymentScreen;