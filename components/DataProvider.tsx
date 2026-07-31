'use client';
import {createContext,useContext,useEffect,useState} from 'react';
import type {AppData} from '@/lib/types';
import {loadData,saveData,seedData} from '@/lib/store';
const C=createContext<{data:AppData;setData:React.Dispatch<React.SetStateAction<AppData>>}|null>(null);
export function DataProvider({children}:{children:React.ReactNode}){const [data,setData]=useState<AppData>(seedData);const [ready,setReady]=useState(false);useEffect(()=>{setData(loadData());setReady(true)},[]);useEffect(()=>{if(ready)saveData(data)},[data,ready]);if(!ready)return <div className="boot">CONSTRUPLATA</div>;return <C.Provider value={{data,setData}}>{children}</C.Provider>}
export function useData(){const x=useContext(C);if(!x)throw new Error('useData fuera de DataProvider');return x}
