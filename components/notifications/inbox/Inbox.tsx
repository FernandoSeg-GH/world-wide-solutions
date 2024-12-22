
"use client";

import React from "react";
import { useAppContext } from "@/context/AppProvider";
import MessagingLayout from "../MessagingLayout";
import SectionHeader from "@/components/layout/navbar/SectionHeader";

const Inbox: React.FC = () => {
    const { data, actions } = useAppContext();
    const { messages } = data;
    const { messageActions } = actions;
    const { fetchInboxMessages } = messageActions;

    if (!messages) {
        return <div>Loading messages...</div>;
    }


    return (
        <div className="h-full w-full">
            <SectionHeader
                title={` Notification Center`}
                subtitle="Stay up to date with your submissions."
            />
            <MessagingLayout />
        </div>
    );
};

export default Inbox;
