import { useUser } from '@/context/userContext';
import { MaterialIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation, useRoute } from '@react-navigation/native';
import { CardField, usePaymentSheet, useStripe } from '@stripe/stripe-react-native';
import React, { useEffect, useState } from 'react';
import { Alert, Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import config from '../config.json';

const PaymentScreen = () => {
  const route = useRoute() as any;
  const [ready, setReady] = useState(false);
  const {user } = useUser()
  const navigation = useNavigation();
  const {initPaymentSheet, presentPaymentSheet} = usePaymentSheet();
  // On récupère cart, instruction, totalRemuneration depuis params
  const [cart, setCart] = useState(route.params?.cart || []);

  const [isLoading, setIsLoading] = useState(false);
  const [savedCards, setSavedCards] = useState<any[]>([]);
  const { confirmSetupIntent } = useStripe();
  const instruction = route.params?.instruction || ""
  let totalRemuneration2 = route.params?.totalRemuneration || 0
  
  
const PERCENT_FEE = 0.015;     // 1,5%
const PER_ITEM_FIXED_FEE = 0.25; // 0,25 € par item

const [itemCount, setItemCount] = useState(0);
const [serviceFee, setServiceFee] = useState(0);
const [transactionFee, setTransactionFee] = useState(0);
const [finalTotal, setFinalTotal] = useState(0);

const [selectedPaymentMethodId, setSelectedPaymentMethodId] = useState<string | null>(null);
const [useSavedCard, setUseSavedCard] = useState<boolean>(false);

console.log(finalTotal)
const [stripeCustomerId, setStripeCustomerId] = useState<string | null>(null);
const [cardDetails, setCardDetails] = useState<any>(null);
const [showCardField, setShowCardField] = useState(false);

  useEffect(() => {
    recalculateTotals(cart);
    fetchSavedCards();
  }, []);

  const removePrestationFromCart = (indexToRemove: number) => {
    Alert.alert(
      'Supprimer la prestation',
      'Êtes-vous sûr de vouloir supprimer cette prestation du panier ?',
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Supprimer',
          style: 'destructive',
          onPress: () => {
            setCart((prevCart: any[]) => {
              const updatedCart = prevCart.filter((_, i) => i !== indexToRemove);
              recalculateTotals(updatedCart); // 👈 recalcul direct
              return updatedCart;
            });
          },
        },
      ]
    );
  };

  const recalculateTotals = (updatedCart: any[]) => {
    let itemCount = Array.isArray(updatedCart) ? updatedCart.length : 0;
  
    const totalRemuneration = updatedCart.reduce(
      (sum, item) => sum + (item.totalRemuneration || 0),
      0
    );
  
    const serviceFeeCalc = totalRemuneration * 0.10;
    const percentFeeAmountCalc = totalRemuneration * PERCENT_FEE;
    const fixedFeeAmountCalc = itemCount * PER_ITEM_FIXED_FEE;
  
    const transactionFeeCalc = percentFeeAmountCalc + fixedFeeAmountCalc;
    const finalTotalCalc = totalRemuneration + serviceFeeCalc + transactionFeeCalc;
  
    // Mets à jour dans le state
    setServiceFee(serviceFeeCalc);
    setTransactionFee(transactionFeeCalc);
    setFinalTotal(finalTotalCalc);
    setItemCount(itemCount);
  };
  
  

  const handleAddCard = async () => {
    try {
      const userId = await getAccountId();
      const response = await fetch(`${config.backendUrl}/api/stripe/create-setup-intent`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ account_id: userId }),
      });
  
      const data = await response.json();
      if (!data.success) throw new Error(data.message || 'Erreur setup intent');
  
      const result = await confirmSetupIntent(data.clientSecret, {
        paymentMethodType: 'Card',
      });
  
      if (result.error) {
        Alert.alert('Erreur', result.error.message);
      } else {
        Alert.alert('Succès', 'Carte enregistrée avec succès');
        fetchSavedCards(); // recharge les cartes
      }
    } catch (err: any) {
      console.error('Erreur ajout carte:', err);
      Alert.alert('Erreur', err.message || 'Impossible d’ajouter la carte');
    }
  };
  

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
  if (data.success && data.cards.length > 0) {
    setSavedCards(data.cards);
    setSelectedPaymentMethodId(data.cards[0].id); // Sélection par défaut
    if (data.customer_id) setStripeCustomerId(data.customer_id); // <--- stocke le customer_id si renvoyé
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
          items:{ amount: Math.round(finalTotal * 100) }})
      });

      console.log(response.status)
      const {paymentIntent, ephemeralKey, customer} = await response.json();
      console.log({paymentIntent}, {ephemeralKey}, {customer});
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

  if (!selectedPaymentMethodId) {
    Alert.alert('Paiement', 'Veuillez sélectionner un moyen de paiement.');
    return;
  }

  setIsLoading(true);

  try {
    const user_id = await getAccountId();

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

      const totalRemunerationItem = (itemRemuneration * 1.115) + 0.25;

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
          total_remuneration : totalRemunerationItem,
          start_time: arrivalTime,
          end_time: departureTime,
          instruction,
          custom_prestation_id: customPrestationId,
          profile_picture_url: profilePictureUrl,
          payment_method_id: selectedPaymentMethodId, 
          stripe_customer_id: stripeCustomerId, 
          location : user?.location,
          address : user?.address
        }),
      });

      const data = await response.json();
      if (!data.success) {
        throw new Error(`Erreur création prestation : ${prestation.metier}`);
      }
    }

    Alert.alert('Succès', 'Le paiement différé a été préparé avec succès.');
    navigation.navigate('validation' as never);
  } catch (error) {
    console.error('Erreur paiement différé :', error);
    Alert.alert('Erreur', 'Une erreur est survenue lors de l’enregistrement.');
  } finally {
    setIsLoading(false);
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
            {/* Icône poubelle en haut à droite */}
            <TouchableOpacity
              onPress={() => removePrestationFromCart(index)}
              style={styles.deleteIcon}
            >
              <MaterialIcons name="delete" size={24} color="#900" />
            </TouchableOpacity>

            <Image
              source={{ uri: profilePictureUrl || prestation.picture_url }}
              style={styles.profilePicture}
            />
            <Text style={styles.prestationTitle}>{prestation.metier}</Text>
            <Text style={styles.descriptionText}>{prestation.description}</Text>
            <Text style={styles.paymentAmount}>
              Montant : {itemRemuneration?.toFixed(2)} €
            </Text>
          </View>
        );
      })}

      <View style={{ width: '100%', marginTop: 10 }}>
        <Text style={{ fontSize: 16, color : 'black' }}>
          Frais de service (10%) : {serviceFee.toFixed(2)} €
        </Text>
        <Text style={{ fontSize: 16 , color : 'black'}}>
          Frais de transaction (1,5% + 0,25€ × {itemCount}) : {transactionFee.toFixed(2)} €
        </Text>
      </View>

      <View style={styles.separator} />
      <Text style={styles.totalText}>Total à payer : {finalTotal.toFixed(2)} €</Text>

      <View style={{ width: '100%', marginTop: 20 }}>
  <Text style={{ fontSize: 16, fontWeight: 'bold', marginBottom: 10, color : 'black' }}>Méthode de paiement</Text>

  {savedCards.length > 0 ? (
    savedCards.map((card) => (
      <TouchableOpacity
        key={card.id}
        onPress={() => setSelectedPaymentMethodId(card.id)}
        style={{
          padding: 12,
          marginBottom: 10,
          borderRadius: 8,
          borderWidth: 1,
          borderColor: card.id === selectedPaymentMethodId ? 'green' : '#ccc',
          backgroundColor: '#fff',
        }}
      >
        <Text style={{ fontSize: 16, color : 'black' }}>
          {`${card.card.brand.toUpperCase()} •••• ${card.card.last4}`}
        </Text>
        <Text style={{ fontSize: 12, color: '#666' }}>
          {`Expire ${card.card.exp_month}/${card.card.exp_year}`}
        </Text>
      </TouchableOpacity>
    ))
  ) : (
    <Text>Aucune carte enregistrée.</Text>
  )}

