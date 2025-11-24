import moment from "moment";
import * as React from "react";
import { Image, StyleSheet, View } from "react-native";
import { Card } from "react-native-paper";
import {
  Menu,
  MenuOption,
  MenuOptions,
  MenuTrigger,
} from "react-native-popup-menu";
import Colors from "./Colors";
import JoinClassWebView from "./JoinClassWebView"; // ⬅️ ADD THIS IMPORT
import TextComponent from "./TextComponent";

// Define interface for props
interface ClassEventCardProps {
  imageUrl: any;
  title: string;
  start: string;
  end: string;
  link: string;
  price: string;
  status: string;
  onReschedule?: () => void;
  onCancel?: () => void;
  onDetails?: () => void;
  joinUrl?: string;
}

const ClassBookingCard: React.FC<ClassEventCardProps> = ({
  imageUrl,
  title,
  start,
  end,
  link,
  price,
  onReschedule,
  onCancel,
  onDetails,
  status,
}) => {
  
  const isRemote = typeof imageUrl === "string" && imageUrl.startsWith("http");

  // ⬅️ ADD WEBVIEW STATE
  const [webVisible, setWebVisible] = React.useState(false);

  return (
    <Card style={styles.card}>
      <View style={styles.container}>
        
        {/* Left image */}
        <Image
          source={isRemote ? { uri: imageUrl } : imageUrl}
          style={styles.image}
          resizeMode="cover"
        />

        {/* Right content */}
        <View style={styles.content}>
          
          <TextComponent type="headerText" style={styles.title}>
            {title}
          </TextComponent>

          <TextComponent type="semiBoldText" style={styles.description}>
            {`${moment(start).format("MMM DD, YYYY h:mm a")} - ${moment(end).format(
              "MMM DD, YYYY h:mm a"
            )}`}
          </TextComponent>

          {/* Existing text – DO NOT TOUCH */}
          <TextComponent type="semiBoldText" style={styles.description}>
            {link
              ? link
              : "The URL will be available 15 minutes before the class begins."}
          </TextComponent>

          {/* BELOW TEXT: Show clickable link ONLY if link exists */}
          {link ? (
            <TextComponent
              type="semiBoldText"
              style={{
                marginTop: -2,
                marginBottom: 8,
                color: Colors.Colors.blue,
                textDecorationLine: "underline",
              }}
              onPress={() => setWebVisible(true)}
            >
              Open Link
            </TextComponent>
          ) : null}

          <TextComponent type="boldText" style={{ marginVertical: 4 }}>
            <TextComponent
              type="semiBoldText"
              style={{ color: Colors.Colors.Light_black }}
            >
              Price :{" "}
            </TextComponent>
            {price}{" "}
            <TextComponent type="mediumText" style={styles.perPerson}>
              / Per Person
            </TextComponent>
          </TextComponent>

          {/* Status + Menu */}
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <TextComponent
                type="semiBoldText"
                style={{ color: Colors.Colors.Light_black }}
              >
                Status :
              </TextComponent>
              <View
                style={{
                  backgroundColor:
                    status === "confirmed"
                      ? Colors.Colors.confiem_bg
                      : status === "pending"
                      ? Colors.Colors.pending_bg
                      : status === "requested"
                      ? Colors.Colors.blue_bg
                      : Colors.Colors.cancel_bg,
                  padding: 4,
                  borderRadius: 16,
                  alignItems: "center",
                  justifyContent: "center",
                  marginLeft: 8,
                  paddingHorizontal: 10,
                }}
              >
                <TextComponent
                  type="boldText"
                  style={{
                    color:
                      status === "confirmed"
                        ? Colors.Colors.confirm_text
                        : status === "pending"
                        ? Colors.Colors.App_theme
                        : status === "requested"
                        ? Colors.Colors.blue
                        : Colors.Colors.canecl,
                  }}
                >
                  {status}
                </TextComponent>
              </View>
            </View>

            <Menu>
              <MenuTrigger>
                <Image
                  source={require("../../assets/C_menu_popup.png")}
                  style={{ width: 30, height: 30, marginRight: -10 }}
                  resizeMode="cover"
                />
              </MenuTrigger>

              <MenuOptions
                customStyles={{
                  optionsContainer: {
                    borderRadius: 8,
                    padding: 4,
                    backgroundColor: Colors.Colors.white,
                    width: 120,
                    alignItems: "center",
                    marginTop: 15,
                  },
                }}
              >
                <>
                  {status === "confirmed" && (
                    <MenuOption onSelect={onReschedule} style={{ marginTop: 10 }}>
                      <TextComponent
                        type="semiBoldText"
                        style={{ color: Colors.Colors.Light_black }}
                      >
                        Reschedule
                      </TextComponent>
                    </MenuOption>
                  )}

                  <MenuOption onSelect={onDetails} style={{ marginTop: 10 }}>
                    <TextComponent
                      type="semiBoldText"
                      style={{ color: Colors.Colors.Light_black }}
                    >
                      Details
                    </TextComponent>
                  </MenuOption>

                  {(status === "confirmed" || status === "requested") && (
                    <MenuOption
                      onSelect={onCancel}
                      style={{ marginTop: 10, marginBottom: 10 }}
                    >
                      <TextComponent type="semiBoldText" style={{ color: "red" }}>
                        Cancel
                      </TextComponent>
                    </MenuOption>
                  )}
                </>
              </MenuOptions>
            </Menu>
          </View>
        </View>
      </View>

      {/* WebView Modal */}
      <JoinClassWebView
        visible={webVisible}
        url={link}
        onClose={() => setWebVisible(false)}
      />
    </Card>
  );
};

