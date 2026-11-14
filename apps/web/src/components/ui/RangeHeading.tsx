"use client";

import { RANGES } from "@/data/ranges";
import { useAppDispatch, useAppState } from "@/state/app-state";
import { PageHeading } from "./PageHeading";
import { Segmented } from "./Segmented";

const RANGE_OPTIONS = RANGES.map((range) => ({ value: range, label: range }));

/** Page heading with the time range control. The range is shared by every screen that shows one. */
export function RangeHeading({ crumb, title }: { crumb: string; title: string }) {
  const { range } = useAppState();
  const dispatch = useAppDispatch();
  return (
    <PageHeading crumb={crumb} title={title}>
      <Segmented
        label="Time range"
        options={RANGE_OPTIONS}
        value={range}
        onChange={(next) => dispatch({ type: "setRange", range: next })}
      />
    </PageHeading>
  );
}
