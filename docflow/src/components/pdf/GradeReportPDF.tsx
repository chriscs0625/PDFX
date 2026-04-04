import React from "react";
import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer";
import { pdfTheme } from "@/lib/pdf-theme";
import type { GradeReportData } from "@/schemas/grade-report.schema";

const styles = StyleSheet.create({
  page: { 
    padding: pdfTheme.spacing.page.padding, 
    fontFamily: pdfTheme.fonts.body,
    backgroundColor: pdfTheme.colors.background 
  },
  header: { 
    borderBottomWidth: 2,
    borderBottomColor: pdfTheme.colors.primary,
    paddingBottom: 10,
    marginBottom: 20
  },
  institution: { 
    fontSize: 24, 
    fontWeight: "bold",
    color: pdfTheme.colors.primary 
  },
  subtitle: { 
    fontSize: 14, 
    color: pdfTheme.colors.textMuted 
  },
  studentInfo: { 
    flexDirection: "row", 
    justifyContent: "space-between", 
    marginBottom: 20 
  },
  infoText: { fontSize: 12, color: pdfTheme.colors.text, marginBottom: 4 },
  table: { width: "100%", marginBottom: 20 },
  row: { 
    flexDirection: "row", 
    borderBottomWidth: 1, 
    borderBottomColor: pdfTheme.colors.border, 
    paddingVertical: 6,
    alignItems: "center"
  },
  headerRow: { 
    backgroundColor: pdfTheme.colors.primary,
    color: "#fff"
  },
  headerText: { fontSize: 12, fontWeight: "bold", color: "#fff" },
  colSub: { width: "40%", paddingLeft: 8 },
  colScore: { width: "15%", textAlign: "center" },
  colGrade: { width: "15%", textAlign: "center" },
  colRem: { width: "30%", textAlign: "right", paddingRight: 8 },
  cellText: { fontSize: 11, color: pdfTheme.colors.text },
  summaryText: { fontSize: 14, fontWeight: "bold", textAlign: "right", marginTop: 10 },
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

const getScoreColor = (score: number) => {
  if (score >= 75) return pdfTheme.colors.success;
  if (score >= 50) return pdfTheme.colors.warning;
  return pdfTheme.colors.danger;
};

export const GradeReportPDF = ({ data }: { data: GradeReportData }) => (
  <Document>
    <Page size="A4" style={styles.page}>
      <View style={styles.header}>
        <Text style={styles.institution}>{data.institution}</Text>
        <Text style={styles.subtitle}>Academic Grade Report</Text>
      </View>
      <View style={styles.studentInfo}>
        <View>
          <Text style={styles.infoText}>Student Name: {data.studentName}</Text>
          <Text style={styles.infoText}>Student ID: {data.studentId}</Text>
        </View>
        <View>
          <Text style={styles.infoText}>Term: {data.term}</Text>
          <Text style={styles.infoText}>Year: {data.year}</Text>
        </View>
      </View>

      <View style={styles.table}>
        <View style={[styles.row, styles.headerRow]}>
          <Text style={[styles.colSub, styles.headerText]}>Subject</Text>
          <Text style={[styles.colScore, styles.headerText]}>Score</Text>
          <Text style={[styles.colGrade, styles.headerText]}>Grade</Text>
          <Text style={[styles.colRem, styles.headerText]}>Remarks</Text>
        </View>
        {data.grades.map((g, i) => (
          <View key={i} style={[styles.row, { backgroundColor: i % 2 === 0 ? "#fff" : pdfTheme.colors.surface }]}>
            <Text style={[styles.colSub, styles.cellText]}>{g.subject}</Text>
            <Text style={[styles.colScore, styles.cellText, { color: getScoreColor(g.score) }]}>
              {g.score}
            </Text>
            <Text style={[styles.colGrade, styles.cellText]}>{g.grade}</Text>
            <Text style={[styles.colRem, styles.cellText]}>{g.remarks || "-"}</Text>
          </View>
        ))}
      </View>

      {data.gpa !== undefined && (
        <Text style={styles.summaryText}>GPA: {data.gpa.toFixed(2)}</Text>
      )}

      {data.remarks && (
        <View style={{ marginTop: 20 }}>
          <Text style={{ fontSize: 14, fontWeight: "bold", marginBottom: 5 }}>Overall Remarks</Text>
          <Text style={{ fontSize: 12, color: pdfTheme.colors.text }}>{data.remarks}</Text>
        </View>
      )}

      <Text style={styles.footer} fixed>{data.institution}</Text>
    </Page>
  </Document>
);