<TouchableOpacity
  onPress={() => setShowCardField(true)}
  style={{ marginTop: 10, marginBottom: 10, padding: 12, borderRadius: 8, borderWidth: 1, borderColor: 'green', alignItems: 'center' }}
>
  <Text style={{ color: 'green', fontWeight: 'bold' }}>+ Ajouter une carte</Text>
  {showCardField && (
        <>
          <CardField
            postalCodeEnabled={false}
            onCardChange={setCardDetails}
            style={{
              width: '100%',
              height: 50,
              marginBottom: 10,
            }}
          />

          <TouchableOpacity
            onPress={handleAddCard}
            style={{
              marginTop: 10,
              padding: 12,
              borderRadius: 8,
              backgroundColor: 'green',
              alignItems: 'center',
            }}
          >
            <Text style={{ color: 'white', fontWeight: 'bold' }}>Valider cette carte</Text>
          </TouchableOpacity>
        </>
      )}
</TouchableOpacity>
</View>
      <TouchableOpacity
        style={[styles.button, isLoading && { backgroundColor: '#666' }]}
        onPress={handlePayment}
        disabled={isLoading || !selectedPaymentMethodId}
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
    color : 'black'
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
    color : 'black'
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

  deleteIcon: {
    position: 'absolute',
    top: 10,
    right: 10,
    zIndex: 10,
  },
  
});

export default PaymentScreen;