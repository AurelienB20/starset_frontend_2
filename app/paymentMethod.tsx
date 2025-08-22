import AsyncStorage from '@react-native-async-storage/async-storage';
import { CardField, useStripe } from '@stripe/stripe-react-native';
import React, { useEffect, useState } from 'react';
import { Alert, FlatList, Modal, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import config from '../config.json';

const PaymentMethodScreen = () => {
  const { confirmSetupIntent } = useStripe();
  const [cards, setCards] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [cardDetails, setCardDetails] = useState<any>(null);
  //const [customerId, setCustomerId] = useState<string | null>(null);

  useEffect(() => {
    const loadCustomerAndCards = async () => {
      try {
        const user_id = await AsyncStorage.getItem('account_id');
        if (!user_id) return;

        // Appel backend pour récupérer ou créer le customer Stripe
        const customerRes = await fetch(`${config.backendUrl}/api/stripe/create-stripe-customer`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ user_id }),
        });

        const customerData = await customerRes.json();
        if (!customerData.success) {
          console.log("❌ Impossible de récupérer stripe_customer_id");
          return;
        }

        // Ensuite, récupérer les cartes liées à ce customer
        const response = await fetch(`${config.backendUrl}/api/stripe/get-customer-payment-methods`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ account_id: user_id }),
        });

        const data = await response.json();
        if (data.success) {
          console.log(data.cards)
          setCards(data.cards.map((card: any) => ({
            id: card.id,
            name: card.card.brand,
            lastFour: card.card.last4,
            status: card.card.exp_month && card.card.exp_year ? 'Valide' : 'Expiré'
          })));
        }
      } catch (error) {
        console.log("Erreur chargement customer/cartes:", error);
      }
    };

    loadCustomerAndCards();
  }, []);

  const handleAddCard = async () => {
    if (!cardDetails || !cardDetails.complete) {
      Alert.alert("Erreur", "Veuillez entrer une carte valide.");
      return;
    }

    try {

       const user_id = await AsyncStorage.getItem('account_id');
      const intentRes = await fetch(`${config.backendUrl}/api/stripe/create-setup-intent`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ account_id: user_id }),
      });

      const intentData = await intentRes.json();
      if (!intentData.success) throw new Error('SetupIntent échoué');

      const { setupIntent, error } = await confirmSetupIntent(intentData.clientSecret, {
        paymentMethodType: 'Card',
      });

      if (error) {
        Alert.alert("Erreur", error.message || "Erreur ajout carte");
        return;
      }

     updateCard();
      setModalVisible(false);
      setCardDetails(null);
    } catch (error) {
      console.log("Erreur ajout carte:", error);
      Alert.alert("Erreur", "Impossible d'ajouter la carte.");
    }
  };

  const updateCard = async () => {
     const user_id = await AsyncStorage.getItem('account_id');

      const updatedCards = await fetch(`${config.backendUrl}/api/stripe/get-customer-payment-methods`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ account_id: user_id }),
      });

      const updatedData = await updatedCards.json();
      if (updatedData.success) {
        setCards(updatedData.cards.map((card: any) => ({
          id: card.id,
          name: card.card.brand,
          lastFour: card.card.last4,
          status: 'Valide',
        })));
      }
  }

  const deleteCard = async(cardId : string) => {
    try{
        const response = await fetch(`${config.backendUrl}/api/stripe/delete-card`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ paymentId: cardId }),
        });
        const responseJson = await response.json();
        updateCard();
    }
    catch(err){
      Alert.alert("Erreur", "Impossible de supprimer la carte")
    }
  }

  const renderCard = ({ item }: any) => (
    <View style={styles.cardContainer}>
      <Icon name="card" size={30} color="#000" />
      <View style={styles.cardTextContainer}>
        <Text style={styles.cardName}>{item.name}</Text>
        <Text style={item.status === 'Valide' ? styles.cardStatusValid : styles.cardStatusExpired}>{item.status}</Text>
        <Text style={styles.cardNumber}>**** {item.lastFour}</Text>
          <TouchableOpacity onPress={()=>deleteCard(item.id)}>
        <Text style={styles.cancelButtonText}>Supprimer carte</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Mes cartes</Text>

      <FlatList
        data={cards}
        renderItem={renderCard}
        keyExtractor={(item: any) => item.id}
      />

      <TouchableOpacity style={styles.addButton} onPress={() => setModalVisible(true)}>
        <Text style={styles.addButtonText}>+ Ajouter une carte</Text>
      </TouchableOpacity>

      <Modal visible={modalVisible} animationType="slide" transparent>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Ajouter une carte</Text>
            <CardField
              postalCodeEnabled={false}
              onCardChange={setCardDetails}
              style={styles.cardField}
            />
            <TouchableOpacity style={styles.saveButton} onPress={handleAddCard}>
              <Text style={styles.saveButtonText}>Ajouter</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.cancelButton} onPress={() => setModalVisible(false)}>
              <Text style={styles.cancelButtonText}>Annuler</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};


const styles = StyleSheet.create({
 container: {
   flex: 1,
   padding: 20,
   backgroundColor: '#FFFFFF',
 },
 title: {
   fontSize: 24,
   fontWeight: 'bold',
   marginBottom: 20,
   color: '#000',
 },
 cardContainer: {
   flexDirection: 'row',
   alignItems: 'center',
   backgroundColor: '#f9f9f9',
   padding: 15,
   borderRadius: 10,
   marginBottom: 10,
   borderWidth: 1,
   borderColor: '#e0e0e0',
 },
 cardInfo: {
   flexDirection: 'row',
   alignItems: 'center',
 },
 cardTextContainer: {
   marginLeft: 10,
 },
 cardName: {
   fontSize: 18,
   fontWeight: 'bold',
   color: '#000',
 },
 cardStatusValid: {
   color: 'green',
   fontSize: 14,
 },
 cardStatusExpired: {
   color: 'red',
   fontSize: 14,
 },
 cardNumber: {
   fontSize: 14,
   color: '#666',
 },
 addButton: {
   marginTop: 20,
   padding: 15,
   backgroundColor: 'white',
   borderRadius: 20,
   alignItems: 'center',
   borderColor: 'green',
   borderWidth: 1,
 },
 addButtonText: {
   color: 'green',
   fontSize: 16,
   fontWeight: 'bold',
 },
 modalContainer: {
   flex: 1,
   justifyContent: 'center',
   alignItems: 'center',
   backgroundColor: 'rgba(0, 0, 0, 0.5)',
 },
 modalContent: {
   width: '80%',
   backgroundColor: 'white',
   padding: 20,
   borderRadius: 10,
   alignItems: 'center',
 },
 modalTitle: {
   fontSize: 20,
   fontWeight: 'bold',
   marginBottom: 10,
   color : 'black'
 },
 cardField: {
   width: '100%',
   height: 50,
   marginVertical: 10,
   color: '#333'
 },
 saveButton: {
   backgroundColor: 'green',
   padding: 10,
   borderRadius: 8,
   alignItems: 'center',
   width: '100%',
 },
 saveButtonText: {
   color: 'white',
   fontSize: 16,
   fontWeight: 'bold',
 },
 cancelButton: {
   marginTop: 10,
 },
 cancelButtonText: {
   color: 'red',
   fontSize: 16,
   fontWeight: 'bold',
 },
});


export default PaymentMethodScreen;

