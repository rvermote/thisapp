"use client"
import {useEffect, useState} from "react"
import axios from "axios"

export default function Home() {

  type Pokemon=any
  type data=any
  type PokemonData={
    jsonData: {[key:string]: any},
    headers: {[key:string]: any},
    pokemonArray: any[]
  }
  const [data,setData] = useState<PokemonData>({jsonData: {}, headers:[],pokemonArray:[]})
  const [curPokemon, setCurPokemon] = useState<number>(0)
  const [initPokemonArray, setInitPokemonArray] = useState<any[]>([])

  enum tableOrder{
    Unsorted,
    Ascending,
    Descending,
  }

  const [tableSorted, setTableSorted] = useState<{[key:string]: any}>({})
  const [inputFieldValue, setInputFieldValue] = useState<string>("")

  useEffect(() => {
    axios.get("https://raw.githubusercontent.com/fanzeyi/pokemon.json/master/pokedex.json")
      .then(res => {
        const arr = dataToArray(res.data)
        setData({jsonData:res.data, headers:columns, pokemonArray:arr})
        setInitPokemonArray([...arr])
      })
  },[])

  useEffect(() => {
    let newTable: {[key:string]: any} = {}
    Object.keys(columns).forEach(key => newTable[key]=tableOrder.Unsorted)
    setTableSorted(newTable)
  },[])

  const columns = {
    sprite: "Sprite",
    name: "Name",
    type1: "Type 1",
    type2: "Type 2",
    HP: "HP",
    attack: "Attack",
    defense: "Defense",
    spAttack: "Sp. Attack",
    spDefense: "Sp. Defense",
    speed: "Speed",}

  const dataToArray = (input:any):any[] => {
    let res:any[]=[]

    for(let {base,name,type,id,...rest} of input){
      res.push({
        id: id,
        HP: base.HP,
        attack: base.Attack,
        defense: base.Defense,
        spAttack: base["Sp. Attack"],
        spDefense: base["Sp. Defense"],
        speed: base["Speed"],
        name: name.english,
        type1: type["0"],
        type2: type["1"]
      })
    }

    return res
  }

  const changeOrder = (key:string) => {
    if (tableSorted[key]===tableOrder.Descending){
      tableSorted[key]=tableOrder.Unsorted
    }
    else if (tableSorted[key]===tableOrder.Ascending){
      tableSorted[key]=tableOrder.Descending
    }
    else if (tableSorted[key]===tableOrder.Unsorted){
      tableSorted[key]=tableOrder.Ascending
    }
  }

  const sortColumn = (key:string) => {
    
    if (tableSorted[key]===tableOrder.Unsorted){
      setData({...data,pokemonArray:[...initPokemonArray]})
      return
    }

    const newData = {...data}
    newData.pokemonArray.sort((a:any, b:any) => {
      const valA = a[key]
      const valB = b[key]

      if (tableSorted[key]===tableOrder.Ascending){
        if (valA < valB) return -1
        if (valB > valA) return 1
        return 0
      }else{
        if (valA > valB) return -1
        if (valB < valA) return 1
        return 0
      }
    })
    setData(newData)
  }

  const filterRows = (rows:Object[]):any[] => {
    return rows.filter(row => Object.values(row).some(ele => String(ele).toLowerCase().includes(inputFieldValue)))
  }

  const scrollToTop = () =>{
    window.scrollTo({top:0, behavior:"smooth"})
  }

  return (
    <body>
    <header className="sticky top-0 bg-[#212121] p-6 border-b border-gray-600 text-white font-bold">
      <h1 className="hover:cursor-pointer left-0 inline-block whitespace-nowrap" onClick={scrollToTop}>POKE LOOKUP</h1>
    </header>
    <main className="font-bold bg-[#212121] text-white min-h-screen">
      <div className="flex flex-col justify-items-center max-w-[600px] mx-auto py-10">

        <div className="mx-auto">
          <select id="PokemonSelect" onChange={(e) => setCurPokemon((document.getElementById("PokemonSelect") as HTMLSelectElement)?.selectedIndex)} className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-[#3d3d3d] dark:border-gray-400 dark:placeholder-gray-300 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500">
            {Object.keys(data.jsonData).map((key,pokemonidx) => <option key={pokemonidx}> {data.jsonData[key].name.english} </option>)}
          </select>

          <div className="flex flex-col items-center my-5">
            <div>{data.jsonData[curPokemon]?.name?.english}</div>
            <div><img src={"https://img.pokemondb.net/sprites/home/normal/"+(data.jsonData[curPokemon]?.name?.english)?.toLowerCase()+".png"}></img></div>
          </div>

          <div className="flex justify-between border rounded-lg m-4">
            <button className="grow hover:bg-[#3d3d3d]" onClick={() => {
              let newVal = curPokemon-1
              if (curPokemon===0){
                newVal=Object.keys(data.jsonData).length-1}
              setCurPokemon(newVal)
            }}>&lt;</button>
            <button className="grow hover:bg-[#3d3d3d]" onClick={() => {
              curPokemon===Object.keys(data.jsonData).length-1 ? setCurPokemon(0) : setCurPokemon(curPokemon+1)
            }}>&gt;</button>
          </div>
        </div>

        <input type="text" placeholder="Search" onChange={(e) => setInputFieldValue(e.target.value)} className="rounded-lg border-gray-300 bg-[#3d3d3d] px-2 py-0.5 m-2"></input>
          <table>
            <thead>
              <tr>
                {Object.keys(data.headers).map((key:string) => <th className="bg-[#3d3d3d] hover:cursor-pointer px-3" id={key} onClick={_ => {changeOrder(key); sortColumn(key)}}> {data.headers[key]} </th>)}
              </tr>
            </thead>
            <tbody>
              {filterRows(data.pokemonArray).map(row => 
                <tr> {Object.keys(data.headers).map(key => {
                    if (key==="sprite")
                      return <td className='bg-[#3d3d3d]'><img src={"https://img.pokemondb.net/sprites/sword-shield/icon/"+String(row["name"].toLowerCase()).padStart(3,"0")+".png"}></img></td>
                    else if (key==="name")
                      return <td className='bg-[#3d3d3d] py-2' onClick={_ => {setCurPokemon(row["id"]-1), scrollToTop()}}> <span className="hover:underline hover:cursor-pointer">{row[key]}</span> </td>
                    else
                      return <td className='bg-[#3d3d3d] py-2'> {row[key]} </td>
                    })} </tr>)}
            </tbody>
          </table>



      </div>
    </main>
    </body>
  )
}
