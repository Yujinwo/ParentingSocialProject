import { StyleSheet } from "react-native";
import Constants from "expo-constants";

const styles = StyleSheet.create({
  Camcontainer: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "white",
  },
  containerImg: {
    flex: 1,
  },
  preview: {
    flex: 1,
    justifyContent: "flex-end",
    alignItems: "center",
    aspectRatio: 3 / 4,
  },
  button1: {
    alignSelf: "center",
    alignContent: "center",
    justifyContent: "center",
    marginVertical: 20,
  },
  flipcamera: {},
  buttonContainer: {
    padding: 13,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  container: {

    backgroundColor: "#fff",
  },
  button: {
    marginVertical: 10,
    paddingVertical: 5,
    color: "#fff",
    tintColor: "#fff",
  },
  boldText: {
    fontWeight: "bold",
    fontSize: 18,
  },
  contentContainer: {
    paddingHorizontal: 0,
  },
  caption: {
    color: "#5f5f5f",
  },
  droidSafeArea: {
    paddingTop: Constants.statusBarHeight,
  },
  topContainer: {
    backgroundColor: "transparent",
    paddingTop: "30%",
  },
  userRaw: {
    justifyContent: "center",
    alignItems: "flex-end",
    flexDirection: "row",
  },
  userDataContaienr: {
    flexDirection: "row",
    flex: 1,
    alignItems: "center",
    justifyContent: "space-around",
  },
  userNameRaw: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginHorizontal: 20,
    marginBottom: 10,
    alignItems: "center",
  },
  editProfile: {
    marginHorizontal: 10,
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
  },
  images: {
    flex: 1,
    marginLeft: 10,
    // width: useWindowDimensions().width / 3,
  },
  centerContent: {
    justifyContent: "center",
    alignItems: "center",
    flex: 1,
  },
  iconButton: {
    backgroundColor: "white",
    elevation: 10,
    borderColor: "black",
    borderWidth: 0.5,
    marginBottom: -10, 
    marginLeft: -42,
  },
  subHeading: {
    fontSize: 20,
    marginVertical: 10,
  },
  input: {
    marginVertical: 10,
  },
  shadowProp: {
    shadowColor: "#171717",
    shadowOffset: { width: -2, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
  },
  searchBarStyle: {
    padding: 0,
    marginHorizontal: 10,
    backgroundColor: "#f000",
    borderBottomColor: "#f000",
    borderTopColor: "#f000",
  },
  searchBarInput: {
    backgroundColor: 'gray',
    height: 40,
    padding: 5,
  },
  userItem: {
    margin: 10,
    borderBottomColor: 'gray',
    borderBottomWidth: 0.5,
  },
  pageSubTitle: {
    fontSize: 25,
    color: 'gray',
    fontWeight: "600",
    marginBottom: 10,
  },
  /** 서치 페이지 style */
  trend: {
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  trendName: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  trendPostCount: {
    fontSize: 16,
    color: '#555',
  },
  trendpage: {
    flex: 1,
    backgroundColor: '#fff',
    paddingHorizontal: 20,
    paddingTop: 40,
  },
  trendtitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  post: {
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  postName: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  postUsername: {
    fontSize: 16,
    color: '#555',
    marginBottom: 5,
  },
  postText: {
    fontSize: 16,
  },
  searchBar: {
    flexDirection: 'row',
    backgroundColor: '#eee',
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 5,
    alignItems: 'center',
    marginBottom: 20,
  },
  searchinput: {
    flex: 1,
    fontSize: 18,
    color: '#111',
    marginRight: 10,
  },
  SearchButton: {
    backgroundColor: '#FFD8D8',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 10,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  backButton: {
    marginBottom: 20,
  },
  backButtonText: {
    color: '#FFD8D8',
    fontSize: 18,
  },
});

export default styles;
