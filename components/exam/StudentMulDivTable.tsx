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
}

export const StudentMulDivTable: React.FC<StudentMulDivTableProps> = ({ questions, answers, setAnswers, disabled }) => {
  const handleAnswerChange = (idx: number, value: string) => {
    setAnswers(prev => prev.map((a, i) => i === idx ? value : a));
  };

  return (
    <div className="overflow-x-auto mt-6">
      <h2 className="font-bold text-lg mb-2">سوالات ضرب و تقسیم</h2>
      <table className="min-w-full border border-gray-300 rounded-lg" dir="ltr">
        <thead>
          <tr className="bg-primary/10">
            <th className="p-2 border">شماره</th>
            <th className="p-2 border">سوال</th>
            <th className="p-2 border">جواب شما</th>
          </tr>
        </thead>
        <tbody>
          {questions.map((q, idx) => (
            <tr key={idx}>
              <td className="p-2 border text-center font-bold">{idx + 1}</td>
              <td className="p-2 border text-center">
                {q.numbers.map((num, i) => (
                  <React.Fragment key={i}>
                    {i > 0 && <span className="mx-1">{q.operators[i - 1]}</span>}
                    <span>{num.toLocaleString()}</span>
                  </React.Fragment>
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
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}; 