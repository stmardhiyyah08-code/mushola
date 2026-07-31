"use client"


import {useEffect,useState} from "react"

import Sidebar from "@/components/Sidebar"

import Header from "@/components/Header"

import FinanceChart from "@/components/FinanceChart"

import {supabase} from "@/lib/supabase"



export default function Laporan(){


const [chart,setChart]=useState<any[]>([])


const [total,setTotal]=useState({

masuk:0,

keluar:0

})



useEffect(()=>{

load()

},[])



async function load(){


const {data}=await supabase

.from("transaksi")

.select("*")



let masuk=0

let keluar=0



data?.forEach(item=>{


if(item.jenis==="MASUK")

masuk+=item.nominal


else

keluar+=item.nominal


})



setTotal({

masuk,

keluar

})



setChart([

{

bulan:"Januari",

masuk:masuk,

keluar:keluar

}

])


}



return (

<div className="flex">


<Sidebar/>


<main className="flex-1">


<Header/>


<div className="p-8">


<h1 className="text-3xl font-bold">

Laporan Keuangan

</h1>



<div className="grid md:grid-cols-2 gap-5 mt-6">


<div className="bg-green-600 text-white rounded-xl p-6">


Pemasukan


<h2 className="text-3xl font-bold">

Rp {total.masuk.toLocaleString()}

</h2>


</div>



<div className="bg-red-600 text-white rounded-xl p-6">


Pengeluaran


<h2 className="text-3xl font-bold">

Rp {total.keluar.toLocaleString()}

</h2>


</div>


</div>



<FinanceChart data={chart}/>



</div>


</main>


</div>

)

}