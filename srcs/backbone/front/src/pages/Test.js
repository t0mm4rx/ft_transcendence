/* The home page. */
import Backbone from 'backbone';
import $ from 'jquery';
import template from '../../templates/test.html';
import {FtSocket, FtSocketCollection} from '../models/FtSocket'

export default Backbone.View.extend({
    el: "#page",
    render: function() {
		this.$el.html(template);
    }
});