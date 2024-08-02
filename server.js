/*********************************************************************************
*  WEB700 – Assignment 06
*  I declare that this assignment is my own work in accordance with Seneca  Academic Policy.  No part 
*  of this assignment has been copied manually or electronically from any other source 
*  (including 3rd party web sites) or distributed to other students.
* 
*  Name: Hiruni Malsha Paththini Durage Student ID: 143446235 Date: 08/01/2024
*  Online (vercel) Link: 
********************************************************************************/ 
const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const collegeData = require('./modules/collegeData');
const exphbs = require('express-handlebars');

const app = express();
const HTTP_PORT = process.env.PORT || 8080;

// Configure express-handlebars
app.engine('.hbs', exphbs.engine({
    extname: '.hbs',
    defaultLayout: 'main',
    helpers: {
        navLink: function(url, options) {
            return '<li' +
            ((url == app.locals.activeRoute) ? ' class="nav-item active" ' : ' class="nav-item" ') +
            '><a class="nav-link" href="' + url + '">' + options.fn(this) + '</a></li>';
        },
        equal: function(lvalue, rvalue, options) {
            if (arguments.length < 3)
                throw new Error("Handlebars Helper equal needs 2 parameters");
            if (lvalue != rvalue) {
                return options.inverse(this);
            } else {
                return options.fn(this);
            }
        }
    }
}));
app.set('view engine', '.hbs');

app.use(express.static('public'));
app.use(bodyParser.urlencoded({ extended: true }));
app.set('views', path.join(__dirname, 'views'));

app.use((req, res, next) => {
    let route = req.path.substring(1);
    app.locals.activeRoute = "/" + (isNaN(route.split('/')[1]) ? route.replace(/\/(?!.*)/, "") : route.replace(/\/(.*)/, ""));
    next();
});

app.get('/', (req, res) => {
    res.render('home', { title: 'Home' });
});

app.get('/students/add', (req, res) => {
    collegeData.getCourses()
        .then((data) => {
            res.render('addStudent', { courses: data });
        })
        .catch(() => {
            res.render('addStudent', { courses: [] });
        });
});

app.post('/students/add', (req, res) => {
    collegeData.addStudent(req.body)
        .then(() => {
            res.redirect('/students');
        })
        .catch(err => {
            console.error('Error adding student:', err);
            res.status(500).send('Error adding student');
        });
});

app.post("/student/update", (req, res) => {
    collegeData.updateStudent(req.body)
        .then(() => {
            res.redirect("/students");
        })
        .catch(err => {
            res.status(500).send("Unable to update student");
        });
});

app.get('/courses/add', (req, res) => {
    res.render('addCourse', { title: 'Add Course' });
});

app.post('/courses/add', (req, res) => {
    collegeData.addCourse(req.body)
        .then(() => {
            res.redirect('/courses');
        })
        .catch(err => {
            console.error('Error adding course:', err);
            res.status(500).send('Error adding course');
        });
});

app.post("/course/update", (req, res) => {
    collegeData.updateCourse(req.body)
        .then(() => {
            res.redirect("/courses");
        })
        .catch(err => {
            res.status(500).send("Unable to update course");
        });
});

app.get('/course/:id', (req, res) => {
    const courseId = req.params.id;
    collegeData.getCourseById(courseId)
        .then(course => {
            if (course) {
                res.render('course', { course: course });
            } else {
                res.status(404).send("Course Not Found");
            }
        })
        .catch(err => {
            res.status(500).send("Error retrieving course");
        });
});

app.get('/course/delete/:id', (req, res) => {
    const courseId = req.params.id;
    collegeData.deleteCourseById(courseId)
        .then(() => {
            res.redirect('/courses');
        })
        .catch(err => {
            res.status(500).send('Unable to Remove Course / Course not found');
        });
});

app.get('/about', (req, res) => {
    res.render('about', { title: 'About' });
});

app.get('/htmlDemo', (req, res) => {
    res.render('htmlDemo', { title: 'HTML Demo' });
});

app.get('/students', (req, res) => {
    const course = req.query.course;

    if (course) {
        collegeData.getStudentsByCourse(course)
            .then(students => {
                if (students.length > 0) {
                    res.render('students', { students: students });
                } else {
                    res.render('students', { message: 'No results' });
                }
            })
            .catch(err => {
                res.render('students', { message: 'Error retrieving students' });
            });
    } else {
        collegeData.getAllStudents()
            .then(students => {
                if (students.length > 0) {
                    res.render('students', { students: students });
                } else {
                    res.render('students', { message: 'No results' });
                }
            })
            .catch(err => {
                res.render('students', { message: 'Error retrieving students' });
            });
    }
});

app.get('/courses', (req, res) => {
    collegeData.getCourses()
        .then(courses => {
            if (courses.length > 0) {
                res.render('courses', { courses: courses });
            } else {
                res.render('courses', { message: "No results" });
            }
        })
        .catch(err => {
            res.render('courses', { message: "Error retrieving courses" });
        });
});

app.get('/student/:studentNum', (req, res) => {
    let viewData = {};
    collegeData.getStudentByNum(req.params.studentNum)
        .then((data) => {
            if (data) {
                viewData.student = data;
            } else {
                viewData.student = null;
            }
        })
        .catch(() => {
            viewData.student = null;
        })
        .then(collegeData.getCourses)
        .then((data) => {
            viewData.courses = data;
            for (let i = 0; i < viewData.courses.length; i++) {
                if (viewData.courses[i].courseId == viewData.student.course) {
                    viewData.courses[i].selected = true;
                }
            }
        })
        .catch(() => {
            viewData.courses = [];
        })
        .then(() => {
            if (viewData.student == null) {
                res.status(404).send("Student Not Found");
            } else {
                res.render("student", { viewData: viewData });
            }
        });
});

app.get('/student/delete/:studentNum', (req, res) => {
    collegeData.deleteStudentByNum(req.params.studentNum)
        .then(() => {
            res.redirect('/students');
        })
        .catch(err => {
            res.status(500).send('Unable to Remove Student / Student not found');
        });
});

app.use((req, res) => {
    res.status(404).send('Page Not Found');
});

collegeData.initialize()
    .then(() => {
        app.listen(HTTP_PORT, () => {
            console.log(`Server is running on http://localhost:${HTTP_PORT}`);
        });
    })
    .catch(err => {
        console.error('Unable to start server:', err);
    });
