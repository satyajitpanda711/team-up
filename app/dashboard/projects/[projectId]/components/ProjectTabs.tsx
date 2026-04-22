"use client";

import {
  FolderTree,
  GitCommit,
  GitPullRequest,
  AlertCircle,
  MessageSquare,
} from "lucide-react";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import FilesTab from "./tabs/FilesTab";
import CommitsTab from "./tabs/CommitsTab";
import IssuesTab from "./tabs/IssuesTab";
import PullRequestsTab from "./tabs/PullRequestsTab";
import QuestionsTab from "./tabs/QuestionsTab";
import ChatTab from "./tabs/ChatTab";

export default function ProjectTabs({ projectId }: { projectId: string }) {
  return (
    <Tabs defaultValue="repo" className="h-full flex flex-col">

      <TabsList className="grid grid-cols-6 border-b border-white/10 bg-transparent">

        {[
          ["repo", "Repo", FolderTree],
          ["commits", "Commits", GitCommit],
          ["prs", "PRs", GitPullRequest],
          ["issues", "Issues", AlertCircle],
          ["questions", "Questions", MessageSquare],
          ["chat", "Chat", MessageSquare],
        ].map(([val, label, Icon]: any) => (
          <TabsTrigger
            key={val}
            value={val}
            className="flex gap-2 items-center text-white/40 data-[state=active]:text-[#00ffa3] data-[state=active]:border-b data-[state=active]:border-[#00ffa3]"
          >
            <Icon className="w-4 h-4" />
            {label}
          </TabsTrigger>
        ))}
      </TabsList>

      <TabsContent value="repo" className="flex-1 overflow-auto">
        <FilesTab projectId={projectId} />
      </TabsContent>

      <TabsContent value="commits" className="flex-1 overflow-auto">
        <CommitsTab projectId={projectId} />
      </TabsContent>

      <TabsContent value="prs" className="flex-1 overflow-auto">
        <PullRequestsTab projectId={projectId} />
      </TabsContent>

      <TabsContent value="issues" className="flex-1 overflow-auto">
        <IssuesTab projectId={projectId} />
      </TabsContent>

      <TabsContent value="questions" className="flex-1 overflow-auto">
        <QuestionsTab projectId={projectId} />
      </TabsContent>

      <TabsContent value="chat" className="flex-1 overflow-hidden">
        <ChatTab projectId={projectId} />
      </TabsContent>

    </Tabs>
  );
}