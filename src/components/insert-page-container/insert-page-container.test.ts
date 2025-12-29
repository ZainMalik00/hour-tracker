import React from 'react';
import ReactDOM from 'react-dom';
import InsertPageContainer from './insert-page-container';


it('It should mount', () => {
  const div = document.createElement('div');
  ReactDOM.render(<InsertPageContainer />, div);
  ReactDOM.unmountComponentAtNode(div);
});