export default ClassBookingCard;

const styles = StyleSheet.create({
  card: {
    borderRadius: 14,
    overflow: "hidden",
    marginBottom: 16,
    elevation: 3,
    backgroundColor: Colors.Colors.white,
  },
  container: {
    flexDirection: "row",
  },
  image: {
    width: 120,
    height: "100%",
  },
  content: {
    flex: 1,
    padding: 10,
    justifyContent: "space-between",
  },
  title: {
    fontSize: 12,
    marginBottom: 2,
  },
  description: {
    marginVertical: 6,
    fontSize: 10,
    color: Colors.Colors.Light_black,
  },
  perPerson: {
    fontSize: 12,
  },
});





// import moment from "moment";
// import * as React from "react";
// import { Image, StyleSheet, View } from "react-native";
// import { Card } from "react-native-paper";
// import {
//   Menu,
//   MenuOption,
//   MenuOptions,
//   MenuTrigger,
// } from "react-native-popup-menu";
// import Colors from "./Colors";
// import TextComponent from "./TextComponent";

// // Define interface for props
// interface ClassEventCardProps {
//   imageUrl: any;
//   title: string;
//   start:string;
//   end:string;
//   link: string;
//   price: string;
//   status:string;
//   onReschedule?: () => void;
//   onCancel?: () => void;
//   onDetails?: () => void;
//   joinUrl?: string;  
// }

// const ClassBookingCard: React.FC<ClassEventCardProps> = ({
//   imageUrl,
//   title,
//   start,
//   end,
//   link,
//   price,
//   onReschedule,
//   onCancel,
//   onDetails,
//   status,
//   joinUrl
// }) => {
//   const isRemote = typeof imageUrl === "string" && imageUrl.startsWith("http");
//   return (
//     <Card style={styles.card}>
//       <View style={styles.container}>
//         {/* Left image */}
//         <Image
//           source={isRemote ? { uri: imageUrl } : imageUrl}
//           style={styles.image}
//           resizeMode="cover"
//         />

