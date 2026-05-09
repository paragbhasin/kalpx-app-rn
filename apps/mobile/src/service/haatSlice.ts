import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import {
  getProductDetail,
  getProducts,
  getStoreDetail,
  getStores,
} from "../Networks/haatApi";
interface HaatState {
  stores: any[];
  products: any[];
  storeDetail: any | null;
  productDetail: any | null;
  loading: boolean;
}

const initialState: HaatState = {
  stores: [],
  products: [],
  storeDetail: null,
  productDetail: null,
  loading: false,
};
export const fetchStores = createAsyncThunk(
  "haat/fetchStores",
  async (params?: any) => {
    const res = await getStores(params);
    return res.data;
  },
);

export const fetchStoreDetail = createAsyncThunk(
  "haat/fetchStoreDetail",
  async (slug: string) => {
    const res = await getStoreDetail(slug);
    return res.data;
  },
);

export const fetchProducts = createAsyncThunk(
  "haat/fetchProducts",
  async (params?: any) => {
    const res = await getProducts(params);
    return res.data;
  },
);

export const fetchProductDetail = createAsyncThunk(
  "haat/fetchProductDetail",
  async (id: number) => {
    const res = await getProductDetail(id);
    return res.data;
  },
);
const haatSlice = createSlice({
  name: "haat",
  initialState,
  reducers: {},

  extraReducers: (builder) => {
    builder

      // Stores
      .addCase(fetchStores.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchStores.fulfilled, (state, action) => {
        state.loading = false;
        state.stores = action.payload;
      })

      // Store Detail
      .addCase(fetchStoreDetail.fulfilled, (state, action) => {
        state.storeDetail = action.payload;
      })

      // Products
      .addCase(fetchProducts.fulfilled, (state, action) => {
        state.products = action.payload;
      })

      // Product Detail
      .addCase(fetchProductDetail.fulfilled, (state, action) => {
        state.productDetail = action.payload;
      });
  },
});

export default haatSlice.reducer;
