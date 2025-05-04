"use client";

import { useEffect, useRef, useState } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { CheckCircle, XCircle } from "lucide-react";
import { calculateRowResult, convertPersianToEnglish, cn } from "@/lib/utils";
import type { ExamRow } from "@/lib/types";

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
}

export function CalculationsTable({ examData, onFinish, isDisabled, onAnswersUpdate }: CalculationsTableProps) {
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
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

  if (!examData.length) {
    return <div>سوالی برای نمایش وجود ندارد.</div>;
  }

  return (
    <div className="space-y-12">
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="bg-primary/10">
              {examData.map((_, i) => (
                <TableHead key={i} className="text-center font-bold">
                  {examData.length - i}
                </TableHead>
              ))}
              <TableHead className="text-center font-bold">شماره</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {examData[0].items.map((_, itemIndex) => (
              <TableRow key={itemIndex}>
                {examData.map((row, rowIndex) => (
                  <TableCell
                    key={rowIndex}
                    className={cn(
                      "text-center",
                      answers[rowIndex + 1]?.submitted && (
                        answers[rowIndex + 1]?.isCorrect
                          ? "bg-green-50"
                          : "bg-red-50"
                      )
                    )}
                  >
                    {itemIndex === 0 ? row.items[itemIndex].value : (
                      <span>{row.items[itemIndex].operator} {row.items[itemIndex].value}</span>
                    )}
                  </TableCell>
                ))}
                <TableCell className="text-center font-bold">
                  {`آیتم ${itemIndex + 1}`}
                </TableCell>
              </TableRow>
            ))}
            <TableRow>
              {examData.map((_, i) => (
                <TableCell key={i} className="p-0">
                  <div className="flex flex-col gap-2 p-2">
                    <Input
                      ref={el => inputRefs.current[i] = el}
                      className="text-center w-full"
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