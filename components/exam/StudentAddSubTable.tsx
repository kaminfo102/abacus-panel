import React from 'react';
import { Input } from '@/components/ui/input';

interface AddSubQuestion {
  numbers: number[];
  answer: number | '';
}

interface StudentAddSubTableProps {
  questions: AddSubQuestion[];
  answers: (string | number)[];
  setAnswers: React.Dispatch<React.SetStateAction<(string | number)[]>>;
  disabled?: boolean;
}

export const StudentAddSubTable: React.FC<StudentAddSubTableProps> = ({ questions, answers, setAnswers, disabled }) => {
  // پیدا کردن بیشترین تعداد عدد در بین سوالات برای تعیین تعداد ردیف‌ها
  const maxRows = Math.max(...questions.map(q => q.numbers.length), 0);

  // هندل تغییر جواب
  const handleAnswerChange = (idx: number, value: string) => {
    setAnswers(prev => prev.map((a, i) => i === idx ? value : a));
  };

  return (
    <div className="overflow-x-auto mt-6">
      <h2 className="font-bold text-lg mb-2">سوالات جمع و تفریق</h2>
      <table className="min-w-full border border-gray-300 rounded-lg" dir="ltr">
        <thead>
          <tr className="bg-primary/10">
            <th className="p-2 border text-center align-middle bg-violet-700 text-white" rowSpan={maxRows + 2}>Abacus</th>
            {questions.map((_, idx) => (
              <th key={idx} className="p-2 border text-center bg-violet-700 text-white">{idx + 1}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {/* ردیف‌های اعداد */}
          {Array.from({ length: maxRows }).map((_, rowIdx) => (
            <tr key={rowIdx}>
              {/* ستون راهنما فقط در اولین ستون */}
              {rowIdx === 0 && <td className="p-2 border text-center align-middle bg-violet-700 text-white" rowSpan={maxRows}> </td>}
              {questions.map((q, colIdx) => (
                <td key={colIdx} className="p-2 border text-center">
                  {q.numbers[rowIdx] !== undefined ? q.numbers[rowIdx] : ''}
                </td>
              ))}
            </tr>
          ))}
          {/* ردیف جواب */}
          <tr>
            <td className="p-2 border text-center font-bold bg-violet-700 text-white">جواب</td>
            {questions.map((_, idx) => (
              <td key={idx} className="p-2 border text-center">
                <Input
                  type="number"
                  value={answers[idx] ?? ''}
                  onChange={e => handleAnswerChange(idx, e.target.value)}
                  disabled={disabled}
                  className="w-24 mx-auto"
                />
              </td>
            ))}
          </tr>
        </tbody>
      </table>
    </div>
  );
}; 