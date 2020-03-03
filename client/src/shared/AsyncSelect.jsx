import React from 'react';
import TextField from '@material-ui/core/TextField';
import Autocomplete from '@material-ui/lab/Autocomplete';
import CircularProgress from '@material-ui/core/CircularProgress';

export default function AsyncSelect(props) {
  const [open, setOpen] = React.useState(false);
  const [options, setOptions] = React.useState([]);
  const [loading, setLoading] = React.useState(true);

  const {url, value, filter} = props;

  React.useEffect(() => {
    let active = true;

    if (!loading) {
      return undefined;
    }

    (async () => {
      const response = await url();
      const json = await response.json();

      if (active) {
        setOptions(json);
        setLoading(false);
      }
    })();

    return () => {
      active = false;
    };
  }, [loading, url]);

  return (
    <Autocomplete
      id="async-auto"
      style={{ width: 300, "paddingTop":"10px", "paddingBottom":"10px" }}
      open={open}
      onOpen={() => {
        setOpen(true);
      }}
      onClose={() => {
        setOpen(false);
      }}
      onChange={props.onClick}
      multiple={props.multi}
      getOptionLabel={option => option.label}
      options={filter?options.filter(filter):options}
      value={value}
      loading={loading}
      renderInput={params => (
        <TextField
          {...params}
          label={props.label}
          variant="outlined"
          InputProps={{
            ...params.InputProps,
            endAdornment: (
              <React.Fragment>
                {loading ? <CircularProgress color="inherit" size={20} /> : null}
                {params.InputProps.endAdornment}
              </React.Fragment>
            ),
          }}
        />
      )}
    />
  );
}
