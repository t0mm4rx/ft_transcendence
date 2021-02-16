import Backbone from "backbone";

const SearchResults = Backbone.Model.extend({
  url: `http://${window.location.hostname}:3000/api/search`,
  for(input) {
    this.fetch({ data: { input: input } });
  },
});

export { SearchResults };
