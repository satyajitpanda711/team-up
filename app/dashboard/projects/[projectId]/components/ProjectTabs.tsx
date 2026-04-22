"use client";

import {
  FolderTree,
  GitCommit,
  GitPullRequest,
  AlertCircle,
  MessageSquare,
  Bot,
} from "lucide-react";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import FilesTab from "./tabs/FilesTab";
import CommitsTab from "./tabs/CommitsTab";
import IssuesTab from "./tabs/IssuesTab";
import PullRequestsTab from "./tabs/PullRequestsTab";
import QuestionsTab from "./tabs/QuestionsTab";
import ChatTab from "./tabs/ChatTab";
import AskRepo from "./tabs/AskRepo";

export default function ProjectTabs({ projectId }: { projectId: string }) {
  return (
    <Tabs defaultValue="repo" className="h-full grid grid-rows-[auto_1fr]  overflow-hidden">

      <TabsList className="grid grid-cols-7 rounded-none border-b w-full">
        {[
          ["repo", "Repo", FolderTree],
          ["commits", "Commits", GitCommit],
          ["prs", "PRs", GitPullRequest],
          ["issues", "Issues", AlertCircle],
          ["questions", "Questions", MessageSquare],
          ["chat", "Chat", MessageSquare],
          ["ai-assistant", "AskRepo", Bot],
        ].map(([val, label, Icon]: any) => (
          <TabsTrigger
            key={val}
            value={val}
            className="flex gap-2 items-center"
          >
            <Icon className="w-4 h-4" />
            {label}
          </TabsTrigger>
        ))}
      </TabsList>

      {/* Shared content area — fills exactly the remaining grid row */}
      <div className="relative overflow-hidden">

        <TabsContent value="repo" className="absolute inset-0 overflow-auto m-0">
          <FilesTab projectId={projectId} />
        </TabsContent>

        <TabsContent value="commits" className="absolute inset-0 overflow-auto m-0">
          <CommitsTab projectId={projectId} />
        </TabsContent>

        <TabsContent value="prs" className="absolute inset-0 overflow-auto m-0">
          <PullRequestsTab projectId={projectId} />
        </TabsContent>

        <TabsContent value="issues" className="absolute inset-0 overflow-auto m-0">
          <IssuesTab projectId={projectId} />
        </TabsContent>

        <TabsContent value="questions" className="absolute inset-0 overflow-auto m-0">
          <QuestionsTab projectId={projectId} />
        </TabsContent>

        <TabsContent value="chat" className="absolute inset-0 overflow-hidden m-0">
          <ChatTab projectId={projectId} />
        </TabsContent>

        <TabsContent value="ai-assistant" className="absolute inset-0 overflow-hidden m-0">
          <AskRepo projectId={projectId} />
        </TabsContent>  

      </div>

    </Tabs>
  );
}