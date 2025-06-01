import React from 'react';
import { Input } from '@/components/ui/input';

interface MulDivQuestion {
  numbers: number[];
  operators: ('×' | '÷')[];
  answer: number | '';
}

interface StudentMulDivTableProps {
  questions: MulDivQuestion[];
  answers: (string | number)[];
  setAnswers: React.Dispatch<React.SetStateAction<(string | number)[]>>;
  disabled?: boolean;
  showAnswers?: boolean;
}

export const StudentMulDivTable: React.FC<StudentMulDivTableProps> = ({ questions, answers, setAnswers, disabled, showAnswers = false }) => {
  const handleAnswerChange = (idx: number, value: string) => {
    setAnswers(prev => prev.map((a, i) => i === idx ? value : a));
  };

  return (
    <div className="overflow-x-auto mt-6">
      <h2 className="font-bold text-lg mb-2">سوالات ضرب و تقسیم</h2>
      <table className="min-w-full border border-gray-300 rounded-lg" dir="ltr">
        <thead className="bg-violet-700 text-white">
          <tr className="bg-primary/10">
            <th className="p-2 border">شماره</th>
            <th className="p-2 border">سوال</th>
            <th className="p-2 border">جواب شما</th>
          </tr>
        </thead>
        <tbody>
          {questions.map((q, idx) => (
            <tr key={idx}>
              <td className="p-2 border text-center font-bold bg-violet-700 text-white">{idx + 1}</td>
              <td className="border p-2 text-center">
                {q.numbers.map((num, index) => (
                  <span key={index} className="inline-flex items-center">
                    {index > 0 && index < q.numbers.length && (
                      <span className="mx-2 text-red-500 text-lg font-bold">
                        {q.operators[index - 1]}
                      </span>
                    )}
                    {num}
                  </span>
                ))}
              </td>
              <td className="p-2 border text-center">
                <Input
                  type="number"
                  value={answers[idx] ?? ''}
                  onChange={e => handleAnswerChange(idx, e.target.value)}
                  disabled={disabled}
                  className="w-32 mx-auto"
                />
                {showAnswers && (
                  <div className="text-sm text-muted-foreground mt-1">
                    جواب: {q.answer}
                  </div>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}; 