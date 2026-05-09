import { useEffect, useState } from "react";
import { api } from "../../lib/api";
import { WEB_ENV } from "../../lib/env";
import {
  haatProducts,
  trustedProductStores,
  type HaatProduct,
  type HaatStore,
} from "./haatData";

const CATALOG_STORAGE_KEY = "kalpx.haat.catalog.v1";

type HaatCatalogCache = {
  stores: HaatStore[];
  products: HaatProduct[];
};

const defaultCatalogCache: HaatCatalogCache = {
  stores: trustedProductStores,
  products: haatProducts,
};

function canUseDom() {
  return typeof window !== "undefined" && typeof localStorage !== "undefined";
}

function readCatalogCache(): HaatCatalogCache {
  if (!canUseDom()) return defaultCatalogCache;
  try {
    const raw = localStorage.getItem(CATALOG_STORAGE_KEY);
    if (!raw) return defaultCatalogCache;
    const parsed = JSON.parse(raw) as Partial<HaatCatalogCache>;
    return {
      stores:
        Array.isArray(parsed.stores) && parsed.stores.length
          ? parsed.stores
          : defaultCatalogCache.stores,
      products:
        Array.isArray(parsed.products) && parsed.products.length
          ? parsed.products
          : defaultCatalogCache.products,
    };
  } catch {
    return defaultCatalogCache;
  }
}

let catalogCache = readCatalogCache();

function writeCatalogCache(nextCache: HaatCatalogCache) {
  catalogCache = nextCache;
  if (!canUseDom()) return;
  localStorage.setItem(CATALOG_STORAGE_KEY, JSON.stringify(nextCache));
}

function setCatalogPartial(partial: Partial<HaatCatalogCache>) {
  writeCatalogCache({
    stores: partial.stores ?? catalogCache.stores,
    products: partial.products ?? catalogCache.products,
  });
}

function extractList(payload: unknown): any[] {
  if (Array.isArray(payload)) return payload;
  if (payload && typeof payload === "object") {
    const record = payload as Record<string, unknown>;
    if (Array.isArray(record.results)) return record.results as any[];
    if (Array.isArray(record.data)) return record.data as any[];
    if (Array.isArray(record.items)) return record.items as any[];
  }
  return [];
}

function parsePriceMinor(value: unknown) {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string") {
    const numeric = Number(value.replace(/[^\d.]/g, ""));
    if (Number.isFinite(numeric)) return numeric;
  }
  return 0;
}

function toAbsoluteImageUrl(value: unknown) {
  if (typeof value !== "string" || !value.trim()) return "";
  if (value.startsWith("http://") || value.startsWith("https://")) return value;
  if (value.startsWith("/")) return `${WEB_ENV.imageBaseUrl}${value}`;
  return `${WEB_ENV.imageBaseUrl}/${value}`;
}

function normalizeStoreReference(raw: any) {
  return {
    id: Number(raw?.id ?? 0),
    store_name: String(raw?.store_name ?? raw?.name ?? "Kalpx Store"),
  };
}

function normalizeAttributes(raw: unknown): Record<string, string> {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) {
    return {
      material: "Traditional",
      "Product Height": "Standard",
      colour: "Natural",
      weight: "N/A",
    };
  }

  const entries = Object.entries(raw as Record<string, unknown>)
    .filter(([, value]) => value != null && `${value}`.trim() !== "")
    .map(([key, value]) => [key, String(value)] as const);

  if (!entries.length) {
    return {
      material: "Traditional",
      "Product Height": "Standard",
      colour: "Natural",
      weight: "N/A",
    };
  }

  return Object.fromEntries(entries);
}

function normalizeProductImages(raw: any): { url: string }[] {
  const candidates = Array.isArray(raw?.images)
    ? raw.images
    : raw?.image
      ? [raw.image]
      : [];

  const normalized = candidates
    .map((item: any) => {
      if (typeof item === "string") return toAbsoluteImageUrl(item);
      if (item && typeof item === "object") {
        return toAbsoluteImageUrl(
          item.url ?? item.image ?? item.file ?? item.path,
        );
      }
      return "";
    })
    .filter(Boolean)
    .map((url: string) => ({ url }));

  if (normalized.length) return normalized;
  return [{ url: haatProducts[0]?.images[0]?.url ?? "" }];
}

function normalizeStore(raw: any): HaatStore {
  const storeRef = normalizeStoreReference(raw);
  return {
    ...storeRef,
    image: toAbsoluteImageUrl(raw?.logo ?? raw?.image ?? raw?.banner) ||
      trustedProductStores[0]?.image ||
      "/haat-assets/default-store.png",
    rating: String(raw?.rating ?? "4.5"),
    time: String(raw?.time ?? raw?.delivery_time ?? "30-40 min"),
    distance: String(raw?.distance ?? raw?.distance_label ?? "Nearby"),
    location: String(raw?.location ?? raw?.address ?? raw?.area ?? ""),
    description: String(raw?.description ?? ""),
    open: String(raw?.open ?? raw?.opening_time ?? raw?.open_time ?? ""),
    close: String(raw?.close ?? raw?.closing_time ?? raw?.close_time ?? ""),
    phoenNumber: String(
      raw?.phoenNumber ?? raw?.phoneNumber ?? raw?.phone_number ?? raw?.mobile ?? "",
    ),
  };
}

