import { BebasNeue_400Regular, useFonts } from '@expo-google-fonts/bebas-neue';
import { LexendDeca_400Regular } from "@expo-google-fonts/lexend-deca";
import { useEffect, useState } from "react";
import { Modal, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import config from '../config.json';


interface Props {
  visible: boolean;
  onClose: () => void;
  prestation: any;
}

const handleChangePlannedPrestationStatus = async (id: string, status: string) => {
  try {
    const response = await fetch(`${config.backendUrl}/api/mission/change-planned-prestation-status`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ id, status }),
    });

    if (!response.ok) throw new Error('Network response was not ok');

    const data = await response.json();
    console.log(`Prestation mise à jour: ${data.message}`);
  } catch (error) {
    console.error('Erreur lors de la mise à jour du statut:', error);
  }
};

const formatTime = (seconds: number) => {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;

  return h > 0
    ? `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
    : `${m}:${s.toString().padStart(2, '0')}`;
};

const PrestationConfirmation = ({ visible, onClose, prestation }: Props) => {
  const [localStatus, setLocalStatus] = useState(prestation?.status || '');
  const [remainingTime, setRemainingTime] = useState<number | null>(null);

  let [fontsLoaded] = useFonts({
      BebasNeue: BebasNeue_400Regular,
      LexendDeca : LexendDeca_400Regular,
      
    });

  useEffect(() => {
    if (prestation?.status) {
      setLocalStatus(prestation.status);
    }
  }, [prestation]);

  useEffect(() => {
  console.log('🟢 useEffect [localStatus, prestation] triggered');
  console.log('🔎 prestation:', prestation);
  console.log('🔎 localStatus:', localStatus);

  if (localStatus !== 'started' || !prestation) {
    console.log('⛔ Pas de prestation en cours ou statut différent de "started"');
    return;
  }

  const rawDateStr = prestation.end_date || prestation.start_date;
const endDateStr = rawDateStr.split('T')[0]; // extrait juste '2025-06-24'
const endTimeStr = prestation.end_time || '23:59:00';
const dateTimeStr = `${endDateStr}T${endTimeStr}`;

  console.log('🕓 Tentative de création de date avec :', dateTimeStr);
  const end = new Date(dateTimeStr);

  if (isNaN(end.getTime())) {
    console.error('❌ Date de fin invalide !');
    return;
  }

  console.log('✅ Date de fin valide :', end.toISOString());

  const updateRemainingTime = () => {
    const now = new Date();
    const diffMs = end.getTime() - now.getTime();
    const diffSec = Math.max(0, Math.floor(diffMs / 1000));

    console.log('🕒 Temps restant :', diffSec, 'secondes');

    setRemainingTime(diffSec);
  };

  updateRemainingTime(); // initial

  const interval = setInterval(() => {
    console.log('🔁 Mise à jour du timer...');
    updateRemainingTime();
  }, 1000);

  return () => {
    console.log('🧹 Nettoyage de l’intervalle du timer');
    clearInterval(interval);
  };
}, [localStatus, prestation]);

  if (!prestation) return null;

  const isStarted = localStatus === 'started';

  const handleStart = async () => {
    await handleChangePlannedPrestationStatus(prestation.id, 'started');
    setLocalStatus('started');
  };

  const handleFinish = async () => {
    await handleChangePlannedPrestationStatus(prestation.id, 'completed');
    onClose();
  };

  return (
    <Modal animationType="slide" transparent visible={visible} onRequestClose={onClose}>
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>
            {isStarted ? 'Bon travail à toi !' : 'Commencer la prestation'}
          </Text>

          <Text style={styles.metierText}>{prestation.metier}</Text>
          {prestation.start_time && prestation.end_time && (
  <Text >
    {prestation.start_time} → {prestation.end_time}
  </Text>
)}

          {isStarted && (
            <Text style={styles.timerText}>
              {remainingTime !== null ? formatTime(remainingTime) : '--:--'}
            </Text>
          )}

          <View style={styles.modalButtons}>
            {isStarted ? (
              <TouchableOpacity
                style={styles.rejectButton}
                onPress={handleFinish}
              >
                <Text style={styles.finishButtonText}>TERMINER LA PRESTATION</Text>
              </TouchableOpacity>
            ) : (
              <>
                <TouchableOpacity
                  style={styles.rejectButton}
                  onPress={onClose}
                >
                  <Text style={styles.modalButtonText}>Non</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.acceptButton}
                  onPress={handleStart}
                >
                  <Text style={styles.modalButtonText}>Oui</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: 'white',
    margin: 20,
    padding: 20,
    paddingVertical : 30,
    borderRadius: 10,
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 40,
    fontFamily : 'BebasNeue',
    marginBottom: 10,
    textAlign: 'center',

  },
  metierText: {
    fontSize: 24,
    fontFamily : 'LexendDeca',
    textAlign: 'center',
    marginBottom: 5,
    color: '#333',
  },
  timerText: {
    fontSize: 60,
    fontWeight : 'bold',
    color: '#008000',
    textAlign: 'center',
    marginVertical: 20,
    
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 20,
    gap: 10,
    flexWrap: 'wrap',
  },
  modalButtonText: {
    color: 'white',
    fontSize: 45,
    fontFamily : 'BebasNeue',
    textAlign: 'center',
  },
  finishButtonText: {
    color: 'white',
    fontSize: 26,
    fontFamily : 'BebasNeue',
    textAlign: 'center',
  },
  acceptButton: {
    backgroundColor: '#00cc66',
    padding: 8,
    borderRadius: 5,
    alignItems: 'center',
    minWidth: '45%',
  },
  rejectButton: {
    backgroundColor: '#FF3B30',
    padding: 8,
    borderRadius: 5,
    alignItems: 'center',
    minWidth: '45%',
  },
});

export default PrestationConfirmation;
