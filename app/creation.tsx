import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import Checkbox from 'expo-checkbox';

import React, { useState } from 'react';
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import config from '../config.json';

const CreationScreen = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isEmailValid, setIsEmailValid] = useState(true);

  const [acceptedPrivacy, setAcceptedPrivacy] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [acceptedCGU, setAcceptedCGU] = useState(false);
  const [cguModalVisible, setCguModalVisible] = useState(false);

  const rules = [
    '8 caractères minimum',
    'au moins une lettre majuscule',
    'une lettre minuscule',
    'Au moins un chiffre',
    'Au moins un caractère spécial (exemple : St@rSet7LovesU)',
  ];

  const [passwordValidity, setPasswordValidity] = useState({
  minLength: false,
  hasUppercase: false,
  hasLowercase: false,
  hasDigit: false,
  hasSpecialChar: false,
});
const [isConfirmPasswordValid, setIsConfirmPasswordValid] = useState(true);
  


  const navigation = useNavigation();

  const handleEmailChange = (text: string) => {
    setEmail(text);
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    setIsEmailValid(emailRegex.test(text));
  };

  const handlePasswordChange = (text: string) => {

  setPassword(text);

  setPasswordValidity({
    minLength: text.length >= 8,
    hasUppercase: /[A-Z]/.test(text),
    hasLowercase: /[a-z]/.test(text),
    hasDigit: /[0-9]/.test(text),
    hasSpecialChar: /[^A-Za-z0-9]/.test(text),
  });
};
  const handleConfirmPasswordChange = (text: string) => {
  setConfirmPassword(text);
  setIsConfirmPasswordValid(text === password);
};


  const handleSubmit = async () => {
    if (!isEmailValid) {
      setErrorMessage('Veuillez entrer une adresse e-mail valide.');
      return;
    }
  
    if (password !== confirmPassword) {
      setErrorMessage('Les mots de passe ne correspondent pas.');
      return;
    }
  
    if (!acceptedPrivacy || !acceptedCGU) {
      setErrorMessage('Vous devez accepter la politique de confidentialité ET les conditions générales d\'utilisation.');
      return;
    }
  
    try {
      // Vérifie d'abord si l'email est disponible
      const checkResponse = await fetch(`${config.backendUrl}/api/auth/check-email-availability`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
        
      const checkData = await checkResponse.json();
      console.log('Check email response:', checkData);
      if (!checkData.available) {
        setErrorMessage("Cette adresse e-mail est déjà utilisée.");
        return;
      }
  
      // Ensuite, envoie l'email de vérification
      const response = await fetch(`${config.backendUrl}/api/auth/send-email-verification-code-if-exists`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
  
      if (!response.ok) throw new Error('Erreur réseau.');
  
      const data = await response.json();
  
      if (data.success === true) {
        setErrorMessage('e-mail existe déjà');
      } else {
      fetch(`${config.TicketUrl}/api/v1/users`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${config.tokenTicket}` },
      body: JSON.stringify({ email: email, organization: "starset"})
     }).then((response) => {
       if (response.ok) {
         navigation.navigate({
           name: 'mailVerificationCode',
           params: { email, password },
         } as never);
       } else {
         setErrorMessage("Erreur lors de la création de l'utilisateur.");
       }
      });
      }
    } catch (error) {
      console.error(error);
      setErrorMessage("Erreur lors de l'enregistrement. Veuillez réessayer.");
    }
  };

  const isPasswordValid = Object.values(passwordValidity).every(Boolean);
  const isFormValid = isEmailValid && acceptedPrivacy && acceptedCGU && isPasswordValid && confirmPassword === password;

  

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.enter}>Création par Email !</Text>
      <Text style={styles.subtitle}>
        Laissez-nous identifier votre profil, Star Set n'attend plus que vous !
      </Text>

      <TextInput
        style={[styles.inputemailcreation, !isEmailValid && styles.inputError]}
        onChangeText={handleEmailChange}
        placeholder="starset@exemple.com"
        placeholderTextColor="#808080"
        keyboardType="email-address"
        autoCapitalize="none"
        value={email}
      />
      {!isEmailValid && <Text style={styles.errorText}>Email invalide</Text>}

      {/* Mot de passe */}
      <View style={[styles.passwordWrapper, { borderColor: isPasswordValid ? 'black' : 'red' }]}>
        <TextInput
          style={styles.passwordInput}
          onChangeText={handlePasswordChange}
          placeholder="Mot de passe"
          placeholderTextColor="#808080"
          secureTextEntry={!showPassword}
          value={password}
        />
        <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.eyeIcon}>
          <Ionicons name={showPassword ? 'eye-off' : 'eye'} size={22} color="#333" />
        </TouchableOpacity>
      </View>
      {/* Confirmation mot de passe */}
      <View style={[styles.passwordWrapper, { borderColor: isPasswordValid ? 'black' : 'red' }]}>
        <TextInput
          style={styles.passwordInput}
          onChangeText={handleConfirmPasswordChange}
          placeholder="Confirmer le mot de passe"
          placeholderTextColor="#808080"
          secureTextEntry={!showConfirmPassword}
          value={confirmPassword}
        />
        <TouchableOpacity onPress={() => setShowConfirmPassword(!showConfirmPassword)} style={styles.eyeIcon}>
          <Ionicons name={showConfirmPassword ? 'eye-off' : 'eye'} size={22} color="#333" />
        </TouchableOpacity>
      </View>


      {!isConfirmPasswordValid && (
  <Text style={styles.errorText}>Les mots de passe ne correspondent pas.</Text>
)}


      <View style={{ marginTop: 10, alignSelf: 'flex-start', marginLeft: '15%' }}>
        <Text style={{ color: passwordValidity.minLength ? 'green' : 'black' }}>
          • 8 caractères minimum
        </Text>
        <Text style={{ color: passwordValidity.hasUppercase ? 'green' : 'black' }}>
          • au moins une lettre majuscule
        </Text>
        <Text style={{ color: passwordValidity.hasLowercase ? 'green' : 'black' }}>
          • une lettre minuscule
        </Text>
        <Text style={{ color: passwordValidity.hasDigit ? 'green' : 'black' }}>
          • Au moins un chiffre
        </Text>
        <Text style={{ color: passwordValidity.hasSpecialChar ? 'green' : 'black' }}>
          • Au moins un caractère spécial (exemple : St@rSet7LovesU)
        </Text>
      </View>


      {/* Case à cocher + lien */}
      <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 20 }}>
       <Checkbox
  value={acceptedPrivacy}
  onValueChange={setAcceptedPrivacy}
  style={{ transform: [{ scale: 0.8 }] }}
/>
        <Pressable onPress={() => setModalVisible(true)}>
          <Text style={{ color: 'blue', textDecorationLine: 'underline' }}>
            J’ai lu et j’accepte la politique de confidentialité
          </Text>
        </Pressable>
      </View>
      <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 10 }}>
        <Checkbox
          value={acceptedCGU}
          onValueChange={setAcceptedCGU}
          style={{ transform: [{ scale: 0.8 }] }}
        />
        <Pressable onPress={() => setCguModalVisible(true)}>
          <Text style={{ color: 'blue', textDecorationLine: 'underline' }}>
            J’accepte les conditions générales d’utilisation
          </Text>
        </Pressable>
      </View>


      {errorMessage !== '' && <Text style={styles.errorText}>{errorMessage}</Text>}

      <TouchableOpacity
        onPress={handleSubmit}
        style={styles.submitbutton}
        disabled={!isFormValid}
      >
        <Text style={{ fontSize: 20, fontWeight: 'bold', color: 'white' }}>Suivant</Text>
      </TouchableOpacity>

      {/* Modal WebView PDF */}
      <Modal visible={modalVisible} animationType="slide" transparent= {true}>
  <View style={{ flex: 1, backgroundColor: 'white' , marginTop : 50 }}>
    <View style={{ padding: 10, backgroundColor: '#eee', alignItems: 'flex-end' }}>
      <TouchableOpacity onPress={() => setModalVisible(false)}>
        <Text style={{ fontSize: 18, color: 'blue' }}>Fermer</Text>
      </TouchableOpacity>
    </View>
    <ScrollView contentContainerStyle={{ padding: 20 }}>
      <Text style={{ fontSize: 20, fontWeight: 'bold', marginBottom: 10 }}>
        🔒 Politique de confidentialité – STARSET
      </Text>
      <Text style={{ color: '#666', fontSize: 12, marginBottom: 15 }}>
        Dernière mise à jour : 01/07/2025
      </Text>

      <Text style={styles.policyTitle}>1. Responsable du traitement</Text>
      <Text style={styles.policyText}>
        STAR SET SAS{"\n"}
        contact@starsetfrance.com{"\n"}
      </Text>

      <Text style={styles.policyTitle}>2. Données collectées</Text>
      <Text style={styles.policyText}>
        - Informations fournies : nom, prénom, email, téléphone, adresse, profil, justificatifs{"\n"}
        - Automatiquement : géolocalisation, appareil, IP, usage app{"\n"}
        - Paiements via Stripe (aucune donnée bancaire stockée)
      </Text>

      <Text style={styles.policyTitle}>3. Utilisation</Text>
      <Text style={styles.policyText}>
        - Créer et gérer les comptes{"\n"}
        - Mettre en relation les utilisateurs{"\n"}
        - Gérer les missions, paiements{"\n"}
        - Lutte contre les fraudes{"\n"}
        - Respect légal
      </Text>

      <Text style={styles.policyTitle}>4. Partage</Text>
      <Text style={styles.policyText}>
        - Avec utilisateurs (mise en relation){"\n"}
        - Prestataires techniques (hébergement, paiement){"\n"}
        - Autorités si nécessaire{"\n"}
        - Pas de vente de données
      </Text>

      <Text style={styles.policyTitle}>5. Géolocalisation</Text>
      <Text style={styles.policyText}>
        - Pour proposer des missions proches{"\n"}
        - Sous réserve de votre consentement
      </Text>

      <Text style={styles.policyTitle}>6. Durée de conservation</Text>
      <Text style={styles.policyText}>
        - Pendant l’activité du compte + 5 ans après suppression (lutte contre fraudes)
      </Text>

      <Text style={styles.policyTitle}>7. Sécurité</Text>
      <Text style={styles.policyText}>
        - Chiffrement, pare-feu, contrôle d’accès, pseudonymisation
      </Text>

      <Text style={styles.policyTitle}>8. Vos droits</Text>
      <Text style={styles.policyText}>
        - Accès, modification, suppression, opposition, portabilité{"\n"}
        - Contact : contact@starsetfrance.com
      </Text>

      <Text style={styles.policyTitle}>9. Transferts internationaux</Text>
      <Text style={styles.policyText}>
        - Vers pays avec protection adéquate ou garanties légales
      </Text>

      <Text style={styles.policyTitle}>10. Cookies</Text>
      <Text style={styles.policyText}>
        - Mesure d’audience, personnalisation{"\n"}
        - Conforme RGPD & App Store
      </Text>

      <Text style={styles.policyTitle}>11. Mise à jour</Text>
      <Text style={styles.policyText}>
        - Vous serez notifié en cas de changement
      </Text>

      <Text style={styles.policyTitle}>12. Contact</Text>
      <Text style={styles.policyText}>
        contact@starsetfrance.com{"\n"}
      </Text>

      <Text style={{ fontStyle: 'italic', marginTop: 20, color: '#555' }}>
        Conforme aux règles App Store (section 5.1)
      </Text>
    </ScrollView>
  </View>
</Modal>

<Modal visible={cguModalVisible} transparent={true}>
  <View style={{ backgroundColor : 'white', marginTop : 50  }}>
    <View style={{ padding: 10, backgroundColor: '#eee', alignItems: 'flex-end' }}>
      <TouchableOpacity onPress={() => setCguModalVisible(false)}>
        <Text style={{ fontSize: 18, color: 'blue' }}>Fermer</Text>
      </TouchableOpacity>
    </View>

    <ScrollView contentContainerStyle={{ padding: 20 }}>
      <Text style={{ fontSize: 20, fontWeight: 'bold', marginBottom: 10 }}>
        📜 Conditions Générales d'Utilisation – STARSET
      </Text>

      <Text style={styles.policyTitle}>1. ÉDITEUR DE L’APPLICATION</Text>
      <Text style={styles.policyText}>
        Star Set, Société par Actions Simplifiée – RCS Champs-sur-Marne{"\n"}
        23 rue de la Garenne, 77420{"\n"}
        📧 contact@starsetfrance.com | 📞 06.52.18.25.02
      </Text>

      <Text style={styles.policyTitle}>2. OBJET</Text>
      <Text style={styles.policyText}>
        Définir les modalités d’accès et d’utilisation des services proposés par l’Application.{"\n"}
        Régies par le droit français, RGPD, LCEN, Code civil et de la consommation.
      </Text>

      <Text style={styles.policyTitle}>3. ACCEPTATION DES CONDITIONS</Text>
      <Text style={styles.policyText}>
        En installant l'application, l'utilisateur reconnaît avoir lu et accepté les présentes CGU.
      </Text>

      <Text style={styles.policyTitle}>4. ACCÈS À L’APPLICATION</Text>
      <Text style={styles.policyText}>
        Application disponible gratuitement sur App Store et Google Play.{"\n"}
        Certaines fonctionnalités nécessitent un compte, Internet ou permissions (caméra, géoloc.).
      </Text>

      <Text style={styles.policyTitle}>5. PROPRIÉTÉ INTELLECTUELLE</Text>
      <Text style={styles.policyText}>
        Tous les contenus sont protégés et appartiennent à Star Set ou ses partenaires.{"\n"}
        Toute reproduction non autorisée est interdite.
      </Text>

      <Text style={styles.policyTitle}>6. DONNÉES PERSONNELLES</Text>
      <Text style={styles.policyText}>
        Collecte conforme au RGPD et à la loi Informatique et Libertés.{"\n"}
        Droits d’accès, de rectification, suppression, opposition et portabilité.
      </Text>

      <Text style={styles.policyTitle}>7. RESPONSABILITÉ</Text>
      <Text style={styles.policyText}>
        L’accès est sécurisé mais non garanti sans bugs, interruptions ou virus.{"\n"}
        Utilisation aux risques de l’utilisateur.
      </Text>

      <Text style={styles.policyTitle}>8. MODIFICATION DES CGU</Text>
      <Text style={styles.policyText}>
        Star Set peut modifier les CGU à tout moment.{"\n"}
        L'utilisation continue vaut acceptation.
      </Text>

      <Text style={styles.policyTitle}>9. LOI APPLICABLE ET JURIDICTION</Text>
      <Text style={styles.policyText}>
        Droit français. Litiges soumis aux juridictions compétentes selon le Code de la consommation.
      </Text>

      <Text style={styles.policyTitle}>10. MISSIONS ET RÈGLES POUR WORKERS / PRESTATAIRES</Text>
      <Text style={styles.policyText}>
        - Acceptation d’une mission = engagement contractuel.{"\n"}
        - 5 min pour accepter une mission urgente.{"\n"}
        - Annulation = frais Stripe + gestion. Abus = suspension.{"\n"}
        - Respect attendu. Début et fin de mission à signaler via l’app.
      </Text>

      <Text style={styles.policyTitle}>11. MISE EN RELATION ET RÔLE DE STAR SET</Text>
      <Text style={styles.policyText}>
        - Star Set est une plateforme d’intermédiation.{"\n"}
        - Pas responsable de la qualité de la prestation.{"\n"}
        - Insatisfactions à signaler au support.{"\n"}
        - Communication préalable entre utilisateurs recommandée.
      </Text>

      <Text style={styles.policyTitle}>12. PAIEMENT & TRANSACTIONS (via STRIPE)</Text>
      <Text style={styles.policyText}>
        - Blocage du créneau à la réservation.{"\n"}
        - Débit automatique J-1 de la mission.{"\n"}
        - Paiement au worker 7 jours après prestation.{"\n"}
        - Suivi via interfaces utilisateur et worker.
      </Text>

      <Text style={{ fontStyle: 'italic', marginTop: 20, color: '#555' }}>
        Dernière mise à jour : 23 juillet 2025
      </Text>
    </ScrollView>
  </View>
</Modal>

    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    height: '100%',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 10,
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 3,
  },
  enter: {
    fontWeight: 'bold',
    textAlign: 'center',
    fontSize: 40,
    marginHorizontal: 20,
    color: 'black',
  },
  subtitle: {
    marginTop: 10,
    fontSize: 10,
    textAlign: 'center',
    color: 'black',
    marginBottom: 50,
  },
  inputemailcreation: {
    width: '70%',
    maxWidth: 450,
    backgroundColor: 'white',
    borderRadius: 15,
    borderWidth: 2,
    borderColor: 'black',
    color: 'black',
    textAlign: 'center',
    fontSize: 15,
    padding: 10,
    marginTop: 10,
    marginBottom: 10,
    paddingHorizontal: 30,
  },
  inputError: {
    borderColor: 'red',
  },
  errorText: {
    color: 'red',
    fontSize: 14,
    marginTop: 5,
  },
  passwordWrapper: {
    width: '70%',
    maxWidth: 450,
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 15,
    borderWidth: 2,
    backgroundColor: 'white',
    marginTop: 10,
    paddingHorizontal: 15,
  },
  passwordInput: {
    flex: 1,
    fontSize: 15,
    paddingVertical: 10,
    color: 'black',
  },
  eyeIcon: {
    paddingLeft: 10,
  },
  submitbutton: {
    maxWidth: 300,
    width: '60%',
    height: 50,
    backgroundColor: '#4CAF50',
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 20,
    borderRadius: 25,
  },

  policyTitle: {
  fontWeight: 'bold',
  fontSize: 16,
  marginTop: 15,
  color: '#000',
},
policyText: {
  fontSize: 14,
  color: '#333',
  lineHeight: 20,
  marginTop: 5,
},
containerRules: {
  alignItems: 'center',
  marginTop: 10,
  marginBottom: 20,
  marginLeft: 20,
  width: '100%',
},
ruleContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 6,
    marginLeft: 30,
  },
  bullet: {
    marginTop: 6,
    marginRight: 8,
  },
  ruleText: {
    fontSize: 12,
    color: '#444',
    flex: 1,
  },
});

export default CreationScreen;
