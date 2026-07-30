const mongoose = require("mongoose");
const Counter = require("./models/counter");
const Poll = require("./models/poll");
const Confession = require("./models/confession");
const Task = require("./models/task");

async function seedCounter(counterName, maxValue) {
  if (maxValue <= 0) return;

  await Counter.findOneAndUpdate(
    { _id: counterName },
    { $max: { seq: maxValue } },
    { upsert: true },
  );
}

async function seedCounters() {
  const lastPoll = await Poll.findOne()
    .sort({ pollId: -1 })
    .select("pollId")
    .lean();
  await seedCounter("pollId", lastPoll?.pollId ?? 0);

  const lastConfession = await Confession.findOne()
    .sort({ confessionId: -1 })
    .select("confessionId")
    .lean();
  await seedCounter("confessionId", lastConfession?.confessionId ?? 0);

  // Prefer newest task that actually has a taskId (legacy/corrupt docs may omit it)
  const lastTask = await Task.findOne({ taskId: { $exists: true, $ne: "" } })
    .sort({ createdAt: -1 })
    .select("taskId")
    .lean();
  const taskIdPart = lastTask?.taskId?.split?.("-")?.[1];
  const taskMax = taskIdPart ? parseInt(taskIdPart, 10) || 0 : 0;
  await seedCounter("taskId", taskMax);
}

module.exports = async () => {
  await mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });

  await seedCounters();

  console.log("✅ MongoDB Connected");
};
