import { useSyncExternalStore } from "react";
import { getHaatProductById } from "./haatData";

const STORAGE_KEY = "kalpx.haat.state.v1";
const EVENT_NAME = "kalpx-haat-state-change";

export type HaatCartEntry = {
  productId: number;
  quantity: number;
};

export type HaatAddress = {
  id: number;
  name: string;
  mobile: string;
  country: string;
  state: string;
  city: string;
  area: string;
};

type HaatState = {
  cart: HaatCartEntry[];
  wishlist: number[];
  addresses: HaatAddress[];
  selectedAddressId: number | null;
};

const defaultState: HaatState = {
  cart: [],
  wishlist: [],
  addresses: [
    {
      id: 1,
      name: "Ramesh Shankar",
      mobile: "9823456367",
      country: "India",
      state: "Delhi",
      city: "New Delhi",
      area: "Flat 302, Shanti Apartments, Lajpat Nagar, New Delhi - 110024",
    },
    {
      id: 2,
      name: "Banu Elson",
      mobile: "9823456367",
      country: "India",
      state: "Delhi",
      city: "New Delhi",
      area: "Flat 302, Shanti Apartments, Lajpat Nagar, New Delhi - 110024",
    },
  ],
  selectedAddressId: 1,
};

let currentState: HaatState = defaultState;

function canUseDom() {
  return typeof window !== "undefined" && typeof localStorage !== "undefined";
}

function parseStoredState(): HaatState {
  if (!canUseDom()) return currentState;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultState;
    const parsed = JSON.parse(raw) as Partial<HaatState>;
    return {
      cart: Array.isArray(parsed.cart) ? parsed.cart : [],
      wishlist: Array.isArray(parsed.wishlist) ? parsed.wishlist : [],
      addresses:
        Array.isArray(parsed.addresses) && parsed.addresses.length
          ? parsed.addresses
          : defaultState.addresses,
      selectedAddressId:
        typeof parsed.selectedAddressId === "number"
          ? parsed.selectedAddressId
          : defaultState.selectedAddressId,
    };
  } catch {
    return defaultState;
  }
}

function syncStateFromStorage() {
  currentState = parseStoredState();
  return currentState;
}

function readState(): HaatState {
  return currentState;
}

function writeState(state: HaatState) {
  if (!canUseDom()) return;
  currentState = state;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  window.dispatchEvent(new Event(EVENT_NAME));
}

function updateState(updater: (state: HaatState) => HaatState) {
  writeState(updater(readState()));
}

function subscribe(onStoreChange: () => void) {
  if (!canUseDom()) return () => {};
  syncStateFromStorage();
  const handler = () => {
    syncStateFromStorage();
    onStoreChange();
  };
  window.addEventListener(EVENT_NAME, handler);
  window.addEventListener("storage", handler);
  return () => {
    window.removeEventListener(EVENT_NAME, handler);
    window.removeEventListener("storage", handler);
  };
}

export function useHaatState() {
  return useSyncExternalStore(subscribe, readState, () => defaultState);
}

export function addProductToCart(productId: number, quantity = 1) {
  updateState((state) => {
    const existing = state.cart.find((item) => item.productId === productId);
    if (existing) {
      return {
        ...state,
        cart: state.cart.map((item) =>
          item.productId === productId
            ? { ...item, quantity: item.quantity + quantity }
            : item,
        ),
      };
    }
    return {
      ...state,
      cart: [...state.cart, { productId, quantity }],
    };
  });
}

export function setCartQuantity(productId: number, quantity: number) {
  updateState((state) => ({
    ...state,
    cart:
      quantity <= 0
        ? state.cart.filter((item) => item.productId !== productId)
        : state.cart.map((item) =>
            item.productId === productId ? { ...item, quantity } : item,
          ),
  }));
}

export function removeFromCart(productId: number) {
  updateState((state) => ({
    ...state,
    cart: state.cart.filter((item) => item.productId !== productId),
  }));
}

export function toggleWishlist(productId: number) {
  updateState((state) => {
    const isActive = state.wishlist.includes(productId);
    return {
      ...state,
      wishlist: isActive
        ? state.wishlist.filter((id) => id !== productId)
        : [...state.wishlist, productId],
    };
  });
}

export function getCartCount(state: HaatState) {
  return state.cart.reduce((sum, item) => sum + item.quantity, 0);
}

export function getCartItemsDetailed(state: HaatState) {
  return state.cart.map((entry) => ({
    ...entry,
    product: getHaatProductById(entry.productId),
  }));
}

export function getWishlistProducts(state: HaatState) {
  return state.wishlist.map((id) => getHaatProductById(id));
}

export function isWishlisted(state: HaatState, productId: number) {
  return state.wishlist.includes(productId);
}

export function getAddresses(state: HaatState) {
  return state.addresses;
}

export function getSelectedAddress(state: HaatState) {
  return (
    state.addresses.find((item) => item.id === state.selectedAddressId) ??
    state.addresses[0] ??
    null
  );
}

export function selectAddress(addressId: number) {
  updateState((state) => ({
    ...state,
    selectedAddressId: addressId,
  }));
}

export function saveAddress(address: Omit<HaatAddress, "id">, id?: number) {
  updateState((state) => {
    if (id != null) {
      return {
        ...state,
        addresses: state.addresses.map((item) =>
          item.id === id ? { ...item, ...address, id } : item,
        ),
      };
    }

    const nextId = state.addresses.length
      ? Math.max(...state.addresses.map((item) => item.id)) + 1
      : 1;

    return {
      ...state,
      addresses: [...state.addresses, { ...address, id: nextId }],
      selectedAddressId: nextId,
    };
  });
}
