const router = require("express").Router();
const personCounterController = require("../controllers/personCounterController");

router.get("/:counter", personCounterController.IncreasePersonCounter);
module.exports = router;
