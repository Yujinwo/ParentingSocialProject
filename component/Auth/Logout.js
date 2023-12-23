import { firebase } from "../../firebase";
// 로그아웃
const Logout = () => {
    firebase.auth().signOut()
}

export default Logout