import React from 'react';
import ReactDOM from 'react-dom';
import DayTimeline from './day-timeline';

it('It should mount', () => {
  const div = document.createElement('div');
  ReactDOM.render(<DayTimeline />, div);
  ReactDOM.unmountComponentAtNode(div);
});