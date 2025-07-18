import {
    auth,
    db,
    setDoc,
    doc,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  GoogleAuthProvider,
  signInWithPopup,
  GithubAuthProvider,
  setPersistence 
} from "../firebase/config.js";



const publicPages = ["login.html", "signup.html"];


onAuthStateChanged(auth, (user) => {
    const authPage = window.location.pathname.split("/").pop();
    console.log(user);

    const userName = document.getElementById("user-name");

    if (user) {
        // ✅ Update username when user is logged in
        // Call the global getUserName function if available
        if (window.getUserName) {
            // Small delay to ensure DOM is ready
            setTimeout(() => {
                window.getUserName();
            }, 100);
        } else {
            // Fallback if getUserName is not available
            if (userName) {
                userName.textContent = user.displayName || user.email || "User";
            }
        }

        if (publicPages.includes(authPage) && user.accessToken) {
            console.log(user);
            window.location.replace(window.location.origin + "/index.html");
        }
    } 
    else {
        // ✅ Clear or set default when user is not logged in
        if (userName) {
            userName.textContent = "Guest";
        }

        console.log("User is not logged in");

        if (!publicPages.includes(authPage)) {
            location.replace(window.location.origin + "/login.html");
        }
    }
});


const logout = async () => {
    try {
        await signOut(auth);
        console.log("User logged out successfully");
        window.location.replace("login.html");
        localStorage.clear();
    } catch (error) {
        console.error("Error during logout:", error);
        alert("Logout failed: " + error.message);
    }
}

document.addEventListener("DOMContentLoaded", () => {
    const currentPath = window.location.pathname; 
    console.log("Current path for logout check:", currentPath); 

    if(currentPath === "/index.html" || currentPath === "/" || currentPath.includes("index.html")){
        const signOutUser = document.getElementById("logout-button");
        if(signOutUser){
            signOutUser.addEventListener("click", logout);
        } else{
            console.error("Logout button not found!");
        }
    } else {
        console.log("Not on main app page!");
    }
})



// const togglePassword = (e) => {
//     const password = document.getElementById("password");
//     const eye = document.getElementById("eye");
//     const eyeSlash = document.getElementById("eye-slash");

//     if (e.target.id === "eye" && password.type === "password") {
//         password.type = "text";
//         eye.classList.add("hidden");
//         eyeSlash.classList.remove("hidden");
//     } else if (e.target.id === "eye-slash" && password.type === "text") {
//         password.type = "password";
//         eye.classList.remove("hidden");
//         eyeSlash.classList.add("hidden");
//     }
// };

// document.getElementById("eye").addEvens

let loginUseer = async (e) => {
    e.preventDefault();
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;

    try {
    signInWithEmailAndPassword(auth, email, password)
    .then((userCredential) => {
        console.log(userCredential);
        window.location.replace(window.location.origin + "/index.html");
    })
    } catch (error) {
        console.log(error);
    }
}

let registerUser = async(e)=>{
    e.preventDefault();
    const firstName = document.getElementById("firstName").value;
    const lastName = document.getElementById("lastName").value;
    const phoneNumber = document.getElementById("phoneNumber").value;
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;
    
    try{
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;
        console.log("User created successfully:", user);
        
        const userData = {
            firstName: firstName,
            lastName: lastName,
            phoneNumber: phoneNumber,
            email: email,
            uid: user.uid,
        }

        // console.log(userData);

        const docRef = await doc(db, "users", user.uid)
        await setDoc(docRef, userData);
        // console.log("Document written with ID: ", docRef.id);
        
        window.location.replace(window.location.origin + "/index.html");
    } catch (error) {
        console.error("Error during signup:", error);
        alert("Signup failed: " + error.message);
    }
}

document.addEventListener("DOMContentLoaded", () => {
    const currentPath = window.location.pathname;
    if(currentPath === "/login.html"){
        const loginForm = document.getElementById("login-form");
        if (loginForm) {
            loginForm.addEventListener("submit", loginUseer);
        }
    }
})

document.addEventListener("DOMContentLoaded", () => {
    const currentPath = window.location.pathname;
    
    if(currentPath.includes("signup.html")){
        const signupForm = document.getElementById("signup-form");
        if (signupForm) {
            signupForm.addEventListener("submit", registerUser);
        } else {
            console.error("Signup form not found!");
        }
    }
});

let loader = false;

let signInWithGoogle = () => {
    // loader = true;
    try{
        const provider = new GoogleAuthProvider();

        console.log("provider: " ,provider);
        // provider.addScope("https://www.googleapis.com/auth/contacts.readonly");
        provider.setCustomParameters({
            prompt: "select_account"
        });
          signInWithPopup(auth, provider)
        .then(async(userCredential) => {
            const user = userCredential.user;
            const userData = {
                firstName: user.displayName,
                lastName: user.displayName,
                phoneNumber: user.phoneNumber,
                email: user.email,
                uid: user.uid,
            }
            console.log(userCredential);
            location.replace(window.location.origin + "/index.html");   


            const docRef = await doc(db, "users", userCredential.user.uid)
            await setDoc(docRef,userData);

        })

        console.log("User Has been logged in with Google");
    } catch (error) {
        console.error("Error during signup with Google:", error);
    } finally{
        // console.error("Error during Google sign in:", error);

        if(error.code === "auth/popup-closed-by-user"){
            alert("Login cancelled. Please try again.");
        } else if(error.code === "auth/popup-blocked"){
            alert("Popup was blocked. Please allow popups for this site.");
        } else {
            alert("Login failed: " + error.message);
        }
    }
}

document.addEventListener("DOMContentLoaded", () =>{
    const googleLoginButton = document.getElementById("google-login");
    if(googleLoginButton){
        googleLoginButton.addEventListener("click", signInWithGoogle);
    }
} )

let signInWithGithub = () => {
    setPersistence(auth, browserSessionPersistence)
    try{
        const provider = new GithubAuthProvider()
        provider.addScope("repo")
        signInWithPopup(auth, provider)
        .then((result) => {
            const crediential = GithubAuthProvider.credentialFromResult(result);
            const token = crediential.accessToken;
            isNewUser(result)
            const user = result;
            console.log("user: ", user);
            location.replace(window.location.origin + "/index.html");   
        }).catch((error) => {
            const errorCode = error.code;
            const errorMessage = error.message;
            const email = error.customData.email;
            const credential = GithubAuthProvider.credentialFromError(error);
            console.log(errorCode, errorMessage, email, credential);
        })
    } catch (error) {
        console.error("Error during GitHub sign in:", error);
    } finally{
        // console.error("Error during GitHub sign in:", error);

        if(error.code === "auth/popup-closed-by-user"){
            alert("Login cancelled. Please try again.");
        } else if(error.code === "auth/popup-blocked"){
            alert("Popup was blocked. Please allow popups for this site.");
        } else {
            alert("Login failed: " + error.message);
        }
    }
}


document.addEventListener("DOMContentLoaded", () => {
    const githubLoginButton = document.getElementById("github-login");
    if(githubLoginButton){
        githubLoginButton.addEventListener("click", signInWithGithub);
    }
})