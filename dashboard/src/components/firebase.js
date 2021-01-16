import app from 'firebase/app'
import 'firebase/auth'
import 'firebase/firebase-firestore'

var config = {
    apiKey: "AIzaSyAs5U_whGphtdKPeBQESxEnlU7SKBG99k0",
    authDomain: "budgetapp-e50d5.firebaseapp.com",
    projectId: "budgetapp-e50d5",
    storageBucket: "budgetapp-e50d5.appspot.com",
    messagingSenderId: "655312635512",
    appId: "1:655312635512:web:f428dff70dd07684820f8d",
    measurementId: "G-DPFDDF883V"
  };

class Firebase {
	constructor() {
		app.initializeApp(config)
		this.auth = app.auth()
		this.db = app.firestore()
	}

	login(email, password) {
		debugger;
		this.auth.setPersistence(app.auth.Auth.Persistence.LOCAL);
		return this.auth.signInWithEmailAndPassword(email, password)
	}

	logout() {
		return this.auth.signOut()
	}

	async register(name, email, password) {
		await this.auth.createUserWithEmailAndPassword(email, password)
		return this.auth.currentUser.updateProfile({
			displayName: name
		})
	}

	addQuote(quote) {
		if(!this.auth.currentUser) {
			return alert('Not authorized')
		}

		return this.db.doc(`users_codedamn_video/${this.auth.currentUser.uid}`).set({
			quote
		})
	}

	isInitialized() {
		return new Promise(resolve => {
			this.auth.onAuthStateChanged(resolve)
		})
	}

	getCurrentUsername() {
		console.log(this.auth)
		return this.auth.currentUser && this.auth.currentUser.displayName
	}

	getUserID() {
		return this.auth.currentUser && this.auth.currentUser.uid
	}


	async getCurrentUserQuote() {
		const quote = await this.db.doc(`users_codedamn_video/${this.auth.currentUser.uid}`).get()
		return quote.get('quote')
	}
}

export default new Firebase()