import { Schema, model } from "mongoose";
import mongoosePaginate from "mongoose-paginate-v2";

const PublicationSchema = new Schema({
  user: {
    type: Schema.ObjectId,
    ref: "User",
  },
  text: {
    type: String,
    required: true,
  },
  file: String,
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

PublicationSchema.plugin(mongoosePaginate);

export default model("Publication", PublicationSchema, "publications");
