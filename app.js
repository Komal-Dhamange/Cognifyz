
const express = require("express");
const path = require("path");

const app = express();
const PORT = 3000;

// Temporary in-memory storage
const registrations = [];
let nextId = 1;

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

function validateRegistration(data, requirePassword = true) {
    const { name, email, age, gender, password } = data;

    if (
        typeof name !== "string" ||
        typeof email !== "string" ||
        !Number.isInteger(Number(age)) ||
        String(age).trim() === "" ||
        !["Female", "Male", "Other", "Prefer not to say"].includes(gender)
    ) {
        return "Please fill all fields with valid details.";
    }

    if (name.trim().length < 2 || name.trim().length > 100) {
        return "Name must contain 2 to 100 characters.";
    }

    if (
        email.trim().length > 254 ||
        !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())
    ) {
        return "Please enter a valid email address.";
    }

    if (Number(age) < 18 || Number(age) > 100) {
        return "Age must be between 18 and 100.";
    }

    if (requirePassword) {
        if (
            typeof password !== "string" ||
            password.length < 8 ||
            password.length > 128 ||
            !/[A-Z]/.test(password) ||
            !/[a-z]/.test(password) ||
            !/[0-9]/.test(password) ||
            !/[^A-Za-z0-9]/.test(password)
        ) {
            return "Password needs 8-128 characters, uppercase, lowercase, a number and a symbol.";
        }
    }

    return null;
}

// Task 1: Render the EJS homepage
app.get("/", (req, res) => {
    res.render("index");
});

// Task 2: Traditional form submission with server validation
app.post("/register", (req, res) => {
    const error = validateRegistration(req.body, true);

    const name = typeof req.body.name === "string"
        ? req.body.name.trim() : "";
    const email = typeof req.body.email === "string"
        ? req.body.email.trim() : "";

    if (error) {
        return res.status(400).render("result", {
            name,
            email,
            error
        });
    }

    registrations.push({
        id: nextId++,
        name,
        email,
        age: Number(req.body.age),
        gender: req.body.gender
    });

    // Password is never saved.
    res.render("result", {
        name,
        email,
        error: null
    });
});

// Task 5: READ all registrations
app.get("/api/registrations", (req, res) => {
    res.json(registrations);
});

// Task 5: CREATE a registration
app.post("/api/registrations", (req, res) => {
    const error = validateRegistration(req.body, true);

    if (error) {
        return res.status(400).json({ error });
    }

    const record = {
        id: nextId++,
        name: req.body.name.trim(),
        email: req.body.email.trim(),
        age: Number(req.body.age),
        gender: req.body.gender
    };

    // Store only non-password fields.
    registrations.push(record);
    res.status(201).json(record);
});

// Task 5: UPDATE a registration
app.put("/api/registrations/:id", (req, res) => {
    const record = registrations.find(
        item => item.id === Number(req.params.id)
    );

    if (!record) {
        return res.status(404).json({
            error: "Registration not found."
        });
    }

    const error = validateRegistration(req.body, true);

    if (error) {
        return res.status(400).json({ error });
    }

    record.name = req.body.name.trim();
    record.email = req.body.email.trim();
    record.age = Number(req.body.age);
    record.gender = req.body.gender;

    res.json(record);
});

// Task 5: DELETE a registration
app.delete("/api/registrations/:id", (req, res) => {
    const index = registrations.findIndex(
        item => item.id === Number(req.params.id)
    );

    if (index === -1) {
        return res.status(404).json({
            error: "Registration not found."
        });
    }

    registrations.splice(index, 1);

    res.json({ message: "Registration deleted successfully." });
});

app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});
