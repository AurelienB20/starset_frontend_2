import config from '../config.json';

export const getPrestation = async (prestation_id: string) => {
  try {
    const response = await fetch(`${config.backendUrl}/api/mission/get-prestation`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ prestation_id }),
    });

    if (!response.ok) throw new Error('Erreur réseau');

    return await response.json();
  } catch (error) {
    console.error('Erreur lors de la récupération des prestations:', error);
    throw error;
  }
};

export const getAllExperience = async (prestation_id: string) => {
  try {
    const response = await fetch(`${config.backendUrl}/api/mission/get-all-experience`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prestation_id }),
    });

    if (!response.ok) throw new Error('Erreur réseau');
    
    return await response.json();
  } catch (error) {
    console.error('Erreur lors de la récupération des expériences:', error);
    throw error;
  }
};

export const getAllCertification = async (prestation_id: string) => {
  try {
    const response = await fetch(`${config.backendUrl}/api/mission/get-all-certification`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prestation_id }),
    });

    if (!response.ok) throw new Error('Erreur réseau');

    return await response.json();
  } catch (error) {
    console.error('Erreur lors de la récupération des certifications:', error);
    throw error;
  }
};

export const handleSaveDescription = async (prestation_id: string, description: string) => {
  try {
    const response = await fetch(`${config.backendUrl}/api/mission/save-prestation-description`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prestation_id, description }),
    });

    if (!response.ok) throw new Error('Erreur réseau');

    return await response.json();
  } catch (error) {
    console.error('Erreur lors de la modification de la description:', error);
    throw error;
  }
};

export const togglePrestationPublished = async (prestation_id: string) => {
  try {
    const response = await fetch(`${config.backendUrl}/api/mission/toggle-prestation-published`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: prestation_id }),
    });

    if (!response.ok) throw new Error('Erreur réseau');

    return await response.json();
  } catch (error) {
    console.error('Erreur lors de la mise à jour de la publication:', error);
    throw error;
  }
};

export const debugLog = async (log: any) => {
  try {
    const response = await fetch(`${config.backendUrl}/api/auth/debug-log`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ log }),
    });

    if (!response.ok) throw new Error('Erreur réseau lors du debug log');

    return await response.json();
  } catch (error) {
    console.error('Erreur lors de l’envoi du log de debug:', error);
    throw error;
  }
};
