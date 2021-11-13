const {
  db,
  syncAndSeed,
  models: { Department, Employee },
} = require("./db");
const express = require("express");
const app = express();

app.get("/api/departments", async (req, res) => {
  try {
    res.send(
      await Department.findAll({
        include: [{ model: Employee, as: "manager" }], //! alias does 2 things, 1) sets the foreign key and 2) sets how it ends up getting loaded
      })
    );
  } catch (error) {
    next(error);
  }
});

app.get("/api/employees", async (req, res) => {
  try {
    res.send(
      await Employee.findAll({
        include: [{ model: Employee, as: "supervisor" }, Employee, Department],
      })
    );
  } catch (error) {
    next(error);
  }
});

const start = async () => {
  try {
    await db.authenticate();
    await syncAndSeed();
    const PORT = process.env.PORT || 3000;
    app.listen(PORT, () => console.log(`listening on port ${PORT}`));
  } catch (error) {
    console.log(error);
  }
};

start();
