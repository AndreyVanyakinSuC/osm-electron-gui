import React from 'react';
import Button from './Button';
import * as ru from 'date-fns/locale/ru';
import DatePicker, { registerLocale } from 'react-datepicker';
import SpanSecsInput from './SpanSecsInput';
registerLocale('ru', ru);

const DateRangeSelector = props => {
  const {
    startSelected,
    endSelected,
    onStartChanged,
    onEndChanged,
    isConnected,
    onHistoryRequestClick,
    spanSecs,
    onSpanSecsChange
  } = props;

  return (
    <div className="selector-card">
      <div className="selector-header">Выберите временной диапазон</div>
      <div className="selector-body">
        <DatePicker
          // ref='start'
          selected={startSelected}
          onChange={onStartChanged}
          selectsStart
          showMonthDropdown={false}
          startDate={startSelected}
          endDate={endSelected}
          locale="ru"
          maxDate={new Date()}
          showTimeSelect
          timeFormat="HH:mm"
          timeIntervals={30}
          dateFormat="d MMM yyyy, HH:mm"
          timeCaption="Время"
          placeholderText="Дата начала"
          shouldCloseOnSelect={true}
        />

        <DatePicker
          // ref='end'
          selected={endSelected}
          onChange={onEndChanged}
          selectsEnd
          showMonthDropdown={false}
          startDate={startSelected}
          endDate={endSelected}
          locale="ru"
          maxDate={new Date()}
          showTimeSelect
          timeFormat="HH:mm"
          timeIntervals={30}
          dateFormat="d MMM yyyy, HH:mm"
          timeCaption="Время"
          todayButton="Сейчас"
          placeholderText="Дата конца"
          shouldCloseOnSelect={true}
        />

        <Button
          isActive={false}
          isDisabled={!isConnected}
          isIcon={false}
          label="Скачать историю"
          clicked={isConnected ? onHistoryRequestClick : null}
        />

        <SpanSecsInput value={spanSecs} changed={onSpanSecsChange} />
      </div>
    </div>
  );
};

export default DateRangeSelector;
