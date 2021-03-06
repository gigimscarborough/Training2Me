const express = require("express");
const router = express.Router({ mergeParams: true });
const bcrypt = require('bcryptjs');
const Trainer = require('../../models/Trainer');
const jwt = require('jsonwebtoken');
const keys = require('../../config/keys');
const passport = require('passport');

router.get('/index', (req, res) => {
    
    Trainer.find({}).populate("workouts").populate("reviews").populate("location")
        .then(trainers => {
            const trainerMap = {};

            trainers.forEach((trainer) => {
                trainerMap[trainer._id] = trainer;
            });

            return res.send(trainerMap);
        })

});

router.get('/show/:trainerId', (req, res) => {
    Trainer.findById(req.params.trainerId).populate("workouts").populate("reviews").populate("location")

        .then(trainer => res.json(trainer))
        .catch(err => console.log(err));
})

router.get('/search', (req, res) => {
    let travelFlag1
    let travelFlag2
    let locationFlag1
    let locationFlag2

    if (req.query.canTravel === '') {
        travelFlag1 = true
        travelFlag2 = false
    } else {
        travelFlag1 = req.query.canTravel === 'true'
        travelFlag2 = req.query.canTravel === 'true'
    }

    if (req.query.hasLocation === '') {
        locationFlag1 = true
        locationFlag2 = false
    } else {
        locationFlag1 = req.query.hasLocation === 'true'
        locationFlag2 = req.query.hasLocation === 'true'
    }

    // Trainer.find({'specialties': req.query.specialty}).populate("workouts").populate("reviews").populate("location")
    // .where("experienceLevel").equals(req.query.experienceLevel)
    // .where("borough").equals(req.query.borough)
    // .find({canTravel: {$in: [travelFlag1, travelFlag2]}})
    // .find({hasLocation: {$in: [locationFlag1, locationFlag2]}})

    Trainer.find({ 'specialties': req.query.specialty })
        .where("experienceLevel").equals(req.query.experienceLevel)
        .where("borough").equals(req.query.borough)
        .find({ canTravel: { $in: [travelFlag1, travelFlag2] } })
        .find({ hasLocation: { $in: [locationFlag1, locationFlag2] } })
        .distinct('_id')

        .then(trainers => {
            if (!trainers.length) return res.json({ trainers: "x" })
            return res.json({ trainers })
        })
})


router.post('/create', (req, res) => {

    const newTrainer = new Trainer({
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        hasLocation: Boolean(req.body.hasLocation),
        canTravel: Boolean(req.body.canTravel),
        dailyAvailability: req.body.dailyAvailability,
        experienceLevel: req.body.experienceLevel,
        specialties: req.body.specialties,
        imageUrl: req.body.imageUrl,
        borough: req.body.borough,
        bio: req.body.bio,
    })

    newTrainer.save()
        .then(trainer => res.json(trainer))
        .catch(err => console.log(err));
})

module.exports = router;