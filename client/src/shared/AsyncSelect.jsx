import { InputLabel } from '@material-ui/core';
import React from 'react';
import AsyncSelect from 'react-select/async';
import API from '../shared/API';
import './AsyncSelect.css'

export default function Select({url, setSelected, label, isMulti, value}) {
  const [isFocused, setFocused] = React.useState(false);
  return (
    <div className="centered-content">
      <InputLabel shrink={isFocused}>{label}</InputLabel>
      <AsyncSelect
        style={{padding:"10px", margin:"10px"}}
        cacheOptions
        defaultOptions
        loadOptions={()=>API.get(url)}
        isMulti={isMulti}
        value={value}
        onMenuOpen={()=>setFocused(true)}
        onMenuClose={()=>setFocused(false)}
        menuPosition="fixed"
        onChange={(val)=>setSelected(val)}
      />
    </div>
  );
}
