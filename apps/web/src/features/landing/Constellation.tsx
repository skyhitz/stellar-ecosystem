import type { Project } from "@/data/types";
import { formatCount } from "@/lib/format";
import { HUB, VIEW_BOX, constellationNodes, round2 } from "./constellation";
import styles from "./constellation.module.css";

/** Seconds per loop, cycled across lines and dots so they drift out of step. */
const FLOW_SECONDS = [1.6, 2.1, 2.6, 3.1];
const TWINKLE_SECONDS = [2.4, 3.1, 3.8];
const TWINKLE_STAGGER_SECONDS = 0.3;

/** Enrolled projects as dots sized by page views, each feeding the SCF global view at the centre. */
export function Constellation({ projects }: { projects: readonly Project[] }) {
  const nodes = constellationNodes(projects);
  return (
    <svg
      className={styles.constellation}
      viewBox={VIEW_BOX}
      role="img"
      aria-label="Enrolled projects connected to the SCF global view"
    >
      {nodes.map((node, i) => {
        const next = nodes[(i + 1) % nodes.length];
        return <line key={node.id} className={styles.ring} x1={node.x} y1={node.y} x2={next.x} y2={next.y} />;
      })}
      {nodes.map((node) => (
        <line key={node.id} className={styles.spoke} x1={node.x} y1={node.y} x2={HUB.x} y2={HUB.y} />
      ))}
      {nodes.map((node, i) => (
        <line
          key={node.id}
          className={styles.flow}
          x1={node.x}
          y1={node.y}
          x2={HUB.x}
          y2={HUB.y}
          style={{ animationDuration: `${FLOW_SECONDS[i % FLOW_SECONDS.length]}s` }}
        />
      ))}

      <circle className={styles.pulse} cx={HUB.x} cy={HUB.y} r={18} />
      <circle className={styles.halo} cx={HUB.x} cy={HUB.y} r={30} />
      <circle className={styles.hub} cx={HUB.x} cy={HUB.y} r={14} />
      <text className={styles.hubLabel} x={HUB.x} y={HUB.y + 50}>
        SCF
      </text>
      <text className={styles.hubCaption} x={HUB.x} y={HUB.y + 64}>
        GLOBAL VIEW
      </text>

      {nodes.map((node, i) => (
        <g key={node.id}>
          <circle
            className={styles.node}
            cx={node.x}
            cy={node.y}
            r={node.r}
            style={{
              animationDuration: `${TWINKLE_SECONDS[i % TWINKLE_SECONDS.length]}s`,
              animationDelay: `${round2(i * TWINKLE_STAGGER_SECONDS)}s`,
            }}
          />
          <text className={styles.nodeLabel} x={node.x} y={round2(node.y + node.r + 14)}>
            {node.name.toUpperCase()}
          </text>
          <text className={styles.nodeCaption} x={node.x} y={round2(node.y + node.r + 25)}>
            {formatCount(node.pageViews)} VIEWS
          </text>
        </g>
      ))}
    </svg>
  );
}
