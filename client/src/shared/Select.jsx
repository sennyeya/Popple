import React from 'react';
import TextField from '@material-ui/core/TextField';
import Autocomplete from '@material-ui/lab/Autocomplete';
import './AsyncSelect.css'

export default function Select({data, label, onClick, multi}) {
  const [open, setOpen] = React.useState(false);

  console.log(data)

  return (
    <div className="centered-content">
      <Autocomplete
		style={{padding:"10px"}}
        open={open}
        onOpen={() => {
          setOpen(true);
        }}
        onClose={() => {
          setOpen(false);
        }}
        onChange={onClick}
        multiple={multi}
        getOptionLabel={option => option.label}
        options={data}
        loading={false}
        renderInput={params => (
          <TextField
            {...params}
            label={label}
            variant="outlined"
            InputProps={{
              ...params.InputProps,
              endAdornment: (
                <>
                  {params.InputProps.endAdornment}
                </>
              ),
            }}
          />
        )}
      />
    </div>
  );
}
