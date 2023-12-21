import express from "express";
import { User, decodeJwtToken } from "../Models/User.js";
import { Notes } from "../Models/Notes.js";
import { MailSender } from "../mailer.js";

let router = express.Router();

//Add New Notes
router.post("/add-notes", async (req, res) => {
  try {
    //Check user is logged in
    let token = req.headers["x-auth"];
    let userId = decodeJwtToken(token);
    let user = await User.findById({ _id: userId });
    if (!user)
      return res.status(400).json({ message: "Invalid Authorization" });

    //Adding new Notes to DB
    await new Notes({
      head: req.body.head,
      data: req.body.data,
      deadline: req.body.deadline,
      user: userId,
    }).save();

    res.status(200).json({ message: "Notes Added successfully" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

//Get Notes by Id
router.get("/get-notes-data-by-id", async (req, res) => {
  try {
    //Check user is logged in
    let token = req.headers["x-auth"];
    let userId = decodeJwtToken(token);
    let user = await User.findById({ _id: userId });
    if (!user)
      return res.status(400).json({ message: "Invalid Authorization" });

    //Get notes by id
    let id = req.headers["id"];
    let notes = await Notes.findById({ _id: id });

    res.status(200).json({ message: "Notes Data Got Successfully", notes });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

//Get All Notes Data
router.get("/get-all-notes", async (req, res) => {
  try {
    //Check user is logged in
    let token = req.headers["x-auth"];
    let userId = decodeJwtToken(token);
    let user = await User.findById({ _id: userId });
    if (!user)
      return res.status(400).json({ message: "Invalid Authorization" });

    //Get all Notes
    let notes = await Notes.aggregate([
      {
        $match: { user: userId },
      },
    ]);
    res.status(200).json({ message: "Notes Data Got Successfully", notes });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

//Update Notes
router.put("/update-notes", async (req, res) => {
  try {
    //Check user is logged in
    let token = req.headers["x-auth"];
    let userId = decodeJwtToken(token);
    let user = await User.findById({ _id: userId });
    if (!user)
      return res.status(400).json({ message: "Invalid Authorization" });

    //Updating Notes
    let id = req.headers["id"];
    await Notes.findOneAndUpdate(
      { _id: id },
      {
        $set: {
          head: req.body.head,
          data: req.body.data,
          deadline: req.body.deadline,
          user: userId,
        },
      }
    );
    res.status(200).json({ message: "Notes Updated Successfully" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

//Update Notes Status
router.put("/update-status", async (req, res) => {
    try {
      //Check user is logged in
      let token = req.headers["x-auth"];
      let userId = decodeJwtToken(token);
      let user = await User.findById({ _id: userId });
      if (!user)
        return res.status(400).json({ message: "Invalid Authorization" });
  
      //Updating Notes Status
      let id = req.headers["id"];

      let notes = await Notes.findById({ _id: id });
      let status=notes.status==true ? false:true
      await Notes.findOneAndUpdate(
        { _id: id },
        {
          $set: {
            status
          },
        }
      );
      res.status(200).json({ message: "Notes Status Updated Successfully" });
    } catch (error) {
      console.log(error);
      res.status(500).json({ message: "Internal Server Error" });
    }
  });

//Delete Notes
router.delete("/delete-notes", async (req, res) => {
  try {
    //Check user is logged in
    let token = req.headers["x-auth"];
    let userId = decodeJwtToken(token);
    let user = await User.findById({ _id: userId });
    if (!user)
      return res.status(400).json({ message: "Invalid Authorization" });

    //Delete Notes
    let id = req.headers["id"];
    await Notes.findByIdAndDelete({ _id: id });

    res.status(200).json({ message: "Notes Deleted Successfully" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

//Reminder  Notification
router.post("/send-reminders", async (req, res) => {
  try {
    let token = req.headers["x-auth"];
    let userId = decodeJwtToken(token);
    let user = await User.findById({ _id: userId });
    if (!user)
      return res.status(400).json({ message: "Invalid Authorization" });

    let id = req.headers["id"];
    let notes = await Notes.findById({ _id: id });
    let deadline = notes.deadline.split("/").join("-");

    //Creating mail details
    let mailData = {
      email: user.email,
      subject: "Task Reminder",
      message: `This is a reminder for your ${notes.head} task`,
    };

    // Check if the task deadline is in the future
    const taskDeadline = new Date(deadline);
    const currentDate = new Date();

    if (currentDate < taskDeadline) {
      //Sending mail
      await MailSender({ data: mailData });
      res.status(200).json({ message: "Reminder sent successfully." });
    } else {
      res
        .status(200)
        .json({ message: "Task deadline has passed. No reminder sent." });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

export let notesRouter = router;
