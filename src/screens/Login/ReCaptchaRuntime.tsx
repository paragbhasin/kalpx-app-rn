
import React, { forwardRef, useImperativeHandle, useRef } from "react";
import { StyleSheet, View } from "react-native";
import { WebView } from "react-native-webview";


const siteKey = "6LfmCiArAAAAAHI_Umc2qhlNXbLoz6l6_C_rpRXz";
const baseUrl = "https://kalpx.com";

type ReCaptchaRuntimeProps = {
  onToken?: (token: string) => void;
};

const ReCaptchaRuntime = forwardRef<unknown, ReCaptchaRuntimeProps>(({ onToken }, ref) => {
  const webviewRef = useRef(null);

  useImperativeHandle(ref, () => ({
    requestNewToken: () => {
      webviewRef.current?.injectJavaScript("generateToken();");
    }
  }));

  const html = `
    <!DOCTYPE html>
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
      <body>
        <button onclick="generateToken()">Generate Token</button>
      </body>
    </html>
  `;

  return (
    <View style={styles.container}>
      <WebView
        ref={webviewRef}
        originWhitelist={["*"]}
        source={{ html, baseUrl }}
        onMessage={(event) => {
          if (onToken) onToken(event.nativeEvent.data);
        }}
        style={{ flex: 0, height: 0, width: 0 }} // hide WebView
      />
    </View>
  );
});

export default ReCaptchaRuntime;

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", alignItems: "center" },
});
