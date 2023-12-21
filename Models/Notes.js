import mongoose from "mongoose";

let notesSchema = new mongoose.Schema({
  head: {
    type: "string",
    required: true,
  },
  data: {
    type: "string",
    required: true,
  },
  deadline: {
    type: "Number",
  },
  user: {
    type: "String",
    required: true,
  },
});

let Notes = mongoose.model("Notes", notesSchema);
export { Notes };
