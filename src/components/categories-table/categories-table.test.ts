import React from 'react';
import ReactDOM from 'react-dom';
import CategoriesTable from './categories-table';

it('It should mount', () => {
  const div = document.createElement('div');
  ReactDOM.render(<CategoriesTable />, div);
  ReactDOM.unmountComponentAtNode(div);
});