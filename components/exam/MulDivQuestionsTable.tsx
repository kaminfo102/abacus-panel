import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Trash2 } from 'lucide-react';

interface MulDivQuestion {
  numbers: number[];
  operators: ('×' | '÷')[];
  answer: number | '';
}

interface MulDivQuestionsTableProps {
  questions: MulDivQuestion[];
  setQuestions: React.Dispatch<React.SetStateAction<MulDivQuestion[]>>;
  active?: boolean;
}

export const MulDivQuestionsTable: React.FC<MulDivQuestionsTableProps> = ({ questions, setQuestions, active = true }) => {
  if (!active) return null;

  // افزودن سوال جدید
  const handleAddQuestion = () => {
    setQuestions(prev => [...prev, { numbers: [0, 0], operators: ['×'], answer: '' }]);
  };

  // حذف سوال
  const handleRemoveQuestion = (qIdx: number) => {
    setQuestions(prev => prev.filter((_, idx) => idx !== qIdx));
  };

  // افزودن عدد به یک سوال
  const handleAddNumber = (qIdx: number) => {
    setQuestions(prev => prev.map((q, idx) => idx === qIdx ? {
      ...q,
      numbers: [...q.numbers, 0],
      operators: [...q.operators, '×']
    } : q));
  };

  // حذف عدد از یک سوال
  const handleRemoveNumber = (qIdx: number, nIdx: number) => {
    setQuestions(prev => prev.map((q, idx) => idx === qIdx ? {
      ...q,
      numbers: q.numbers.filter((_, i) => i !== nIdx),
      operators: q.operators.filter((_, i) => i !== nIdx && i !== 0)
    } : q));
  };

  // تغییر مقدار عدد
  const handleNumberChange = (qIdx: number, nIdx: number, value: string) => {
    const newQuestions = [...questions];
    newQuestions[qIdx].numbers[nIdx] = parseInt(value) || 0;
    newQuestions[qIdx].answer = calculateAnswer(newQuestions[qIdx]);
    setQuestions(newQuestions);
  };

  // تغییر مقدار عملگر
  const handleOperatorChange = (qIdx: number, oIdx: number, value: string) => {
    const newQuestions = [...questions];
    newQuestions[qIdx].operators[oIdx] = value as '×' | '÷';
    newQuestions[qIdx].answer = calculateAnswer(newQuestions[qIdx]);
    setQuestions(newQuestions);
  };

  const calculateAnswer = (question: MulDivQuestion): number => {
    let result = question.numbers[0];
    for (let i = 1; i < question.numbers.length; i++) {
      const operator = question.operators[i - 1];
      const number = question.numbers[i];
      
      if (operator === '×') {
        result *= number;
      } else if (operator === '÷') {
        if (number === 0) return 0; // جلوگیری از تقسیم بر صفر
        result = Math.floor(result / number);
      }
    }
    return result;
  };

  return (
    <div className="overflow-x-auto mt-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="font-bold text-lg">سوالات ضرب و تقسیم</h2>
        <Button
          variant="outline"
          size="sm"
          onClick={handleAddQuestion}
        >
          افزودن سوال
        </Button>
      </div>
      <table className="min-w-full border border-gray-300 rounded-lg" dir="rtl">
        <thead>
          <tr className="bg-violet-700 text-white">
            <th className="p-2 border">شماره</th>
            <th className="p-2 border">سوال</th>
            <th className="p-2 border">جواب</th>
            <th className="p-2 border">عملیات</th>
          </tr>
        </thead>
        <tbody>
          {questions.map((q, qIdx) => (
            <tr key={qIdx}>
              <td className="p-2 border text-center font-bold bg-violet-700 text-white">{qIdx + 1}</td>
              <td className="p-2 border text-center">
                <div className="flex flex-wrap items-center gap-2 justify-center">
                  {q.numbers.map((num, nIdx) => (
                    <React.Fragment key={nIdx}>
                      <Input
                        type="number"
                        value={num}
                        onChange={e => handleNumberChange(qIdx, nIdx, e.target.value)}
                        className="w-20 inline-block"
                      />
                      {nIdx < q.numbers.length - 1 && (
                        <select
                          value={q.operators[nIdx]}
                          onChange={e => handleOperatorChange(qIdx, nIdx, e.target.value)}
                          className="w-12 border rounded px-1 py-1 text-center mx-1"
                        >
                          <option value="×">×</option>
                          <option value="÷">÷</option>
                        </select>
                      )}
                      {q.numbers.length > 2 && nIdx > 0 && nIdx < q.numbers.length - 1 && (
                        <Button
                          type="button"
                          variant="destructive"
                          size="icon"
                          onClick={() => handleRemoveNumber(qIdx, nIdx)}
                          title="حذف عدد"
                        >
                          -
                        </Button>
                      )}
                    </React.Fragment>
                  ))}
                  <Button type="button" variant="outline" size="icon" onClick={() => handleAddNumber(qIdx)} title="افزودن عدد">+</Button>
                </div>
              </td>
              <td className="p-2 border text-center">
                {q.answer}
              </td>
              <td className="p-2 border text-center">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleRemoveQuestion(qIdx)}
                >
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}; 