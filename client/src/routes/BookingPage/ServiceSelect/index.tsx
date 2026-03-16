import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import { useFilter } from '@/hooks/useFilter';

const selectSx = {
  '& .MuiOutlinedInput-root': {
    backgroundColor: '#1f1f1f',
    borderRadius: '0.625rem',
    '& fieldset': { borderColor: '#2a2a2a' },
    '&:hover fieldset': { borderColor: '#037E94' },
    '&.Mui-focused fieldset': { borderColor: '#26C4E0', borderWidth: '1.5px' },
  },
  '& .MuiInputLabel-root': {
    color: '#888',
    fontFamily: 'Nobile, sans-serif',
    '&.Mui-focused': { color: '#26C4E0' },
    '&.MuiFormLabel-filled:not(.Mui-focused)': { color: '#629aa4' },
  },
  '& .MuiSelect-select': {
    color: '#E6B953',
    fontFamily: 'Nobile, sans-serif',
  },
  '& .MuiSvgIcon-root': { color: '#629aa4' },
};

export default function ServiceSelect() {
  const { services, service, handleServiceChange } = useFilter();
  return (
    <FormControl fullWidth sx={selectSx}>
      <InputLabel>Choose a service</InputLabel>
      <Select
        label="Choose a service"
        value={service.id}
        fullWidth
        onChange={(e) => handleServiceChange(e.target.value as number)}
      >
        {services.map((svc) => {
          return (
            <MenuItem value={svc.id} key={svc.id}>
              {svc.name} — {svc.duration} min
            </MenuItem>
          );
        })}
      </Select>
    </FormControl>
  );
}
