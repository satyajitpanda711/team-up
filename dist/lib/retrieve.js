"use strict";
// lib/retrieve.ts
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.retrieveRelevantFiles = retrieveRelevantFiles;
const RepoFile_1 = __importDefault(require("@/models/RepoFile"));
const chunking_1 = require("./chunking");
async function retrieveRelevantFiles(repositoryId, question) {
    var _a;
    const keywords = question
        .toLowerCase()
        .replace(/[^\w\s]/g, "")
        .split(/\s+/)
        .filter((word) => word.length > 2);
    const uniqueKeywords = [...new Set(keywords)];
    const files = await RepoFile_1.default.find({
        repository: repositoryId,
        content: { $exists: true, $ne: "" },
    }).lean();
    const relevantChunks = [];
    const expandedTerms = [
        ...uniqueKeywords,
    ];
    if (uniqueKeywords.includes("authentication")) {
        expandedTerms.push("auth", "nextauth", "jwt", "session", "login", "signin");
    }
    for (const file of files) {
        if (!file.content)
            continue;
        const chunks = (0, chunking_1.chunkText)(file.content);
        const lowerPath = ((_a = file.path) === null || _a === void 0 ? void 0 : _a.toLowerCase()) || "";
        for (const chunk of chunks) {
            let score = 0;
            for (const keyword of expandedTerms) {
                const regex = new RegExp(keyword, "gi");
                const matches = chunk.match(regex);
                if (matches) {
                    score += matches.length;
                }
                if (lowerPath.includes(keyword)) {
                    score += 3;
                }
            }
            if (score > 0) {
                relevantChunks.push({
                    path: file.path,
                    content: chunk,
                    score,
                });
            }
        }
    }
    relevantChunks.sort((a, b) => b.score - a.score);
    return relevantChunks.slice(0, 6);
}
