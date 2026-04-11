import React, { forwardRef, useImperativeHandle, useRef } from "react";
import { StyleSheet, View } from "react-native";
import { WebView } from "react-native-webview";

const siteKey = "6LfmCiArAAAAAHI_Umc2qhlNXbLoz6l6_C_rpRXz";
const baseUrl = "https://kalpx.com";

type ReCaptchaRuntimeProps = {
  onToken?: (token: string) => void;
};

const ReCaptchaRuntime = forwardRef<unknown, ReCaptchaRuntimeProps>(
  ({ onToken }, ref) => {
    const webviewRef = useRef<WebView>(null);

    useImperativeHandle(ref, () => ({
      requestNewToken: () => {
        webviewRef.current?.injectJavaScript("generateToken(); true;");
      },
    }));

    const html = `<!DOCTYPE html>
<html>
  <head>
    <script src="https://www.google.com/recaptcha/api.js?render=${siteKey}"></script>
    <script>
      function generateToken() {
        grecaptcha.ready(function() {
          grecaptcha.execute('${siteKey}', { action: 'login' }).then(function(token) {
            window.ReactNativeWebView.postMessage(token);
          });
        });
      }
    </script>
  </head>
  <body></body>
</html>`;

    // Offscreen with non-zero size so Fabric's view reconciler doesn't race
    // the viewState for this tag during nav transitions into the Login
    // screen. width/height=0 crashes with "Unable to find viewState for
    // tag N" on newArchEnabled:true builds. collapsable=false keeps the
    // view in the tree even with zero-children defs.
    return (
      <View style={styles.hidden} pointerEvents="none" collapsable={false}>
        <WebView
          ref={webviewRef}
          originWhitelist={["*"]}
          source={{ html, baseUrl }}
          onMessage={(event) => {
            if (onToken) onToken(event.nativeEvent.data);
          }}
          style={styles.webview}
          javaScriptEnabled
          domStorageEnabled
        />
      </View>
    );
  },
);

export default ReCaptchaRuntime;

const styles = StyleSheet.create({
  hidden: {
    position: "absolute",
    width: 1,
    height: 1,
    left: -9999,
    top: -9999,
    opacity: 0,
  },
  webview: {
    width: 1,
    height: 1,
    backgroundColor: "transparent",
  },
});
