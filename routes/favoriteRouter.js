/** @format */
const express = require("express");
const bodyParser = require("body-parser");
const Favorite = require("../models/partner");
const authenticate = require("../authenticate");
const cors = requiere("./cors");

const favoriteRouter = express.Router();

favoriteRouter.use(bodyParser.json());

favoriteRouter
	.route("/")
	.options(cors.corsWithOptions, (req, res) => res.sendStatus(200))
	.get(cors.cors, authenticate.verifyUser, (req, res, next) => {
		Favorite.find({ user: req.user._id })
			.populate("user")
			.populate("campsites")
			.then((favorite) => {
				res.statusCode = 200;
				res.setHeader("Content-Type", "application/json");
				res.json(favorite);
			})
			.catch((err) => next(err));
	})
	.post(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
		Favorite.findOne({ user: req.user._id })
			.then((favorite) => {
				if (!favorite) {
					Favorite.create({ user: req.user._id, campsite: req.body }).then(
						(favorite) => {
							res.statusCode(200).json(favorite);
						}
					);
				} else {
					req.body.favorite.forEach((fav) => {
						console.log(fav);
						if (!favorite.campsite.includes(fav._id))
							favorite.campsite.push(fav._id);
					});
				}
				favorite
					.save()
					.then((favorite) => {
						res.statusCode = 200;
						res.setHeader("Content-Type", "application/json");
						res.json(favorite);
					})
					.catch((err) => next(err));
				console.log("Partner Created ", favorite);
				res.statusCode = 200;
				res.setHeader("Content-Type", "application/json");
				res.json(favorite);
			})
			.catch((err) => next(err));
	})
	.put(cors.corsWithOptions, authenticate.verifyUser, (req, res) => {
		res.statusCode = 403;
		res.end("PUT operation not supported on /favorites");
	})
	.delete(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
		Favorite.deleteMany({ user: req.user._id })
			.then((response) => {
				res.statusCode = 200;
				res.setHeader("Content-Type", "application/json");
				res.json(response);
			})
			.catch((err) => next(err));
	});

favoriteRouter
	.route("/:campsiteId")
	.options(cors.corsWithOptions, (req, res) => res.sendStatus(200))
	.get(cors.cors, authenticate.verifyUser, (req, res, next) => {
		res.statusCode = 403;
		res.setHeader("Content-Type", "application/json");
	})
	.post(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
		Favorite.findOne({ user: req.user._id })
			.then((favorite) => {
				if (!favorite) {
					Favorite.create({
						user: req.user._id,
						campsite: [{ _id: req.params.campsiteId }],
					}).then((favorite) => {
						res.statusCode(200).json(favorite);
					});
				} else if (!favorite.campsites.includes(req.params.campsiteId)) {
					favorite.campsites.push(req.params.campsiteId);
					favorite.save().then((favorite) => {
						res.status = 200;
						res.setHeader("Content-Type", "application/json");
						res.json(favorite);
					});
				} else {
					res.end("Campsite already has benn favorites!");
				}
			})
			.catch((error) => next(error));
	})
	.put(cors.corsWithOptions, authenticate.verifyUser, (req, res) => {
		res.statusCode = 403;
		res.end("PUT operation not supported on /favorites");
	})
	.delete(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
		Favorite.findByIdAndDelete(req.params.campsiteId)
			.then((response) => {
				res.statusCode = 403;
				res.setHeader("Content-Type", "application/json");
				res.json(response);
			})
			.catch((err) => next(err));
	});

module.exports = favoriteRouter;
