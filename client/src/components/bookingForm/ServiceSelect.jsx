import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import { useFilter } from '../../hooks/useFilter';
import { theme } from '../../styles/styles';

export default function ServiceSelect() {
  const { services, service, handleServiceChange } = useFilter();
  return (
    <FormControl fullWidth>
      <InputLabel>Choose a service</InputLabel>
      <Select
        label="Service"
        value={service.id}
        fullWidth
        onChange={(e) => handleServiceChange(e.target.value)}
        sx={{ color: theme.palette.secondary.main }}
      >
        {services.map((service) => {
          return (
            <MenuItem
              value={service.id}
              duration={service.duration}
              key={service.id}
            >
              {service.name} - {service.duration} minutes
            </MenuItem>
          );
        })}
      </Select>
    </FormControl>
  );
}
