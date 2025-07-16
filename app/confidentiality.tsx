import * as Asset from 'expo-asset';
import React from 'react';
import { WebView } from 'react-native-webview';

const PdfViewer = () => {
  const [uri, setUri] = React.useState<string | null>(null);

  React.useEffect(() => {
    const loadPdf = async () => {
      const asset = Asset.Asset.fromModule(require('../assets/mon-fichier.pdf'));
      await asset.downloadAsync(); // S'assurer que le fichier est dispo
      setUri(asset.localUri || asset.uri);
    };

    loadPdf();
  }, []);

  if (!uri) return null;

  return (
    <WebView
      source={{ uri }}
      style={{ flex: 1 }}
    />
  );
};

export default PdfViewer;
