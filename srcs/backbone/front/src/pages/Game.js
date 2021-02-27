/**
 * Game page, chosse between normal and
 * ranked game.
*/

import Backbone from 'backbone';
import $ from 'jquery';
import template from '../../templates/game.html';
import { Game } from '../models/Game';
import toast from '../utils/toasts';

export default Backbone.View.extend({
    el: "#page",

    initialize: function()
    {
      this.listenTo(window.currentUser, 'change', this.render);
      this.game = new Game();
      this.plop = "mej";
    },

    events: {
      'click #game-normal' : function() {

        // Find normal game.
        this.findNormal();
      },
      'click #game-ranked' : function() {

        // Find ranked game.
        window.currentUser.findLadderGame();
      }
    },

    /**
     * Content "Searching for oppoenent...".
     */
    waitingForOpponent: function()
    {
      const panel = $("#game-panel");
		
      panel.css("width", 'initial');
      panel.css("height", 'initial');
      panel.css("text_align", 'initial');
  
      panel.html(`
        <div class="panel">
          <h1 class="panel-header">Searching for opponent...</h1>
        </div>
      `);
    },

    /**
     * Call model to to generate a new game.
     */
    createNewGame: async function()
    {
      this.game.createNewGame();
      this.waitingForOpponent();
    },

    /**
     * Called when the "normal game" event is triggered.
     * Check if the player is disconnected from another
     * game, otherwise a new game is created if no
     * game without opponent was found.
     */
    findNormal: async function()
    {
      const is_diconnected = await this.game.isDisconnected();

      if (is_diconnected !== null)
      {
        if (is_diconnected.error)
          toast.notifyError(game_no_opponent.error);
        else
          window.location.hash = "game_live/" + is_diconnected.id;
        return;
      }

      const game_no_opponent = await this.game.findGameWithoutOpponent();
      
      // No game exist
      if (game_no_opponent === null)
        this.createNewGame();

      // Error append
      else if (game_no_opponent.error)
        toast.notifyError(game_no_opponent.error);

      // A game was found & i'm not the creator
      else if (game_no_opponent.user.id != window.currentUser.get('id')
        && game_no_opponent.opponent === null)
        this.game.joinGame(game_no_opponent);

      // A game was found but i'm the creator
      else
        this.waitingForOpponent();
    },

    render: function() {
      if (window.currentUser.get('login'))
      {
        this.self = this;
        this.$el.html(template);
      }
    }
});
