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

// Navigate to a screen inside the Home tab's stack from anywhere (deep link /
// Live Activity tap). The Home stack is triple-nested:
//   Root > "AppDrawer" > "HomePage" (drawer → BottomMenu) > "HomePage" (tab → HomeStack) > screen
// A flat navigate(name) can't resolve deeply nested runner screens ("not
// handled by any navigator"), and starting at the ambiguous "HomePage" (which
// is BOTH a drawer screen and a tab) collapses to the stack's initial route.
// Using the fully-qualified path from "AppDrawer" disambiguates and drills in.
export function navigateInHomeStack(screen: string, params?: any) {
  if (!navigationRef.isReady()) return;
  (navigationRef.navigate as any)("AppDrawer", {
    screen: "HomePage",
    params: {
      screen: "HomePage",
      params: { screen, params },
    },
  });
}
