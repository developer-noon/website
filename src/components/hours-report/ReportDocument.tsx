import { Document, Image, Page, StyleSheet, Text, View } from '@react-pdf/renderer';
import type { Report, ReportMeta } from '@/lib/hours-report/types';

// Brand accent, using the darker light-mode violet from the global theme so it prints well.
const ACCENT = '#6340f0';

const styles = StyleSheet.create({
  page: { padding: 40, fontFamily: 'Helvetica', fontSize: 8, color: '#222' },
  head: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 28 },
  logo: { width: 68 },
  right: { alignItems: 'flex-end' },
  title: { fontSize: 22, letterSpacing: 5, marginBottom: 6 },
  meta: { fontSize: 7.5, lineHeight: 1.35 },
  bar: { flexDirection: 'row', backgroundColor: ACCENT, borderRadius: 4, paddingVertical: 8, paddingHorizontal: 14, marginBottom: 8 },
  th: { color: '#fff', fontFamily: 'Helvetica-Bold', fontSize: 8.5 },
  date: { width: 85 },
  project: { flex: 1, paddingRight: 12 },
  time: { width: 70, textAlign: 'right' },
  sectionTitle: { fontFamily: 'Helvetica-Bold', fontSize: 8.5, color: ACCENT, marginTop: 14, marginBottom: 6 },
  row: { flexDirection: 'row', paddingVertical: 5, paddingHorizontal: 14, borderBottomWidth: 0.5, borderBottomColor: '#bdbdbd' },
  subtotal: { fontFamily: 'Helvetica-Bold', fontSize: 8.5, textAlign: 'right', marginTop: 8, paddingRight: 14 },
  grand: { flexDirection: 'row', justifyContent: 'space-between', borderTopWidth: 1.5, borderTopColor: ACCENT, marginTop: 14, paddingTop: 8, paddingHorizontal: 2 },
  grandText: { fontFamily: 'Helvetica-Bold', fontSize: 9, color: ACCENT },
});

function HeaderBar() {
  return <View style={styles.bar}><Text style={[styles.th, styles.date]}>DATE</Text><Text style={[styles.th, styles.project]}>PROJECTS</Text><Text style={[styles.th, styles.time]}>TIME</Text></View>;
}

export function ReportDocument({ report, meta, logoSrc }: { report: Report; meta: ReportMeta; logoSrc: string }) {
  return (
    <Document title={`Hours Report - ${meta.name}`} author="TheBrandefy">
      <Page size="A4" style={styles.page}>
        <View style={styles.head}>
          {/* eslint-disable-next-line jsx-a11y/alt-text */}
          <Image src={logoSrc} style={styles.logo} />
          <View style={styles.right}><Text style={styles.title}>REPORT</Text><Text style={styles.meta}>{meta.client}</Text><Text style={styles.meta}>{meta.name}</Text><Text style={styles.meta}>{meta.email}</Text><Text style={styles.meta}>Date: {meta.date}</Text></View>
        </View>
        <HeaderBar />
        <View fixed render={({ pageNumber }) => (pageNumber > 1 ? <HeaderBar /> : null)} />
        {report.sections.map((section) => <View key={section.title}><Text style={styles.sectionTitle} minPresenceAhead={40}>{section.title}</Text>{section.rows.map((row, index) => <View key={`${row.date}-${row.project}-${index}`} style={styles.row} wrap={false}><Text style={styles.date}>{row.date}</Text><Text style={styles.project}>{row.project}</Text><Text style={styles.time}>{row.time}</Text></View>)}<Text style={styles.subtotal}>+ {section.total}</Text></View>)}
        <View style={styles.grand} wrap={false}><Text style={styles.grandText}>TOTAL HOURS</Text><Text style={styles.grandText}>{report.grandTotal}</Text></View>
      </Page>
    </Document>
  );
}