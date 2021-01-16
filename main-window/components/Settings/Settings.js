import React, { useState, useEffect } from 'react';
import TextField from '@material-ui/core/TextField';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';
import Radio from '@material-ui/core/Radio';
import RadioGroup from '@material-ui/core/RadioGroup';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import FormControl from '@material-ui/core/FormControl';
import FormLabel from '@material-ui/core/FormLabel';
import Button from '@material-ui/core/Button';
import Grid from '@material-ui/core/Grid';
import Switch from '@material-ui/core/Switch';
import { createMuiTheme, ThemeProvider } from '@material-ui/core/styles';
import { F_MODES, I_MODE } from '../../APInHelpers/history';

const theme = createMuiTheme({
  palette: {
    primary: {
      main: '#5DA1FF'
    },
    secondary: {
      main: '#5DA1FF'
    }
  }
});

const Settings = props => {
  const {
    isOpen,
    onClose,
    onApply,
    iceMode,
    fMode,
    spanLength,
    isSoundAlarmOption
  } = props;

  const [state, setState] = useState({});
  const [error, setError] = useState(null);

  useEffect(() => {
    setState({ iceMode, fMode, spanLength, isSoundAlarmOption });
  }, [iceMode, fMode, spanLength]);

  const handleChange = e => {
    console.log(e.target.value);
    setState({ ...state, [e.target.name]: e.target.value });
    setError(null);
  };

  const handleToggle = e => {
    setState({ ...state, isSoundAlarmOption: e.target.checked });
  };

  const handleApplyClick = () => {
    if (state.spanLength === '' || state.spanLength <= 0) {
      setError('Недопустимо');
    } else {
      onApply(state);
    }
  };

  return (
    <ThemeProvider theme={theme}>
      <Dialog
        open={isOpen}
        onClose={onClose}
        aria-labelledby="form-dialog-title"
      >
        <DialogTitle id="form-dialog-title">Настройки отображения</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Настройки применяются после нажатия на "Применить"
          </DialogContentText>
          <Grid container spacing={1}>
            {/* Sound alarm option */}
            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Switch
                    checked={state.isSoundAlarmOption}
                    onChange={handleToggle}
                    name="isSoundAlarmOption"
                    color="primary"
                  />
                }
                label="Звуковая сигнализация при гололёде"
              />
            </Grid>
            <Grid item xs={12}>
              {/* Ice mode */}
              <FormControl component="fieldset">
                <FormLabel component="legend">Размерность гололёда</FormLabel>
                <RadioGroup
                  name="iceMode"
                  value={state.iceMode}
                  onChange={handleChange}
                >
                  <FormControlLabel
                    value={I_MODE.kg_per_m}
                    control={<Radio />}
                    label={
                      <div style={{ display: 'flex', alignItems: 'center' }}>
                        Вес в кг при длине пролёта
                        <TextField
                          autoFocus
                          name="spanLength"
                          id="spanLength"
                          disabled={state.iceMode !== I_MODE.kg_per_m}
                          //   label="Длина пролёта для расчёта гололёда, м"
                          style={{
                            width: '5rem',
                            marginLeft: '1rem',
                            marginRight: '1rem'
                          }}
                          type="number"
                          placeholder="Длина"
                          value={state.spanLength}
                          onChange={handleChange}
                          error={!!error}
                          helperText={!!error ? error : ''}
                        />
                        метров
                      </div>
                    }
                  />

                  <FormControlLabel
                    value={I_MODE.mm}
                    control={<Radio />}
                    label="Миллиметры эквивалентной стенки"
                  />
                </RadioGroup>
              </FormControl>
            </Grid>
            {/* {state.iceMode === I_MODE.kg_per_m && (
              <Grid item xs={8}>
                <TextField
                  autoFocus
                  fullWidth
                  name="spanLength"
                  id="spanLength"
                  label="Длина пролёта для расчёта гололёда, м"
                  type="number"
                  value={state.spanLength}
                />
              </Grid>
            )} */}
            {/* Tension mode */}
            <Grid item xs={12}>
              <FormControl component="fieldset">
                <FormLabel component="legend">Размерность тяжения</FormLabel>
                <RadioGroup
                  name="fMode"
                  value={state.fMode}
                  onChange={handleChange}
                >
                  <FormControlLabel
                    value={F_MODES.kgs}
                    control={<Radio />}
                    label="Килограмм-сила"
                  />
                  <FormControlLabel
                    value={F_MODES.newton}
                    control={<Radio />}
                    label="Ньютоны"
                  />
                </RadioGroup>
              </FormControl>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>Отмена</Button>
          <Button onClick={handleApplyClick}>Применить</Button>
        </DialogActions>
      </Dialog>
    </ThemeProvider>
  );
};

export default Settings;
