import {supabase} from "./supabase"


export async function uploadBukti(

file:File

){

const filename=

`${Date.now()}-${file.name}`



const {data,error}=await supabase.storage

.from("dokumen-masjid")

.upload(

`transaksi/${filename}`,

file

)



if(error){

throw error

}



const url=

supabase.storage

.from("dokumen-masjid")

.getPublicUrl(data.path)



return url.data.publicUrl

}