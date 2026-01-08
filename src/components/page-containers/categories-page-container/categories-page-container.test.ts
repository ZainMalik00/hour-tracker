import React from 'react';
import ReactDOM from 'react-dom';
import CategoriesPageContainer from './categories-page-container';


it('It should mount', () => {
  const div = document.createElement('div');
  ReactDOM.render(<CategoriesPageContainer />, div);
  ReactDOM.unmountComponentAtNode(div);
});