import React, { useState } from "react";
import { Image, TouchableOpacity } from "react-native";

const SafeImage = ({ uri, style, onPress }: any) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [retryKey, setRetryKey] = useState(Date.now());

  return (
    <TouchableOpacity onPress={onPress} style={style}>
      

      <Image
        key={retryKey} // 🔑 force le re-render au retry
        source={{ uri }}
        style={{ width: "98%", height: "98%"}}
        
        
        onError={() => {
          console.log("Erreur image:", uri);
          setError(true);
          // retry auto après 1 seconde
          setTimeout(() => setRetryKey(Date.now()), 1000);
        }}
        resizeMode="cover"
      />
    </TouchableOpacity>
  );
};

export default SafeImage;