//         {/* Right content */}
//         <View style={styles.content}>
//           <TextComponent type="headerText" style={styles.title}>
//             {title}
//           </TextComponent>
//           <TextComponent type="semiBoldText" style={styles.description}>
//            {`${moment(start).format("MMM DD, YYYY h:mm a")} - ${moment(end).format("MMM DD, YYYY h:mm a")}`}
//           </TextComponent>
//           <TextComponent type="semiBoldText" style={styles.description}>
//             {link
//               ? link
//               : "The URL will be available 15 minutes before the class begins."}
//           </TextComponent>
//           <TextComponent type="boldText" style={{ marginVertical: 4 }}>
//             <TextComponent
//               type="semiBoldText"
//               style={{ color: Colors.Colors.Light_black }}
//             >
//               Price :{" "}
//             </TextComponent>
//             {price}{" "}
//             <TextComponent type="mediumText" style={styles.perPerson}>
//               / Per Person
//             </TextComponent>
//           </TextComponent>
//           <View
//             style={{
//               flexDirection: "row",
//               justifyContent: "space-between",
//               alignItems: "center",
//             }}
//           >
//             <View style={{ flexDirection: "row", alignItems: "center" }}>
//               <TextComponent
//                 type="semiBoldText"
//                 style={{ color: Colors.Colors.Light_black }}
//               >
//                 Status :
//               </TextComponent>
//               <View
//                 style={{
//                   backgroundColor: status === "confirmed" ? Colors.Colors.confiem_bg :  status === "pending" ? Colors.Colors.pending_bg : status === "requested" ? Colors.Colors.blue_bg : Colors.Colors.cancel_bg,
//                   padding: 4,
//                   borderRadius: 16,
//                   alignItems: "center",
//                   justifyContent: "center",
//                   marginLeft: 8,
//                   paddingHorizontal: 10,
//                 }}
//               >
//                 <TextComponent
//                   type="boldText"
//                   style={{ color: status === "confirmed" ? Colors.Colors.confirm_text :  status === "pending" ?  Colors.Colors.App_theme : status === "requested" ? Colors.Colors.blue : Colors.Colors.canecl}}
//                 >
//                   {status}
//                 </TextComponent>
//               </View>
//             </View>
//             <Menu>
//               <MenuTrigger>
//                 <Image
//                   source={require("../../assets/C_menu_popup.png")}
//                   style={{ width: 30, height: 30, marginRight: -10 }}
//                   resizeMode="cover"
//                 />
//               </MenuTrigger>
//               <MenuOptions
//                 customStyles={{
//                   optionsContainer: {
//                     borderRadius: 8,
//                     padding: 4,
//                     backgroundColor: Colors.Colors.white,
//                     width: 120,
//                     alignItems: "center",
//                     marginTop: 15,
//                   },
//                 }}
//               >
//                 <>
//                 {status === "confirmed" && 
//                 <MenuOption onSelect={onReschedule} style={{ marginTop: 10 }}>
//                   <TextComponent
//                     type="semiBoldText"
//                     style={{ color: Colors.Colors.Light_black }}
//                   >
//                     Reschedule
//                   </TextComponent>
//                 </MenuOption>
// }
//                 <MenuOption onSelect={onDetails} style={{ marginTop: 10 }}>
//                   <TextComponent
//                     type="semiBoldText"
//                     style={{ color: Colors.Colors.Light_black }}
//                   >
//                     Details
//                   </TextComponent>
//                 </MenuOption>
// {(status === "confirmed" || status === "requested") &&
//                 <MenuOption
//                   onSelect={onCancel}
//                   style={{ marginTop: 10, marginBottom: 10 }}
//                 >
//                   <TextComponent type="semiBoldText" style={{ color: "red" }}>
//                     Cancel
//                   </TextComponent>
//                 </MenuOption>
// }
//                 </>
//               </MenuOptions>
//             </Menu>
//           </View>
//           {/* Buttons row */}
//           {/* <View style={styles.buttonRow}>
//             <TouchableOpacity onPress={onViewDetails}>
//               <TextComponent type="semiBoldText">View Details</TextComponent>
//             </TouchableOpacity>
//               <TouchableOpacity onPress={onViewDetails} style={{backgroundColor:Colors.Colors.App_theme,padding:8,borderRadius:6,marginLeft:10}}>
//               <TextComponent type="semiBoldText" style={{color:Colors.Colors.white}}>View Details</TextComponent>
//             </TouchableOpacity>
//           </View> */}
//         </View>
//       </View>
//     </Card>
//   );
// };

// export default ClassBookingCard;

// const styles = StyleSheet.create({
//   card: {
//     borderRadius: 14,
//     overflow: "hidden",
//     marginBottom: 16,
//     elevation: 3,
//     backgroundColor: Colors.Colors.white,
//   },
//   container: {
//     flexDirection: "row",
//   },
//   image: {
//     width: 120,
//     height: "100%",
//   },
//   content: {
//     flex: 1,
//     padding: 10,
//     justifyContent: "space-between",
//   },
//   title: {
//     fontSize: 12,
//     marginBottom: 2,
//   },
//   description: {
//     marginVertical: 6,
//     fontSize: 10,
//     color: Colors.Colors.Light_black,
//   },
//   bold: {
//     color: Colors.Colors.BLACK,
//   },
//   price: {
//     marginVertical: 4,
//   },
//   perPerson: {
//     fontSize: 12,
//   },
//   buttonRow: {
//     flexDirection: "row",
//     alignSelf: "flex-end",
//     marginTop: 6,
//     alignItems: "center",
//   },
// });
