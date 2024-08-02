const { Sequelize, DataTypes } = require('sequelize');

// Retrieve environment variables
const host = process.env.DATABASE_HOST;
const database = process.env.DATABASE_NAME;
const username = process.env.DATABASE_USER;
const password = process.env.DATABASE_PASSWORD;
const port = process.env.DATABASE_PORT || 5432;

// Initialize Sequelize
const sequelize = new Sequelize(database, username, password, {
    host: host,
    port: port,
    dialect: 'postgres'
});

// Define models
const Student = sequelize.define('Student', {
    studentNum: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    firstName: DataTypes.STRING,
    lastName: DataTypes.STRING,
    email: DataTypes.STRING,
    addressStreet: DataTypes.STRING,
    addressCity: DataTypes.STRING,
    addressProvince: DataTypes.STRING,
    TA: DataTypes.BOOLEAN,
    status: DataTypes.STRING,
    course: {
        type: DataTypes.INTEGER,
        references: {
            model: 'Courses',
            key: 'courseId'
        }
    }
});

const Course = sequelize.define('Course', {
    courseId: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    courseCode: DataTypes.STRING,
    courseDescription: DataTypes.STRING
});

Course.hasMany(Student, { foreignKey: 'course' });

module.exports = sequelize;

module.exports.initialize = function () {
    return new Promise(function (resolve, reject) {
        sequelize.sync()
            .then(() => resolve())
            .catch(err => reject("unable to sync the database: " + err));
    });
}

module.exports.getAllStudents = function () {
    return new Promise(function (resolve, reject) {
        Student.findAll()
            .then(data => resolve(data))
            .catch(err => reject("no results returned: " + err));
    });
}

module.exports.getStudentsByCourse = function (course) {
    return new Promise(function (resolve, reject) {
        Student.findAll({
            where: { course: course }
        })
            .then(data => resolve(data))
            .catch(err => reject("no results returned: " + err));
    });
}

module.exports.getStudentByNum = function (num) {
    return new Promise(function (resolve, reject) {
        Student.findAll({
            where: { studentNum: num }
        })
            .then(data => resolve(data[0]))
            .catch(err => reject("no results returned: " + err));
    });
}

module.exports.getCourses = function () {
    return new Promise(function (resolve, reject) {
        Course.findAll()
            .then(data => resolve(data))
            .catch(err => reject("no results returned: " + err));
    });
}

module.exports.getCourseById = function (id) {
    return new Promise(function (resolve, reject) {
        Course.findAll({
            where: { courseId: id }
        })
            .then(data => resolve(data[0]))
            .catch(err => reject("no results returned: " + err));
    });
}

module.exports.addStudent = function (studentData) {
    return new Promise(function (resolve, reject) {
        studentData.TA = (studentData.TA) ? true : false;
        for (let key in studentData) {
            if (studentData[key] === "") {
                studentData[key] = null;
            }
        }
        Student.create(studentData)
            .then(() => resolve())
            .catch(err => reject("unable to create student: " + err));
    });
}

module.exports.updateStudent = function (studentData) {
    return new Promise(function (resolve, reject) {
        studentData.TA = (studentData.TA) ? true : false;
        for (let key in studentData) {
            if (studentData[key] === "") {
                studentData[key] = null;
            }
        }
        Student.update(studentData, {
            where: { studentNum: studentData.studentNum }
        })
            .then(() => resolve())
            .catch(err => reject("unable to update student: " + err));
    });
}

module.exports.addCourse = function (courseData) {
    return new Promise(function (resolve, reject) {
        for (let key in courseData) {
            if (courseData[key] === "") {
                courseData[key] = null;
            }
        }
        Course.create(courseData)
            .then(() => resolve())
            .catch(err => reject("unable to create course: " + err));
    });
}

module.exports.updateCourse = function (courseData) {
    return new Promise(function (resolve, reject) {
        for (let key in courseData) {
            if (courseData[key] === "") {
                courseData[key] = null;
            }
        }
        Course.update(courseData, {
            where: { courseId: courseData.courseId }
        })
            .then(() => resolve())
            .catch(err => reject("unable to update course: " + err));
    });
}

module.exports.deleteCourseById = function (id) {
    return new Promise(function (resolve, reject) {
        Course.destroy({
            where: { courseId: id }
        })
            .then(() => resolve())
            .catch(err => reject("unable to delete course: " + err));
    });
}
module.exports.deleteStudentByNum = function (studentNum) {
    return new Promise(function (resolve, reject) {
        Student.destroy({
            where: { studentNum: studentNum }
        })
            .then((deletedCount) => {
                if (deletedCount > 0) {
                    resolve();
                } else {
                    reject("Student not found");
                }
            })
            .catch(err => reject("unable to delete student: " + err));
    });
};
