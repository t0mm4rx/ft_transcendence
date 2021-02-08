/* The home page. */
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
        this.findNormal();
      }
    },

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

    createNewGame: async function()
    {
      this.game.createNewGame();
      this.waitingForOpponent();
    },

    findNormal: async function()
    {
      const is_diconnected = await this.game.isDisconnected();

      console.log("Is disco : ", is_diconnected);

      if (is_diconnected !== null)
      {
        if (is_diconnected.error)
          toast.notifyError(game_no_opponent.error);
        else
          window.location.hash = "game_live/" + is_diconnected.id;
        return;
      }

      const game_no_opponent = await this.game.findGameWithoutOpponent();
      
      console.log("Game no opponent : ", game_no_opponent);

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