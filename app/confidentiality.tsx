import React from 'react';
import { ScrollView, StyleSheet, Text } from 'react-native';

const ConfidentialiteScreen = () => {
  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.header}>🔒 Politique de confidentialité – Application mobile STARSET</Text>
      <Text style={styles.subHeader}>Dernière mise à jour : 01/07/2025</Text>

      <Text style={styles.sectionTitle}>1. Responsable du traitement</Text>
      <Text style={styles.text}>
        Société : STAR SET SAS{"\n"}
        Email : contact@starsetfrance.com{"\n"}
      </Text>

      <Text style={styles.sectionTitle}>2. Données que nous collectons</Text>
      <Text style={styles.text}>
        a. Données que vous fournissez : nom, prénom, email, téléphone, adresse (si applicable), photo de profil,
        description, compétences, pièces justificatives.{"\n\n"}
        b. Données collectées automatiquement : géolocalisation (si autorisée), type d’appareil, OS, langue, IP,
        usage de l’app.{"\n\n"}
        c. Paiement : via Stripe, STARSET ne stocke aucune donnée bancaire.
      </Text>

      <Text style={styles.sectionTitle}>3. Utilisation des données</Text>
      <Text style={styles.text}>
        ● Gestion du compte utilisateur{"\n"}
        ● Mise en relation{"\n"}
        ● Réservations et paiements{"\n"}
        ● Services personnalisés{"\n"}
        ● Lutte contre les fraudes{"\n"}
        ● Respect des obligations légales
      </Text>

      <Text style={styles.sectionTitle}>4. Partage des données</Text>
      <Text style={styles.text}>
        ● Avec les utilisateurs (mise en relation){"\n"}
        ● Prestataires techniques (hébergement, paiement){"\n"}
        ● Autorités si requis par la loi{"\n"}
        Aucune vente ou location de données.
      </Text>

      <Text style={styles.sectionTitle}>5. Géolocalisation</Text>
      <Text style={styles.text}>
        ● Proposer des missions proches{"\n"}
        ● Faciliter les rencontres{"\n"}
        ● Requiert votre accord explicite (modifiable dans les réglages)
      </Text>

      <Text style={styles.sectionTitle}>6. Durée de conservation</Text>
      <Text style={styles.text}>
        ● Pendant la durée d’activité du compte{"\n"}
        ● Jusqu’à 5 ans après suppression (obligations légales)
      </Text>

      <Text style={styles.sectionTitle}>7. Sécurité des données</Text>
      <Text style={styles.text}>
        ● Chiffrement, pare-feu, pseudonymisation{"\n"}
        ● Contrôles d’accès & surveillance continue
      </Text>

      <Text style={styles.sectionTitle}>8. Vos droits</Text>
      <Text style={styles.text}>
        ● Accès, rectification, suppression{"\n"}
        ● Limitation, opposition{"\n"}
        ● Portabilité{"\n"}
        ● Contact : contact@starsetfrance.com
      </Text>

      <Text style={styles.sectionTitle}>9. Transferts internationaux</Text>
      <Text style={styles.text}>
        ● Vers des pays avec un niveau de protection adéquat{"\n"}
        ● Ou avec garanties (clauses contractuelles types)
      </Text>

      <Text style={styles.sectionTitle}>10. Cookies et suivi</Text>
      <Text style={styles.text}>
        ● Mesure d’audience{"\n"}
        ● Amélioration de performance{"\n"}
        ● Personnalisation des contenus{"\n"}
        Conforme RGPD & directives App Store
      </Text>

      <Text style={styles.sectionTitle}>11. Mise à jour</Text>
      <Text style={styles.text}>
        Cette politique peut être modifiée à tout moment. Vous serez informé(e) par notification ou email.
      </Text>

      <Text style={styles.sectionTitle}>12. Contact</Text>
      <Text style={styles.text}>
        Email : contact@starsetfrance.com{"\n"}
        Adresse : 23 rue de la Garenne, Champs sur Marne, 77420
      </Text>

      <Text style={styles.footer}>📱 Politique conforme aux directives App Store (section 5.1)</Text>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    paddingBottom: 40,
  },
  header: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#222',
  },
  subHeader: {
    fontSize: 14,
    marginBottom: 20,
    color: '#777',
  },
  sectionTitle: {
    fontWeight: 'bold',
    fontSize: 16,
    marginTop: 15,
    marginBottom: 5,
    color: '#333',
  },
  text: {
    fontSize: 14,
    color: '#444',
    lineHeight: 22,
  },
  footer: {
    marginTop: 20,
    fontStyle: 'italic',
    fontSize: 13,
    color: '#666',
  },
});

export default ConfidentialiteScreen;
