// import 'babel-polyfill';
import React from 'react';
import { render } from 'react-dom';
import App from './App';
import { declareDB, destroyDB, thinDB } from './APInHelpers/database';
import { HISTORY_SPAN_SECS } from './APInHelpers/base';

// import setupSSEListeners from './API/LiveData';
// import {setupDexie} from './API/IndexedDexie';

// Since we are using HtmlWebpackPlugin WITHOUT a template, we should create our own root node in the body element before rendering into it
let root = document.createElement('div');
root.id = 'root';
document.body.appendChild(root);

// Enable IDB logic
// setupDexie();

declareDB();
// destroyDB();

// thinDB(HISTORY_SPAN_SECS).then(console.log(`%c[DB] Have successfully thinned data`, 'color: purple'));

// Now we can render our application into it
render(<App />, document.getElementById('root'));
