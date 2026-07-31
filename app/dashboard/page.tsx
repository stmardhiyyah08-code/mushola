"use client"


import {useEffect,useState} from "react"

import Sidebar from "@/components/Sidebar"

import Header from "@/components/Header"

import StatCard from "@/components/StatCard"

import {supabase} from "@/lib/supabase"



export default function Dashboard(){


const [saldo,setSaldo]=useState(0)

const [masuk,setMasuk]=useState(0)

const [keluar,setKeluar]=useState(0)



useEffect(()=>{

loadFinance()

},[])



async function loadFinance(){


const {data}=await supabase

.from("transaksi")

.select("*")



let income=0

let expense=0



data?.forEach(item=>{


if(item.jenis==="MASUK")

income+=item.nominal


else

expense+=item.nominal


})


setMasuk(income)

setKeluar(expense)

setSaldo(income-expense)


}



return (

<div className="flex">


<Sidebar/>


<main className="flex-1">


<Header/>


<div className="p-8">


<h1 className="text-3xl font-bold mb-8">

Dashboard Keuangan

</h1>



<div className="grid md:grid-cols-3 gap-5">


<StatCard

title="Saldo Kas"

value={
"Rp "+saldo.toLocaleString()
}

/>


<StatCard

title="Pemasukan"

value={
"Rp "+masuk.toLocaleString()
}

/>


<StatCard

title="Pengeluaran"

value={
"Rp "+keluar.toLocaleString()
}

/>


</div>


</div>


</main>


</div>

)

}