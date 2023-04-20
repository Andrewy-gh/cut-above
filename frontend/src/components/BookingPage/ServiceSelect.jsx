import { useDispatch, useSelector } from 'react-redux';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import { theme } from '../../styles/styles';
import { services } from '../../data';
import { selectService, setService } from '../../features/filter/filterSlice';

const ServiceSelect = () =>
  // { selected, setSelected }
  {
    const dispatch = useDispatch();
    const service = useSelector(selectService);
    console.log('service', service);

    const handleServiceChange = (service) => {
      // setSelected({ ...selected, service });
      dispatch(setService(service));
    };

    return (
      <FormControl
        sx={{
          width: '100%',
        }}
      >
        <InputLabel>Choose a service</InputLabel>
        <Select
          label="Barber"
          value={service}
          fullWidth
          onChange={(e) => handleServiceChange(e.target.value)}
          sx={{ color: theme.palette.secondary.main }}
        >
          {services.map((service) => {
            return (
              <MenuItem value={service.name} key={service.id}>
                {service.name}
              </MenuItem>
            );
          })}
        </Select>
      </FormControl>
    );
  };

export default ServiceSelect;
