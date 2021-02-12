import React from 'react'
import { Dialog, TextField, DialogActions, DialogTitle, DialogContent} from '@material-ui/core';

export default function Modal({handleClose, isOpen, children, buttons, title}){
    return (<>
        <Dialog open={isOpen} onClose={handleClose} scroll="body" maxWidth='md'>
            <DialogTitle id="alert-dialog-title">{title}</DialogTitle>
            <DialogContent dividers>
            {children}
            </DialogContent>
            <DialogActions>
                {buttons}
            </DialogActions>
        </Dialog>
    </>)
}