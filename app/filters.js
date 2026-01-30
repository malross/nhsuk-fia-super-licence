/**
 * @param {Environment} env
 */
module.exports = function (env) {
  const filters = {}

  /* ------------------------------------------------------------------
    add your methods to the filters obj below this comment block:
    @example:

    filters.sayHi = function(name) {
        return 'Hi ' + name + '!'
    }

    Which in your templates would be used as:

    {{ 'Paul' | sayHi }} => 'Hi Paul'

    Notice the first argument of your filters method is whatever
    gets 'piped' via '|' to the filter.

    Filters can take additional arguments, for example:

    filters.sayHi = function(name,tone) {
      return (tone == 'formal' ? 'Greetings' : 'Hi') + ' ' + name + '!'
    }

    Which would be used like this:

    {{ 'Joel' | sayHi('formal') }} => 'Greetings Joel!'
    {{ 'Gemma' | sayHi }} => 'Hi Gemma!'

    For more on filters and how to write them see the Nunjucks
    documentation.

  ------------------------------------------------------------------ */

  filters.rank = function(position) {
    switch (String(position)) {
      case "1":
        return "1st"
      case "2":
        return "2nd"
      case "3":
        return "3rd"
      case "4":
        return "4th"
      case "5":
        return "5th"
      case "6":
        return "6th"
      case "7":
        return "7th"
      case "8":
        return "8th"
      case "9":
        return "9th"
      case "10":
        return "10th"
      case "11":
        return "11th"
      default:
        return position;
    }
  }

  /* keep the following line to return your filters to the app  */
  return filters
}

/**
 * @import { Environment } from 'nunjucks'
 */
