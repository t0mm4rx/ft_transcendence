/* A channel object contains the messages of a group of users.
Chat is the collection of all the channels of the user. */
import Backbone from 'backbone';

const Channel = Backbone.Model.extend({});
const Chat = Backbone.Collection.extend({});

export {Channel, Chat};