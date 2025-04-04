import {TaskStats} from "../components/TaskStats";
import {TaskTable} from "../components/TaskTable";
import React from "react";

export default function HomePage() {
  return (
    <>
      <TaskStats />
      <TaskTable />
    </>
  )
}
