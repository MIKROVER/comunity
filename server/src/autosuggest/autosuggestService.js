const routes = require("../routers/routes.js");
const autoSuggestModel = require("../models").AutoSuggest;
const db = require("../models");
const stringUtils = require("underscore.string");
const config = require("../../conf/config");

const getAllSuggestions = () => {

	return autoSuggestModel.findAll()
		.then(suggestions => {
			return suggestions
		})
		.catch(err => err);

}

exports.getAllSuggestions = getAllSuggestions