"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getRepoIdfromProjectId = exports.getRepositoriesForProject = void 0;
const db_1 = require("./db");
const Repository_1 = __importDefault(require("@/models/Repository"));
const Project_1 = __importDefault(require("@/models/Project"));
const getRepositoriesForProject = async (projectId) => {
    await (0, db_1.connectDB)();
    const repo = await Project_1.default.findById(projectId).populate("repositories");
    if (!repo)
        throw new Error("Project not found");
    return repo;
};
exports.getRepositoriesForProject = getRepositoriesForProject;
const getRepoIdfromProjectId = async (projectId) => {
    try {
        await (0, db_1.connectDB)();
        const project = await Project_1.default.findById(projectId);
        if (!project) {
            throw new Error("Project not found");
        }
        const repository = await Repository_1.default.findOne({ projectId: projectId });
        if (!repository) {
            throw new Error("Repository not found");
        }
        return repository._id;
    }
    catch (e) {
        throw new Error("Project not found");
    }
};
exports.getRepoIdfromProjectId = getRepoIdfromProjectId;
