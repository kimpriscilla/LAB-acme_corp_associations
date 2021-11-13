const Sequelize = require("sequelize");
const db = new Sequelize(
  process.env.DATABASE || "postgres://localhost/acme_corp_db"
);

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

const Department = db.define("department", {
  name: {
    type: Sequelize.STRING(20),
  },
});

const Employee = db.define("employee", {
  id: {
    type: Sequelize.UUID, //! creating UNIQUE identifiers instead of having integers as ID's
    primaryKey: true,
    defaultValue: Sequelize.UUIDV4,
  },
  name: {
    type: Sequelize.STRING(20),
  },
});

Department.belongsTo(Employee, { as: "manager" }); //!now employeeId is now under managerId
Employee.hasMany(Department, { foreignKey: "managerId" }); //! use thru table to associate foreignKey so we dont have both managerId & employeeId, just managerId

Employee.belongsTo(Employee, { as: "supervisor" });
Employee.hasMany(Employee, { foreignKey: "supervisorId" });

const syncAndSeed = async () => {
  await db.sync({ force: true });
  const [moe, lucy, larry, hr, engineering] = await Promise.all([
    Employee.create({ name: "moe" }),
    Employee.create({ name: "lucy" }),
    Employee.create({ name: "larry" }),
    Department.create({ name: "hr" }),
    Department.create({ name: "engineering" }),
  ]);
  hr.managerId = lucy.id;
  await hr.save();
  //console.log(JSON.stringify(hr, null, 2));
  moe.supervisorId = lucy.id;
  larry.supervisorId = lucy.id;
  await Promise.all([moe.save(), larry.save()]);
};

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
