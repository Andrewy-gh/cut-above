import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import { useFilter } from '@/hooks/useFilter';
import { theme } from '@/styles/styles';

export default function ServiceSelect() {
  const { services, service, handleServiceChange } = useFilter();
  return (
    <FormControl fullWidth>
      <InputLabel>Choose a service</InputLabel>
      <Select
        label="Service"
        value={service.id}
        fullWidth
        onChange={(e) => handleServiceChange(e.target.value as number)}
        sx={{ color: theme.palette.secondary.main }}
      >
        {services.map((svc) => {
          return (
            <MenuItem value={svc.id} key={svc.id}>
              {svc.name} - {svc.duration} minutes
            </MenuItem>
          );
        })}
      </Select>
    </FormControl>
  );
}
