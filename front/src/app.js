/*
 Entrypoint of the web app.
*/

import Router from './Router';
import pageLayout from './views/PageLayout';

window.router = new Router();
new pageLayout().render();
Backbone.history.start();