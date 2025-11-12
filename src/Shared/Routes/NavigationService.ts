// NavigationService.ts
import { DrawerActions } from "@react-navigation/native";

let drawerRef: any = null;

export const setDrawerRef = (ref: any) => {
  drawerRef = ref;
};

export function openDrawer() {
  if (drawerRef) {
    drawerRef.dispatch(DrawerActions.openDrawer());
  }
}
