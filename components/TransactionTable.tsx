"use client"


import {supabase} from "@/lib/supabase"

import {useEffect,useState} from "react"



export default function TransactionTable(){


const [data,setData]=useState<any[]>([])



useEffect(()=>{

load()

},[])



async function load(){


const {data}=await supabase

.from("transaksi")

.select(`

*,

kategori(

nama

)

`)

.order(

"created_at",

{

ascending:false

}

)



setData(data || [])

}



async function hapus(id:string){


if(!confirm("Hapus transaksi?"))

return



await supabase

.from("transaksi")

.delete()

.eq(

"id",

id

)



load()

}



return (

<div className="bg-white rounded-xl shadow mt-8 overflow-hidden">


<table className="w-full">


<thead className="bg-gray-100">


<tr>

<th className="p-3">

Tanggal

</th>


<th>

Jenis

</th>


<th>

Kategori

</th>


<th>

Nominal

</th>


<th>

Aksi

</th>


</tr>


</thead>


<tbody>


{

data.map(item=>(


<tr

key={item.id}

className="border-t"

>


<td className="p-3">

{item.tanggal}

</td>


<td>

{item.jenis}

</td>


<td>

{item.kategori?.nama}

</td>


<td>

Rp {item.nominal.toLocaleString()}

</td>


<td>


<button

onClick={()=>hapus(item.id)}

className="text-red-600"

>

Hapus

</button>


</td>


</tr>


))

}


</tbody>


</table>


</div>

)

}