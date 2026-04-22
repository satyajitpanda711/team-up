User
_id: ObjectId
name: String
email: String (unique)
image: String
githubId: String
githubAccessToken: String (hidden)
createdAt: Date
updatedAt: Date


Project
_id: ObjectId
name: String (unique, required)
owner: ObjectId → User
members:
user: ObjectId → User
role: owner | maintainer | developer | viewer
repository: ObjectId → Repository
githubRepoUrl: String (required)
createdAt: Date
updatedAt: Date


Repository
_id: ObjectId
projectId: ObjectId → Project (indexed)
githubId: Number
owner: String
name: String
fullName: String
url: String
isPrivate: Boolean
defaultBranch: String
tree: Object
lastSyncedAt: Date
createdAt: Date
updatedAt: Date

Constraint:

(projectId + githubId) must be unique


RepoFile
_id: ObjectId
repository: ObjectId → Repository (indexed)
path: String
content: String
language: String
size: Number
lastCommitSha: String
createdAt: Date
updatedAt: Date
Question
_id: ObjectId
project: ObjectId → Project (indexed)
askedBy: ObjectId → User
question: String (max 500)
answer: String | null
status: pending | answered
createdAt: Date
updatedAt: Date


Message
_id: ObjectId
project: ObjectId → Project (indexed)
sender: ObjectId → User (indexed)
content: String (max 2000)
type: text | image | file | system
createdAt: Date

Index:

(project, createdAt DESC)



PullRequest
_id: ObjectId
repository: ObjectId → Repository (indexed)
number: Number
title: String
body: String
state: String
merged: Boolean
createdAt: Date
updatedAt: Date


Issue
_id: ObjectId
repository: ObjectId → Repository (indexed)
number: Number
title: String
body: String
state: String
labels: [String]
createdAt: Date
updatedAt: Date



Commit
_id: ObjectId
repository: ObjectId → Repository (indexed)
sha: String
message: String
author: String
date: Date
createdAt: Date
updatedAt: Date
AskRepoMessage
_id: ObjectId
projectId: ObjectId → Project (indexed)
repository: ObjectId → Repository
user: ObjectId → User
username: String
question: String
answer: String
answered: Boolean
createdAt: Date
updatedAt: Date


🔗 RELATION SNAPSHOT
User → owns Project
Project → has members (Users)
Project → linked to one Repository
Repository → has Files, PRs, Issues, Commits
Project → has Messages & Questions
AskRepoMessage → bridges Project + Repository + User (AI layer)