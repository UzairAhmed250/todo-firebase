import {
    auth,
    db,
    setDoc,
    doc,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
} from "../firebase/config.js";

const publicPages = ["login.html", "signup.html"];

onAuthStateChanged(auth, (user) => {
    const authPage = window.location.pathname.split("/").pop();
    console.log(user)


    if (user && publicPages.includes(authPage)) {
        console.log(user);
        window.location.replace(window.location.origin + "/index.html");
    } 
    else if(!user && !publicPages.includes(authPage)) {
        console.log("User is not logged in");
        location.replace(window.location.origin + "/login.html");
    }
})

const logout = async () => {
    try {
        await signOut(auth);
        console.log("User logged out successfully");
        window.location.replace("login.html");
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


let signupUser = async () => {
}

// const signupForm = document.getElementById("signup-form");