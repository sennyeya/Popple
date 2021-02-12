import { Snackbar } from '@material-ui/core';
import MuiAlert from '@material-ui/lab/Alert'
import React, {useState, useMemo, useContext} from 'react'

const MessageContext = React.createContext()

export default MessageContext;

function Alert(props) {
  return <MuiAlert elevation={6} variant="filled" {...props} />;
}

export function MessageDisplayBoundary({ children }) {
  const [message, setMessage] = useState(null);
  const [messageArr, setMessageArr] = useState([]);
  const ctx = useMemo(() => ({ message, setMessage }), [message])

  return <MessageContext.Provider value={ctx}>
    {message?<Snackbar open autoHideDuration={6000}>
      <Alert severity={message.type}>
        {message.text}
      </Alert>
    </Snackbar>:<></>}
    {children}
  </MessageContext.Provider>
}

export function useMessageOutlet() {
    const ctx = useContext(MessageContext)
    return ctx.setMessage
}