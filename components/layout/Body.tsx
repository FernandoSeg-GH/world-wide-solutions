"use client"
import React, { useEffect } from "react";
import { SummaryCards } from "./SummaryCards";
import { RecentOrders } from "./RecentOrders";
import { OrderDetails } from "./OrderDetails";
import { DashboardBodyProps } from "@/types";
import { useSession } from "next-auth/react";
import { useAppContext } from "../context/AppContext";
import CreateBusinessForm from "../business/CreateBusinessForm";

export const Body: React.FC<DashboardBodyProps> = ({
    summaryCards,
    recentOrders,
    selectedOrder,
}) => {
    const { data: session } = useSession();
    const { data, actions } = useAppContext();
    const { godMode, loading: formLoading, loading, forms } = data;

    return (
        <main className="grid flex-1 items-start gap-4 p-4 sm:px-6 sm:py-0 md:gap-8 lg:grid-cols-3 xl:grid-cols-3">
            {/* THEME 1 */}
            {summaryCards && <SummaryCards cards={summaryCards} />}
            {session?.user?.role.id === 4 && session?.user.name === "superadmin" ?
                <CreateBusinessForm /> : null
            }
            <CreateBusinessForm />
            {/* <div className="grid auto-rows-max items-start gap-4 md:gap-8 lg:col-span-2">
                {recentOrders && <RecentOrders orders={recentOrders} />}
            </div>
            <div>
                {selectedOrder && <OrderDetails order={selectedOrder} />}
            </div> */}
        </main>
    );
};
