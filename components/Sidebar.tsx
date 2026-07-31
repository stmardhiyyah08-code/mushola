import Link from "next/link"


export default function Sidebar(){


return (

<aside className="w-64 bg-green-800 text-white min-h-screen p-5">


<h2 className="text-2xl font-bold mb-8">

SIMAS

</h2>



<nav className="space-y-3">


<Link href="/dashboard"
className="block">

Dashboard

</Link>


<Link href="/transaksi"
className="block">

Transaksi

</Link>


<Link href="/laporan"
className="block">

Laporan

</Link>


<Link href="/program"
className="block">

Program Masjid

</Link>


</nav>


</aside>

)

}