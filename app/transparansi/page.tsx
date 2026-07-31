import {supabase} from "@/lib/supabase"



export default async function Transparansi(){


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


const saldo=masuk-keluar



return (

<div className="min-h-screen bg-gray-100 p-8">


<div className="max-w-4xl mx-auto">


<h1 className="text-4xl font-bold text-center">

Transparansi Keuangan Masjid

</h1>



<div className="bg-green-700 text-white rounded-xl p-8 mt-8">


<p>

Saldo Kas Saat Ini

</p>


<h2 className="text-5xl font-bold">

Rp {saldo.toLocaleString()}

</h2>


</div>



<div className="grid md:grid-cols-2 gap-6 mt-6">


<div className="bg-white shadow rounded-xl p-6">

Pemasukan

<h2 className="text-3xl font-bold">

Rp {masuk.toLocaleString()}

</h2>

</div>



<div className="bg-white shadow rounded-xl p-6">

Pengeluaran

<h2 className="text-3xl font-bold">

Rp {keluar.toLocaleString()}

</h2>

</div>


</div>



<p className="text-center mt-8 text-gray-500">

Update otomatis dari sistem keuangan masjid

</p>


</div>


</div>

)

}