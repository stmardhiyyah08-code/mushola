"use client"


import {useState} from "react"

import Sidebar from "@/components/Sidebar"

import Header from "@/components/Header"

import {supabase} from "@/lib/supabase"

import {uploadBukti} from "@/lib/upload"

import TransactionTable from "@/components/TransactionTable"



export default function Transaksi(){


const [jenis,setJenis]=useState("MASUK")

const [kategori,setKategori]=useState("")

const [nominal,setNominal]=useState("")

const [keterangan,setKeterangan]=useState("")

const [file,setFile]=useState<File|null>(null)



async function simpan(){



let bukti=null



if(file){

bukti=await uploadBukti(file)

}



const {error}=await supabase

.from("transaksi")

.insert({


tanggal:

new Date()

.toISOString()

.split("T")[0],


jenis,


kategori_id:kategori,


nominal:

Number(nominal),


keterangan,


bukti_url:bukti


})



if(error)

alert(error.message)

else{

alert("Transaksi tersimpan")

location.reload()

}



}



return (

<div className="flex">


<Sidebar/>


<main className="flex-1">


<Header/>


<div className="p-8">


<h1 className="text-3xl font-bold">

Input Transaksi

</h1>



<div className="bg-white shadow rounded-xl p-6 mt-6 max-w-xl">


<select

className="border p-3 w-full mb-3"

onChange={e=>setJenis(e.target.value)}

>


<option value="MASUK">

Pemasukan

</option>


<option value="KELUAR">

Pengeluaran

</option>


</select>




<input

className="border p-3 w-full mb-3"

placeholder="ID Kategori"

onChange={e=>setKategori(e.target.value)}

/>




<input

className="border p-3 w-full mb-3"

placeholder="Nominal"

type="number"

onChange={e=>setNominal(e.target.value)}

/>




<textarea

className="border p-3 w-full mb-3"

placeholder="Keterangan"

onChange={e=>setKeterangan(e.target.value)}

>




</textarea>




<input

type="file"

className="mb-4"

onChange={e=>

setFile(

e.target.files?.[0] || null

)

}

/>



<button

onClick={simpan}

className="bg-green-700 text-white px-6 py-3 rounded"

>

Simpan Transaksi

</button>



</div>



<TransactionTable/>


</div>


</main>


</div>

)

}