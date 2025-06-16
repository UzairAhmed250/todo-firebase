// import {doc , setdoc} from "./firebase/config"

import { addDoc, collection, doc } from "./firebase/config"

const todo = document.getElementById("todo")
const value = todo.value 
const loader = false


export const addtodo = async(e) => {
    loader = true
    try {
        const mytodos = await addDoc(collection(doc, "todos"),{
            task: value,
            createdAt: new Date(),
        }) 

        console.log("added: ", value )
        value = ""
        
    } catch (error) {
        console.error("Error Adding Todo: ", error)
    } finally{
        loader = false
    }

    // console.log("coneected")
}

// addtodo()