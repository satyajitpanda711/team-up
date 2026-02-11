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
      <TabsList
        className="
          sticky top-0 z-10
          grid grid-cols-6
          w-full
          border-b
          bg-background
          rounded-none
        "
      >
        <TabsTrigger value="repo" className="flex gap-2 items-center">
          <FolderTree className="w-4 h-4" />
          Repo
        </TabsTrigger>

        <TabsTrigger value="commits" className="flex gap-2 items-center">
          <GitCommit className="w-4 h-4" />
          Commits
        </TabsTrigger>

        <TabsTrigger value="prs" className="flex gap-2 items-center">
          <GitPullRequest className="w-4 h-4" />
          PRs
        </TabsTrigger>

        <TabsTrigger value="issues" className="flex gap-2 items-center">
          <AlertCircle className="w-4 h-4" />
          Issues
        </TabsTrigger>

        <TabsTrigger value="questions" className="flex gap-2 items-center">
          <MessageSquare className="w-4 h-4" />
          Questions
        </TabsTrigger>

        <TabsTrigger value="chat" className="flex gap-2 items-center">
          <MessageSquare className="w-4 h-4" />
          Chat
        </TabsTrigger>
      </TabsList>
      <TabsContent value="repo" className="mt-0 flex-1 overflow-y-autoai">
        <FilesTab projectId={projectId} />
      </TabsContent>

      <TabsContent value="commits" className="mt-0 flex-1 overflow-y-auto">
        <CommitsTab projectId={projectId} />
      </TabsContent>

      <TabsContent value="prs" className="mt-0 flex-1 overflow-y-auto">
        <PullRequestsTab projectId={projectId} />
      </TabsContent>

      <TabsContent value="issues" className="mt-0 flex-1 overflow-y-auto">
        <IssuesTab projectId={projectId} />
      </TabsContent>

      <TabsContent value="questions" className="mt-0 flex-1 overflow-y-auto">
        <QuestionsTab projectId={projectId} />
      </TabsContent>

      {/* Chat usually wants full height */}
      <TabsContent value="chat" className="mt-0 flex-1 overflow-hidden">
        <ChatTab projectId={projectId} />
      </TabsContent>

    </Tabs>
  );
}
