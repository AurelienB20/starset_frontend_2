import React, { createContext, useContext, useState } from 'react';

// Types flexibles
type User = Record<string, any>;
type Prestation = Record<string, any>;
type PlannedPrestation = Record<string, any>;
type Conversation = Record<string, any>; // Tu peux remplacer par un vrai type plus tard si tu veux
type CartItem = Record<string, any>; // adapte au besoin


// Interfaces de contextes
interface UserContextType {
  user: User | null;
  setUser: (user: User) => void;
}

interface CurrentWorkerPrestationContextType {
  currentWorkerPrestation: Prestation | null;
  setCurrentWorkerPrestation: (prestation: Prestation) => void;
}

interface AllWorkerPrestationContextType {
  allWorkerPrestation: Prestation | null;
  setAllWorkerPrestation: (prestation: Prestation) => void;
}

interface PlannedPrestationContextType {
  newPlannedPrestation: PlannedPrestation | null;
  setNewPlannedPrestation: (prestation: PlannedPrestation) => void;
}

interface UserConversationContextType {
  userConversations: Conversation[] | null;
  setUserConversations: (conversations: Conversation[]) => void;
}

interface WorkerConversationsContextType {
  workerConversations: Conversation[] | null;
  setWorkerConversations: (conversations: Conversation[]) => void;
}

interface CartContextType {
  cart: CartItem[];
  addToCart: (item: CartItem) => void;
  removeFromCart: (index: number) => void;  // ou selon identifiant
  clearCart: () => void;
}

interface AllWorkerPlannedPrestationContextType {
  allWorkerPlannedPrestation: PlannedPrestation[] | null;
  setAllWorkerPlannedPrestation: (prestations: PlannedPrestation[]) => void;
}

interface AllUserPlannedPrestationContextType {
  allUserPlannedPrestation: PlannedPrestation[] | null;
  setAllUserPlannedPrestation: (prestations: PlannedPrestation[]) => void;
}

// Contexts
const UserContext = createContext<UserContextType | undefined>(undefined);
const CurrentWorkerPrestationContext = createContext<CurrentWorkerPrestationContextType | undefined>(undefined);
const AllWorkerPrestationContext = createContext<AllWorkerPrestationContextType | undefined>(undefined);
const PlannedPrestationContext = createContext<PlannedPrestationContextType | undefined>(undefined);
const UserConversationContext = createContext<UserConversationContextType | undefined>(undefined);
const WorkerConversationContext = createContext<WorkerConversationsContextType | undefined>(undefined);
const CartContext = createContext<CartContextType | undefined>(undefined);
const AllWorkerPlannedPrestationContext = createContext<AllWorkerPlannedPrestationContextType | undefined>(undefined);
const AllUserPlannedPrestationContext = createContext<AllUserPlannedPrestationContextType | undefined>(undefined);



// Providers
export const UserProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  return <UserContext.Provider value={{ user, setUser }}>{children}</UserContext.Provider>;
};

export const CurrentWorkerPrestationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentWorkerPrestation, setCurrentWorkerPrestation] = useState<Prestation | null>(null);
  return (
    <CurrentWorkerPrestationContext.Provider value={{ currentWorkerPrestation, setCurrentWorkerPrestation }}>
      {children}
    </CurrentWorkerPrestationContext.Provider>
  );
};

export const AllWorkerPrestationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [allWorkerPrestation, setAllWorkerPrestation] = useState<Prestation | null>(null);
  return (
    <AllWorkerPrestationContext.Provider value={{ allWorkerPrestation, setAllWorkerPrestation }}>
      {children}
    </AllWorkerPrestationContext.Provider>
  );
};

export const PlannedPrestationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [newPlannedPrestation, setNewPlannedPrestation] = useState<PlannedPrestation | null>(null);
  return (
    <PlannedPrestationContext.Provider value={{ newPlannedPrestation, setNewPlannedPrestation }}>
      {children}
    </PlannedPrestationContext.Provider>
  );
};

