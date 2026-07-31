"use client"

import {
BarChart,
Bar,
XAxis,
YAxis,
Tooltip,
Legend,
ResponsiveContainer
} from "recharts"


export default function FinanceChart({

data

}:{

data:any[]

}){


return (

<div className="bg-white rounded-xl shadow p-6 mt-8">


<h2 className="text-xl font-bold mb-5">

Grafik Keuangan

</h2>


<ResponsiveContainer

width="100%"

height={300}

>


<BarChart data={data}>


<XAxis dataKey="bulan"/>

<YAxis/>


<Tooltip/>


<Legend/>


<Bar

dataKey="masuk"

fill="#16a34a"

/>


<Bar

dataKey="keluar"

fill="#dc2626"

/>


</BarChart>


</ResponsiveContainer>


</div>

)

}