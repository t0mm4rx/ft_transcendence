/* The game model and collection. */
import Backbone from 'backbone';
import io from 'sockjs-client';

const Game = Backbone.Model.extend({

    initialize: function(options) 
    {
    }
});

const GameCollection = Backbone.Collection.extend({});

export {Game, GameCollection};