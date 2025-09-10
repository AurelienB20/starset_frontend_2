import React from "react";
import { Button, Linking, Modal, StyleSheet, Text, TouchableOpacity, View } from "react-native";

type B3InfoModalProps = {
  visible: boolean;
  onClose: () => void;
};

export default function B3InfoModal({ visible, onClose }: B3InfoModalProps) {
  return (
    <View style={styles.container}>
        <Modal
        visible={visible}
        transparent
        animationType="slide"
        onRequestClose={onClose}
      >
        <View style={styles.overlay}>
          <View style={styles.modalContent}>
            <Text style={styles.title}>ℹ️  B3</Text>
            <Text style={styles.text}>
              Vous pouvez obtenir le B3 en suivant le lien suivant.{"\n\n"}
              <TouchableOpacity onPress={() => Linking.openURL('https://faq.casier-judiciaire.justice.gouv.fr/selfservice/fr-fr/193/h-donnees-personnelles/458/comment-verifier-l-authenticite-d-un-extrait-de-casier-judiciaire-bulletin-n-3')}>
                <Text style={styles.link}>Acceder au B3</Text>
              </TouchableOpacity>
            </Text>

            <Button title="Fermer" onPress={onClose} color="#00C851" />
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    margin: 20
  },
  infoBtn: {
    backgroundColor: "#0ea5e9",
    padding: 12,
    borderRadius: 8,
  },
  overlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  modalContent: {
    backgroundColor: "white",
    padding: 20,
    borderRadius: 12,
    width: "85%",
  },
  title: { 
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
    fontFamily : 'LexendDeca'
  },
  text: {
    fontSize: 14,
    color: "#333",
    marginBottom: 20,
    lineHeight: 20,
    fontFamily : 'LexendDeca'
  },
  link: {
    color: "#0ea5e9",
    textDecorationLine: "underline",
    fontFamily: 'LexendDeca',
    textAlign: 'center'
  },
});