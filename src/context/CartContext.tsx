// context/CartContext.tsx
import React, { createContext, useContext, useState } from "react";

const CartContext = createContext<any>(null);

export const CartProvider = ({ children }) => {
  const [cartModalVisible, setCartModalVisible] = useState(false);
  const [localPractices, setLocalPractices] = useState<any[]>([]);

  // ⭐ Track which API practices the user has removed (by practice_id)
  const [removedApiIds, setRemovedApiIds] = useState<Set<string | number>>(
    new Set()
  );

  const addPractice = (practice: any) => {
    const unified =
      practice.unified_id ?? practice.practice_id ?? practice.id ?? Date.now();

    setLocalPractices((prev) => {
      if (
        prev.some(
          (p) =>
            (p.unified_id ?? p.practice_id ?? p.id) === unified
        )
      ) {
        return prev;
      }

      return [
        ...prev,
        {
          ...practice,
          unified_id: unified,
        },
      ];
    });
  };

  const removePractice = (idOrUnified: string | number) => {
    setLocalPractices((prev) =>
      prev.filter(
        (p) =>
          (p.unified_id ?? p.practice_id ?? p.id) !== idOrUnified
      )
    );
  };

  // ⭐ Special remover for API practices → also mark as "removed from API"
  const removeApiPractice = (practiceId: string | number) => {
    setRemovedApiIds((prev) => {
      const next = new Set(prev);
      next.add(practiceId);
      return next;
    });

    setLocalPractices((prev) =>
      prev.filter(
        (p) =>
          (p.practice_id ?? p.id ?? p.unified_id) !== practiceId
      )
    );
  };

  const clearCart = () => {
    setLocalPractices([]);
    setRemovedApiIds(new Set());
  };

// ⭐ Used when user chooses "Leave" in ConfirmDiscardModal
const resetFromMerged = (mergedPractices: any[]) => {
  setLocalPractices((prev) => {
    // 👇 Keep all custom practices that were created in CreateOwnPractice
    const customPractices = prev.filter(
      (item) =>
        item.source === "custom" &&
        item.details?.details?.isCustom &&
        item.isSubmitted !== true
    );

    // 👇 Rebuild merged API + resume list with unified_id
    const merged = mergedPractices.map((p) => ({
      ...p,
      unified_id: p.unified_id ?? p.practice_id ?? p.id,
    }));

    // 🔥 Final list = API + resume + custom
    return [...merged, ...customPractices];
  });

  // Reset removed API ids
  setRemovedApiIds(new Set());
};


  return (
    <CartContext.Provider
      value={{
        cartModalVisible,
        setCartModalVisible,
        localPractices,
        addPractice,
        removePractice,
        removeApiPractice,
        resetFromMerged,
        clearCart,
        removedApiIds,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);





// import React, { createContext, useContext, useState } from "react";

// const CartContext = createContext(null);

// export const CartProvider = ({ children }) => {
//   const [cartModalVisible, setCartModalVisible] = useState(false);
//   const [localPractices, setLocalPractices] = useState([]);

//   const normalize = (practice) => {
//     const unifiedId = practice.practice_id ?? practice.id ?? Date.now();

//     return {
//       ...practice,
//       unified_id: unifiedId,
//       id: unifiedId,
//       practice_id: unifiedId,
//     };
//   };

//   const addPractice = (practice) => {
//     const item = normalize(practice);

//     setLocalPractices((prev) => {
//       if (prev.some((p) => p.unified_id === item.unified_id)) return prev;
//       return [...prev, item];
//     });
//   };

//   const removePractice = (unified_id) => {
//     setLocalPractices((prev) =>
//       prev.filter((p) => p.unified_id !== unified_id)
//     );
//   };

//   const clearCart = () => {
//     setLocalPractices([]);
//   };

//   return (
//     <CartContext.Provider
//       value={{
//         cartModalVisible,
//         setCartModalVisible,
//         localPractices,
//         addPractice,
//         removePractice,
//         clearCart,
//       }}
//     >
//       {children}
//     </CartContext.Provider>
//   );
// };

// export const useCart = () => useContext(CartContext);





// import React, { createContext, useContext, useState } from "react";

// const CartContext = createContext(null);

// export const CartProvider = ({ children }) => {
//   const [cartModalVisible, setCartModalVisible] = useState(false);
//   const [localPractices, setLocalPractices] = useState([]);

//   const addPractice = (practice) => {
//     setLocalPractices((prev) => [
//       ...prev,
//       {
//         ...practice,
//         id: practice.id ?? Date.now(),
//       },
//     ]);
//   };

//   const removePractice = (id) => {
//     setLocalPractices((prev) => prev.filter((p) => p.id !== id));
//   };

//   const clearCart = () => {
//     setLocalPractices([]);
//   };

//   return (
//     <CartContext.Provider
//       value={{
//         cartModalVisible,
//         setCartModalVisible,
//         localPractices,
//         addPractice,
//         removePractice,
//         clearCart, // ✅ expose here
//       }}
//     >
//       {children}
//     </CartContext.Provider>
//   );
// };

// export const useCart = () => useContext(CartContext);
