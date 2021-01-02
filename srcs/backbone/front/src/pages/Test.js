/* The home page. */
import Backbone from 'backbone';
import $ from 'jquery';
import template from '../../templates/test.html';
import {FtSocket, FtSocketCollection} from '../models/FtSocket'

export default Backbone.View.extend({
    el: "#page",
    
    initialize: function()
    {
        this.ftsocket = new FtSocket({id: 33, channel: 'GameRoomChannel'});
    },

    events: {
        'click #create-db' : 'createDataBase',
        'click #connect-socket' : 'connectSocket',
        'click #send-msg' : 'sendMessage',
    },

    createDataBase: function()
    {
        // Change to be the actual url
        fetch(`http://localhost:3000/game_rooms`,{
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify({
                player: JSON.stringify({
                    id: 985,
                    name: "James"
                }),
                opponent: ""
            })
		});
    },

    sendMessage: function()
    {
        this.ftsocket.sendMessage({action: "pef", content: "Hi!"});
    },

	render: function () {
        this.$el.html(template);
	}
});