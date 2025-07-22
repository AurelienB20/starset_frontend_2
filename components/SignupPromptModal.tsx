import { useNavigation } from '@react-navigation/native';
import React from 'react';
import {
    Modal,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

type SignupPromptModalProps = {
  visible: boolean;
  onClose?: () => void; // Optionnel : si tu veux pouvoir fermer depuis le parent
};

const SignupPromptModal: React.FC<SignupPromptModalProps> = ({
  visible,
  onClose,
}) => {
  const navigation = useNavigation();

  const handlePress = () => {
    navigation.navigate('connexion' as never);
    if (onClose) onClose(); // Ferme si fonction fournie
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.popup}>
          <Text style={styles.text}>
            POUR ALLER PLUS LOIN DANS L’EXPÉRIENCE STARSET,{"\n"}NOUS VOUS INVITONS À CRÉER VOTRE COMPTE
          </Text>

          <TouchableOpacity style={styles.button} onPress={handlePress}>
            <Text style={styles.buttonText}>INSCRIPTION</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  popup: {
    backgroundColor: 'white',
    padding: 30,
    borderRadius: 12,
    alignItems: 'center',
  },
  text: {
    fontWeight: 'bold',
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 25,
  },
  button: {
    backgroundColor: '#00BF63',
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 8,
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
});

export default SignupPromptModal;
