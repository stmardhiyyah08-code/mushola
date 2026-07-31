import Link from "next/link"


export default function Home(){


return (

<div className="min-h-screen flex items-center justify-center">


<div className="bg-white shadow-xl rounded-xl p-10 text-center">


<h1 className="text-4xl font-bold">

SIMAS Masjid

</h1>


<p className="mt-3 text-gray-600">

Sistem Informasi Keuangan Masjid

</p>


<Link

href="/login"

className="inline-block mt-6 bg-green-600 text-white px-6 py-3 rounded-lg"

>

Masuk Sistem

</Link>


</div>


</div>

)

}