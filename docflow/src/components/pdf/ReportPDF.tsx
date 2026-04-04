import React from "react";
import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer";
import { pdfTheme } from "@/lib/pdf-theme";
import type { ReportData } from "@/schemas/report.schema";

const styles = StyleSheet.create({
  page: { 
    padding: pdfTheme.spacing.page.padding, 
    fontFamily: pdfTheme.fonts.body,
    backgroundColor: pdfTheme.colors.background 
  },
  header: { 
    alignItems: "center", 
    borderBottomWidth: 2,
    borderBottomColor: pdfTheme.colors.primary,
    paddingBottom: 20,
    marginBottom: 40
  },
  title: { 
    fontSize: 28, 
    fontWeight: "bold",
    color: pdfTheme.colors.primary,
    marginBottom: 10
  },
  subtitle: { 
    fontSize: 16, 
    color: pdfTheme.colors.textMuted,
    marginBottom: 20
  },
  authorBlock: { 
    flexDirection: "row", 
    justifyContent: "space-between",
    width: "100%",
  },
  authorText: { 
    fontSize: 12, 
    color: pdfTheme.colors.text 
  },
  section: { 
    marginBottom: 20 
  },
  sectionHeading: { 
    fontSize: 18, 
    fontWeight: "bold",
    color: pdfTheme.colors.primary,
    marginBottom: 10 
  },
  sectionBody: { 
    fontSize: 12, 
    color: pdfTheme.colors.text,
    lineHeight: 1.5 
  },
  chartOverview: { 
    fontSize: 16, 
    fontWeight: "bold",
    color: pdfTheme.colors.primary,
    marginTop: 20,
    marginBottom: 10 
  },
  chartBar: {
    height: 20,
    backgroundColor: pdfTheme.colors.secondary,
    borderRadius: 4,
    marginBottom: 10
  },
  chartLabel: {
    fontSize: 10,
    color: pdfTheme.colors.textMuted,
    marginBottom: 2
  },
  footer: {
    position: "absolute",
    bottom: 30,
    left: 0,
    right: 0,
    textAlign: "center",
    fontSize: 10,
    color: pdfTheme.colors.muted
  }
});

export const ReportPDF = ({ data }: { data: ReportData }) => {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <Text style={styles.title}>{data.title}</Text>
          {data.subtitle && <Text style={styles.subtitle}>{data.subtitle}</Text>}
          <View style={styles.authorBlock}>
            <Text style={styles.authorText}>Author: {data.author}</Text>
            <Text style={styles.authorText}>Date: {data.date}</Text>
          </View>
        </View>

        {data.sections.map((sec, idx) => (
          <View key={idx} style={styles.section}>
            <Text style={styles.sectionHeading}>{sec.heading}</Text>
            <Text style={styles.sectionBody}>{sec.body}</Text>
          </View>
        ))}

        {data.chartData && data.chartData.length > 0 && (
          <View>
            <Text style={styles.chartOverview}>Overview</Text>
            {data.chartData.map((point, idx) => {
              const maxVal = Math.max(...data.chartData!.map(d => d.value));
              const widthPct = (point.value / maxVal) * 100;
              return (
                <View key={idx}>
                  <Text style={styles.chartLabel}>{point.label} - {point.value}</Text>
                  <View style={[styles.chartBar, { width: `${Math.max(10, widthPct)}%` }]} />
                </View>
              );
            })}
          </View>
        )}

        <Text style={styles.footer} fixed render={({ pageNumber, totalPages }) => (
          `Page ${pageNumber} of ${totalPages}`
        )} />
      </Page>
    </Document>
  );
};
