import { createNavigationContainerRef, DrawerActions } from "@react-navigation/native";

export const navigationRef = createNavigationContainerRef<any>();

let drawerRef: any = null;

export const setDrawerRef = (ref: any) => {
  drawerRef = ref;
};

export function openDrawer() {
  if (drawerRef) {
    drawerRef.dispatch(DrawerActions.openDrawer());
  }
}

export function navigate(name: string, params?: any) {
  if (navigationRef.isReady()) {
    (navigationRef.navigate as any)(name, params);
  }
}
