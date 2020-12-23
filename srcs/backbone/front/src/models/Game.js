/* The game model and collection. */
import Backbone from 'backbone';

const Game = Backbone.Model.extend({

    initialize: function(options) 
    {
        console.log(options);
    }
});

const GameCollection = Backbone.Collection.extend({});

export {Game, GameCollection};