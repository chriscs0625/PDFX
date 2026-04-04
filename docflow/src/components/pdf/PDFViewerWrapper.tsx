"use client";
import React from "react";
import { PDFViewer } from "@react-pdf/renderer";

export default function PDFViewerWrapper(props: any) {
  return <PDFViewer {...props} />;
}