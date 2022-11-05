import { createContext, useContext } from 'react'

export interface DataContextType {
  constants: {
    [key: string]: string | number | boolean
  }
}

export const DataContext = createContext<DataContextType>({
  constants: {},
})

export const useDataContext = () => useContext(DataContext)
