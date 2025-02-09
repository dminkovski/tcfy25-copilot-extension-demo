import express, { Request, Response } from "express";

// Create a new express application instance
const app = express();

// Set the network port
const port = process.env.PORT || 3000;

const todos = [{ id: 1, name: "Fly to Tech Connect." }, { id: 2, name: "Join Session on GH Copilot" }, { id: 3, name: "Meet people and have fun."}];

// Middleware to parse JSON bodies
app.use(express.json());

app.get("/", (req: Request, res: Response) => {
    res.json({ message: "Welcome to TechConnect FY2025" });
});

app.get("/todos", (req: Request, res: Response) => {
    console.log("GET /todos response:", todos);
    res.json(todos);
});

// Start the Express server
app.listen(port, () => {
    console.log(`The server is running at http://localhost:${port}`);
});