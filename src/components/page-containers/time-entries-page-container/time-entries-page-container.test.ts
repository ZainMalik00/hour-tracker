import React from 'react';
import ReactDOM from 'react-dom';
import TimeEntriesPageContainer from './time-entries-page-container';


it('It should mount', () => {
  const div = document.createElement('div');
  ReactDOM.render(<TimeEntriesPageContainer />, div);
  ReactDOM.unmountComponentAtNode(div);
});