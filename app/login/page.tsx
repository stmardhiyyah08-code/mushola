"use client"


import {useState} from "react"

import {supabase} from "@/lib/supabase"

import {useRouter} from "next/navigation"



export default function Login(){


const router=useRouter()


const [email,setEmail]=useState("")

const [password,setPassword]=useState("")



async function login(){


const {error}=await supabase.auth.signInWithPassword({

email,

password

})


if(!error){

router.push("/dashboard")

}

else{

alert(error.message)

}


}



return (

<div className="min-h-screen flex items-center justify-center">


<div className="bg-white p-8 rounded-xl shadow w-96">


<h1 className="text-2xl font-bold mb-5">

Login Bendahara

</h1>



<input

className="border p-3 w-full mb-3 rounded"

placeholder="Email"

onChange={(e)=>setEmail(e.target.value)}

/>


<input

type="password"

className="border p-3 w-full mb-3 rounded"

placeholder="Password"

onChange={(e)=>setPassword(e.target.value)}

/>


<button

onClick={login}

className="bg-green-600 text-white w-full py-3 rounded"

>

Masuk

</button>


</div>


</div>

)

}