function normalizeProduct(raw: any): HaatProduct {
  return {
    id: Number(raw?.id ?? 0),
    name: String(raw?.name ?? raw?.product_name ?? "Haat Product"),
    price_minor: parsePriceMinor(
      raw?.price_minor ?? raw?.price ?? raw?.selling_price,
    ),
    images: normalizeProductImages(raw),
    store: normalizeStoreReference(raw?.store ?? raw?.vendor ?? raw?.shop),
    rating: Number(raw?.rating ?? raw?.store?.rating ?? 4.5),
    description: String(raw?.description ?? raw?.short_description ?? ""),
    attributes: normalizeAttributes(
      raw?.attributes ?? raw?.specifications ?? raw?.metadata,
    ),
  };
}

export function getCachedHaatStores() {
  return catalogCache.stores;
}

export function getCachedHaatProducts() {
  return catalogCache.products;
}

export function getCachedHaatProductById(id: number) {
  return (
    catalogCache.products.find((item) => item.id === id) ??
    haatProducts.find((item) => item.id === id) ??
    catalogCache.products[0] ??
    haatProducts[0]
  );
}

export function getCachedHaatStoreById(id: number) {
  return (
    catalogCache.stores.find((item) => item.id === id) ??
    trustedProductStores.find((item) => item.id === id) ??
    catalogCache.stores[0] ??
    trustedProductStores[0]
  );
}

export async function fetchHaatStores(params?: Record<string, unknown>) {
  const response = await api.get("/haat/stores/", { params });
  const stores = extractList(response.data)
    .map(normalizeStore)
    .filter((item) => item.id);

  if (stores.length) {
    setCatalogPartial({ stores });
    return stores;
  }

  return catalogCache.stores;
}

export async function fetchHaatProducts(params?: Record<string, unknown>) {
  const response = await api.get("/haat/products/", { params });
  const products = extractList(response.data)
    .map(normalizeProduct)
    .filter((item) => item.id);

  if (products.length) {
    setCatalogPartial({ products });
    return products;
  }

  return catalogCache.products;
}

export async function fetchHaatStoreDetail(idOrSlug: string | number) {
  const response = await api.get(`/haat/stores/${idOrSlug}/`);
  const store = normalizeStore(response.data);
  const nextStores = [...catalogCache.stores];
  const existingIndex = nextStores.findIndex((item) => item.id === store.id);
  if (existingIndex >= 0) nextStores[existingIndex] = store;
  else nextStores.unshift(store);
  setCatalogPartial({ stores: nextStores });
  return store;
}

export async function fetchHaatProductDetail(id: number) {
  const response = await api.get(`/haat/products/${id}/`);
  const product = normalizeProduct(response.data);
  const nextProducts = [...catalogCache.products];
  const existingIndex = nextProducts.findIndex((item) => item.id === product.id);
  if (existingIndex >= 0) nextProducts[existingIndex] = product;
  else nextProducts.unshift(product);
  setCatalogPartial({ products: nextProducts });
  return product;
}

export function useHaatCatalog() {
  const [stores, setStores] = useState<HaatStore[]>(() => getCachedHaatStores());
  const [products, setProducts] = useState<HaatProduct[]>(() => getCachedHaatProducts());
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let active = true;

    async function load() {
      setLoading(true);
      try {
        const [nextStores, nextProducts] = await Promise.all([
          fetchHaatStores(),
          fetchHaatProducts(),
        ]);
        if (!active) return;
        setStores(nextStores);
        setProducts(nextProducts);
      } catch {
        if (!active) return;
        setStores(getCachedHaatStores());
        setProducts(getCachedHaatProducts());
      } finally {
        if (active) setLoading(false);
      }
    }

    load();
    return () => {
      active = false;
    };
  }, []);

  return { stores, products, loading };
}

export function useHaatProductDetail(productId: number) {
  const [product, setProduct] = useState<HaatProduct>(() =>
    getCachedHaatProductById(productId),
  );

  useEffect(() => {
    if (!productId) return;
    let active = true;

    fetchHaatProductDetail(productId)
      .then((nextProduct) => {
        if (active) setProduct(nextProduct);
      })
      .catch(() => {
        if (active) setProduct(getCachedHaatProductById(productId));
      });

    return () => {
      active = false;
    };
  }, [productId]);

  return product;
}

export function useHaatStoreDetail(storeId: string | number) {
  const numericStoreId = Number(storeId);
  const [store, setStore] = useState<HaatStore>(() =>
    getCachedHaatStoreById(numericStoreId),
  );

  useEffect(() => {
    if (!storeId) return;
    let active = true;

    fetchHaatStoreDetail(storeId)
      .then((nextStore) => {
        if (active) setStore(nextStore);
      })
      .catch(() => {
        if (active) setStore(getCachedHaatStoreById(numericStoreId));
      });

    return () => {
      active = false;
    };
  }, [numericStoreId, storeId]);

  return store;
}
