"use client";

import { useEffect, useRef, useState } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { CheckCircle, XCircle, Download } from "lucide-react";
import { calculateRowResult, convertPersianToEnglish, cn } from "@/lib/utils";
import type { ExamRow } from "@/lib/types";
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

export type Answer = {
  value: string;
  submitted: boolean;
  isCorrect?: boolean;
};

interface CalculationsTableProps {
  examData: ExamRow[];
  onFinish: (correctAnswers: number) => void;
  isDisabled?: boolean;
  onAnswersUpdate: (answers: { [key: number]: Answer }) => void;
  examTitle?: string;
}

export function CalculationsTable({ examData, onFinish, isDisabled, onAnswersUpdate, examTitle }: CalculationsTableProps) {
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const tableRef = useRef<HTMLDivElement>(null);
  const [answers, setAnswers] = useState<{ [key: number]: Answer }>(
    examData.reduce((acc, _, index) => ({
      ...acc,
      [index + 1]: { value: "", submitted: false }
    }), {})
  );

  useEffect(() => {
    setAnswers(
      examData.reduce((acc, _, index) => ({
        ...acc,
        [index + 1]: { value: "", submitted: false }
      }), {})
    );
  }, [examData]);

  useEffect(() => {
    onAnswersUpdate(answers);
  }, [answers]);

  useEffect(() => {
    const lastInputIndex = examData.length - 1;
    const lastInput = inputRefs.current[lastInputIndex];
    if (lastInput) {
      lastInput.focus();
    }
  }, [examData.length]);

  const focusNextInput = (currentIndex: number) => {
    const nextIndex = currentIndex - 1;
    const nextInput = inputRefs.current[nextIndex];
    if (nextIndex >= 0 && nextInput) {
      nextInput.focus();
    }
  };

  const handleAnswerChange = (rowIndex: number, value: string) => {
    if (!answers[rowIndex]?.submitted && !isDisabled) {
      setAnswers(prev => ({
        ...prev,
        [rowIndex]: { ...prev[rowIndex], value }
      }));
    }
  };

  const handleSubmitAnswer = (rowIndex: number) => {
    if (!answers[rowIndex]?.value || isDisabled) return;
    const userAnswer = convertPersianToEnglish(answers[rowIndex].value);
    const correctAnswer = calculateRowResult(examData[rowIndex - 1].items);
    const isCorrect = userAnswer === correctAnswer;
    const newAnswers = {
      ...answers,
      [rowIndex]: { ...answers[rowIndex], submitted: true, isCorrect }
    };
    setAnswers(newAnswers);
    onAnswersUpdate(newAnswers);
    focusNextInput(rowIndex - 1);
  };

  const handleFinishExam = () => {
    const totalCorrect = Object.values(answers).filter(a => a.isCorrect).length;
    onFinish(totalCorrect);
  };

  // const handleExportPDF = async () => {
  //   if (!tableRef.current) return;

  //   try {
  //     // Create a temporary container for the header
  //     const headerDiv = document.createElement('div');
  //     headerDiv.style.padding = '20px 40px';
  //     headerDiv.style.textAlign = 'center';
  //     headerDiv.style.backgroundColor = '#ffffff';
  //     headerDiv.style.marginBottom = '20px';
  //     headerDiv.style.display = 'flex';
  //     headerDiv.style.flexDirection = 'column';
  //     headerDiv.style.alignItems = 'center';
      
  //     // Add logo
  //     const logo = document.createElement('img');
  //     logo.src = '/logo.png';
  //     logo.style.height = '80px';
  //     logo.style.marginBottom = '15px';
  //     logo.style.objectFit = 'contain';
  //     headerDiv.appendChild(logo);

  //     // Add title
  //     const title = document.createElement('h1');
  //     title.textContent = examTitle || 'آزمون ریاضی';
  //     title.style.fontSize = '24px';
  //     title.style.fontWeight = 'bold';
  //     title.style.marginBottom = '15px';
  //     headerDiv.appendChild(title);

  //     // Create a container for both header and table
  //     const container = document.createElement('div');
  //     container.style.width = '800px';
  //     container.style.padding = '0 40px';
  //     container.appendChild(headerDiv);
  //     container.appendChild(tableRef.current.cloneNode(true));
  //     document.body.appendChild(container);

  //     const canvas = await html2canvas(container, {
  //       useCORS: true,
  //       logging: false,
  //       allowTaint: true,
  //       background: '#ffffff'
  //     });

  //     document.body.removeChild(container);

  //     const imgData = canvas.toDataURL('image/png');
  //     const pdf = new jsPDF({
  //       orientation: 'portrait',
  //       unit: 'mm',
  //       format: 'a4',
  //     });

  //     const pageWidth = pdf.internal.pageSize.getWidth();
  //     const pageHeight = pdf.internal.pageSize.getHeight();
  //     const imgWidth = canvas.width;
  //     const imgHeight = canvas.height;
  //     const ratio = Math.min((pageWidth - 40) / imgWidth, pageHeight / imgHeight);
  //     const imgX = (pageWidth - imgWidth * ratio) / 2;
  //     const imgY = 5;

  //     pdf.addImage(imgData, 'PNG', imgX, imgY, imgWidth * ratio, imgHeight * ratio);
  //     pdf.save(`${examTitle || 'exam'}-results.pdf`);
  //   } catch (error) {
  //     console.error('Error generating PDF:', error);
  //   }
  // };

  if (!examData.length) {
    return <div>سوالی برای نمایش وجود ندارد.</div>;
  }

  return (
    <div className="space-y-0">
      {/* <div className="flex justify-end mb-4">
        <Button
          onClick={handleExportPDF}
          variant="outline"
          className="flex items-center gap-2"
        >
          <Download className="w-4 h-4" />
          دانلود PDF
        </Button>
      </div> */}
      <div className="overflow-x-auto" ref={tableRef}>
        <Table className="border border-gray-300">
          <TableHeader>
            <TableRow className="bg-primary/10 border-b border-gray-300">
              {examData.map((_, i) => (
                <TableHead key={i} className="text-center font-bold border-x border-gray-300">
                  {examData.length - i}
                </TableHead>
              ))}
              <TableHead className="text-center font-bold border-l border-gray-300">شماره</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {examData[0].items.map((_, itemIndex) => (
              <TableRow key={itemIndex} className="border-b border-gray-300">
                {examData.map((row, rowIndex) => (
                  <TableCell
                    key={rowIndex}
                    className={cn(
                      "text-center border-x border-gray-300",
                      answers[rowIndex + 1]?.submitted && (
                        answers[rowIndex + 1]?.isCorrect
                          ? "bg-green-50"
                          : "bg-red-50"
                      )
                    )}
                  >
                    {itemIndex === 0 ? (
                      <span className="font-mono">{row.items[itemIndex].value}</span>
                    ) : (
                      <span className="font-mono">
                        {row.items[itemIndex - 1].operator} {row.items[itemIndex].value}
                      </span>
                    )}
                  </TableCell>
                ))}
                <TableCell className="text-center font-bold border-l border-gray-300">
                  {`آیتم ${itemIndex + 1}`}
                </TableCell>
              </TableRow>
            ))}
            <TableRow>
              {examData.map((_, i) => (
                <TableCell key={i} className="p-0 border-x border-gray-300">
                  <div className="flex flex-col gap-2 p-2">
                    <Input
                      ref={el => inputRefs.current[i] = el}
                      className="text-center w-full font-mono"
                      value={answers[i + 1]?.value || ""}
                      onChange={(e) => handleAnswerChange(i + 1, e.target.value)}
                      disabled={answers[i + 1]?.submitted || isDisabled}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && !isDisabled) {
                          if (answers[i + 1]?.value) {
                            handleSubmitAnswer(i + 1);
                            focusNextInput(i);
                          }
                        } else if (e.key === 'Tab') {
                          e.preventDefault();
                          focusNextInput(i);
                        }
                      }}
                    />
                    {answers[i + 1]?.submitted ? (
                      answers[i + 1]?.isCorrect ? (
                        <CheckCircle className="w-5 h-5 mx-auto text-green-500" />
                      ) : (
                        <XCircle className="w-5 h-5 mx-auto text-red-500" />
                      )
                    ) : (
                      <Button
                        size="sm"
                        variant="outline"
                        className="w-full"
                        onClick={() => handleSubmitAnswer(i + 1)}
                        disabled={!answers[i + 1]?.value || isDisabled}
                      >
                        ثبت
                      </Button>
                    )}
                  </div>
                </TableCell>
              ))}
              <TableCell className="text-center font-bold">جواب</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </div>
      {/* <div className="flex justify-center mt-8">
        <Button
          size="lg"
          className="bg-green-600 hover:bg-green-700 text-white px-8 py-6 text-lg"
          onClick={handleFinishExam}
        >
          پایان آزمون
        </Button>
      </div> */}
    </div>
  );
}