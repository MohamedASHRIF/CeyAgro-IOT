"use client";
import ActivityLogCard from "../(components)/act-log";
import { ActLogHeader } from "../(components)/act-log-header";

export default function ActivityLogPage() {
  return (
    <div className="Activity-Log-Page mt-20">
      {/*  activeTab prop to Act Log */}
      <ActLogHeader activeTab="Activity Log" />
      {/*  show the Acts */}
      <div className="p-6">
        <ActivityLogCard />
      </div>
    </div>
  );
}
