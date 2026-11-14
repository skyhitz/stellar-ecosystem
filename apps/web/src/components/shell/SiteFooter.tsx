import styles from "./SiteFooter.module.css";

export function SiteFooter() {
  return (
    <footer className={styles.footer}>
      <span>Stellar Ecosystem Stats · operated by Skyhitz for the Stellar Community Fund</span>
      <span>Built on Umami · open source · demo data</span>
    </footer>
  );
}
