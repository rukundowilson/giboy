"use client"
import API from "@/app/utils/axios"
export default async function testApi(){
    const response = await API.get("/")
    const {message} = await response.data;
    return <>{`${message}`}</>
}