export const UserConversationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [userConversations, setUserConversations] = useState<Conversation[] | null>(null);
  return (
    <UserConversationContext.Provider value={{ userConversations, setUserConversations }}>
      {children}
    </UserConversationContext.Provider>
  );
};

export const WorkerConversationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [workerConversations, setWorkerConversations] = useState<Conversation[] | null>(null);
  return (
    <WorkerConversationContext.Provider value={{ workerConversations, setWorkerConversations }}>
      {children}
    </WorkerConversationContext.Provider>
  );
};

export const AllWorkerPlannedPrestationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [allWorkerPlannedPrestation, setAllWorkerPlannedPrestation] = useState<PlannedPrestation[] | null>(null);

  return (
    <AllWorkerPlannedPrestationContext.Provider value={{ allWorkerPlannedPrestation, setAllWorkerPlannedPrestation }}>
      {children}
    </AllWorkerPlannedPrestationContext.Provider>
  );
};

export const AllUserPlannedPrestationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [allUserPlannedPrestation, setAllUserPlannedPrestation] = useState<PlannedPrestation[] | null>(null);

  return (
    <AllUserPlannedPrestationContext.Provider value={{ allUserPlannedPrestation, setAllUserPlannedPrestation }}>
      {children}
    </AllUserPlannedPrestationContext.Provider>
  );
};


export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [cart, setCart] = useState<CartItem[]>([]);

  const addToCart = (item: CartItem) => {
    setCart(prev => [...prev, item]);
  };

  const removeFromCart = (index: number) => {
    setCart(prev => prev.filter((_, i) => i !== index));
  };

  const clearCart = () => {
    setCart([]);
  };

  return (
    <CartContext.Provider value={{ cart, addToCart, removeFromCart, clearCart }}>
      {children}
    </CartContext.Provider>
  );
};

// Hooks pour utiliser les contextes
export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser doit être utilisé à l’intérieur de UserProvider');
  }
  return context;
};

export const useCurrentWorkerPrestation = () => {
  const context = useContext(CurrentWorkerPrestationContext);
  if (!context) {
    throw new Error('useWorkerPrestation doit être utilisé à l’intérieur de WorkerPrestationProvider');
  }
  return context;
};

export const useAllWorkerPrestation = () => {
  const context = useContext(AllWorkerPrestationContext);
  if (!context) {
    throw new Error('useAllWorkerPrestation doit être utilisé à l’intérieur de AllWorkerPrestationProvider');
  }
  return context;
};

export const usePlannedPrestation = () => {
  const context = useContext(PlannedPrestationContext);
  if (!context) {
    throw new Error('usePlannedPrestation doit être utilisé à l’intérieur de PlannedPrestationProvider');
  }
  return context;
};

export const useUserConversations = () => {
  const context = useContext(UserConversationContext);
  if (!context) {
    throw new Error('useUserConversations doit être utilisé à l’intérieur de UserConversationProvider');
  }
  return context;
};

export const useWorkerConversation = () => {
  const context = useContext(WorkerConversationContext);
  if (!context) {
    throw new Error('useWorkerConversations doit être utilisé à l’intérieur de WorkerConversationsProvider');
  }
  return context;
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart doit être utilisé à l’intérieur de CartProvider');
  }
  return context;
};

export const useAllWorkerPlannedPrestation = () => {
  const context = useContext(AllWorkerPlannedPrestationContext);
  if (!context) {
    throw new Error('useAllWorkerPlannedPrestation doit être utilisé à l’intérieur de AllWorkerPlannedPrestationProvider');
  }
  return context;
};

export const useAllUserPlannedPrestation = () => {
  const context = useContext(AllUserPlannedPrestationContext);
  if (!context) {
    throw new Error('useAllUserPlannedPrestation doit être utilisé à l’intérieur de AllUserPlannedPrestationProvider');
  }
  return context;
};
