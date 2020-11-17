import React, {useState, useMemo, useContext} from 'react'
import API from '../shared/API'

export const authenticateStudent = ()=>{
    API.get("/auth/login/status").then(e=>{
        this.setState({sId:e.id, isAuthenticated:true, isLoading: true})
    })
}

const UserContext = React.createContext()

export default UserContext;

export function UserBoundary({ children }) {
  const [user, setUser] = useState(null)
  const ctx = useMemo(() => ({ user, setUser }), [user])

  return <UserContext.Provider value={ctx}>{children}</UserContext.Provider>
}

export function useUserOutlet() {
    const ctx = useContext(UserContext)
    return ctx.setUser
}