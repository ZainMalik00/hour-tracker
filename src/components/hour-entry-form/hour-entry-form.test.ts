import React from 'react';
import ReactDOM from 'react-dom';
import HourEntryForm from './hour-entry-form';

it('It should mount', () => {
  const div = document.createElement('div');
  ReactDOM.render(<HourEntryForm />, div);
  ReactDOM.unmountComponentAtNode(div);
});