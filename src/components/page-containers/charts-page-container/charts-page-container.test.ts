import React from 'react';
import ReactDOM from 'react-dom';
import ChartsPageContainer from './charts-page-container';


it('It should mount', () => {
  const div = document.createElement('div');
  ReactDOM.render(<ChartsPageContainer />, div);
  ReactDOM.unmountComponentAtNode(div);
});