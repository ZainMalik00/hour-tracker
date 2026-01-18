import React from 'react';
import ReactDOM from 'react-dom';
import TimelineComponent from './timeline';

it('It should mount', () => {
  const div = document.createElement('div');
  ReactDOM.render(<TimelineComponent />, div);
  ReactDOM.unmountComponentAtNode(div);
});