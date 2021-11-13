const Sequelize = require("sequelize");
const db = new Sequelize(
  process.env.DATABASE || "postgres://localhost/acme_corp_db"
);

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

module.exports = {
  db,
  syncAndSeed,
  models: {
    Department,
    Employee,
  },
};
