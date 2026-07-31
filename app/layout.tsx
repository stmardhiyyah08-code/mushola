import "./globals.css"


export const metadata = {

title:"SIMAS Masjid",

description:"Sistem Informasi Keuangan Masjid"

}


export default function RootLayout({

children,

}:{

children:React.ReactNode

}){


return (

<html lang="id">

<body className="bg-gray-100">

{children}

</body>

</html>

)

}