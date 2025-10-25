import * as React from "react";
import {
  House,
  MessageCircle,
  CirclePlus,
  User,
  Search,
  Users,
} from "lucide-react";

import { NavMain } from "@/components/nav-main";
import { NavUser } from "@/components/nav-user";
import Avatar from "../assets/sample_profile.jpg";
import { Button } from "@/components/ui/button";

import { Sidebar, SidebarContent } from "@/components/ui/sidebar";

const data = {
  user: {
    name: "John Warern",
    email: "m@example.com",
    avatar: Avatar,
  },
  navMain: [
    {
      title: "Feed",
      url: "#",
      icon: House,
    },
    {
      title: "Messages",
      url: "#",
      icon: MessageCircle,
    },
    {
      title: "Connections",
      url: "#",
      icon: Users,
    },
    {
      title: "Discover",
      url: "#",
      icon: Search,
    },
    {
      title: "Profile",
      url: "#",
      icon: User,
    },
  ],
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar
      className="top-(--header-height) h-[calc(100svh-var(--header-height))]!"
      {...props}
    >
      <SidebarContent>
        <NavMain items={data.navMain} />
        <div className="w-full p-2">
          <Button variant="outline" size="icon" className="w-full">
            <CirclePlus />
            Create Post
          </Button>
        </div>
      </SidebarContent>
      <div className="p-2">
        <NavUser user={data.user} />
      </div>
    </Sidebar>
  );
}
