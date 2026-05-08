import api from "./axios";

// 1️⃣ Get All Public Stores
export const getStores = (params) => {
  return api.get("/haat/stores/", { params });
};

// 2️⃣ Get Store Detail
export const getStoreDetail = (slug) => {
  return api.get(`/haat/stores/${slug}/`);
};

// 3️⃣ Get All Public Products
export const getProducts = (params) => {
  return api.get("/haat/products/", { params });
};

// 4️⃣ Get Product Detail
export const getProductDetail = (id) => {
  return api.get(`/haat/products/${id}/`);
};
